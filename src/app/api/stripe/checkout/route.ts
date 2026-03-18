import { NextResponse } from "next/server";
import { readPuppyById } from "@/data/puppies";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const { puppyId } = await request.json();
    const puppy = await readPuppyById(String(puppyId ?? ""));

    if (!puppy) {
      return NextResponse.json({ error: "Puppy not found." }, { status: 404 });
    }

    if (puppy.status !== "available") {
      return NextResponse.json(
        { error: "This puppy is not currently available for reservation." },
        { status: 409 }
      );
    }

    const stripe = getStripe();
    const origin = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      billing_address_collection: "auto",
      success_url: `${origin}/reserve/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/reserve/cancel?puppy=${puppy.id}`,
      customer_creation: "always",
      payment_intent_data: {
        metadata: {
          puppyId: puppy.id,
          puppyName: puppy.name,
          paymentType: "deposit",
        },
      },
      metadata: {
        puppyId: puppy.id,
        puppyName: puppy.name,
        paymentType: "deposit",
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: puppy.depositAmount * 100,
            product_data: {
              name: `${puppy.name} Reservation Deposit`,
              description: `Deposit toward ${puppy.name}'s adoption fee at Textile Poms.`,
            },
          },
        },
      ],
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout session error", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to start checkout." },
      { status: 500 }
    );
  }
}
