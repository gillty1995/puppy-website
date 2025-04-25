import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const form = await request.formData();
  const email = form.get('email');
  const message = form.get('message');

  // create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,    
    port: Number(process.env.SMTP_PORT), 
    secure: false,                    
    auth: {
      user: process.env.SMTP_USER,    
      pass: process.env.SMTP_PASS,    
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  // send the mail
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `Adoption Inquiry from ${email}`,
    text: String(message),
  });

  return NextResponse.json({ ok: true });
}