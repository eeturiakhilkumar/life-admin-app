import { describe, expect, it } from "vitest";

import { buildPhoneNumber, buildPhoneNumberFromInput, sanitizeDialCode, sanitizeOtpToken } from "../src/lib/auth-utils";
import { moduleCards } from "../src/content/modules";

describe("module coverage", () => {
  it("includes all launch modules", () => {
    expect(moduleCards.map((moduleCard) => moduleCard.type)).toEqual([
      "bill",
      "appointment",
      "renewal",
      "important_date",
      "shopping_list",
      "document"
    ]);
  });

  it("builds an international phone number for OTP auth", () => {
    expect(buildPhoneNumber({ dialCode: "+91", nationalNumber: "98765 43210" })).toEqual({
      phone: "+919876543210",
      error: null
    });
  });

  it("sanitizes dial code and otp input", () => {
    expect(sanitizeDialCode("91abc")).toBe("+91");
    expect(sanitizeOtpToken("12a34 567")).toBe("123456");
  });

  it("supports a single mobile-number field with an India-first default", () => {
    expect(buildPhoneNumberFromInput("9876543210")).toEqual({
      phone: "+919876543210",
      error: null
    });
    expect(buildPhoneNumberFromInput("+14155550123")).toEqual({
      phone: "+14155550123",
      error: null
    });
  });
});
