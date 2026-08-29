import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  defaultPuppies,
  DEFAULT_PUPPY_SKILLS,
} from "@/data/defaultPuppies";

export type PuppyStatus = "available" | "reserved" | "adopted";
export type PuppySex = "male" | "female";

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
  payment?: PuppyPaymentState;
  archivedAt?: string;
}

const filePath = path.join(process.cwd(), "src", "data", "puppies.json");

function createLitterId() {
  return `litter-${new Date().toISOString().slice(0, 10)}-${randomUUID().slice(0, 8)}`;
}

function createPuppyId(base?: string) {
  return `${base || "puppy"}-${randomUUID()}`;
}

function dedupePuppiesById(puppies: PuppyRecord[]): PuppyRecord[] {
  const deduped = new Map<string, PuppyRecord>();
  for (const puppy of puppies) {
    deduped.set(puppy.id, puppy);
  }
  return Array.from(deduped.values());
}

function normalizePuppy(puppy: Partial<PuppyRecord>, fallbackLitterId?: string): PuppyRecord {
  return {
    id: typeof puppy.id === "string" && puppy.id ? puppy.id : createPuppyId(),
    litterId: puppy.litterId || fallbackLitterId || undefined,
    name: typeof puppy.name === "string" ? puppy.name : "Unnamed Puppy",
    image: typeof puppy.image === "string" ? puppy.image : "/images/coming-soon.jpg",
    currentPrice:
      typeof puppy.currentPrice === "number" ? puppy.currentPrice : null,
    depositAmount:
      typeof puppy.depositAmount === "number" ? puppy.depositAmount : 1000,
    status:
      puppy.status === "reserved" || puppy.status === "adopted"
        ? puppy.status
        : "available",
    sex:
      puppy.sex === "male" || puppy.sex === "female" ? puppy.sex : undefined,
    age: typeof puppy.age === "string" ? puppy.age : "",
    color: typeof puppy.color === "string" ? puppy.color : "",
    description:
      typeof puppy.description === "string" ? puppy.description : "",
    skills:
      typeof puppy.skills === "string" && puppy.skills.trim()
        ? puppy.skills
        : DEFAULT_PUPPY_SKILLS,
    payment:
      puppy.payment && typeof puppy.payment === "object"
        ? {
            ...puppy.payment,
          }
        : undefined,
    archivedAt:
      typeof puppy.archivedAt === "string" && puppy.archivedAt
        ? puppy.archivedAt
        : undefined,
  };
}

function createDefaultLitter(): PuppyRecord[] {
  const litterId = createLitterId();
  return defaultPuppies.map((puppy) =>
    normalizePuppy(
      {
        ...puppy,
        id: createPuppyId(puppy.id),
        litterId,
        archivedAt: undefined,
        payment: undefined,
      },
      litterId
    )
  );
}

export async function readAllPuppies(): Promise<PuppyRecord[]> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return dedupePuppiesById(parsed.map((entry) => normalizePuppy(entry)));
    }
    return [];
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") {
      const seeded = createDefaultLitter();
      await fs.writeFile(filePath, JSON.stringify(seeded, null, 2));
      return seeded;
    }
    throw err;
  }
}

export async function readPuppies(): Promise<PuppyRecord[]> {
  const puppies = await readAllPuppies();
  return puppies.filter((puppy) => !puppy.archivedAt);
}

export async function readArchivedPuppies(): Promise<PuppyRecord[]> {
  const puppies = await readAllPuppies();
  return puppies.filter((puppy) => Boolean(puppy.archivedAt));
}

export async function writePuppies(puppies: PuppyRecord[]): Promise<void> {
  const sanitized = dedupePuppiesById(puppies.map((puppy) => normalizePuppy(puppy)));
  await fs.writeFile(filePath, JSON.stringify(sanitized, null, 2));
}

export async function readPuppyById(id: string): Promise<PuppyRecord | undefined> {
  const puppies = await readPuppies();
  return puppies.find((puppy) => puppy.id === id);
}

export async function readPuppyByIdIncludingArchived(
  id: string
): Promise<PuppyRecord | undefined> {
  const puppies = await readAllPuppies();
  return puppies.find((puppy) => puppy.id === id);
}

export interface PuppyDraft {
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
  payment?: PuppyPaymentState;
  litterId?: string;
}

export async function createPuppy(puppy: PuppyDraft): Promise<PuppyRecord> {
  const puppies = await readAllPuppies();
  const created = normalizePuppy(
    {
      ...puppy,
      id: createPuppyId(puppy.name),
      archivedAt: undefined,
    },
    puppy.litterId || createLitterId()
  );

  puppies.push(created);
  await writePuppies(puppies);
  return created;
}

export async function updatePuppy(
  id: string,
  updates: Partial<PuppyDraft> & { resetPayment?: boolean }
): Promise<PuppyRecord | undefined> {
  const puppies = await readAllPuppies();
  const index = puppies.findIndex((puppy) => puppy.id === id);
  if (index === -1) return undefined;

  const current = puppies[index];
  const resetPayment = Boolean(updates.resetPayment);
  const nextPayment = resetPayment
    ? {
        reservedByEmail: updates.payment?.reservedByEmail || "",
        reservedByName: updates.payment?.reservedByName || "",
      }
    : {
        ...current.payment,
        ...(updates.payment || {}),
      };

  puppies[index] = normalizePuppy(
    {
      ...current,
      ...updates,
      payment: nextPayment,
    },
    current.litterId
  );

  await writePuppies(puppies);
  return puppies[index];
}

export async function archivePuppy(id: string): Promise<PuppyRecord | undefined> {
  const puppies = await readAllPuppies();
  const index = puppies.findIndex((puppy) => puppy.id === id);
  if (index === -1) return undefined;

  puppies[index] = normalizePuppy(
    {
      ...puppies[index],
      archivedAt: new Date().toISOString(),
    },
    puppies[index].litterId
  );

  await writePuppies(puppies);
  return puppies[index];
}

export async function deletePuppyRecord(id: string): Promise<boolean> {
  const puppies = await readAllPuppies();
  const next = puppies.filter((puppy) => puppy.id !== id);
  if (next.length === puppies.length) {
    return false;
  }

  await writePuppies(next);
  return true;
}

export async function resetCurrentLitter(): Promise<PuppyRecord[]> {
  const puppies = await readAllPuppies();
  const archivedAt = new Date().toISOString();
  const freshLitter = createDefaultLitter();

  const updated = puppies.map((puppy) =>
    puppy.archivedAt
      ? normalizePuppy(puppy)
      : normalizePuppy(
          {
            ...puppy,
            archivedAt,
          },
          puppy.litterId
        )
  );

  const merged = [...updated, ...freshLitter];
  await writePuppies(merged);
  return freshLitter;
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
