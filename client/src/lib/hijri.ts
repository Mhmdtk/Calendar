import moment from 'moment-hijri';
import { HijriOverride } from '@shared/schema';

// Configure moment to use Arabic numerals or names if needed
moment.locale('ar-sa');

export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
}

/**
 * Calculates the Hijri date for a given Gregorian date, applying any overrides.
 */
export function getHijriDate(date: Date, overrides: HijriOverride[] = []): HijriDate {
  const m = moment(date);
  
  // Normalize the input date to start of day in local time for comparison
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  // Sort overrides by date descending
  const sortedOverrides = [...overrides].sort((a, b) => 
    new Date(b.gregorianDate).getTime() - new Date(a.gregorianDate).getTime()
  );

  // Find the active override (the one with the latest start date <= current date)
  const activeOverride = sortedOverrides.find(ov => {
    const ovDate = new Date(ov.gregorianDate);
    ovDate.setHours(0, 0, 0, 0);
    return d >= ovDate;
  });

  if (activeOverride) {
    const startGregorian = new Date(activeOverride.gregorianDate);
    startGregorian.setHours(0, 0, 0, 0);
    
    // Calculate difference in calendar days from the override start date
    const diffDays = Math.round((d.getTime() - startGregorian.getTime()) / (1000 * 60 * 60 * 24));
    
    // Logic: If we have an override, all dates after it follow that cycle.
    // Each month is ~29.5 days. To handle "all months after", we calculate
    // how many months have passed since the override.
    
    // Total days since override
    let remainingDays = diffDays;
    let hijriMonth = activeOverride.hijriMonth;
    let hijriYear = activeOverride.hijriYear;

    // This is a basic simulation of Hijri month progression (alternating 30/29)
    // to ensure subsequent months are also shifted relative to the override.
    while (remainingDays >= 29) {
      const monthDays = (hijriMonth % 2 === 1) ? 30 : 29; // Simple alternating rule
      if (remainingDays < monthDays) break;
      
      remainingDays -= monthDays;
      hijriMonth++;
      if (hijriMonth > 12) {
        hijriMonth = 1;
        hijriYear++;
      }
    }

    return {
      day: remainingDays + 1,
      month: hijriMonth,
      year: hijriYear,
      monthName: moment().iMonth(hijriMonth - 1).format('iMMMM'),
    };
  }

  return {
    day: m.iDate(),
    month: m.iMonth() + 1,
    year: m.iYear(),
    monthName: m.format('iMMMM'),
  };
}

export function formatHijri(date: Date): string {
  const m = moment(date);
  return m.format('iD iMMMM iYYYY');
}
