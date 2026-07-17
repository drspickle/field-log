import { Box, Typography } from '@mui/material';

function Trend({ current, priorAvg, colorOverride }) {
  if (current === null || current === undefined || priorAvg === null || priorAvg === undefined || !priorAvg) return null;
  const dir = current > priorAvg ? 'up' : current < priorAvg ? 'down' : 'flat';
  const arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '–';
  const color = colorOverride || (dir === 'up' ? '#5c7a68' : dir === 'down' ? '#c1523a' : 'text.secondary');
  const pct = Math.round(((current - priorAvg) / priorAvg) * 100);
  const sign = pct > 0 ? '+' : '';
  return (
    <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, mt: 0.4, color }}>
      {arrow} {sign}{pct}% vs 30d avg
    </Typography>
  );
}

function Cell({ label, value, trend, borderRight }) {
  return (
    <Box sx={{ flex: 1, minWidth: 110, py: 1.25, px: 1.75, borderRight: borderRight ? '1px solid' : 'none', borderColor: 'divider' }}>
      <Typography sx={{ fontSize: 10, letterSpacing: 1.5, color: 'text.secondary', textTransform: 'uppercase', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 16, color: 'primary.main' }}>
        {value}
      </Typography>
      {trend}
    </Box>
  );
}

export default function HeaderStats({ stats }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', border: '1px solid', borderColor: 'divider', borderRadius: 0.75, overflow: 'hidden' }}>
      <Cell
        label="Zone 2 Min (7d)"
        value={stats.zone2Minutes}
        trend={<Trend current={stats.zone2Minutes} priorAvg={stats.zone2Trend} />}
        borderRight
      />
      <Cell
        label="Latest VO2 Max"
        value={stats.latestVo2 ?? '—'}
        trend={<Trend current={parseFloat(stats.latestVo2)} priorAvg={stats.vo2Trend} />}
        borderRight
      />
      <Cell
        label="Est. 1RM Bench"
        value={stats.latest1RM ? Math.round(stats.latest1RM) + ' lb' : '—'}
        trend={<Trend current={stats.latest1RM} priorAvg={stats.oneRMTrend} />}
        borderRight
      />
      <Cell
        label="Calories Today"
        value={stats.todayCalories}
        trend={<Trend current={stats.todayCalories} priorAvg={stats.caloriesTrend} />}
        borderRight
      />
      <Cell
        label="Protein Today"
        value={stats.todayProtein + 'g'}
        trend={<Trend current={stats.todayProtein} priorAvg={stats.proteinTrend} />}
      />
    </Box>
  );
}
