export const otpStore = new Map();

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const setOtp = (email, otp) => {
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  });
};

export const getOtp = (email) => {
  const record = otpStore.get(email);

  if (!record) return null;

  if (record.expiresAt < Date.now()) {
    otpStore.delete(email);
    return null;
  }

  return record;
};

setInterval(() => {
  const now = Date.now();
  for (const [email, record] of otpStore.entries()) {
    if (record.expiresAt < now) {
      otpStore.delete(email);
    }
  }
}, 60 * 1000);