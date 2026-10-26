import { isUsernameValid, isPasswordValid } from './security';

// Demo credentials (plaintext per updated requirements)
const DEMO = {
  admin: { username: 'admin', password: 'AdminPass1!', name: 'Admin' },
  restaurant: { username: 're34', password: 'RestPass1!', name: 'Pizza Palace' }
};

// Async login validation with policy enforcement and hashed verification
export const validateLogin = async (loginType, username, password) => {
  const u = (username || '').trim();
  const p = (password || '').trim();

  if (!u || !p) {
    return { success: false, message: 'Both username and password are required.' };
  }

  if (!['admin', 'restaurant', 'staff'].includes(loginType)) {
    return { success: false, message: 'Invalid login type.' };
  }

  // Enforce username/password policy (admin username exempt)
  if (!isUsernameValid(loginType, u)) {
    return { success: false, message: 'Username must be at least two letters followed by at least two digits (e.g., ab12).' };
  }
  if (!isPasswordValid(p)) {
    return { success: false, message: 'Password must be at least 6 chars with uppercase, lowercase, and a number.' };
  }

  // Admin and restaurant accounts (plaintext compare per requirement)
  if (loginType === 'admin') {
    const stored = (() => { try { return localStorage.getItem('adminPassword'); } catch { return null; } })();
    const ok = (u === DEMO.admin.username) && (p === (stored || DEMO.admin.password));
    return ok ? { success: true, name: DEMO.admin.name } : { success: false, message: 'Invalid credentials!' };
  }

  if (loginType === 'restaurant') {
    const stored = (() => { try { return localStorage.getItem('restaurantPassword'); } catch { return null; } })();
    const ok = (u === DEMO.restaurant.username) && (p === (stored || DEMO.restaurant.password));
    return ok ? { success: true, name: DEMO.restaurant.name } : { success: false, message: 'Invalid credentials!' };
  }

  // Staff login: check staffAccounts in localStorage, compare against passwordHash
  try {
    const staffAccounts = JSON.parse(localStorage.getItem('staffAccounts') || '[]');
    // Allow login via username or email; compare plaintext per requirement
    const staff = staffAccounts.find(s => (s.username && s.username.toLowerCase() === u.toLowerCase()) || (s.email && s.email.toLowerCase() === u.toLowerCase()));
    if (!staff) return { success: false, message: 'Invalid credentials!' };
    if (p !== (staff.password || '')) return { success: false, message: 'Invalid credentials!' };
    return { success: true, name: staff.fullName || staff.name || 'Staff', staffData: staff };
  } catch (e) {
    return { success: false, message: 'Login unavailable. Please try again.' };
  }
};
