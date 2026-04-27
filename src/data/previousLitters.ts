import fs from "fs/promises";
import path from "path";
import { readArchivedPuppies, type PuppyRecord } from "@/data/puppies";

type LegacyPost = {
  id?: string;
  title?: string;
  body?: string;
  images?: string[];
};

type LegacyPuppySeed = {
  slug: string;
  name: string;
};

type LegacyLitterSeed = {
  slug: string;
  title: string;
  thumb: string;
  puppies: LegacyPuppySeed[];
};

export type PreviousLitterSummary = {
  slug: string;
  title: string;
  thumb: string;
  source: "archived" | "legacy";
  dataKey?: string;
};

export type PreviousPuppySummary = {
  slug: string;
  name: string;
  image: string;
  source: "archived" | "legacy";
};

export type PreviousPuppyDetail = PreviousPuppySummary & {
  images: string[];
  color?: string;
  age?: string;
  description?: string;
  skills?: string;
  relatedPosts?: { id: string; title: string }[];
};

const LEGACY_LITTERS: LegacyLitterSeed[] = [
  {
    slug: "litter-2025",
    title: "Litter — 2025",
    thumb: "/images/litter-2025.jpeg",
    puppies: [
      { slug: "canvas", name: "Canvas" },
      { slug: "cotton", name: "Cotton" },
    ],
  },
];

