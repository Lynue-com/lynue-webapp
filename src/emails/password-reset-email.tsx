import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
  Section,
  Button,
} from "@react-email/components";
import * as React from "react";

interface PasswordResetEmailProps {
  firstName: string;
  email: string;
  resetUrl: string;
  appName: string;
  logoUrl: string;
  expiresInHours?: number;
}

import { getCanonicalUrl } from "@/shared/lib/canonical-url";

const BASE_URL = getCanonicalUrl();

export const PasswordResetEmail = ({
  firstName,
  email,
  resetUrl,
  appName,
  logoUrl,
  expiresInHours = 1,
}: PasswordResetEmailProps) => {
  const previewText =
    `Password reset requested for ${appName}`;

  return (
    <Html>
      <Head />
      <Body
        style={{
          backgroundColor: "#f9fafb",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          padding: "0 16px",
        }}
      >
        <Preview>{previewText}</Preview>

        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "32px 24px",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Header */}
          <Section>
            <Img
              src={logoUrl || `${BASE_URL}/favicon.ico`}
              width={48}
              height={48}
              alt={appName || "App Logo"}
              style={{
                borderRadius: "8px",
                objectFit: "contain",
              }}
            />
          </Section>

          <Heading
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#111827",
              margin: "24px 0 8px 0",
              lineHeight: "1.2",
            }}
          >
            Reset your password
          </Heading>

          <Text
            style={{
              fontSize: "16px",
              color: "#4b5563",
              lineHeight: "1.6",
              marginBottom: "16px",
            }}
          >
            Hi {firstName},
          </Text>

          <Text
            style={{
              fontSize: "16px",
              color: "#4b5563",
              lineHeight: "1.6",
              marginBottom: "24px",
            }}
          >
            We received a request to reset the password for your account ending
            in <Text style={{ fontWeight: "600" }}>{email.slice(-4)}</Text>.
            If you did not make this request, please ignore this email — your
            password will remain unchanged.
          </Text>

          <Text
            style={{
              fontSize: "16px",
              color: "#4b5563",
              lineHeight: "1.6",
              marginBottom: "24px",
            }}
          >
            To create a new password, click the button below. This link will
            expire in <Text style={{ fontWeight: "600" }}>{expiresInHours} hour</Text>
            for your security.
          </Text>

          {/* CTA Button */}
          <Section
            style={{
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            <Button
              href={resetUrl}
              style={{
                backgroundColor: "#111827",
                color: "#ffffff",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontSize: "16px",
                fontWeight: "600",
                textDecoration: "none",
                borderRadius: "8px",
                padding: "14px 32px",
                display: "inline-block",
                transition: "background-color 0.2s ease",
              }}
              target="_blank"
            >
              Reset Password
            </Button>
          </Section>

          <Text
            style={{
              fontSize: "14px",
              color: "#9ca3af",
              marginBottom: "24px",
            }}
          >
            Or copy and paste this link into your browser:
          </Text>

          <Section
            style={{
              backgroundColor: "#f3f4f6",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
              overflow: "hidden",
            }}
          >
            <Link
              href={resetUrl}
              style={{
                color: "#111827",
                fontSize: "14px",
                wordBreak: "break-all",
                display: "block",
                padding: "8px",
              }}
              target="_blank"
            >
              {resetUrl}
            </Link>
          </Section>

          {/* Footer */}
          <Section
            style={{
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <Text
              style={{
                fontSize: "12px",
                color: "#9ca3af",
                lineHeight: "1.5",
              }}
            >
              If you're still having trouble, reply to this email and we'll
              help you out.
            </Text>
          </Section>

          <Text
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              marginTop: "16px",
              textAlign: "center",
            }}
          >
            {appName || "Vamlar"} — {BASE_URL}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetEmail;
