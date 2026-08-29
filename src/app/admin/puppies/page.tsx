"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_PUPPY_SKILLS } from "@/data/defaultPuppies";
import { resolvePuppyImageSrc } from "@/lib/puppyImageSrc";

type PuppyStatus = "available" | "reserved" | "adopted";
type PuppySex = "male" | "female";

interface PuppyAdminRecord {
  id: string;
  litterId?: string;
  name: string;
  image: string;
  currentPrice: number | null;
  depositAmount: number;
  status: PuppyStatus;
  sex?: PuppySex;
  age: string;
  color: string;
  description: string;
  skills?: string;
  archivedAt?: string;
  payment?: {
    depositPaidAmount?: number;
    reservedByEmail?: string;
    reservedByName?: string;
    finalInvoiceUrl?: string;
    finalInvoiceStatus?: string;
    stripeCustomerId?: string;
  };
}

interface PuppyFormState {
  name: string;
  currentPrice: string;
  depositAmount: string;
  status: PuppyStatus;
  sex: PuppySex | "";
  age: string;
  color: string;
  description: string;
  skills: string;
  reservedByEmail: string;
  reservedByName: string;
}

const EMPTY_FORM: PuppyFormState = {
  name: "",
  currentPrice: "3000",
  depositAmount: "1000",
  status: "available",
  sex: "",
  age: "",
  color: "",
  description: "",
  skills: DEFAULT_PUPPY_SKILLS,
  reservedByEmail: "",
  reservedByName: "",
};

function toFormState(puppy: PuppyAdminRecord): PuppyFormState {
  return {
    name: puppy.name,
    currentPrice:
      puppy.currentPrice === null ? "" : String(puppy.currentPrice ?? ""),
    depositAmount: String(puppy.depositAmount ?? 1000),
    status: puppy.status,
    sex: puppy.sex || "",
    age: puppy.age,
    color: puppy.color,
    description: puppy.description,
    skills: puppy.skills || DEFAULT_PUPPY_SKILLS,
    reservedByEmail: puppy.payment?.reservedByEmail || "",
    reservedByName: puppy.payment?.reservedByName || "",
  };
}

function createEmptyFileState() {
  return {
    file: null as File | null,
    preview: null as string | null,
  };
}

