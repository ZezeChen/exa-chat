/**
 * Formats a date string as relative time for recent dates (within 30 days),
 * or as a formatted date for older dates.
 * 
 * @param dateString - ISO date string to format
 * @returns Relative time string (e.g., "2 days ago") or formatted date
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  if (isNaN(date.getTime())) {
    return dateString;
  }

  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return formatDate(date);
  }

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes <= 1) return 'just now';
      return `${diffMinutes} minutes ago`;
    }
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  }

  if (diffDays === 1) return 'yesterday';
  if (diffDays <= 30) return `${diffDays} days ago`;

  return formatDate(date);
}

/**
 * Formats a date as a readable string.
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
