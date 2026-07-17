import { Box, TextField, MenuItem, Button, Typography } from '@mui/material';
import { useEntryForm, todayFields } from '../../utils/useEntryForm';

const FOCI = ['Lower Body', 'Upper Body', 'Full Body', 'Stability'];

const INITIAL = todayFields({ duration: '', focus: 'Lower Body', notes: '' });
const TRACKED = ['duration', 'notes'];

export default function StrengthForm({ editing, entries, commitEntry, cancelEdit }) {
  const { fields, setField, message, submit, hasData, isEditingThis } = useEntryForm({
    type: 'strength',
    editing,
    entries,
    commitEntry,
    cancelEdit,
    initialFields: INITIAL,
    trackedFields: TRACKED,
  });

  const handleSubmit = () =>
    submit((f) => (!f.date || !f.duration ? 'Date and duration are required.' : null));

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1.75, mb: 1.75 }}>
        <TextField label="Date" type="date" value={fields.date} onChange={(e) => setField('date', e.target.value)} required InputLabelProps={{ shrink: true }} />
        <TextField label="Duration (min)" type="number" value={fields.duration} onChange={(e) => setField('duration', e.target.value)} required />
        <TextField select label="Focus" value={fields.focus} onChange={(e) => setField('focus', e.target.value)}>
          {FOCI.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
        </TextField>
      </Box>

      <TextField
        label="Notes (lifts, weights, reps)"
        multiline
        minRows={2}
        fullWidth
        value={fields.notes}
        onChange={(e) => setField('notes', e.target.value)}
        sx={{ mb: 1.75 }}
      />

      <Button variant="contained" color="primary" fullWidth disabled={!hasData} onClick={handleSubmit}>
        {isEditingThis ? 'Update Entry' : 'Log Strength Session'}
      </Button>
      <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, mt: 1.25, minHeight: 16, color: message.isError ? 'error.main' : 'secondary.main' }}>
        {message.text}
      </Typography>
    </Box>
  );
}
