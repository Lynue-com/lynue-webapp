import "server-only";
import { Resend } from "resend";
import type { JSX } from "react";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error("RESEND_API_KEY is not configured in environment variables");
}

export const resend = new Resend(resendApiKey);

export type EmailTemplate =
  | "verification-email"
  | "password-reset-email"
  | "email-resend";

export interface EmailTemplateProps {
  firstName: string;
  email: string;
  [key: string]: unknown;
}

export interface SendEmailOptions {
  to: string;
  template: EmailTemplate;
  templateProps: EmailTemplateProps;
  from?: string;
  replyTo?: string;
}

/**
 * Sends an email using Resend
 * @param options - Email sending options
 */
export async function sendEmail({
  to,
  template,
  templateProps,
  from = process.env.RESEND_FROM_EMAIL || "no-reply@vamlar.com",
  replyTo,
}: SendEmailOptions) {
  // Dynamically import templates to avoid circular dependencies
  const verificationTemplates = await import("../../emails/verification-email");
  let emailComponent: unknown = null;

  switch (template) {
    case "verification-email":
      emailComponent = verificationTemplates.VerificationEmail;
      break;
    case "password-reset-email": {
      const resetTemplates = await import("../../emails/password-reset-email");
      emailComponent = resetTemplates.PasswordResetEmail;
      break;
    }
    case "email-resend": {
      const resendTemplates = await import("../../emails/email-resend");
      emailComponent = resendTemplates.EmailResendEmail;
      break;
    }
    default:
      throw new Error(`Unknown email template: ${template}`);
  }

  if (typeof emailComponent !== "function") {
    throw new Error(`Failed to load template: ${template}`);
  }

  // Cast to ComponentType and pass templateProps (extra props are fine in React)
  const renderedContent = (emailComponent as (props: EmailTemplateProps) => JSX.Element)(templateProps);

  const { data, error } = await resend.emails.send({
    from,
    to,
    replyTo,
    subject: getSubject(template, templateProps),
    react: renderedContent,
  } as any);

  if (error) {
    console.error(`[Email] Failed to send ${template} to ${to}:`, error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  if (!data?.id) {
    console.warn(`[Email] Email ${template} sent without ID to ${to}`);
    throw new Error("Failed to send email: No response ID received");
  }

  console.log(`[Email] Sent ${template} to ${to} (ID: ${data.id})`);
  return {
    success: true,
    messageId: data.id,
    template,
    to,
  };
}

function getSubject(template: EmailTemplate, props: EmailTemplateProps): string {
  switch (template) {
    case "verification-email":
      return `Verify your ${props.appName || "Vamlar"} email`;
    case "password-reset-email":
      return `Reset your password on ${props.appName || "Vamlar"}`;
    case "email-resend":
      return `Verification email for ${props.appName || "Vamlar"}`;
    default:
      return "Email from Vamlar";
  }
}

