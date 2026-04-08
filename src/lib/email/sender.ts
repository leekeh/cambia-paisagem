import { Resend } from "resend";

interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

interface MailEnv {
  resendApiKey?: string;
  fromEmail?: string;
  contactEmail?: string;
}

const env: MailEnv = {
  resendApiKey: import.meta.env.RESEND_API_KEY,
  fromEmail: import.meta.env.FROM_EMAIL,
  contactEmail: import.meta.env.CONTACT_EMAIL,
};
if (!env.resendApiKey || !env.fromEmail || !env.contactEmail) {
  console.warn(
    "⚠️ Mail environment variables are not fully configured. Emails will not be sent.",
  );
}

export async function sendEmails(messages: OutgoingEmail[]): Promise<void> {
  if (!env.resendApiKey || !env.fromEmail || !env.contactEmail) {
    // return an error
    throw new Error("Missing environment variables for sending emails");
  }
  const resend = new Resend(env.resendApiKey);

  for (const message of messages) {
    const { error } = await resend.emails.send({
      from: env.fromEmail,
      to: message.to,
      subject: message.subject,
      html: message.html,
      replyTo: message.replyTo,
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}
