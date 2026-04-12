export const prerender = false;

import type { APIRoute } from "astro";
import { parseTemplate } from "../../lib/email/templateEngine";
import {
  ownerBookingTemplate,
  getUserAutoReplyTemplate,
} from "../../lib/email/templates";
import { sendEmails } from "../../lib/email/sender";
import { validateEmail, validatePhone } from "../../lib/validators";
import { env as cloudflareEnv } from "cloudflare:workers";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const lang = typeof body?.lang === "string" ? body.lang.trim() : "en";

    if (!name) {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400,
      });
    }

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
      });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return new Response(JSON.stringify({ error: emailError }), {
        status: 400,
      });
    }

    const phoneError = validatePhone(phone);
    if (phoneError) {
      return new Response(JSON.stringify({ error: phoneError }), {
        status: 400,
      });
    }

    const ownerMessage = parseTemplate(ownerBookingTemplate, body);

    const userMessage = parseTemplate(getUserAutoReplyTemplate(lang), { name });

    await sendEmails([
      {
        to: cloudflareEnv.CONTACT_EMAIL,
        subject: ownerMessage.subject,
        html: ownerMessage.html,
        replyTo: email,
      },
      {
        to: email,
        subject: userMessage.subject,
        html: userMessage.html,
      },
    ]);

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    console.error("Tour booking error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
};
