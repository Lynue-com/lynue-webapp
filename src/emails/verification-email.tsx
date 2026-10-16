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

interface VerificationEmailProps {
  firstName: string;
  email: string;
  verificationUrl: string;
  appName: string;
  logoUrl: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vamlar.com";

export const VerificationEmail = ({
  firstName,
  email,
  verificationUrl,
  appName,
  logoUrl,
}: VerificationEmailProps) => {
  const previewText =
    `Verify your ${appName} account — ${firstName}`;

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
            Welcome to {appName}!
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
            Thank you for signing up. Please verify your email address by
            clicking the button below. This helps us keep your account secure
            and ensures you receive important updates.
          </Text>

          {/* CTA Button */}
          <Section
            style={{
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            <Button
              href={verificationUrl}
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
              Verify Email Address
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
              href={verificationUrl}
              style={{
                color: "#111827",
                fontSize: "14px",
                wordBreak: "break-all",
                display: "block",
                padding: "8px",
              }}
              target="_blank"
            >
              {verificationUrl}
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
              If you did not request this verification, please ignore this email.
              No action is needed on your part.
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

export default VerificationEmail;
