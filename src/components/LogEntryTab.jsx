import { Box, Typography, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import CardioForm from './forms/CardioForm';
import StrengthForm from './forms/StrengthForm';
import StrengthTestForm from './forms/StrengthTestForm';
import Vo2Form from './forms/Vo2Form';
import DietForm from './forms/DietForm';

const FORM_TYPES = [
  { key: 'cardio', label: 'Cardio' },
  { key: 'strength', label: 'Strength' },
  { key: 'strength_test', label: 'Strength Test' },
  { key: 'vo2max', label: 'VO2 Max' },
  { key: 'diet', label: 'Diet' },
];

export default function LogEntryTab({ formType, setFormType, editing, entries, diet, dietPresets, setDietPresets, commitEntry, cancelEdit }) {
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
        {FORM_TYPES.map((f) => (
          <ToggleButton
            key={f.key}
            value={f.key}
            disabled={!!editing && formType !== f.key}
            sx={{ flex: 1, textTransform: 'uppercase', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: 1 }}
          >
            {f.label}
          </ToggleButton>
        ))}
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
