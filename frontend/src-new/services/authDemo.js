const DEMO_OTP = "123456";

let demoAccount = null;
let demoSession = null;

export function createDemoAccount({ fullName, identifier }) {
  demoAccount = {
    fullName,
    identifier,
  };

  return {
    ok: true,
    account: { ...demoAccount },
  };
}

export function loginDemoAccount({ identifier }) {
  if (!identifier?.trim()) {
    return {
      ok: false,
      error: "Email or phone is required.",
    };
  }

  if (!demoAccount) {
    demoAccount = {
      fullName: "Demo User",
      identifier: identifier.trim(),
    };
  }

  demoSession = {
    identifier: identifier.trim(),
    authenticated: true,
  };

  return {
    ok: true,
    session: { ...demoSession },
  };
}

export function verifyDemoOTP(otp) {
  if (otp !== DEMO_OTP) {
    return {
      ok: false,
      error: "Invalid demo OTP.",
    };
  }

  return {
    ok: true,
  };
}

export function createDemoPIN(pin) {
  if (!/^\d{6}$/.test(pin)) {
    return {
      ok: false,
      error: "PIN must contain 6 digits.",
    };
  }

  return {
    ok: true,
  };
}

export function requestDemoPasswordReset(identifier) {
  if (!identifier?.trim()) {
    return {
      ok: false,
      error: "Email or phone is required.",
    };
  }

  return {
    ok: true,
  };
}

export function getDemoSession() {
  return demoSession ? { ...demoSession } : null;
}

export function clearDemoSession() {
  demoSession = null;
}

export function getDemoOTP() {
  return DEMO_OTP;
}
