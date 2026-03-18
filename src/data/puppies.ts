import fs from "fs/promises";
import path from "path";
import { defaultPuppies } from "@/data/defaultPuppies";

export type PuppyStatus = "available" | "reserved" | "adopted";

export interface PuppyPaymentState {
  depositPaidAmount?: number;
  depositPaidAt?: string;
  depositSessionId?: string;
  reservedByEmail?: string;
  reservedByName?: string;
  stripeCustomerId?: string;
  finalInvoiceId?: string;
  finalInvoiceUrl?: string;
  finalInvoiceStatus?: string;
  finalPaidAt?: string;
}

export interface PuppyRecord {
  id: string;
  name: string;
  image: string;
  currentPrice: number | null;
  depositAmount: number;
  status: PuppyStatus;
  age: string;
  color: string;
  description: string;
  skills?: string;
  payment?: PuppyPaymentState;
}

const filePath = path.join(process.cwd(), "src", "data", "puppies.json");

export async function readPuppies(): Promise<PuppyRecord[]> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as PuppyRecord[];
    return [];
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") {
      await fs.writeFile(filePath, JSON.stringify(defaultPuppies, null, 2));
      return defaultPuppies;
    }
    throw err;
  }
}

export async function writePuppies(puppies: PuppyRecord[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(puppies, null, 2));
}

export async function readPuppyById(id: string): Promise<PuppyRecord | undefined> {
  const puppies = await readPuppies();
  return puppies.find((puppy) => puppy.id === id);
}

export function getRemainingBalance(puppy: PuppyRecord): number {
  const currentPrice = puppy.currentPrice ?? 0;
  const depositPaid = puppy.payment?.depositPaidAmount ?? 0;
  return Math.max(currentPrice - depositPaid, 0);
}

export function formatPuppyPrice(puppy: Pick<PuppyRecord, "status" | "currentPrice">): string {
  if (puppy.status === "adopted") return "ADOPTED";
  if (puppy.status === "reserved") return "RESERVED";
  if (typeof puppy.currentPrice !== "number") return "Contact for pricing";
  return `$${puppy.currentPrice.toLocaleString()} USD`;
}
