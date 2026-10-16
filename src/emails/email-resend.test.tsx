import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

process.env.NEXT_PUBLIC_APP_URL = "https://test.vamlar.com";

import { EmailResendEmail } from "./email-resend";

describe("EmailResendEmail", () => {
  const props = {
    firstName: "John",
    email: "john@example.com",
    appName: "Vamlar",
    logoUrl: "",
  };

  it("renders resend verification heading", () => {
    render(<EmailResendEmail {...props} />);
    expect(screen.getByText("Resend verification email")).toBeInTheDocument();
  });

  it("renders greeting with firstName", () => {
    render(<EmailResendEmail {...props} />);
    expect(screen.getByText("Hi John,")).toBeInTheDocument();
  });

  it("renders email sent success message", () => {
    render(<EmailResendEmail {...props} />);
    expect(screen.getByText(/✓ Email sent successfully!/)).toBeInTheDocument();
  });

  it("renders email address in body", () => {
    render(<EmailResendEmail {...props} />);
    expect(screen.getByText(props.email)).toBeInTheDocument();
  });

  it("renders app name in footer", () => {
    render(<EmailResendEmail {...props} />);
    expect(screen.getByText(/Vamlar — https:\/\/vamlar\.com/)).toBeInTheDocument();
  });

  it("renders preview text", () => {
    render(<EmailResendEmail {...props} />);
    expect(screen.getByText("Resend verification email for Vamlar")).toBeInTheDocument();
  });
});
