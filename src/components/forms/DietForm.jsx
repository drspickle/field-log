import { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, IconButton, Typography, Chip, useMediaQuery, useTheme } from '@mui/material';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import PhotoDropzone from '../PhotoDropzone';
import { localDateStr } from '../../utils/stats';
import { insertPreset, deletePresetRow } from '../../utils/supabase';
import { estimateNutritionPhoto, estimateNutritionText } from '../../utils/api';

const INITIAL = { date: localDateStr(), food: '', calories: '', protein: '', notes: '' };

function Breakdown({ items }) {
  if (!items || !items.length) return null;
  return (
    <Box sx={{ mb: 1.75 }}>
      {items.map((item, i) => (
        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'text.secondary', py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <span>{item.name}</span>
          <span>{Math.round(item.calories)} cal &middot; {Math.round(item.protein)}g</span>
        </Box>
      ))}
    </Box>
  );
}

export default function DietForm({ editing, diet, dietPresets, setDietPresets, commitEntry, cancelEdit }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [fields, setFields] = useState(INITIAL);
  const [message, setMessage] = useState({ text: '', isError: false });
  const messageTimer = useRef(null);

  const [presetName, setPresetName] = useState('');
  const [savingPreset, setSavingPreset] = useState(false);

  const [estimating, setEstimating] = useState(false);
  const [estimateStatus, setEstimateStatus] = useState({ text: '', kind: '' });
  const [breakdown, setBreakdown] = useState(null);

  const isEditingThis = editing && editing.arr === 'diet';

  useEffect(() => {
    if (isEditingThis) {
      const entry = diet.find((e) => e.id === editing.id);
      if (entry) {
        setFields({
          date: entry.date,
          food: entry.food || '',
          calories: entry.calories || '',
          protein: entry.protein || '',
          notes: entry.notes || '',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const setField = (name, value) => setFields((prev) => ({ ...prev, [name]: value }));

  const flash = (text, isError) => {
    setMessage({ text, isError });
    clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage({ text: '', isError: false }), 2500);
  };

  const handleSubmit = async () => {
    if (!fields.date || !fields.food) {
      flash('Date and food description are required.', true);
      return;
    }
    try {
      const wasEditing = await commitEntry('diet', fields);
      if (wasEditing) {
        cancelEdit();
      } else {
        flash('Saved.', false);
        setFields({ date: localDateStr(), food: '', calories: '', protein: '', notes: '' });
        setBreakdown(null);
        setEstimateStatus({ text: '', kind: '' });
      }
    } catch {
      flash('Save failed, try again.', true);
    }
  };

  const handleSavePreset = async () => {
    const name = presetName.trim();
    const food = fields.food.trim();
    if (!name || !food) return;
    setSavingPreset(true);
    try {
      const preset = await insertPreset(name, food);
      setDietPresets((prev) => [...prev, preset]);
      setPresetName('');
    } finally {
      setSavingPreset(false);
    }
  };

  const handleDeletePreset = async (id) => {
    await deletePresetRow(id);
    setDietPresets((prev) => prev.filter((p) => p.id !== id));
  };

  const applyPreset = (preset) => {
    setField('food', fields.food.trim() ? fields.food.trim() + ', ' + preset.food : preset.food);
  };

  const handleEstimateText = async () => {
    const text = fields.food.trim();
    if (!text) {
      setEstimateStatus({ text: 'Describe what you ate first.', kind: 'err' });
      return;
    }
    setEstimating(true);
    setEstimateStatus({ text: 'Estimating...', kind: '' });
    setBreakdown(null);
    try {
      const data = await estimateNutritionText(text);
      setField('calories', Math.round(data.totalCalories));
      setField('protein', Math.round(data.totalProtein));
      setEstimateStatus({ text: 'Estimated from standard nutrition data. Adjust the numbers below if anything looks off.', kind: 'ok' });
      setBreakdown(data.items);
    } catch (err) {
      setEstimateStatus({ text: 'Could not estimate. Enter calories and protein manually.', kind: 'err' });
      console.error(err);
    } finally {
      setEstimating(false);
    }
  };

  const hasData = ['food', 'calories', 'protein', 'notes'].some((k) => String(fields[k] ?? '').trim() !== '');

  return (
    <Box>
      <PhotoDropzone
        label="Drop a nutrition label or food photo here, or click to browse"
        sublabel="Estimates calories and protein automatically. Review before saving."
        onExtract={estimateNutritionPhoto}
        successMessage="Estimated from photo. Review the fields below, then save."
        onResult={(data) => {
          if (!data) return;
          if (data.totalCalories != null) setField('calories', Math.round(data.totalCalories));
          if (data.totalProtein != null) setField('protein', Math.round(data.totalProtein));
          if (!fields.food.trim() && data.items && data.items.length) {
            setField('food', data.items.map((item) => item.name).join(', '));
          }
          if (data.items && data.items.length) setBreakdown(data.items);
        }}
      />

      <TextField
        label="What did you eat"
        placeholder="e.g. 3 eggs, 2 slices whole wheat toast, 1 tbsp butter, black coffee"
        multiline
        minRows={2}
        fullWidth
        value={fields.food}
        onChange={(e) => setField('food', e.target.value)}
        sx={{ mb: 1.5 }}
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.25 }}>
        {dietPresets.length === 0 ? (
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            No quick meals saved yet. Type a meal above, name it, and save it for one-click logging next time.
          </Typography>
        ) : (
          dietPresets.map((p) => (
            <Chip
              key={p.id}
              label={p.name}
              onClick={() => applyPreset(p)}
              onDelete={() => handleDeletePreset(p.id)}
              sx={{ fontFamily: 'IBM Plex Mono, monospace' }}
            />
          ))
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mb: 2, alignItems: { xs: 'stretch', sm: 'center' } }}>
        <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
          <TextField
            placeholder="Name this meal (e.g. Breakfast)"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSavePreset(); } }}
            sx={{ flex: 1 }}
          />
          {isMobile ? (
            <IconButton
              disabled={savingPreset}
              onClick={handleSavePreset}
              aria-label="Save as Quick Meal"
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 0.75, color: 'text.secondary' }}
            >
              <BookmarkAddIcon fontSize="small" />
            </IconButton>
          ) : (
            <Button variant="outlined" color="inherit" disabled={savingPreset} onClick={handleSavePreset} sx={{ color: 'text.secondary', borderColor: 'divider', whiteSpace: 'nowrap' }}>
              Save as Quick Meal
            </Button>
          )}
        </Box>
        <TextField
          type="date"
          value={fields.date}
          onChange={(e) => setField('date', e.target.value)}
          required
          InputLabelProps={{ shrink: true }}
          sx={{ width: { xs: '100%', sm: 150 }, ml: { xs: 0, sm: 2 } }}
        />
      </Box>

      <Button variant="outlined" fullWidth disabled={estimating} onClick={handleEstimateText} sx={{ color: 'primary.main', borderColor: 'primary.dark', mb: 2 }}>
        {estimating ? 'Estimating...' : 'Estimate Calories & Protein'}
      </Button>
      {estimateStatus.text && (
        <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, mb: 1, color: estimateStatus.kind === 'err' ? 'error.main' : estimateStatus.kind === 'ok' ? 'secondary.main' : 'text.secondary' }}>
          {estimateStatus.text}
        </Typography>
      )}
      <Breakdown items={breakdown} />

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1.75, mb: 1.75 }}>
        <TextField label="Calories" type="number" value={fields.calories} onChange={(e) => setField('calories', e.target.value)} />
        <TextField label="Protein (g)" type="number" value={fields.protein} onChange={(e) => setField('protein', e.target.value)} />
      </Box>

      <TextField label="Notes (optional)" multiline minRows={2} fullWidth value={fields.notes} onChange={(e) => setField('notes', e.target.value)} sx={{ mb: 1.75 }} />

      <Button variant="contained" color="primary" fullWidth disabled={!hasData} onClick={handleSubmit}>
        {isEditingThis ? 'Update Entry' : 'Log Diet Entry'}
      </Button>
      <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, mt: 1.25, minHeight: 16, color: message.isError ? 'error.main' : 'secondary.main' }}>
        {message.text}
      </Typography>
    </Box>
  );
}
