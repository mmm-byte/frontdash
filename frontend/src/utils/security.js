// Centralized username and password policy helpers.

// Username: at least two letters followed by at least two digits
export const USERNAME_REGEX = /^[A-Za-z]{2,}\d{2,}$/;

// Password: >=6 chars, at least one uppercase, one lowercase, one number
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

export const isUsernameValid = (loginType, username) => {
  if (!username || typeof username !== 'string') return false;
  // Admin username is exempt from the pattern; all others must follow two letters + two digits
  if (loginType === 'admin') return true;
  return USERNAME_REGEX.test(username.trim());
};

export const isPasswordValid = (password) => {
  if (!password || typeof password !== 'string') return false;
  return PASSWORD_REGEX.test(password);
};

export function generateTempPassword(length = 12) {
  if (!window.crypto?.getRandomValues) {
    throw new Error('Secure password generation is unavailable in this browser.');
  }
  length = Math.max(3, Math.floor(length));
  const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowers = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const all = uppers + lowers + digits;
  const random = new Uint32Array(length);
  window.crypto.getRandomValues(random);
  const chars = [
    uppers[random[0] % uppers.length],
    lowers[random[1] % lowers.length],
    digits[random[2] % digits.length],
  ];
  for (let index = 3; index < length; index += 1) {
    chars.push(all[random[index] % all.length]);
  }
  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swapIndex = random[index] % (index + 1);
    [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];
  }
  return chars.join('');
}
