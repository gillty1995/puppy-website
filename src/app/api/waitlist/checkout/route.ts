import { NextResponse } from "next/server";
import {
  createWaitlistEntry,
  getWaitlistDepositAmount,
  updateWaitlistEntry,
} from "@/data/waitlist";
import { getStripe } from "@/lib/stripe";

function normalizeField(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = normalizeField(body.name);
    const email = normalizeField(body.email);
    const phone = normalizeField(body.phone);
    const notes = normalizeField(body.notes);

    if (!name || !email) {
      return NextResponse.json(
        { error: "Please enter your name and email." },
        { status: 400 }
      );
    }

    const entry = await createWaitlistEntry({ name, email, phone, notes });
    const stripe = getStripe();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      new URL(request.url).origin;
    const depositAmount = getWaitlistDepositAmount();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      billing_address_collection: "auto",
      success_url: `${siteUrl}/waitlist/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/waitlist/cancel?waitlist=${entry.id}`,
      customer_creation: "always",
      metadata: {
        paymentType: "waitlist_deposit",
        waitlistId: entry.id,
        waitlistName: name,
        waitlistEmail: email,
      },
      payment_intent_data: {
        metadata: {
          paymentType: "waitlist_deposit",
          waitlistId: entry.id,
          waitlistName: name,
          waitlistEmail: email,
        },
        description: `Waitlist deposit for Textile Poms`,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: depositAmount * 100,
            product_data: {
              name: "Textile Poms Waitlist Deposit",
              description:
                "Reserve your spot for an upcoming puppy litter with a $500 non-refundable deposit for 18 months.",
            },
          },
        },
      ],
    });

    await updateWaitlistEntry(entry.id, {
      checkoutSessionId: session.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Waitlist checkout error", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Unable to start waitlist checkout.",
      },
      { status: 500 }
    );
  }
}
