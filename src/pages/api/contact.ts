// Server-side endpoint — not pre-rendered
export const prerender = false;

import type { APIRoute } from "astro";
import { Resend } from "resend";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      tour,
      tourSlug,
      message,
      notes,
      date,
      guests,
      lang,
    } = body;

    const subject = `[CambiaPaisagem] New enquiry${tour ? ` — ${tour}` : ""}`;
    const html = `
      <h2 style="font-family:sans-serif;">New enquiry via CambiaPaisagem</h2>
      <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Name</td><td>${name}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
        ${phone ? `<tr><td style="padding:4px 12px 4px 0;font-weight:600;">Phone</td><td>${phone}</td></tr>` : ""}
        ${tour ? `<tr><td style="padding:4px 12px 4px 0;font-weight:600;">Tour</td><td>${tour}</td></tr>` : ""}
        ${date ? `<tr><td style="padding:4px 12px 4px 0;font-weight:600;">Date</td><td>${date}</td></tr>` : ""}
        ${guests ? `<tr><td style="padding:4px 12px 4px 0;font-weight:600;">Guests</td><td>${guests}</td></tr>` : ""}
        ${message ? `<tr><td style="padding:4px 12px 4px 0;font-weight:600;">Message</td><td>${message}</td></tr>` : ""}
        ${notes ? `<tr><td style="padding:4px 12px 4px 0;font-weight:600;">Notes</td><td>${notes}</td></tr>` : ""}
        ${lang ? `<tr><td style="padding:4px 12px 4px 0;font-weight:600;">Language</td><td>${lang}</td></tr>` : ""}
      </table>
    `;

    const resendKey = import.meta.env.RESEND_API_KEY;
    const toEmail = import.meta.env.CONTACT_EMAIL ?? "info@cambiapaisagem.pt";
    const fromEmail =
      import.meta.env.FROM_EMAIL ?? "CambiaPaisagem <onboarding@resend.dev>";

    if (!resendKey) {
      // Development fallback — log and return success
      console.log("📧 [Contact form — no RESEND_API_KEY configured]");
      console.log(`  To: ${toEmail}`);
      console.log(`  Subject: ${subject}`);
      console.log(`  Name: ${name} | Email: ${email} | Tour: ${tour ?? "-"}`);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    const resend = new Resend(resendKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("Contact form error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};

// TODO also send an email to the customer confirming receipt and providing next steps?
