import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

process.env.NEXT_PUBLIC_APP_URL = "https://test.vamlar.com";

import { PasswordResetEmail } from "./password-reset-email";

describe("PasswordResetEmail", () => {
  const props = {
    firstName: "John",
    email: "john@example.com",
    resetUrl: "https://test.vamlar.com/reset-password?token=xyz789",
    appName: "Vamlar",
    logoUrl: "",
  };

  it("renders reset password heading", () => {
    render(<PasswordResetEmail {...props} />);
    expect(screen.getByText("Reset your password")).toBeInTheDocument();
  });

  it("renders greeting with firstName", () => {
    render(<PasswordResetEmail {...props} />);
    expect(screen.getByText("Hi John,")).toBeInTheDocument();
  });

  it("renders reset button with resetUrl", () => {
    render(<PasswordResetEmail {...props} />);
    const button = screen.getByRole("link", { name: /Reset Password/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("href", props.resetUrl);
  });

  it("renders reset URL as a link", () => {
    render(<PasswordResetEmail {...props} />);
    const link = screen.getByRole("link", { name: props.resetUrl });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", props.resetUrl);
  });

  it("renders app name in footer", () => {
    render(<PasswordResetEmail {...props} />);
    expect(screen.getByText(/Vamlar — https:\/\/vamlar\.com/)).toBeInTheDocument();
  });

  it("renders preview text", () => {
    render(<PasswordResetEmail {...props} />);
    expect(screen.getByText("Password reset requested for Vamlar")).toBeInTheDocument();
  });
});
