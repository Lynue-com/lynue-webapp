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

interface EmailResendEmailProps {
  firstName: string;
  email: string;
  appName: string;
  logoUrl: string;
}

import { getCanonicalUrl } from "@/shared/lib/canonical-url";

const BASE_URL = getCanonicalUrl();

export const EmailResendEmail = ({
  firstName,
  email,
  appName,
  logoUrl,
}: EmailResendEmailProps) => {
  const previewText = `Resend verification email for ${appName}`;

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
            Resend verification email
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
            We've sent a fresh verification email to <Text style={{ fontWeight: "600" }}>{email}</Text>. Please check your inbox (and spam folder) for an email from us with a verify link.
          </Text>

          <Text
            style={{
              fontSize: "16px",
              color: "#4b5563",
              lineHeight: "1.6",
              marginBottom: "24px",
            }}
          >
            If you didn't receive it, please ensure your email address is correct and try again in a few minutes.
          </Text>

          {/* Good news text */}
          <Section
            style={{
              backgroundColor: "#eef2ff",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            <Text style={{ fontSize: "16px", color: "#1d4ed8", fontWeight: "600" }}>
              ✓ Email sent successfully!
            </Text>
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
              If you still don't receive the email after 10 minutes, please
              contact our support team.
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

export default EmailResendEmail;
