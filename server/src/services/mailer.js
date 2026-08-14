import nodemailer from 'nodemailer';

let transporter = null;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
}

export async function sendMail({ to, subject, text }) {
  if (!transporter) {
    // Pa gen SMTP konfigire — nou enprime kòd la nan log sèvè a pou devlopman/premye lansman.
    console.log(`[MAIL SIMULE] Pou: ${to} | ${subject}\n${text}`);
    return;
  }
  await transporter.sendMail({ from: process.env.SMTP_FROM || 'no-reply@mondialito.example', to, subject, text });
}
