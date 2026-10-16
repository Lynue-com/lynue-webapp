import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

process.env.NEXT_PUBLIC_APP_URL = "https://test.vamlar.com";

import { VerificationEmail } from "./verification-email";

describe("VerificationEmail", () => {
  const props = {
    firstName: "John",
    email: "john@example.com",
    verificationUrl: "https://test.vamlar.com/verify-email?token=abc123",
    appName: "Vamlar",
    logoUrl: "",
  };

  it("renders welcome heading", () => {
    render(<VerificationEmail {...props} />);
    expect(screen.getByText("Welcome to Vamlar!")).toBeInTheDocument();
  });

  it("renders greeting with firstName", () => {
    render(<VerificationEmail {...props} />);
    expect(screen.getByText("Hi John,")).toBeInTheDocument();
  });

  it("renders verify button", () => {
    render(<VerificationEmail {...props} />);
    const button = screen.getByRole("link", { name: /Verify Email Address/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("href", props.verificationUrl);
  });

  it("renders verification URL as a link", () => {
    render(<VerificationEmail {...props} />);
    const link = screen.getByRole("link", { name: props.verificationUrl });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", props.verificationUrl);
  });

  it("renders app name in footer", () => {
    render(<VerificationEmail {...props} />);
    expect(screen.getByText(/Vamlar — https:\/\/vamlar\.com/)).toBeInTheDocument();
  });

  it("renders preview text", () => {
    render(<VerificationEmail {...props} />);
    expect(screen.getByText("Verify your Vamlar account — John")).toBeInTheDocument();
  });
});
