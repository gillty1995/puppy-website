import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deployUser = process.env.DEPLOY_USER || "ubuntu";
const deployHost = process.env.DEPLOY_HOST || "3.139.240.156";
const deployPath = process.env.DEPLOY_PATH || "~/textilepoms";

const remote =
  process.env.DEPLOY_REMOTE ||
  `${deployUser}@${deployHost}:${deployPath}/src/data/adoptions.json`;
const local = path.join(__dirname, "../src/data/adoptions.json");
const temp = path.join(__dirname, "../src/data/adoptions.remote.json");
const sshKey =
  process.env.DEPLOY_SSH_KEY ||
  process.env.DEPLOY_KEY ;

// 1. Download remote file to temp
const cmd = `rsync -avz -e "ssh -i ${sshKey}" ${remote} ${temp}`;
console.log("Downloading remote adoptions.json...");
execSync(cmd, { stdio: "inherit" });

// 2. Read both files
const localData = fs.existsSync(local)
  ? JSON.parse(fs.readFileSync(local, "utf8"))
  : [];
const remoteData = fs.existsSync(temp)
  ? JSON.parse(fs.readFileSync(temp, "utf8"))
  : [];

// 3. Merge logic: keep all unique adoptions by id, and merge reviews arrays (no duplicates)
function mergeReviews(localReviews = [], remoteReviews = []) {
  const all = [...localReviews, ...remoteReviews];
  // Remove duplicate reviews by stringifying (could be improved for more complex cases)
  const seen = new Set();
  return all.filter((r) => {
    const key = JSON.stringify(r);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const merged = [];
const byId = new Map();

// Add all local adoptions
for (const adoption of localData) {
  byId.set(adoption.id, { ...adoption });
}

// Merge in remote adoptions
for (const adoption of remoteData) {
  if (byId.has(adoption.id)) {
    // Merge reviews
    byId.set(adoption.id, {
      ...adoption,
      ...byId.get(adoption.id),
      reviews: mergeReviews(byId.get(adoption.id).reviews, adoption.reviews),
    });
  } else {
    byId.set(adoption.id, adoption);
  }
}

for (const adoption of byId.values()) {
  merged.push(adoption);
}

// 4. Write merged result
fs.writeFileSync(local, `${JSON.stringify(merged, null, 2)}\n`);
console.log("Merged adoptions.json written.");

// 5. Clean up temp file
fs.unlinkSync(temp);
console.log("Temporary file removed.");
