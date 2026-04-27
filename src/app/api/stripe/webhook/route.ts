import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { readPuppies, writePuppies } from "@/data/puppies";
import { getStripe } from "@/lib/stripe";
import {
  findWaitlistByPaymentIntentId,
  markWaitlistPaid,
  markWaitlistRefunded,
  isWaitlistRefundEligible,
} from "@/data/waitlist";
import { sendEmail } from "@/lib/mailer";

function getAdminEmail() {
  return process.env.ADMIN_EMAIL;
}

async function notifyAdmin(subject: string, lines: string[], replyTo?: string) {
  const adminEmail = getAdminEmail();
  if (!adminEmail) return;

  await sendEmail({
    to: adminEmail,
    subject,
    text: lines.join("\n"),
    replyTo,
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    );
  }

  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid webhook signature." },
      { status: 400 }
    );
  }

  const puppies = await readPuppies();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentType = session.metadata?.paymentType;
    const puppyId = session.metadata?.puppyId;
    if (paymentType === "waitlist_deposit") {
      const waitlistId = session.metadata?.waitlistId;
      const paidAt = new Date().toISOString();
      const entry = await markWaitlistPaid({
        id: waitlistId,
        checkoutSessionId: session.id,
        paymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : undefined,
        stripeCustomerId:
          typeof session.customer === "string" ? session.customer : undefined,
        paidAt,
      });

      if (entry) {
        const refundEligibleAt = entry.refundEligibleAt
          ? new Date(entry.refundEligibleAt).toLocaleDateString()
          : "18 months from the deposit date";
        await notifyAdmin(
          `New waitlist deposit from ${entry.name}`,
          [
            `A new waitlist deposit has been paid.`,
            ``,
            `Name: ${entry.name}`,
            `Email: ${entry.email}`,
            `Phone: ${entry.phone || "n/a"}`,
            `Deposit: $${entry.depositAmount.toLocaleString()}`,
            `Paid at: ${paidAt}`,
            `Refund eligible after: ${refundEligibleAt}`,
            `Waitlist ID: ${entry.id}`,
          ],
          entry.email
        );
      }
    }

    const index = puppies.findIndex((puppy) => puppy.id === puppyId);

    if (index >= 0) {
      const puppy = puppies[index];
      puppies[index] = {
        ...puppy,
        status: "reserved",
        payment: {
          ...puppy.payment,
          depositPaidAmount:
            typeof session.amount_total === "number"
              ? session.amount_total / 100
              : puppy.depositAmount,
          depositPaidAt: new Date().toISOString(),
          depositSessionId: session.id,
          reservedByEmail:
            session.customer_details?.email || puppy.payment?.reservedByEmail,
          reservedByName:
            session.customer_details?.name || puppy.payment?.reservedByName,
          stripeCustomerId:
            typeof session.customer === "string"
              ? session.customer
              : puppy.payment?.stripeCustomerId,
        },
      };
      await writePuppies(puppies);

      await notifyAdmin(
        `Puppy deposit received for ${puppy.name}`,
        [
          `A puppy deposit payment has completed.`,
          ``,
          `Puppy: ${puppy.name}`,
          `Email: ${session.customer_details?.email || "n/a"}`,
          `Name: ${session.customer_details?.name || "n/a"}`,
          `Deposit: $${(typeof session.amount_total === "number"
            ? session.amount_total / 100
            : puppy.depositAmount
          ).toLocaleString()}`,
          `Session ID: ${session.id}`,
          `Puppy ID: ${puppy.id}`,
        ],
        session.customer_details?.email || undefined
      );
    }
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    const puppyId = invoice.metadata?.puppyId;
    const index = puppies.findIndex((puppy) => puppy.id === puppyId);

    if (index >= 0) {
      const puppy = puppies[index];
      puppies[index] = {
        ...puppy,
        status: "adopted",
        payment: {
          ...puppy.payment,
          finalInvoiceId: invoice.id,
          finalInvoiceUrl: invoice.hosted_invoice_url ?? puppy.payment?.finalInvoiceUrl,
          finalInvoiceStatus: invoice.status ?? puppy.payment?.finalInvoiceStatus,
          finalPaidAt: new Date().toISOString(),
        },
      };
      await writePuppies(puppies);

      await notifyAdmin(
        `Puppy balance invoice paid for ${puppy.name}`,
        [
          `The remaining balance invoice has been paid.`,
          ``,
          `Puppy: ${puppy.name}`,
          `Invoice ID: ${invoice.id}`,
          `Customer email: ${invoice.customer_email || puppy.payment?.reservedByEmail || "n/a"}`,
          `Amount paid: $${typeof invoice.amount_paid === "number" ? (invoice.amount_paid / 100).toLocaleString() : "n/a"}`,
          `Puppy ID: ${puppy.id}`,
        ],
        invoice.customer_email || puppy.payment?.reservedByEmail || undefined
      );
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    await notifyAdmin(
      "Stripe invoice payment failed",
      [
        `An invoice payment failed.`,
        ``,
        `Invoice ID: ${invoice.id}`,
        `Customer email: ${invoice.customer_email || "n/a"}`,
        `Amount due: $${typeof invoice.amount_due === "number" ? (invoice.amount_due / 100).toLocaleString() : "n/a"}`,
        `Amount paid: $${typeof invoice.amount_paid === "number" ? (invoice.amount_paid / 100).toLocaleString() : "n/a"}`,
      ],
      invoice.customer_email || undefined
    );
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId =
      typeof charge.payment_intent === "string" ? charge.payment_intent : undefined;
    const waitlist = paymentIntentId
      ? await findWaitlistByPaymentIntentId(paymentIntentId)
      : undefined;

    if (waitlist && isWaitlistRefundEligible(waitlist)) {
      await markWaitlistRefunded({
        id: waitlist.id,
        paymentIntentId,
        chargeId: charge.id,
        refundedAmount:
          typeof charge.amount_refunded === "number"
            ? charge.amount_refunded / 100
            : undefined,
      });

      await notifyAdmin(
        `Waitlist refund issued for ${waitlist.name}`,
        [
          `A waitlist refund was processed.`,
          ``,
          `Name: ${waitlist.name}`,
          `Email: ${waitlist.email}`,
          `Charge ID: ${charge.id}`,
          `Payment Intent: ${paymentIntentId || "n/a"}`,
          `Refunded amount: $${typeof charge.amount_refunded === "number" ? (charge.amount_refunded / 100).toLocaleString() : "n/a"}`,
          `Waitlist ID: ${waitlist.id}`,
        ],
        waitlist.email
      );
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentType = session.metadata?.paymentType || "checkout";
    await notifyAdmin(
      `Stripe checkout expired (${paymentType})`,
      [
        `A checkout session expired without completing payment.`,
        ``,
        `Session ID: ${session.id}`,
        `Customer email: ${session.customer_details?.email || session.customer_email || "n/a"}`,
        `Payment type: ${paymentType}`,
      ],
      session.customer_details?.email || session.customer_email || undefined
    );
  }

  return NextResponse.json({ received: true });
}
