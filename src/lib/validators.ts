/**
 * Generic validators for use on both client-side forms and server-side API routes.
 * These ensure consistent validation logic across the application.
 */

/**
 * Validates email format.
 * Returns error message if invalid, null if valid.
 */
export function validateEmail(email: string): string | null {
  if (!email) return null; // Let required validation handle empty check
  if (!/^\S+@\S+\.\S+$/.test(email)) return "Email format invalid";
  return null;
}

/**
 * Validates phone format.
 * Returns error message if invalid, null if valid.
 * Accepts formats: digits, spaces, +, -, ()
 */
export function validatePhone(phone: string): string | null {
  if (!phone) return null; // Phone is optional
  if (!/^[\d\s+\-()]+$/.test(phone) || phone.replace(/\D/g, "").length < 6) {
    return "Phone format invalid";
  }
  return null;
}
