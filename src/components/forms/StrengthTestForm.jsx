import { Box, TextField, Button, Typography } from '@mui/material';
import { useEntryForm, todayFields } from '../../utils/useEntryForm';
import { epley1RM } from '../../utils/stats';

const INITIAL = todayFields({ weight: '', reps: '' });
const TRACKED = ['weight', 'reps'];

export default function StrengthTestForm({ editing, entries, commitEntry, cancelEdit }) {
  const { fields, setField, message, submit, hasData, isEditingThis } = useEntryForm({
    type: 'strength_test',
    editing,
    entries,
    commitEntry,
    cancelEdit,
    initialFields: INITIAL,
    trackedFields: TRACKED,
  });

  const liveRM = epley1RM(fields.weight, fields.reps);

  const handleSubmit = () =>
    submit((f) => (!f.date || !f.weight || !f.reps ? 'Date, weight, and reps are required.' : null));

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1.75, mb: 1.75 }}>
        <TextField label="Date" type="date" value={fields.date} onChange={(e) => setField('date', e.target.value)} required InputLabelProps={{ shrink: true }} />
        <TextField label="Weight (lb)" type="number" inputProps={{ step: 0.5 }} value={fields.weight} onChange={(e) => setField('weight', e.target.value)} required />
        <TextField label="Reps" type="number" value={fields.reps} onChange={(e) => setField('reps', e.target.value)} required />
      </Box>

      <Box sx={{ mb: 1.75 }}>
        <Typography sx={{ fontSize: 11, letterSpacing: 1, color: 'text.secondary', textTransform: 'uppercase', mb: 0.5 }}>
          Estimated 1RM
        </Typography>
        <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 20 }}>
          {liveRM ? Math.round(liveRM) + ' lb' : '—'}
        </Typography>
      </Box>

      <Button variant="contained" color="primary" fullWidth disabled={!hasData} onClick={handleSubmit}>
        {isEditingThis ? 'Update Entry' : 'Log Strength Test'}
      </Button>
      <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, mt: 1.25, minHeight: 16, color: message.isError ? 'error.main' : 'secondary.main' }}>
        {message.text}
      </Typography>
    </Box>
  );
}
