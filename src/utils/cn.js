/**
 * Combines dynamic Tailwind CSS class names.
 * @param {...string} classes - Class list or conditional expressions.
 * @returns {string} - Combined class string.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ').trim();
}
