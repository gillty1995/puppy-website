import fs from "fs/promises";
import path from "path";

export interface Post {
  id: string;
  title: string;
  body: string;
  images: string[];
}

const filePath = path.join(process.cwd(), "src", "data", "posts.json");

export async function readPosts(): Promise<Post[]> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err: any) {
    if (err.code === "ENOENT") {
      // first run: create the file
      await fs.writeFile(filePath, "[]");
      return [];
    }
    throw err;
  }
}

export async function writePosts(posts: Post[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(posts, null, 2));
}