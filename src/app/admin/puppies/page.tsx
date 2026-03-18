"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PuppyStatus = "available" | "reserved" | "adopted";

interface PuppyAdminRecord {
  id: string;
  name: string;
  image: string;
  currentPrice: number | null;
  depositAmount: number;
  status: PuppyStatus;
  age: string;
  color: string;
  payment?: {
    depositPaidAmount?: number;
    reservedByEmail?: string;
    reservedByName?: string;
    finalInvoiceUrl?: string;
    finalInvoiceStatus?: string;
  };
}

export default function AdminPuppiesPage() {
  const [puppies, setPuppies] = useState<PuppyAdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchPuppies() {
    setLoading(true);
    const response = await fetch("/api/admin/puppies");
    const payload = await response.json();
    setPuppies(payload);
    setLoading(false);
  }

  useEffect(() => {
    fetchPuppies();
  }, []);

  function updateLocal(
    id: string,
    field: "currentPrice" | "depositAmount" | "status" | "reservedByEmail" | "reservedByName",
    value: string
  ) {
    setPuppies((current) =>
      current.map((puppy) => {
        if (puppy.id !== id) return puppy;

        if (field === "reservedByEmail" || field === "reservedByName") {
          return {
            ...puppy,
            payment: {
              ...puppy.payment,
              [field]: value,
            },
          };
        }

        return {
          ...puppy,
          [field]:
            field === "status"
              ? value
              : value === ""
                ? null
                : Number(value),
        };
      })
    );
  }

  async function savePuppy(puppy: PuppyAdminRecord) {
    try {
      setError(null);
      setSavingId(puppy.id);
      const response = await fetch(`/api/admin/puppies/${puppy.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPrice: puppy.currentPrice,
          depositAmount: puppy.depositAmount,
          status: puppy.status,
          reservedByEmail: puppy.payment?.reservedByEmail || "",
          reservedByName: puppy.payment?.reservedByName || "",
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to save puppy.");
      }

      setPuppies((current) =>
        current.map((entry) => (entry.id === puppy.id ? payload : entry))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save puppy.");
    } finally {
      setSavingId(null);
    }
  }

  async function sendInvoice(puppy: PuppyAdminRecord) {
    try {
      setError(null);
      setInvoiceId(puppy.id);
      const response = await fetch(`/api/admin/puppies/${puppy.id}/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: puppy.payment?.reservedByEmail || "" }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to send invoice.");
      }

      await fetchPuppies();
      if (payload.invoiceUrl) {
        window.open(payload.invoiceUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send invoice.");
    } finally {
      setInvoiceId(null);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16 md:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
              Admin
            </p>
            <h1 className="mt-3 text-4xl font-extrabold text-gray-900">
              Puppy Pricing & Payments
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-gray-700">
              Update pricing, reservation status, deposit defaults, and the
              buyer email used for the final Stripe invoice.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/blog"
              className="rounded-full border border-gray-300 px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-white"
            >
              Blog Admin
            </Link>
            <Link
              href="/#puppies"
              className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              View Site
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-10 grid gap-6">
          {loading ? (
            <div className="rounded-[2rem] border border-stone-200 bg-white px-6 py-10 text-gray-600 shadow-sm">
              Loading puppies...
            </div>
          ) : (
            puppies.map((puppy) => {
              const remainingBalance = Math.max(
                (puppy.currentPrice ?? 0) - (puppy.payment?.depositPaidAmount ?? 0),
                0
              );

              return (
                <section
                  key={puppy.id}
                  className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-stone-500">
                        {puppy.id}
                      </p>
                      <h2 className="mt-2 text-3xl font-bold text-gray-900">
                        {puppy.name}
                      </h2>
                      <p className="mt-2 text-gray-600">
                        {puppy.color} · DOB {puppy.age}
                      </p>
                    </div>
                    <div className="rounded-full bg-stone-100 px-4 py-2 text-sm uppercase tracking-[0.25em] text-stone-700">
                      {puppy.status}
                    </div>
                  </div>

                  <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-gray-700">
                        Current Price
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={puppy.currentPrice ?? ""}
                        onChange={(e) =>
                          updateLocal(puppy.id, "currentPrice", e.target.value)
                        }
                        className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-gray-700">
                        Deposit Amount
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={puppy.depositAmount}
                        onChange={(e) =>
                          updateLocal(puppy.id, "depositAmount", e.target.value)
                        }
                        className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-gray-700">
                        Status
                      </span>
                      <select
                        value={puppy.status}
                        onChange={(e) => updateLocal(puppy.id, "status", e.target.value)}
                        className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                      >
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="adopted">Adopted</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-gray-700">
                        Buyer Email
                      </span>
                      <input
                        type="email"
                        value={puppy.payment?.reservedByEmail ?? ""}
                        onChange={(e) =>
                          updateLocal(puppy.id, "reservedByEmail", e.target.value)
                        }
                        className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                      />
                    </label>
                  </div>

                  <label className="mt-5 block md:max-w-md">
                    <span className="mb-2 block text-sm font-medium text-gray-700">
                      Buyer Name
                    </span>
                    <input
                      type="text"
                      value={puppy.payment?.reservedByName ?? ""}
                      onChange={(e) =>
                        updateLocal(puppy.id, "reservedByName", e.target.value)
                      }
                      className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                    />
                  </label>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-[1.5rem] bg-stone-100 px-5 py-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                        Deposit Paid
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        ${Number(puppy.payment?.depositPaidAmount ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] bg-stone-100 px-5 py-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                        Remaining Balance
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        ${remainingBalance.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] bg-stone-100 px-5 py-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                        Final Invoice
                      </p>
                      <p className="mt-2 text-lg font-semibold text-gray-900">
                        {puppy.payment?.finalInvoiceStatus || "Not sent"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => savePuppy(puppy)}
                      disabled={savingId === puppy.id}
                      className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                    >
                      {savingId === puppy.id ? "Saving..." : "Save Puppy"}
                    </button>
                    <button
                      type="button"
                      onClick={() => sendInvoice(puppy)}
                      disabled={invoiceId === puppy.id}
                      className="rounded-full border border-emerald-600 px-5 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-emerald-200 disabled:text-emerald-300"
                    >
                      {invoiceId === puppy.id
                        ? "Creating Invoice..."
                        : "Send Remaining Balance Invoice"}
                    </button>
                    {puppy.payment?.finalInvoiceUrl ? (
                      <a
                        href={puppy.payment.finalInvoiceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-gray-300 px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-stone-50"
                      >
                        Open Invoice
                      </a>
                    ) : null}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
