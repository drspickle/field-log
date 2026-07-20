export function parseLocalDate(dateStr) {
  if (!dateStr) return new Date(NaN);
  const parts = dateStr.split('-');
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

export function localDateStr(d) {
  d = d || new Date();
  const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
  return y + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
}

export function daysAgo(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

export function isToday(dateStr) {
  const d = parseLocalDate(dateStr);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

export function fmtDate(dateStr) {
  const d = parseLocalDate(dateStr);
  return (d.getMonth() + 1) + '/' + d.getDate();
}

// Monday (midnight) of the calendar week containing `date`.
export function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun..6=Sat
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

export function epley1RM(weight, reps) {
  const w = parseFloat(weight), r = parseFloat(reps);
  if (!w || !r) return null;
  return w * (1 + r / 30);
}

export function average(arr) {
  if (!arr || !arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function dailyDietTotals(diet) {
  const map = {};
  diet.forEach((e) => {
    if (!map[e.date]) map[e.date] = { date: e.date, calories: 0, protein: 0 };
    map[e.date].calories += parseFloat(e.calories) || 0;
    map[e.date].protein += parseFloat(e.protein) || 0;
  });
  return Object.keys(map)
    .map((k) => map[k])
    .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
}

export function weeklyZone2Series(entries, weeks) {
  const currentWeekStart = startOfWeek(new Date());
  const buckets = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(currentWeekStart);
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const total = entries
      .filter((e) => {
        const d = parseLocalDate(e.date);
        return e.type === 'cardio' && d >= start && d < end;
      })
      .reduce((sum, e) => {
        const avg = parseFloat(e.avgHR);
        if (avg >= 127 && avg <= 154) return sum + (parseFloat(e.duration) || 0);
        return sum;
      }, 0);
    buckets.push({ label: (start.getMonth() + 1) + '/' + start.getDate(), value: Math.round(total) });
  }
  return buckets;
}

// Trend baselines compare "current" to a prior average, per metric:
// - Zone 2 is a calendar-week total (Monday-start), so its baseline is the average
//   weekly total over the 4 completed calendar weeks before this one (comparable units).
// - VO2/1RM are sparse point-in-time tests, so the baseline is the average of prior
//   readings (excluding the latest) logged in the last 30 real days.
// - Calories/protein are daily totals, so the baseline is the average daily total over
//   the 30 days before today.
export function computeStats(entries, diet) {
  const currentWeekStart = startOfWeek(new Date());
  const zone2Minutes = entries
    .filter((e) => e.type === 'cardio' && parseLocalDate(e.date) >= currentWeekStart)
    .reduce((sum, e) => {
      const avg = parseFloat(e.avgHR);
      if (avg >= 127 && avg <= 154) return sum + (parseFloat(e.duration) || 0);
      return sum;
    }, 0);
  // Baseline: average weekly total over the 4 completed calendar weeks before this one.
  const PRIOR_WEEKS = 4;
  const priorWeeksStart = new Date(currentWeekStart);
  priorWeeksStart.setDate(priorWeeksStart.getDate() - PRIOR_WEEKS * 7);
  const priorZone2Total = entries
    .filter((e) => {
      const d = parseLocalDate(e.date);
      return e.type === 'cardio' && d >= priorWeeksStart && d < currentWeekStart;
    })
    .reduce((sum, e) => {
      const avg = parseFloat(e.avgHR);
      if (avg >= 127 && avg <= 154) return sum + (parseFloat(e.duration) || 0);
      return sum;
    }, 0);
  const zone2Trend = priorZone2Total > 0 ? priorZone2Total / PRIOR_WEEKS : null;

  const vo2Entries = entries
    .filter((e) => e.type === 'vo2max')
    .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
  const latestVo2 = vo2Entries.length ? vo2Entries[vo2Entries.length - 1].value : null;
  const priorVo2 = vo2Entries
    .slice(0, -1)
    .filter((e) => {
      const d = parseLocalDate(e.date);
      return d >= daysAgo(30) && d < daysAgo(0);
    })
    .map((e) => parseFloat(e.value));
  const vo2Trend = average(priorVo2);

  const strengthTestEntries = entries
    .filter((e) => e.type === 'strength_test')
    .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
  const latest1RM = strengthTestEntries.length
    ? epley1RM(strengthTestEntries[strengthTestEntries.length - 1].weight, strengthTestEntries[strengthTestEntries.length - 1].reps)
    : null;
  const priorRM = strengthTestEntries
    .slice(0, -1)
    .filter((e) => {
      const d = parseLocalDate(e.date);
      return d >= daysAgo(30) && d < daysAgo(0);
    })
    .map((e) => epley1RM(e.weight, e.reps))
    .filter((v) => v !== null);
  const oneRMTrend = average(priorRM);

  const dietDaily = dailyDietTotals(diet);
  const todayDiet = diet.filter((e) => isToday(e.date));
  const todayCalories = todayDiet.reduce((sum, e) => sum + (parseFloat(e.calories) || 0), 0);
  const todayProtein = todayDiet.reduce((sum, e) => sum + (parseFloat(e.protein) || 0), 0);
  const priorDiet = dietDaily.filter((d) => {
    const dd = parseLocalDate(d.date);
    return dd >= daysAgo(30) && dd < daysAgo(0);
  });
  const caloriesTrend = average(priorDiet.map((d) => d.calories));
  const proteinTrend = average(priorDiet.map((d) => d.protein));

  return {
    zone2Minutes: Math.round(zone2Minutes),
    zone2Trend,
    latestVo2,
    vo2Entries,
    vo2Trend,
    latest1RM,
    strengthTestEntries,
    oneRMTrend,
    dietDaily,
    todayCalories: Math.round(todayCalories),
    todayProtein: Math.round(todayProtein),
    todayDietCount: todayDiet.length,
    caloriesTrend,
    proteinTrend,
  };
}
