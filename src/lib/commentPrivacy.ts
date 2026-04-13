export interface PublicComment {
  maskedEmail: string;
  comment: string;
  createdAt: string;
}

export type StoredComment = PublicComment;

export function maskEmailAddress(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "anonymous";

  const visibleChars = Math.min(4, Math.max(1, local.length));
  const visiblePart = local.slice(0, visibleChars);
  const hiddenPart = "*".repeat(Math.max(3, local.length - visibleChars));

  return `${visiblePart}${hiddenPart}@${domain}`;
}

export type CommentLike = {
  email?: string;
  maskedEmail?: string;
  comment?: string;
  createdAt?: string;
};

export function normalizeComment(comment: CommentLike): StoredComment {
  const maskedEmail =
    typeof comment.maskedEmail === "string" && comment.maskedEmail.trim()
      ? comment.maskedEmail.trim()
      : typeof comment.email === "string" && comment.email.trim()
        ? maskEmailAddress(comment.email.trim())
        : "anonymous";

  return {
    maskedEmail,
    comment: typeof comment.comment === "string" ? comment.comment : "",
    createdAt:
      typeof comment.createdAt === "string" && comment.createdAt.trim()
        ? comment.createdAt
        : new Date().toISOString(),
  };
}

export function createStoredComment(
  email: string,
  comment: string,
  createdAt = new Date().toISOString()
): StoredComment {
  return {
    maskedEmail: maskEmailAddress(email),
    comment,
    createdAt,
  };
}

export function toPublicComment(comment: CommentLike): PublicComment {
  return normalizeComment(comment);
}
