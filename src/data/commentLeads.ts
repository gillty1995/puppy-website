import fs from "fs/promises";
import path from "path";

export interface CommentLead {
  postId: string;
  postTitle: string;
  email: string;
  comment: string;
  createdAt: string;
}

const filePath = path.join(process.cwd(), "src", "data", "commentLeads.json");

export async function readCommentLeads(): Promise<CommentLead[]> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CommentLead[]) : [];
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") {
      await fs.writeFile(filePath, "[]");
      return [];
    }
    throw err;
  }
}

export async function writeCommentLeads(leads: CommentLead[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(leads, null, 2));
}

export async function appendCommentLead(lead: CommentLead): Promise<void> {
  const leads = await readCommentLeads();
  leads.unshift(lead);
  await writeCommentLeads(leads);
}
