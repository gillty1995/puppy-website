"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { WAITLIST_DEPOSIT_AMOUNT } from "@/lib/waitlistConfig";

type WaitlistStatus =
  | "pending"
  | "paid"
  | "contacted"
  | "refund_eligible"
  | "refunded";

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  depositAmount: number;
  status: WaitlistStatus;
  createdAt: string;
  updatedAt: string;
  checkoutSessionId?: string;
  paymentIntentId?: string;
  stripeCustomerId?: string;
  chargeId?: string;
  paidAt?: string;
  refundEligibleAt?: string;
  refundedAt?: string;
  refundedAmount?: number;
  adminNotes?: string;
  refundEligible?: boolean;
}

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [refundingId, setRefundingId] = useState<string | null>(null);

  async function fetchEntries() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/waitlist");
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to load waitlist.");
      }
      setEntries(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load waitlist.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEntries();
  }, []);

  const totals = useMemo(() => {
    return {
      total: entries.length,
      paid: entries.filter((entry) => entry.status === "paid").length,
      eligible: entries.filter((entry) => entry.refundEligible).length,
      refunded: entries.filter((entry) => entry.status === "refunded").length,
    };
  }, [entries]);

  async function markContacted(entry: WaitlistEntry) {
    try {
      setError("");
      setSavingId(entry.id);
      const response = await fetch(`/api/admin/waitlist/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "contacted",
          adminNotes: entry.adminNotes || "",
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to update waitlist.");
      }
      await fetchEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update waitlist.");
    } finally {
      setSavingId(null);
    }
  }

  async function issueRefund(entry: WaitlistEntry) {
    if (!confirm("Refund this waitlist deposit now?")) return;

    try {
      setError("");
      setRefundingId(entry.id);
      const response = await fetch(`/api/admin/waitlist/${entry.id}/refund`, {
        method: "POST",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to refund deposit.");
      }
      await fetchEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to refund deposit.");
    } finally {
      setRefundingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16 md:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
              Admin
            </p>
            <h1 className="mt-3 text-4xl font-extrabold text-gray-900">
              Waitlist CRM
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-gray-700">
              Track paid deposits, refund eligibility, and follow-up actions for
              upcoming litters.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/puppies"
              className="rounded-full border border-gray-300 px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-white"
            >
              Puppy CRM
            </Link>
            <Link
              href="/waitlist"
              className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              View Waitlist Page
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.75rem] border border-stone-200 bg-white px-6 py-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Total</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{totals.total}</p>
          </div>
          <div className="rounded-[1.75rem] border border-stone-200 bg-white px-6 py-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Paid</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{totals.paid}</p>
          </div>
          <div className="rounded-[1.75rem] border border-stone-200 bg-white px-6 py-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Refund Eligible</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{totals.eligible}</p>
          </div>
          <div className="rounded-[1.75rem] border border-stone-200 bg-white px-6 py-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Refunded</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{totals.refunded}</p>
          </div>
        </div>

        {error ? (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mt-10">
          {loading ? (
            <div className="rounded-[2rem] border border-stone-200 bg-white px-6 py-10 text-gray-600 shadow-sm">
              Loading waitlist...
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-[2rem] border border-stone-200 bg-white px-6 py-10 text-gray-600 shadow-sm">
              No waitlist entries yet.
            </div>
          ) : (
            <div className="grid gap-6">
              {entries.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-stone-500">
                        {entry.id}
                      </p>
                      <h2 className="mt-2 text-3xl font-bold text-gray-900">
                        {entry.name}
                      </h2>
                      <p className="mt-2 text-gray-600">{entry.email}</p>
                      {entry.phone ? <p className="mt-1 text-gray-600">{entry.phone}</p> : null}
                    </div>
                    <div className="rounded-full bg-stone-100 px-4 py-2 text-sm uppercase tracking-[0.25em] text-stone-700">
                      {entry.status}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-4">
                    <div className="rounded-[1.5rem] bg-stone-100 px-5 py-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                        Deposit
                      </p>
                      <p className="mt-2 text-2xl font-bold text-gray-900">
                        ${entry.depositAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] bg-stone-100 px-5 py-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                        Refund Eligible
                      </p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {entry.refundEligible
                          ? "Eligible now"
                          : entry.refundEligibleAt
                            ? new Date(entry.refundEligibleAt).toLocaleDateString()
                            : "Pending"}
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] bg-stone-100 px-5 py-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                        Created
                      </p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] bg-stone-100 px-5 py-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                        Paid At
                      </p>
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {entry.paidAt ? new Date(entry.paidAt).toLocaleString() : "Not paid"}
                      </p>
                    </div>
                  </div>

                  {entry.notes ? (
                    <p className="mt-5 rounded-2xl bg-stone-50 px-4 py-3 text-sm leading-7 text-gray-700">
                      {entry.notes}
                    </p>
                  ) : null}

                  {entry.adminNotes ? (
                    <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm leading-7 text-gray-700">
                      Admin Notes: {entry.adminNotes}
                    </p>
                  ) : null}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => markContacted(entry)}
                      disabled={savingId === entry.id || refundingId === entry.id}
                      className="rounded-full border border-emerald-600 px-5 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-emerald-200 disabled:text-emerald-300"
                    >
                      {savingId === entry.id ? "Saving..." : "Mark Contacted"}
                    </button>
                    <button
                      type="button"
                      onClick={() => issueRefund(entry)}
                      disabled={
                        refundingId === entry.id ||
                        savingId === entry.id ||
                        !entry.refundEligible ||
                        entry.status === "refunded"
                      }
                      className="rounded-full border border-amber-500 px-5 py-3 text-sm font-medium text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:border-amber-200 disabled:text-amber-300"
                    >
                      {refundingId === entry.id
                        ? "Refunding..."
                        : entry.status === "refunded"
                          ? "Refunded"
                          : entry.refundEligible
                            ? "Refund Deposit"
                            : "Not Refund Eligible"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="mt-8 text-sm text-stone-500">
          The current waitlist deposit amount is ${WAITLIST_DEPOSIT_AMOUNT}.
        </p>
      </div>
    </main>
  );
}
