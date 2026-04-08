const digitsOnly = (value: string) => value.replace(/\D/g, "");

export const sanitizeDialCode = (value: string) => {
  const digits = digitsOnly(value);
  return digits ? `+${digits}` : "+";
};

export const sanitizeOtpToken = (value: string) => digitsOnly(value).slice(0, 6);

export const buildPhoneNumber = ({
  dialCode,
  nationalNumber
}: {
  dialCode: string;
  nationalNumber: string;
}) => {
  const dialDigits = digitsOnly(dialCode);
  const localDigits = digitsOnly(nationalNumber);
  const combinedLength = dialDigits.length + localDigits.length;

  if (!dialDigits.length) {
    return {
      phone: null,
      error: "Enter a country code such as +91 or +1."
    };
  }

  if (localDigits.length < 8) {
    return {
      phone: null,
      error: "Enter a valid mobile number."
    };
  }

  if (combinedLength > 15) {
    return {
      phone: null,
      error: "Phone numbers must fit the international E.164 format."
    };
  }

  return {
    phone: `+${dialDigits}${localDigits}`,
    error: null
  };
};

export const buildPhoneNumberFromInput = (
  value: string,
  options: {
    defaultCountryCode?: string;
  } = {}
) => {
  const { defaultCountryCode = "+91" } = options;
  const trimmed = value.trim();
  const digits = digitsOnly(trimmed);
  const defaultCodeDigits = digitsOnly(defaultCountryCode);

  if (!digits.length) {
    return {
      phone: null,
      error: "Enter your mobile number to continue."
    };
  }

  if (trimmed.startsWith("+")) {
    if (digits.length > 15) {
      return {
        phone: null,
        error: "Enter a valid mobile number with country code."
      };
    }

    return {
      phone: `+${digits}`,
      error: null
    };
  }

  if (digits.length === 10 && defaultCodeDigits.length) {
    return {
      phone: `+${defaultCodeDigits}${digits}`,
      error: null
    };
  }

  if (digits.length >= 11 && digits.length <= 15) {
    return {
      phone: `+${digits}`,
      error: null
    };
  }

  return {
    phone: null,
    error: "Enter a valid mobile number. Example: 9876543210 or +14155552671."
  };
};