export default function AdminPuppiesPage() {
  const [puppies, setPuppies] = useState<PuppyAdminRecord[]>([]);
  const [drafts, setDrafts] = useState<Record<string, PuppyFormState>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [resettingLitter, setResettingLitter] = useState(false);
  const [createForm, setCreateForm] = useState<PuppyFormState>(EMPTY_FORM);
  const [createFileState, setCreateFileState] = useState(
    createEmptyFileState()
  );
  const [editFiles, setEditFiles] = useState<Record<string, File | null>>({});
  const [editPreviews, setEditPreviews] = useState<
    Record<string, string | null>
  >({});

  const activePuppies = useMemo(
    () => puppies.filter((puppy) => !puppy.archivedAt),
    [puppies]
  );
  const archivedPuppies = useMemo(
    () => puppies.filter((puppy) => puppy.archivedAt),
    [puppies]
  );

  function cleanupPreview(url: string | null | undefined) {
    if (url) URL.revokeObjectURL(url);
  }

  function setCreatePreview(file: File | null) {
    setCreateFileState((current) => {
      cleanupPreview(current.preview);
      return {
        file,
        preview: file ? URL.createObjectURL(file) : null,
      };
    });
  }

  function setEditPreview(id: string, file: File | null) {
    setEditPreviews((current) => {
      const previousPreview = current[id];
      cleanupPreview(previousPreview);
      return {
        ...current,
        [id]: file ? URL.createObjectURL(file) : null,
      };
    });

    setEditFiles((current) => ({
      ...current,
      [id]: file,
    }));
  }

  async function fetchPuppies() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/puppies");
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to load puppies.");
      }

      setPuppies(payload as PuppyAdminRecord[]);
      setDrafts(
        Object.fromEntries(
          (payload as PuppyAdminRecord[]).map((puppy) => [
            puppy.id,
            toFormState(puppy),
          ])
        )
      );
      setEditFiles({});
      setEditPreviews((current) => {
        Object.values(current).forEach((url) => cleanupPreview(url));
        return {};
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load puppies.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPuppies();
    return () => {
      cleanupPreview(createFileState.preview);
      Object.values(editPreviews).forEach((url) => cleanupPreview(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateDraft(id: string, field: keyof PuppyFormState, value: string) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...(current[id] || EMPTY_FORM),
        [field]: value,
      },
    }));
  }

  function updateCreateForm(field: keyof PuppyFormState, value: string) {
    setCreateForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function savePuppy(puppy: PuppyAdminRecord, resetPayment = false) {
    try {
      setError(null);
      setSavingId(puppy.id);
      const draft = drafts[puppy.id] || toFormState(puppy);
      const formData = new FormData();
      formData.append("name", draft.name);
      formData.append("currentPrice", draft.currentPrice);
      formData.append("depositAmount", draft.depositAmount);
      formData.append("status", draft.status);
      formData.append("sex", draft.sex);
      formData.append("age", draft.age);
      formData.append("color", draft.color);
      formData.append("description", draft.description);
      formData.append("skills", draft.skills);
      formData.append(
        "reservedByEmail",
        resetPayment ? "" : draft.reservedByEmail
      );
      formData.append(
        "reservedByName",
        resetPayment ? "" : draft.reservedByName
      );
      formData.append("resetPayment", resetPayment ? "true" : "false");

      const file = editFiles[puppy.id];
      if (file) {
        formData.append("image", file);
      }

      const response = await fetch(`/api/admin/puppies/${puppy.id}`, {
        method: "PUT",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to save puppy.");
      }

      await fetchPuppies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save puppy.");
    } finally {
      setSavingId(null);
    }
  }

  async function createPuppy() {
    try {
      setError(null);
      if (!createFileState.file) {
        throw new Error("Please choose an image before creating a puppy.");
      }

      setSavingId("create");
      const formData = new FormData();
      formData.append("name", createForm.name);
      formData.append("currentPrice", createForm.currentPrice);
      formData.append("depositAmount", createForm.depositAmount);
      formData.append("status", createForm.status);
      formData.append("sex", createForm.sex);
      formData.append("age", createForm.age);
      formData.append("color", createForm.color);
      formData.append("description", createForm.description);
      formData.append("skills", createForm.skills || DEFAULT_PUPPY_SKILLS);
      formData.append("image", createFileState.file);

      const response = await fetch("/api/admin/puppies", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to create puppy.");
      }

      setCreateForm(EMPTY_FORM);
      setCreateFileState((current) => {
        cleanupPreview(current.preview);
        return createEmptyFileState();
      });
      await fetchPuppies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create puppy.");
    } finally {
      setSavingId(null);
    }
  }

  async function archivePuppy(puppy: PuppyAdminRecord) {
    try {
      setError(null);
      setArchivingId(puppy.id);
      const response = await fetch(`/api/admin/puppies/${puppy.id}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to archive puppy.");
      }

      await fetchPuppies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to archive puppy.");
    } finally {
      setArchivingId(null);
    }
  }

  async function purgeArchivedPuppy(puppy: PuppyAdminRecord) {
    if (!confirm("Permanently delete this archived puppy record?")) return;

    try {
      setError(null);
      setArchivingId(puppy.id);
      const response = await fetch(`/api/admin/puppies/${puppy.id}/purge`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to delete archived puppy.");
      }

      await fetchPuppies();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete archived puppy."
      );
    } finally {
      setArchivingId(null);
    }
  }

  async function resetPaymentState(puppy: PuppyAdminRecord) {
    try {
      setError(null);
      setResettingId(puppy.id);
      const draft = drafts[puppy.id] || toFormState(puppy);
      const formData = new FormData();
      formData.append("name", draft.name);
      formData.append("currentPrice", draft.currentPrice);
      formData.append("depositAmount", draft.depositAmount);
      formData.append("status", "available");
      formData.append("sex", draft.sex);
      formData.append("age", draft.age);
      formData.append("color", draft.color);
      formData.append("description", draft.description);
      formData.append("skills", draft.skills);
      formData.append("reservedByEmail", "");
      formData.append("reservedByName", "");
      formData.append("resetPayment", "true");

      const response = await fetch(`/api/admin/puppies/${puppy.id}`, {
        method: "PUT",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to reset payment state.");
      }

      await fetchPuppies();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to reset payment state."
      );
    } finally {
      setResettingId(null);
    }
  }

  async function sendInvoice(puppy: PuppyAdminRecord) {
    try {
      setError(null);
      setInvoiceId(puppy.id);
      const draft = drafts[puppy.id] || toFormState(puppy);
      const response = await fetch(`/api/admin/puppies/${puppy.id}/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: draft.reservedByEmail || "" }),
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

  async function resetLitter() {
    if (!confirm("Archive the current litter and seed a fresh one?")) return;

    try {
      setError(null);
      setResettingLitter(true);
      const response = await fetch("/api/admin/puppies/reset", {
        method: "POST",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to reset litter.");
      }

      setCreateForm(EMPTY_FORM);
      setCreateFileState((current) => {
        cleanupPreview(current.preview);
        return createEmptyFileState();
      });
      await fetchPuppies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset litter.");
    } finally {
      setResettingLitter(false);
    }
  }

  const availableCount = activePuppies.length;
  const archivedCount = archivedPuppies.length;

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16 md:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
              Admin
            </p>
            <h1 className="mt-3 text-4xl font-extrabold text-gray-900">
              Puppy CRM
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-gray-700">
              Create, edit, archive, and reseed puppy cards from one place.
              Pricing, payments, and invoice controls stay in the same workflow.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={resetLitter}
              disabled={resettingLitter}
              className="rounded-full border cursor-pointer border-amber-500 px-5 py-3 text-sm font-medium text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:border-amber-200 disabled:text-amber-300"
            >
              {resettingLitter ? "Resetting Litter..." : "Reset Current Litter"}
            </button>
            <Link
              href="/admin/waitlist"
              className="flex items-center justify-center rounded-full border border-amber-500 px-5 py-3 text-sm font-medium text-amber-700 transition hover:bg-amber-50"
            >
              Waitlist CRM
            </Link>
            <Link
              href="/admin/blog"
              className="flex items-center justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-white"
            >
              Blog Admin
            </Link>
            <Link
              href="/#puppies"
              className="flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              View Site
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-stone-200 bg-white px-6 py-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
              Active Puppies
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {availableCount}
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-stone-200 bg-white px-6 py-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
              Archived Puppies
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {archivedCount}
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-stone-200 bg-white px-6 py-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
              Shared Skills Copy
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              {DEFAULT_PUPPY_SKILLS.slice(0, 120)}...
            </p>
          </div>
        </div>

        {error ? (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mt-10 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Create New Puppy
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Add a new card, upload the primary image, and seed the litter
                with the default skills text.
              </p>
            </div>
            <p className="text-sm text-stone-500">
              Image upload is required for new puppies.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Name
              </span>
              <input
                value={createForm.name}
                onChange={(e) => updateCreateForm("name", e.target.value)}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                placeholder="Satin"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Current Price
              </span>
              <input
                type="number"
                min="0"
                value={createForm.currentPrice}
                onChange={(e) =>
                  updateCreateForm("currentPrice", e.target.value)
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
                value={createForm.depositAmount}
                onChange={(e) =>
                  updateCreateForm("depositAmount", e.target.value)
                }
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </span>
              <select
                value={createForm.status}
                onChange={(e) =>
                  updateCreateForm("status", e.target.value as PuppyStatus)
                }
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="adopted">Adopted</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Gender
              </span>
              <select
                value={createForm.sex}
                onChange={(e) =>
                  updateCreateForm("sex", e.target.value as PuppySex | "")
                }
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                DOB / Age
              </span>
              <input
                value={createForm.age}
                onChange={(e) => updateCreateForm("age", e.target.value)}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                placeholder="Jan 1st, 2026"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Color
              </span>
              <input
                value={createForm.color}
                onChange={(e) => updateCreateForm("color", e.target.value)}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                placeholder="Cream"
              />
            </label>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </span>
              <textarea
                rows={5}
                value={createForm.description}
                onChange={(e) =>
                  updateCreateForm("description", e.target.value)
                }
                className="w-full rounded-3xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                placeholder="Short description for the puppy card..."
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Skills
              </span>
              <textarea
                rows={5}
                value={createForm.skills}
                onChange={(e) => updateCreateForm("skills", e.target.value)}
                className="w-full rounded-3xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <label className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-emerald-600 px-5 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50">
              <span>Choose Image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setCreatePreview(e.target.files?.[0] || null)}
              />
            </label>
            <p className="text-sm text-gray-600">
              {createFileState.file
                ? createFileState.file.name
                : "No file selected"}
            </p>
          </div>

          {createFileState.preview ? (
            <div className="mt-5 max-w-xs overflow-hidden rounded-[1.75rem] border border-stone-200 bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={createFileState.preview}
                alt="New puppy preview"
                className="h-64 w-full object-cover"
              />
            </div>
          ) : null}

          <button
            type="button"
            onClick={createPuppy}
            disabled={savingId === "create"}
            className="mt-6 rounded-full bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {savingId === "create" ? "Creating Puppy..." : "Create Puppy"}
          </button>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Active Puppies
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Edit card details, replace the primary image, reset payment
                state, or archive a puppy when the litter is sold.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 rounded-[2rem] border border-stone-200 bg-white px-6 py-10 text-gray-600 shadow-sm">
              Loading puppies...
            </div>
          ) : activePuppies.length === 0 ? (
            <div className="mt-6 rounded-[2rem] border border-stone-200 bg-white px-6 py-10 text-gray-600 shadow-sm">
              No active puppies yet. Use the form above to add a new card or
              reset the litter to seed the defaults.
            </div>
          ) : (
            <div className="mt-6 grid gap-6">
              {activePuppies.map((puppy) => {
                const draft = drafts[puppy.id] || toFormState(puppy);
                const finalInvoicePaid =
                  puppy.payment?.finalInvoiceStatus === "paid";
                const remainingBalance = finalInvoicePaid
                  ? 0
                  : Math.max(
                      (puppy.currentPrice ?? 0) -
                        (puppy.payment?.depositPaidAmount ?? 0),
                      0
                    );

                return (
                  <section
                    key={puppy.id}
                    className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm"
                  >
                    <div className="grid gap-6 p-6 lg:grid-cols-[300px_minmax(0,1fr)]">
                      <div className="space-y-4">
                        <div className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-stone-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolvePuppyImageSrc(
                              editPreviews[puppy.id] || puppy.image
                            )}
                            alt={puppy.name}
                            className="h-80 w-full object-cover"
                          />
                        </div>
                        <label className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-emerald-600 px-5 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50">
                          <span>Replace Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              setEditPreview(
                                puppy.id,
                                e.target.files?.[0] || null
                              )
                            }
                          />
                        </label>
                        {editFiles[puppy.id] ? (
                          <p className="text-sm text-gray-600">
                            Selected file: {editFiles[puppy.id]?.name}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-sm uppercase tracking-[0.35em] text-stone-500">
                              {puppy.id}
                            </p>
                            <h3 className="mt-2 text-3xl font-bold text-gray-900">
                              {puppy.name}
                            </h3>
                            <p className="mt-2 text-gray-600">
                              {puppy.color} · DOB {puppy.age}
                            </p>
                            {puppy.litterId ? (
                              <p className="mt-1 text-sm text-stone-500">
                                Litter {puppy.litterId}
                              </p>
                            ) : null}
                          </div>
                          <div className="rounded-full bg-stone-100 px-4 py-2 text-sm uppercase tracking-[0.25em] text-stone-700">
                            {puppy.status}
                          </div>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-gray-700">
                              Name
                            </span>
                            <input
                              value={draft.name}
                              onChange={(e) =>
                                updateDraft(puppy.id, "name", e.target.value)
                              }
                              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-gray-700">
                              Current Price
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={draft.currentPrice}
                              onChange={(e) =>
                                updateDraft(
                                  puppy.id,
                                  "currentPrice",
                                  e.target.value
                                )
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
                              value={draft.depositAmount}
                              onChange={(e) =>
                                updateDraft(
                                  puppy.id,
                                  "depositAmount",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-gray-700">
                              Status
                            </span>
                            <select
                              value={draft.status}
                              onChange={(e) =>
                                updateDraft(
                                  puppy.id,
                                  "status",
                                  e.target.value as PuppyStatus
                                )
                              }
                              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                            >
                              <option value="available">Available</option>
                              <option value="reserved">Reserved</option>
                              <option value="adopted">Adopted</option>
                            </select>
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-gray-700">
                              Gender
                            </span>
                            <select
                              value={draft.sex}
                              onChange={(e) =>
                                updateDraft(
                                  puppy.id,
                                  "sex",
                                  e.target.value as PuppySex | ""
                                )
                              }
                              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                            >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                          </label>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-gray-700">
                              DOB / Age
                            </span>
                            <input
                              value={draft.age}
                              onChange={(e) =>
                                updateDraft(puppy.id, "age", e.target.value)
                              }
                              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-gray-700">
                              Color
                            </span>
                            <input
                              value={draft.color}
                              onChange={(e) =>
                                updateDraft(puppy.id, "color", e.target.value)
                              }
                              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                            />
                          </label>
                        </div>

                        <div className="mt-5 grid gap-4 lg:grid-cols-2">
                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-gray-700">
                              Description
                            </span>
                            <textarea
                              rows={5}
                              value={draft.description}
                              onChange={(e) =>
                                updateDraft(
                                  puppy.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-3xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-gray-700">
                              Skills
                            </span>
                            <textarea
                              rows={5}
                              value={draft.skills}
                              onChange={(e) =>
                                updateDraft(puppy.id, "skills", e.target.value)
                              }
                              className="w-full rounded-3xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                            />
                          </label>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-gray-700">
                              Buyer Email
                            </span>
                            <input
                              type="email"
                              value={draft.reservedByEmail}
                              onChange={(e) =>
                                updateDraft(
                                  puppy.id,
                                  "reservedByEmail",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-gray-700">
                              Buyer Name
                            </span>
                            <input
                              type="text"
                              value={draft.reservedByName}
                              onChange={(e) =>
                                updateDraft(
                                  puppy.id,
                                  "reservedByName",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                            />
                          </label>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                          <div className="rounded-[1.5rem] bg-stone-100 px-5 py-4">
                            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                              Deposit Paid
                            </p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">
                              $
                              {Number(
                                puppy.payment?.depositPaidAmount ?? 0
                              ).toLocaleString()}
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
                            disabled={
                              savingId === puppy.id ||
                              archivingId === puppy.id ||
                              resettingId === puppy.id
                            }
                            className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                          >
                            {savingId === puppy.id ? "Saving..." : "Save Puppy"}
                          </button>
                          <button
                            type="button"
                            onClick={() => resetPaymentState(puppy)}
                            disabled={
                              resettingId === puppy.id ||
                              savingId === puppy.id ||
                              archivingId === puppy.id
                            }
                            className="rounded-full border border-amber-500 px-5 py-3 text-sm font-medium text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:border-amber-200 disabled:text-amber-300"
                          >
                            {resettingId === puppy.id
                              ? "Resetting..."
                              : "Reset Payment State"}
                          </button>
                          <button
                            type="button"
                            onClick={() => sendInvoice(puppy)}
                            disabled={
                              invoiceId === puppy.id ||
                              resettingId === puppy.id ||
                              savingId === puppy.id ||
                              finalInvoicePaid ||
                              remainingBalance <= 0
                            }
                            className="rounded-full border border-emerald-600 px-5 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-emerald-200 disabled:text-emerald-300"
                          >
                            {invoiceId === puppy.id
                              ? "Creating Invoice..."
                              : finalInvoicePaid
                              ? "Invoice Paid"
                              : "Send Remaining Balance Invoice"}
                          </button>
                          <button
                            type="button"
                            onClick={() => archivePuppy(puppy)}
                            disabled={
                              archivingId === puppy.id ||
                              savingId === puppy.id ||
                              resettingId === puppy.id
                            }
                            className="rounded-full border border-red-500 px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-red-200 disabled:text-red-300"
                          >
                            {archivingId === puppy.id
                              ? "Archiving..."
                              : "Archive Puppy"}
                          </button>
                        </div>

                        {puppy.payment?.finalInvoiceUrl ? (
                          <div className="mt-4">
                            <a
                              href={puppy.payment.finalInvoiceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium text-emerald-700 underline"
                            >
                              Open Invoice
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">Archived History</h2>
          <p className="mt-1 text-sm text-gray-600">
            Archived puppies stay in the record for historical reference and are
            hidden from the public site.
          </p>

          {archivedPuppies.length === 0 ? (
            <div className="mt-6 rounded-[2rem] border border-stone-200 bg-white px-6 py-10 text-gray-600 shadow-sm">
              No archived puppies yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {archivedPuppies.map((puppy) => (
                <article
                  key={puppy.id}
                  className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolvePuppyImageSrc(puppy.image)}
                    alt={puppy.name}
                    className="h-64 w-full object-cover"
                  />
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
                      {puppy.id}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-gray-900">
                      {puppy.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {puppy.color} · DOB {puppy.age}
                    </p>
                    <p className="mt-3 text-sm text-stone-500">
                      Archived{" "}
                      {puppy.archivedAt
                        ? new Date(puppy.archivedAt).toLocaleString()
                        : "recently"}
                    </p>
                    <p className="mt-3 text-sm uppercase tracking-[0.25em] text-stone-700">
                      {puppy.status}
                    </p>
                    <button
                      type="button"
                      onClick={() => purgeArchivedPuppy(puppy)}
                      disabled={archivingId === puppy.id}
                      className="mt-4 rounded-full border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-rose-200 disabled:text-rose-300"
                    >
                      {archivingId === puppy.id
                        ? "Deleting..."
                        : "Delete Permanently"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
