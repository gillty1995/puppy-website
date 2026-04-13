import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { readPuppies, writePuppies } from "@/data/puppies";
import { getStripe } from "@/lib/stripe";

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
    const puppyId = session.metadata?.puppyId;
    const index = puppies.findIndex((puppy) => puppy.id === puppyId);

    if (index >= 0) {
      const puppy = puppies[index];
      puppies[index] = {
        ...puppy,
        status: "reserved",
        payment: {
          ...puppy.payment,
          depositPaidAmount: typeof session.amount_total === "number" ? session.amount_total / 100 : puppy.depositAmount,
          depositPaidAt: new Date().toISOString(),
          depositSessionId: session.id,
          reservedByEmail: session.customer_details?.email || puppy.payment?.reservedByEmail,
          reservedByName: session.customer_details?.name || puppy.payment?.reservedByName,
          stripeCustomerId:
            typeof session.customer === "string"
              ? session.customer
              : puppy.payment?.stripeCustomerId,
        },
      };
      await writePuppies(puppies);
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
    }
  }

  return NextResponse.json({ received: true });
}
