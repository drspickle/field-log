import { Box, TextField, MenuItem, Button, Typography } from '@mui/material';
import { useEntryForm, todayFields } from '../../utils/useEntryForm';

const SOURCES = ['Apple Watch', 'Lab Test', 'Other'];

const INITIAL = todayFields({ value: '', source: 'Apple Watch' });
const TRACKED = ['value'];

export default function Vo2Form({ editing, entries, commitEntry, cancelEdit }) {
  const { fields, setField, message, submit, hasData, isEditingThis } = useEntryForm({
    type: 'vo2max',
    editing,
    entries,
    commitEntry,
    cancelEdit,
    initialFields: INITIAL,
    trackedFields: TRACKED,
  });

  const handleSubmit = () =>
    submit((f) => (!f.date || !f.value ? 'Date and reading are required.' : null));

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1.75, mb: 1.75 }}>
        <TextField label="Date" type="date" value={fields.date} onChange={(e) => setField('date', e.target.value)} required InputLabelProps={{ shrink: true }} />
        <TextField label="VO2 Max Reading" type="number" inputProps={{ step: 0.1 }} value={fields.value} onChange={(e) => setField('value', e.target.value)} required />
        <TextField select label="Source" value={fields.source} onChange={(e) => setField('source', e.target.value)}>
          {SOURCES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
      </Box>

      <Button variant="contained" color="primary" fullWidth disabled={!hasData} onClick={handleSubmit}>
        {isEditingThis ? 'Update Entry' : 'Log VO2 Max'}
      </Button>
      <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, mt: 1.25, minHeight: 16, color: message.isError ? 'error.main' : 'secondary.main' }}>
        {message.text}
      </Typography>
    </Box>
  );
}
