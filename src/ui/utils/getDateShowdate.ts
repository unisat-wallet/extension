import { formatDate } from '.';

/**
 * Get the date show date
 * @param date
 * @param t
 * @returns
 */
export function getDateShowdate(date: Date, t: (key: string, substitutions?: string | string[]) => string) {
  if (date.getTime() < 100) {
    return t('unconfirmed');
  } else {
    const old = Date.now() - date.getTime();
    if (old < 60 * 1000) {
      return `${Math.floor(old / 1000)}` + t('seconds_ago');
    }
    if (old < 1000 * 60 * 60) {
      return `${Math.floor(old / 60000)}` + t('minutes_ago');
    }
    if (old < 1000 * 60 * 60 * 24) {
      return `${Math.floor(old / 3600000)}` + t('hours_ago');
    }
    if (old < 1000 * 60 * 60 * 24 * 30) {
      return `${Math.floor(old / 86400000)}` + t('days_ago');
    }
  }
  return formatDate(date, 'yyyy-MM-dd');
}
