import { NextResponse } from "next/server";
import {
  findWaitlistById,
  isWaitlistRefundEligible,
  markWaitlistRefunded,
} from "@/data/waitlist";
import { requireAdminApi } from "@/lib/admin";
import { getStripe } from "@/lib/stripe";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const entry = await findWaitlistById(id);
  if (!entry) {
    return NextResponse.json({ error: "Waitlist entry not found." }, { status: 404 });
  }

  if (!isWaitlistRefundEligible(entry)) {
    return NextResponse.json(
      { error: "This waitlist deposit is not yet refund eligible." },
      { status: 400 }
    );
  }

  if (!entry.paymentIntentId) {
    return NextResponse.json(
      { error: "Missing payment intent for this waitlist entry." },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const refund = await stripe.refunds.create({
      payment_intent: entry.paymentIntentId,
    });

    const updated = await markWaitlistRefunded({
      id: entry.id,
      paymentIntentId: entry.paymentIntentId,
      chargeId:
        typeof refund.charge === "string" ? refund.charge : undefined,
      refundedAmount:
        typeof refund.amount === "number" ? refund.amount / 100 : entry.depositAmount,
    });

    return NextResponse.json({ ok: true, entry: updated, refund });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to refund waitlist deposit." },
      { status: 500 }
    );
  }
}
