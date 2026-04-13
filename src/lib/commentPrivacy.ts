export interface PublicComment {
  maskedEmail: string;
  comment: string;
  createdAt: string;
}

export function maskEmailAddress(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "anonymous";

  const visibleChars = Math.min(4, Math.max(1, local.length));
  const visiblePart = local.slice(0, visibleChars);
  const hiddenPart = "*".repeat(Math.max(3, local.length - visibleChars));

  return `${visiblePart}${hiddenPart}@${domain}`;
}

export function toPublicComment(comment: {
  email: string;
  comment: string;
  createdAt: string;
}): PublicComment {
  return {
    maskedEmail: maskEmailAddress(comment.email),
    comment: comment.comment,
    createdAt: comment.createdAt,
  };
}