const IMAGES_DIR = path.join(process.cwd(), "public", "images");
const POSTS_PATH = path.join(process.cwd(), "src", "data", "posts.json");

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function compactKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function imageBaseKey(value: string) {
  return compactKey(path.parse(value.replace(/^\/images\//, "")).name);
}

function titleizeLitterId(litterId: string) {
  if (litterId.startsWith("archived-")) {
    const raw = litterId.replace(/^archived-/, "");
    const yearMatch = raw.match(/^(\d{4})/);
    if (yearMatch) {
      return `Litter — ${yearMatch[1]}`;
    }
    return "Litter — Archived";
  }

  const parts = litterId.split("-");
  const maybeDate = parts.length >= 4 ? parts.slice(1, 4).join("-") : litterId;
  return `Litter — ${maybeDate}`;
}

function archivedLitterKey(puppy: PuppyRecord) {
  return puppy.litterId || `archived-${puppy.archivedAt || "unknown"}`;
}

function archivedLitterSlug(puppy: PuppyRecord) {
  return slugify(archivedLitterKey(puppy));
}

async function listImageFiles() {
  try {
    return await fs.readdir(IMAGES_DIR);
  } catch {
    return [];
  }
}

async function readLegacyPosts() {
  try {
    const raw = await fs.readFile(POSTS_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as LegacyPost[];
  } catch {
    return [];
  }
}

function findLegacyLitter(slug: string) {
  return LEGACY_LITTERS.find((litter) => litter.slug === slug);
}

function buildGalleryImages(
  aliases: Array<string | undefined | null>,
  files: string[],
  primaryImage?: string
) {
  const normalizedAliases = aliases
    .filter((alias): alias is string => Boolean(alias))
    .map((alias) => imageBaseKey(alias));

  const matches = files
    .filter((file) => {
      const fileKey = imageBaseKey(file);
      return normalizedAliases.some(
        (alias) =>
          fileKey.startsWith(alias) ||
          alias.startsWith(fileKey) ||
          fileKey.includes(alias) ||
          alias.includes(fileKey)
      );
    })
    .map((file) => `/images/${file}`);

  const ordered: string[] = [];
  if (primaryImage) {
    const primaryBase = path.parse(primaryImage).base.toLowerCase();
    const primaryMatch = files.some(
      (file) => path.parse(file).base.toLowerCase() === primaryBase
    );
    if (primaryMatch) {
      ordered.push(primaryImage);
    }
  }

  for (const match of matches) {
    if (!ordered.includes(match)) {
      ordered.push(match);
    }
  }

  return ordered.length ? ordered : ["/images/coming-soon.jpg"];
}

function selectArchivedCoverImage(
  archivedPuppies: PuppyRecord[],
  posts: LegacyPost[]
): string {
  const names = archivedPuppies.map((puppy) => puppy.name.toLowerCase());
  const keywords = ["all together", "growing babies", "new arrivals", "litter", "puppies"];

  const scored = posts
    .filter((post) => Array.isArray(post.images) && post.images.length > 0)
    .map((post) => {
      const text = `${post.title || ""} ${post.body || ""}`.toLowerCase();
      const keywordScore = keywords.reduce(
        (score, keyword) => score + (text.includes(keyword) ? 1 : 0),
        0
      );
      const nameScore = names.reduce(
        (score, name) => score + (text.includes(name) ? 1 : 0),
        0
      );
      const multiImageScore = (post.images?.length || 0) > 1 ? 1 : 0;
      return {
        image: post.images?.[0] || "",
        score: keywordScore * 10 + nameScore * 3 + multiImageScore * 5 + (post.images?.length || 0),
      };
    })
    .filter((entry) => Boolean(entry.image))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.image || archivedPuppies[0]?.image || "/images/coming-soon.jpg";
}

async function buildArchivedSummaries(archived: PuppyRecord[]) {
  const posts = await readLegacyPosts();
  const groups = archived.reduce<
    Record<
      string,
      { slug: string; title: string; thumb: string; source: "archived"; dataKey: string }
    >
  >((acc, puppy) => {
    const key = archivedLitterKey(puppy);
    const slug = archivedLitterSlug(puppy);
    if (!acc[key]) {
      acc[key] = {
        slug,
        title: titleizeLitterId(key),
        thumb: selectArchivedCoverImage(
          archived.filter((entry) => archivedLitterKey(entry) === key),
          posts
        ),
        source: "archived",
        dataKey: key,
      };
    }
    return acc;
  }, {});

  return Object.values(groups);
}

export async function getPreviousLitters(): Promise<PreviousLitterSummary[]> {
  const archived = await readArchivedPuppies();
  const archivedSummaries = await buildArchivedSummaries(archived);
  const legacySummaries = LEGACY_LITTERS.map((litter) => ({
    slug: litter.slug,
    title: litter.title,
    thumb: litter.thumb,
    source: "legacy" as const,
    dataKey: litter.slug,
  }));

  const known = new Set(archivedSummaries.map((litter) => litter.slug));
  return [...archivedSummaries, ...legacySummaries.filter((litter) => !known.has(litter.slug))];
}

export async function getPreviousLitter(
  litterSlug: string
): Promise<{ summary: PreviousLitterSummary; puppies: PreviousPuppySummary[] } | undefined> {
  const archived = await readArchivedPuppies();
  const archivedGroup = archived.find((puppy) => archivedLitterSlug(puppy) === litterSlug);
  const archivedGroupKey = archivedGroup ? archivedLitterKey(archivedGroup) : undefined;
  const archivedPuppies = archivedGroupKey
    ? archived.filter((puppy) => archivedLitterKey(puppy) === archivedGroupKey)
    : [];

  if (archivedPuppies.length) {
    return {
      summary: {
        slug: litterSlug,
        title: titleizeLitterId(archivedGroupKey || litterSlug),
        thumb: archivedPuppies[0].image,
        source: "archived",
        dataKey: archivedGroupKey,
      },
      puppies: archivedPuppies.map((puppy) => ({
        slug: slugify(puppy.name),
        name: puppy.name,
        image: puppy.image,
        source: "archived",
      })),
    };
  }

  const legacy = findLegacyLitter(litterSlug);
  if (!legacy) {
    return undefined;
  }

  const files = await listImageFiles();

    return {
      summary: {
        slug: legacy.slug,
        title: legacy.title,
        thumb: legacy.thumb,
        source: "legacy",
        dataKey: legacy.slug,
      },
      puppies: legacy.puppies.map((puppy) => ({
        slug: puppy.slug,
        name: puppy.name,
        image: buildGalleryImages([puppy.slug, puppy.name], files)[0],
        source: "legacy",
      })),
    };
  }

export async function getPreviousPuppy(
  litterSlug: string,
  puppySlug: string
): Promise<PreviousPuppyDetail | undefined> {
  const archived = await readArchivedPuppies();
  const archivedPuppyMatch = archived.find(
    (entry) =>
      (archivedLitterSlug(entry) === litterSlug ||
        archivedLitterKey(entry) === litterSlug) &&
      slugify(entry.name) === puppySlug
  );

  if (archivedPuppyMatch) {
    const files = await listImageFiles();
    const images = buildGalleryImages(
      [
        archivedPuppyMatch.name,
        slugify(archivedPuppyMatch.name),
        compactKey(archivedPuppyMatch.name),
      ],
      files,
      archivedPuppyMatch.image
    );
    const posts = await readLegacyPosts();
    const puppyName = archivedPuppyMatch.name.toLowerCase();
    const relatedPosts = posts
      .filter((post) => {
        const text = `${post.title || ""} ${post.body || ""}`.toLowerCase();
        return text.includes(puppyName) || text.includes(slugify(archivedPuppyMatch.name));
      })
      .slice(0, 12)
      .map((post) => ({
        id: post.id || `${slugify(archivedPuppyMatch.name)}-${slugify(post.title || "post")}`,
        title: post.title || "Untitled post",
      }));

    return {
      slug: slugify(archivedPuppyMatch.name),
      name: archivedPuppyMatch.name,
      image: images[0] || archivedPuppyMatch.image,
      images,
      color: archivedPuppyMatch.color,
      age: archivedPuppyMatch.age,
      description: archivedPuppyMatch.description,
      skills: archivedPuppyMatch.skills,
      relatedPosts,
      source: "archived",
    };
  }

  const legacy = findLegacyLitter(litterSlug);
  if (!legacy) {
    return undefined;
  }

  const legacyPuppy = legacy.puppies.find((entry) => entry.slug === puppySlug);
  if (!legacyPuppy) {
    return undefined;
  }

  const files = await listImageFiles();
  const images = buildGalleryImages(
    [legacyPuppy.slug, legacyPuppy.name],
    files
  );
  const posts = await readLegacyPosts();
  const puppyName = legacyPuppy.name.toLowerCase();
  const relatedPosts = posts
    .filter((post) => {
      const text = `${post.title || ""} ${post.body || ""}`.toLowerCase();
      return text.includes(puppyName) || text.includes(legacyPuppy.slug.toLowerCase());
    })
    .slice(0, 12)
    .map((post) => ({
      id: post.id || `${legacyPuppy.slug}-${slugify(post.title || "post")}`,
      title: post.title || "Untitled post",
    }));

  return {
    slug: legacyPuppy.slug,
    name: legacyPuppy.name,
    image: images[0],
    images,
    relatedPosts,
    source: "legacy",
  };
}
