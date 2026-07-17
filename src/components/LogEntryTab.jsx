import { Box, Typography, Button, ToggleButtonGroup, ToggleButton, useMediaQuery, useTheme } from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CardioForm from './forms/CardioForm';
import StrengthForm from './forms/StrengthForm';
import StrengthTestForm from './forms/StrengthTestForm';
import Vo2Form from './forms/Vo2Form';
import DietForm from './forms/DietForm';

const FORM_TYPES = [
  { key: 'cardio', label: 'Cardio', icon: DirectionsRunIcon },
  { key: 'strength', label: 'Strength', icon: FitnessCenterIcon },
  { key: 'strength_test', label: 'Strength Test', icon: EmojiEventsIcon },
  { key: 'vo2max', label: 'VO2 Max', icon: MonitorHeartIcon },
  { key: 'diet', label: 'Diet', icon: RestaurantIcon },
];

export default function LogEntryTab({ formType, setFormType, editing, entries, diet, dietPresets, setDietPresets, commitEntry, cancelEdit }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box>
      {editing && (
        <Box
          sx={{
            backgroundColor: 'primary.main',
            color: '#1b1000',
            border: '1px solid',
            borderColor: 'primary.main',
            borderRadius: 0.75,
            px: 1.75,
            py: 1.25,
            mb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 13,
          }}
        >
          <span>Editing existing entry.</span>
          <Button size="small" onClick={cancelEdit} sx={{ color: '#1b1000', border: '1px solid #1b1000' }}>
            Cancel
          </Button>
        </Box>
      )}

      <ToggleButtonGroup
        value={formType}
        exclusive
        onChange={(_, v) => v && !editing && setFormType(v)}
        sx={{ display: 'flex', gap: 1, mb: 2.25 }}
      >
        {FORM_TYPES.map((f) => {
          const Icon = f.icon;
          return (
            <ToggleButton
              key={f.key}
              value={f.key}
              disabled={!!editing && formType !== f.key}
              aria-label={f.label}
              sx={{ flex: 1, minWidth: 0, px: isMobile ? 0.5 : 1.5, textTransform: 'uppercase', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: 1 }}
            >
              <Icon fontSize="small" sx={{ mr: isMobile ? 0 : 0.75 }} />
              {!isMobile && f.label}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>

      {formType === 'cardio' && <CardioForm editing={editing} entries={entries} commitEntry={commitEntry} cancelEdit={cancelEdit} />}
      {formType === 'strength' && <StrengthForm editing={editing} entries={entries} commitEntry={commitEntry} cancelEdit={cancelEdit} />}
      {formType === 'strength_test' && <StrengthTestForm editing={editing} entries={entries} commitEntry={commitEntry} cancelEdit={cancelEdit} />}
      {formType === 'vo2max' && <Vo2Form editing={editing} entries={entries} commitEntry={commitEntry} cancelEdit={cancelEdit} />}
      {formType === 'diet' && (
        <DietForm editing={editing} diet={diet} dietPresets={dietPresets} setDietPresets={setDietPresets} commitEntry={commitEntry} cancelEdit={cancelEdit} />
      )}
    </Box>
  );
}
