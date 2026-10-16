// Mock the resend module before importing server.ts so no real API calls are made
const mockEmailsSend = vi.hoisted(() => vi.fn());

// Set env vars inside the mock factory so they exist before server.ts is evaluated
vi.mock("resend", () => {
  process.env.RESEND_API_KEY = "re_test_key_12345";
  process.env.RESEND_FROM_EMAIL = "no-reply@test.vamlar.com";
  process.env.NEXT_PUBLIC_APP_URL = "https://test.vamlar.com";
  return {
    Resend: vi.fn(function () {
      return {
        emails: {
          send: mockEmailsSend,
        },
      };
    }),
  };
});

// Mock server-only to allow importing in vitest (jsdom client environment)
vi.mock("server-only", () => ({}));

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendEmail } from "./server";

const baseProps = {
  firstName: "John",
  email: "john@example.com",
  appName: "Vamlar",
  logoUrl: "",
};

describe("sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test_key_12345";
    process.env.RESEND_FROM_EMAIL = "no-reply@test.vamlar.com";
    process.env.NEXT_PUBLIC_APP_URL = "https://test.vamlar.com";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("verification-email template", () => {
    it("should send successfully and return message data", async () => {
      mockEmailsSend.mockResolvedValue({ data: { id: "verification_abc" }, error: null });

      const result = await sendEmail({
        to: "john@example.com",
        template: "verification-email",
        templateProps: {
          ...baseProps,
          verificationUrl: "https://test.vamlar.com/verify-email?token=xyz",
        },
      });

      expect(result).toEqual({
        success: true,
        messageId: "verification_abc",
        template: "verification-email",
        to: "john@example.com",
      });

      expect(mockEmailsSend).toHaveBeenCalledTimes(1);
      expect(mockEmailsSend).toHaveBeenCalledWith({
        from: "no-reply@test.vamlar.com",
        to: "john@example.com",
        replyTo: undefined,
        subject: "Verify your Vamlar email",
        react: expect.anything(),
      });
    });

    it("should throw when Resend returns an error", async () => {
      mockEmailsSend.mockResolvedValue({
        data: null,
        error: { message: "Invalid API key" },
      });

      await expect(
        sendEmail({
          to: "john@example.com",
          template: "verification-email",
          templateProps: {
            ...baseProps,
            verificationUrl: "https://test.vamlar.com/verify-email",
          },
        })
      ).rejects.toThrow("Failed to send email: Invalid API key");

      expect(mockEmailsSend).toHaveBeenCalledTimes(1);
    });

    it("should throw when Resend returns no data.id", async () => {
      mockEmailsSend.mockResolvedValue({ data: {}, error: null });

      await expect(
        sendEmail({
          to: "john@example.com",
          template: "verification-email",
          templateProps: {
            ...baseProps,
            verificationUrl: "https://test.vamlar.com/verify-email",
          },
        })
      ).rejects.toThrow("Failed to send email: No response ID received");
    });

    it("should throw when Resend throws", async () => {
      mockEmailsSend.mockRejectedValue(new Error("Network error"));

      await expect(
        sendEmail({
          to: "john@example.com",
          template: "verification-email",
          templateProps: {
            ...baseProps,
            verificationUrl: "https://test.vamlar.com/verify-email",
          },
        })
      ).rejects.toThrow("Network error");
    });
  });

  describe("password-reset-email template", () => {
    it("should send successfully", async () => {
      mockEmailsSend.mockResolvedValue({ data: { id: "reset_def" }, error: null });

      const result = await sendEmail({
        to: "john@example.com",
        template: "password-reset-email",
        templateProps: {
          ...baseProps,
          resetUrl: "https://test.vamlar.com/reset-password?token=reset123",
        },
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("reset_def");
      expect(result.template).toBe("password-reset-email");

      expect(mockEmailsSend).toHaveBeenCalledWith({
        from: "no-reply@test.vamlar.com",
        to: "john@example.com",
        replyTo: undefined,
        subject: "Reset your password on Vamlar",
        react: expect.anything(),
      });
    });

    it("should throw when Resend returns an error", async () => {
      mockEmailsSend.mockResolvedValue({
        data: null,
        error: { message: "Rate limited" },
      });

      await expect(
        sendEmail({
          to: "john@example.com",
          template: "password-reset-email",
          templateProps: {
            ...baseProps,
            resetUrl: "https://test.vamlar.com/reset-password?token=reset123",
          },
        })
      ).rejects.toThrow("Failed to send email: Rate limited");
    });
  });

  describe("email-resend template", () => {
    it("should send successfully", async () => {
      mockEmailsSend.mockResolvedValue({ data: { id: "resend_ghi" }, error: null });

      const result = await sendEmail({
        to: "john@example.com",
        template: "email-resend",
        templateProps: {
          ...baseProps,
        },
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("resend_ghi");
      expect(result.template).toBe("email-resend");

      expect(mockEmailsSend).toHaveBeenCalledWith({
        from: "no-reply@test.vamlar.com",
        to: "john@example.com",
        replyTo: undefined,
        subject: "Verification email for Vamlar",
        react: expect.anything(),
      });
    });
  });

  describe("unknown template", () => {
    it("should throw an error for unknown template types", async () => {
      await expect(
        sendEmail({
          to: "john@example.com",
          template: "nonexistent-template" as never,
          templateProps: {
            ...baseProps,
          },
        })
      ).rejects.toThrow("Unknown email template: nonexistent-template");

      expect(mockEmailsSend).not.toHaveBeenCalled();
    });
  });

  describe("custom from and replyTo", () => {
    it("should use custom from and replyTo when provided", async () => {
      mockEmailsSend.mockResolvedValue({ data: { id: "custom" }, error: null });

      await sendEmail({
        to: "john@example.com",
        template: "verification-email",
        from: "custom@test.vamlar.com",
        replyTo: "support@test.vamlar.com",
        templateProps: {
          ...baseProps,
          verificationUrl: "https://test.vamlar.com/verify-email",
        },
      });

      expect(mockEmailsSend).toHaveBeenCalledWith({
        from: "custom@test.vamlar.com",
        to: "john@example.com",
        replyTo: "support@test.vamlar.com",
        subject: "Verify your Vamlar email",
        react: expect.anything(),
      });
    });
  });

  describe("default from email fallback", () => {
    it("should use default from email when RESEND_FROM_EMAIL is not set", async () => {
      mockEmailsSend.mockResolvedValue({ data: { id: "test" }, error: null });
      const originalFrom = process.env.RESEND_FROM_EMAIL;
      delete process.env.RESEND_FROM_EMAIL;

      await sendEmail({
        to: "john@example.com",
        template: "verification-email",
        templateProps: {
          ...baseProps,
          verificationUrl: "https://test.vamlar.com/verify-email",
        },
      });

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({ from: "no-reply@vamlar.com" })
      );

      process.env.RESEND_FROM_EMAIL = originalFrom;
    });
  });

  describe("appName fallback", () => {
    it("should use default app name when appName is not provided in props", async () => {
      mockEmailsSend.mockResolvedValue({ data: { id: "fallback" }, error: null });

      await sendEmail({
        to: "john@example.com",
        template: "verification-email",
        templateProps: {
          firstName: "John",
          email: "john@example.com",
          verificationUrl: "https://test.vamlar.com/verify-email",
          logoUrl: "",
        },
      });

      const callArg = mockEmailsSend.mock.calls[0][0];
      expect(callArg.subject).toBe("Verify your Vamlar email");
    });
  });
});