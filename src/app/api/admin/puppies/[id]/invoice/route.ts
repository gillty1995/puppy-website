import { NextResponse } from "next/server";
import { getRemainingBalance, readPuppies, writePuppies } from "@/data/puppies";
import { requireAdminApi } from "@/lib/admin";
import { getStripe } from "@/lib/stripe";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = await requireAdminApi();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const { email: emailOverride } = await request.json().catch(() => ({
      email: undefined,
    }));

    const puppies = await readPuppies();
    const index = puppies.findIndex((puppy) => puppy.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Puppy not found." }, { status: 404 });
    }

    const puppy = puppies[index];
    const email = emailOverride || puppy.payment?.reservedByEmail;
    const remainingBalance = getRemainingBalance(puppy);

    if (!email) {
      return NextResponse.json(
        { error: "Add the buyer email before sending the balance invoice." },
        { status: 400 }
      );
    }

    if (remainingBalance <= 0) {
      return NextResponse.json(
        { error: "This puppy does not have a remaining balance." },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const customer =
      puppy.payment?.stripeCustomerId
        ? await stripe.customers.update(puppy.payment.stripeCustomerId, { email })
        : await stripe.customers.create({
            email,
            name: puppy.payment?.reservedByName || puppy.name,
            metadata: {
              puppyId: puppy.id,
              puppyName: puppy.name,
            },
          });

    await stripe.invoiceItems.create({
      customer: customer.id,
      amount: remainingBalance * 100,
      currency: "usd",
      description: `Remaining balance for ${puppy.name}`,
      metadata: {
        puppyId: puppy.id,
        puppyName: puppy.name,
        paymentType: "remaining_balance",
      },
    });

    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: 7,
      pending_invoice_items_behavior: "include",
      metadata: {
        puppyId: puppy.id,
        puppyName: puppy.name,
        paymentType: "remaining_balance",
      },
    });

    const sentInvoice = await stripe.invoices.sendInvoice(invoice.id);

    puppies[index] = {
      ...puppy,
      payment: {
        ...puppy.payment,
        reservedByEmail: email,
        stripeCustomerId: customer.id,
        finalInvoiceId: sentInvoice.id,
        finalInvoiceUrl: sentInvoice.hosted_invoice_url ?? undefined,
        finalInvoiceStatus: sentInvoice.status ?? undefined,
      },
    };

    await writePuppies(puppies);

    return NextResponse.json({
      invoiceId: sentInvoice.id,
      invoiceUrl: sentInvoice.hosted_invoice_url,
      status: sentInvoice.status,
    });
  } catch (err) {
    console.error("Stripe invoice error", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Unable to create balance invoice.",
      },
      { status: 500 }
    );
  }
}
