import { Box, TextField, MenuItem, Button, Typography } from '@mui/material';
import PhotoDropzone from '../PhotoDropzone';
import { useEntryForm, todayFields } from '../../utils/useEntryForm';
import { extractWorkout } from '../../utils/api';

const ACTIVITIES = ['Run', 'Bike', 'Row', 'Hike', 'Other'];

const INITIAL = todayFields({ activity: 'Run', duration: '', distance: '', avgHR: '', maxHR: '', calories: '', notes: '' });
const TRACKED = ['duration', 'distance', 'avgHR', 'maxHR', 'calories', 'notes'];

export default function CardioForm({ editing, entries, commitEntry, cancelEdit }) {
  const { fields, setField, message, submit, hasData, isEditingThis } = useEntryForm({
    type: 'cardio',
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
      <PhotoDropzone
        label="Drop a screenshot from your workout app here, or click to browse"
        sublabel="Reads distance, duration, and heart rate automatically. Review before saving."
        onExtract={extractWorkout}
        successMessage="Extracted. Review the fields below, then save."
        onResult={(data) => {
          if (!data) return;
          if (data.activity && ACTIVITIES.includes(data.activity)) setField('activity', data.activity);
          if (data.duration != null) setField('duration', Math.round(data.duration));
          if (data.distance != null) setField('distance', data.distance);
          if (data.avgHR != null) setField('avgHR', Math.round(data.avgHR));
          if (data.maxHR != null) setField('maxHR', Math.round(data.maxHR));
          if (data.calories != null) setField('calories', Math.round(data.calories));
        }}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1.75, mb: 1.75 }}>
        <TextField label="Date" type="date" value={fields.date} onChange={(e) => setField('date', e.target.value)} required InputLabelProps={{ shrink: true }} />
        <TextField select label="Activity" value={fields.activity} onChange={(e) => setField('activity', e.target.value)}>
          {ACTIVITIES.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
        </TextField>
        <TextField label="Duration (min)" type="number" value={fields.duration} onChange={(e) => setField('duration', e.target.value)} required />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1.75, mb: 1.75 }}>
        <TextField label="Distance (mi)" type="number" inputProps={{ step: 0.01 }} value={fields.distance} onChange={(e) => setField('distance', e.target.value)} />
        <TextField label="Avg HR" type="number" value={fields.avgHR} onChange={(e) => setField('avgHR', e.target.value)} />
        <TextField label="Max HR" type="number" value={fields.maxHR} onChange={(e) => setField('maxHR', e.target.value)} />
        <TextField label="Calories" type="number" value={fields.calories} onChange={(e) => setField('calories', e.target.value)} />
      </Box>

      <TextField label="Notes" multiline minRows={2} fullWidth value={fields.notes} onChange={(e) => setField('notes', e.target.value)} sx={{ mb: 1.75 }} />

      <Button variant="contained" color="primary" fullWidth disabled={!hasData} onClick={handleSubmit}>
        {isEditingThis ? 'Update Entry' : 'Log Cardio Session'}
      </Button>
      <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, mt: 1.25, minHeight: 16, color: message.isError ? 'error.main' : 'secondary.main' }}>
        {message.text}
      </Typography>
    </Box>
  );
}
