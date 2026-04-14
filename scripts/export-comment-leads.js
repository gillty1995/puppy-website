#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execFileSync } from "node:child_process";

const projectRoot = process.cwd();
const envPath = path.join(projectRoot, ".env.local");
const outputDir = path.join(projectRoot, "exports");
const outputPath = path.join(outputDir, "comment-leads.json");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const rawValue = trimmed.slice(eqIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function getDeployConfig() {
  loadEnvFile(envPath);

  const deployUser = process.env.DEPLOY_USER || "ubuntu";
  const deployHost = process.env.DEPLOY_HOST;
  const deployPath = process.env.DEPLOY_PATH || "~/textilepoms";
  const sshKey = process.env.DEPLOY_SSH_KEY || process.env.DEPLOY_KEY;

  if (!deployHost) {
    throw new Error("Missing DEPLOY_HOST in environment or .env.local");
  }

  if (!sshKey) {
    throw new Error("Missing DEPLOY_KEY or DEPLOY_SSH_KEY in environment or .env.local");
  }

  return {
    deployUser,
    deployHost,
    deployPath,
    sshKey,
  };
}

function readRemoteJson(remotePath) {
  const { deployUser, deployHost, deployPath, sshKey } = getDeployConfig();
  const normalizedDeployPath =
    deployPath === "~/textilepoms" ? "/home/ubuntu/textilepoms" : deployPath;
  const sshTarget = `${deployUser}@${deployHost}`;

  return execFileSync(
    "ssh",
    ["-i", sshKey, sshTarget, "cat", `${normalizedDeployPath}/${remotePath}`],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }
  );
}

function buildExportFromLeads(leads) {
  const comments = leads
    .map((lead) => ({
      postId: typeof lead?.postId === "string" ? lead.postId : "",
      postTitle: typeof lead?.postTitle === "string" ? lead.postTitle : "",
      email:
        typeof lead?.email === "string" && lead.email.trim()
          ? lead.email.trim()
          : null,
      comment: typeof lead?.comment === "string" ? lead.comment : "",
      createdAt: typeof lead?.createdAt === "string" ? lead.createdAt : null,
    }))
    .sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bTime - aTime;
    });

  const commentsWithFullEmail = comments.filter((comment) => comment.email);
  const uniqueEmails = [...new Set(commentsWithFullEmail.map((comment) => comment.email))];

  return {
    exportedAt: new Date().toISOString(),
    source: "remote commentLeads.json",
    totalComments: comments.length,
    commentsWithFullEmail: commentsWithFullEmail.length,
    uniqueFullEmails: uniqueEmails.length,
    comments,
  };
}

function main() {
  const raw = readRemoteJson("src/data/commentLeads.json");
  const leads = JSON.parse(raw);

  if (!Array.isArray(leads)) {
    throw new Error("Remote commentLeads.json did not contain an array");
  }

  const exportData = buildExportFromLeads(leads);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

  console.log(`Exported ${exportData.totalComments} comments to ${path.relative(projectRoot, outputPath)}`);
  console.log(`Comments with full email: ${exportData.commentsWithFullEmail}`);
  console.log(`Unique full emails: ${exportData.uniqueFullEmails}`);
}

main();
