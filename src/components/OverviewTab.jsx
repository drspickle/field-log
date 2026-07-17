import { Box, Typography } from '@mui/material';
import ZoneChart from './charts/ZoneChart';
import Vo2Chart from './charts/Vo2Chart';
import StrengthChart from './charts/StrengthChart';
import NutritionChart from './charts/NutritionChart';

function SectionTitle({ children }) {
  return (
    <Typography
      sx={{
        fontFamily: 'Oswald, sans-serif',
        fontSize: 15,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        mb: 1.75,
        pb: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {children}
    </Typography>
  );
}

function ChartBox({ children }) {
  return (
    <Box sx={{ backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 0.75, p: 2.25, mb: 2.5, height: 260 }}>
      {children}
    </Box>
  );
}

export default function OverviewTab({ entries, stats }) {
  return (
    <Box>
      <SectionTitle>Cardiovascular Minutes / Week</SectionTitle>
      <ChartBox>
        <ZoneChart entries={entries} />
      </ChartBox>

      <SectionTitle>VO2 Max Trend</SectionTitle>
      <ChartBox>
        <Vo2Chart vo2Entries={stats.vo2Entries} />
      </ChartBox>

      <SectionTitle>Estimated 1RM Bench Trend</SectionTitle>
      <ChartBox>
        <StrengthChart strengthTestEntries={stats.strengthTestEntries} />
      </ChartBox>

      <SectionTitle>Calories &amp; Protein (Last 7 Logged Days)</SectionTitle>
      {stats.dietDaily.length === 0 ? (
        <Typography color="text.secondary" sx={{ fontSize: 13, py: 4, textAlign: 'center' }}>
          No diet entries logged yet.
        </Typography>
      ) : (
        <ChartBox>
          <NutritionChart dietDaily={stats.dietDaily} />
        </ChartBox>
      )}
    </Box>
  );
}
