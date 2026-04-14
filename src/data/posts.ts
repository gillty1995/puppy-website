import fs from "fs/promises";
import path from "path";
import {
  normalizeComment,
  type CommentLike,
  type StoredComment,
} from "@/lib/commentPrivacy";

export interface Comment {
  maskedEmail: string;
  comment: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  images: string[];
  comments: Comment[];
  // optional map of generated variants keyed by original basename
  variants?: Record<string, { thumb: string; large: string }>;
}

const filePath = path.join(process.cwd(), "src", "data", "posts.json");

export async function readPosts(): Promise<Post[]> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      let needsMigration = false;
      const parsedPosts = parsed as Array<Post & { comments?: CommentLike[] }>;
      const sanitized = parsedPosts.map((post) => {
        const comments = Array.isArray(post.comments)
          ? post.comments.map((comment) => {
              if (
                comment &&
                (Object.prototype.hasOwnProperty.call(comment, "email") ||
                  typeof comment.maskedEmail !== "string")
              ) {
                needsMigration = true;
              }

              return normalizeComment(comment) as StoredComment;
            })
          : [];

        if (comments.length !== (post.comments?.length ?? 0)) {
          needsMigration = true;
        }

        return {
          ...post,
          comments,
        } as Post;
      });

      if (needsMigration) {
        await fs.writeFile(filePath, JSON.stringify(sanitized, null, 2));
      }

      return sanitized as Post[];
    }
    return [];
  } catch (err) {
    // cast to the built-in ErrnoException
    const e = err as NodeJS.ErrnoException;
    if (e.code === "ENOENT") {
      // first run: create file
      await fs.writeFile(filePath, "[]");
      return [];
    }
    throw err;
  }
}

export async function writePosts(posts: Post[]): Promise<void> {
  const sanitized = posts.map((post) => ({
    ...post,
    comments: (post.comments ?? []).map((comment) =>
      normalizeComment(comment) as StoredComment
    ),
  }));

  await fs.writeFile(filePath, JSON.stringify(sanitized, null, 2));
}

export const getAllPosts = readPosts;
