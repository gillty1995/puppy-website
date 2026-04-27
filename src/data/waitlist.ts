import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  WAITLIST_DEPOSIT_AMOUNT,
  WAITLIST_REFUND_ELIGIBILITY_MONTHS,
} from "@/lib/waitlistConfig";

export type WaitlistStatus =
  | "pending"
  | "paid"
  | "contacted"
  | "refund_eligible"
  | "refunded";

export interface WaitlistEntry {
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
}

const filePath = path.join(process.cwd(), "src", "data", "waitlist.json");

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function normalizeWaitlistEntry(entry: Partial<WaitlistEntry>): WaitlistEntry {
  const createdAt = typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString();
  const updatedAt = typeof entry.updatedAt === "string" ? entry.updatedAt : createdAt;
  return {
    id: typeof entry.id === "string" && entry.id ? entry.id : randomUUID(),
    name: typeof entry.name === "string" ? entry.name : "Unnamed",
    email: typeof entry.email === "string" ? entry.email : "",
    phone: typeof entry.phone === "string" ? entry.phone : "",
    notes: typeof entry.notes === "string" ? entry.notes : "",
    depositAmount:
      typeof entry.depositAmount === "number" ? entry.depositAmount : WAITLIST_DEPOSIT_AMOUNT,
    status:
      entry.status === "paid" ||
      entry.status === "contacted" ||
      entry.status === "refund_eligible" ||
      entry.status === "refunded"
        ? entry.status
        : "pending",
    createdAt,
    updatedAt,
    checkoutSessionId:
      typeof entry.checkoutSessionId === "string" ? entry.checkoutSessionId : undefined,
    paymentIntentId:
      typeof entry.paymentIntentId === "string" ? entry.paymentIntentId : undefined,
    stripeCustomerId:
      typeof entry.stripeCustomerId === "string" ? entry.stripeCustomerId : undefined,
    chargeId: typeof entry.chargeId === "string" ? entry.chargeId : undefined,
    paidAt: typeof entry.paidAt === "string" ? entry.paidAt : undefined,
    refundEligibleAt:
      typeof entry.refundEligibleAt === "string"
        ? entry.refundEligibleAt
        : addMonths(new Date(createdAt), WAITLIST_REFUND_ELIGIBILITY_MONTHS).toISOString(),
    refundedAt: typeof entry.refundedAt === "string" ? entry.refundedAt : undefined,
    refundedAmount:
      typeof entry.refundedAmount === "number" ? entry.refundedAmount : undefined,
    adminNotes: typeof entry.adminNotes === "string" ? entry.adminNotes : "",
  };
}

export function getWaitlistDepositAmount() {
  return WAITLIST_DEPOSIT_AMOUNT;
}

export function getWaitlistRefundEligibilityMonths() {
  return WAITLIST_REFUND_ELIGIBILITY_MONTHS;
}

export function isWaitlistRefundEligible(entry: Pick<WaitlistEntry, "refundEligibleAt" | "status">) {
  if (entry.status === "refunded") return false;
  if (!entry.refundEligibleAt) return false;
  return new Date(entry.refundEligibleAt).getTime() <= Date.now();
}

export async function readWaitlist(): Promise<WaitlistEntry[]> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((entry) => normalizeWaitlistEntry(entry)) : [];
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") {
      await fs.writeFile(filePath, "[]");
      return [];
    }
    throw err;
  }
}

export async function writeWaitlist(entries: WaitlistEntry[]): Promise<void> {
  const sanitized = entries.map((entry) => normalizeWaitlistEntry(entry));
  await fs.writeFile(filePath, JSON.stringify(sanitized, null, 2));
}

export async function createWaitlistEntry(
  input: Pick<WaitlistEntry, "name" | "email" | "phone" | "notes">
): Promise<WaitlistEntry> {
  const entries = await readWaitlist();
  const createdAt = new Date().toISOString();
  const entry = normalizeWaitlistEntry({
    ...input,
    depositAmount: WAITLIST_DEPOSIT_AMOUNT,
    status: "pending",
    createdAt,
    updatedAt: createdAt,
  });

  entries.unshift(entry);
  await writeWaitlist(entries);
  return entry;
}

export async function updateWaitlistEntry(
  id: string,
  updates: Partial<WaitlistEntry>
): Promise<WaitlistEntry | undefined> {
  const entries = await readWaitlist();
  const index = entries.findIndex((entry) => entry.id === id);
  if (index === -1) return undefined;

  entries[index] = normalizeWaitlistEntry({
    ...entries[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  });
  await writeWaitlist(entries);
  return entries[index];
}

export async function findWaitlistById(id: string): Promise<WaitlistEntry | undefined> {
  const entries = await readWaitlist();
  return entries.find((entry) => entry.id === id);
}

export async function findWaitlistByCheckoutSessionId(
  sessionId: string
): Promise<WaitlistEntry | undefined> {
  const entries = await readWaitlist();
  return entries.find((entry) => entry.checkoutSessionId === sessionId);
}

export async function findWaitlistByPaymentIntentId(
  paymentIntentId: string
): Promise<WaitlistEntry | undefined> {
  const entries = await readWaitlist();
  return entries.find((entry) => entry.paymentIntentId === paymentIntentId);
}

export async function markWaitlistPaid(input: {
  id?: string;
  checkoutSessionId?: string;
  paymentIntentId?: string;
  chargeId?: string;
  stripeCustomerId?: string;
  paidAt?: string;
}): Promise<WaitlistEntry | undefined> {
  const entries = await readWaitlist();
  const index = entries.findIndex((entry) => {
    if (input.id && entry.id === input.id) return true;
    if (input.checkoutSessionId && entry.checkoutSessionId === input.checkoutSessionId) return true;
    if (input.paymentIntentId && entry.paymentIntentId === input.paymentIntentId) return true;
    return false;
  });

  if (index === -1) return undefined;

  entries[index] = normalizeWaitlistEntry({
    ...entries[index],
    status: "paid",
    paidAt: input.paidAt || new Date().toISOString(),
    checkoutSessionId: input.checkoutSessionId || entries[index].checkoutSessionId,
    paymentIntentId: input.paymentIntentId || entries[index].paymentIntentId,
    chargeId: input.chargeId || entries[index].chargeId,
    stripeCustomerId: input.stripeCustomerId || entries[index].stripeCustomerId,
    updatedAt: new Date().toISOString(),
  });

  await writeWaitlist(entries);
  return entries[index];
}

export async function markWaitlistRefunded(input: {
  id?: string;
  paymentIntentId?: string;
  chargeId?: string;
  refundedAmount?: number;
}): Promise<WaitlistEntry | undefined> {
  const entries = await readWaitlist();
  const index = entries.findIndex((entry) => {
    if (input.id && entry.id === input.id) return true;
    if (input.paymentIntentId && entry.paymentIntentId === input.paymentIntentId) return true;
    if (input.chargeId && entry.chargeId === input.chargeId) return true;
    return false;
  });

  if (index === -1) return undefined;

  entries[index] = normalizeWaitlistEntry({
    ...entries[index],
    status: "refunded",
    refundedAt: new Date().toISOString(),
    refundedAmount: input.refundedAmount,
    updatedAt: new Date().toISOString(),
  });

  await writeWaitlist(entries);
  return entries[index];
}

export async function listWaitlist(): Promise<WaitlistEntry[]> {
  const entries = await readWaitlist();
  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
