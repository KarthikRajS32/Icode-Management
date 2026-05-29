/**
 * Formats a date string (YYYY-MM-DD or ISO) into a reader-friendly format.
 * @param {string|Date} dateVal - Input date string or Date object.
 * @param {boolean} includeTime - If true, appends standard time.
 * @returns {string} - Formatted date (e.g. "May 29, 2026").
 */
export function formatDate(dateVal, includeTime = false) {
  if (!dateVal) return 'N/A';
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return String(dateVal);

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  const formattedDate = date.toLocaleDateString('en-US', options);

  if (includeTime) {
    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return `${formattedDate} at ${date.toLocaleTimeString('en-US', timeOptions)}`;
  }

  return formattedDate;
}
