import nodemailer from "nodemailer";

function hasMailerConfig() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

export function createMailer() {
  if (!hasMailerConfig()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}) {
  const transporter = createMailer();
  if (!transporter) {
    console.warn("SMTP not configured; skipping email", params.subject);
    return { skipped: true as const };
  }

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    ...params,
  });

  return { skipped: false as const };
}
