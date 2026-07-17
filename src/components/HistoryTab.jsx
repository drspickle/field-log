import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { parseLocalDate, fmtDate, epley1RM } from '../utils/stats';

const HISTORY_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'cardio', label: 'Cardio' },
  { key: 'strength', label: 'Strength' },
  { key: 'strength_test', label: 'Strength Test' },
  { key: 'vo2max', label: 'VO2 Max' },
  { key: 'diet', label: 'Diet' },
];

function describe(e) {
  if (e._kind === 'diet') {
    return {
      label: 'Diet',
      detail: [e.calories ? `${e.calories} cal` : '', e.protein ? `${e.protein}g protein` : '', e.food || '', e.notes || '']
        .filter(Boolean)
        .join(' · '),
    };
  }
  if (e.type === 'cardio') {
    return {
      label: e.activity || 'Cardio',
      detail: [e.duration ? `${e.duration} min` : '', e.distance ? `${e.distance} mi` : '', e.avgHR ? `avg ${e.avgHR} bpm` : '', e.maxHR ? `max ${e.maxHR} bpm` : '']
        .filter(Boolean)
        .join(' · '),
    };
  }
  if (e.type === 'strength') {
    return {
      label: `Strength · ${e.focus || ''}`,
      detail: [e.duration ? `${e.duration} min` : '', e.notes || ''].filter(Boolean).join(' · '),
    };
  }
  if (e.type === 'vo2max') {
    return { label: 'VO2 Max Check', detail: [`${e.value} ml/kg/min`, e.source || ''].filter(Boolean).join(' · ') };
  }
  if (e.type === 'strength_test') {
    return {
      label: 'Strength Test (Est. 1RM)',
      detail: `${Math.round(epley1RM(e.weight, e.reps))} lb estimated · ${e.weight} lb x ${e.reps} reps`,
    };
  }
  return { label: '', detail: '' };
}

export default function HistoryTab({ entries, diet, historyFilter, setHistoryFilter, onEdit, onDelete, onDuplicate }) {
  const all = entries
    .map((e) => ({ ...e, _kind: 'entry' }))
    .concat(diet.map((e) => ({ ...e, _kind: 'diet', type: 'diet' })));

  all.sort((a, b) => {
    const dateDiff = parseLocalDate(b.date) - parseLocalDate(a.date);
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  if (all.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ fontSize: 13, py: 4, textAlign: 'center' }}>
        No entries logged yet. Head to Log Entry to start tracking.
      </Typography>
    );
  }

  const filtered = historyFilter === 'all' ? all : all.filter((e) => e.type === historyFilter);

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.25 }}>
        {HISTORY_FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            onClick={() => setHistoryFilter(f.key)}
            variant={historyFilter === f.key ? 'filled' : 'outlined'}
            sx={{
              borderRadius: 0.75,
              fontFamily: 'IBM Plex Mono, monospace',
              ...(historyFilter === f.key && { borderColor: 'primary.main', color: 'primary.main', backgroundColor: 'transparent' }),
            }}
          />
        ))}
      </Box>

      {filtered.length === 0 ? (
        <Typography color="text.secondary" sx={{ fontSize: 13, py: 4, textAlign: 'center' }}>
          No entries in this category yet.
        </Typography>
      ) : (
        filtered.map((e) => {
          const { label, detail } = describe(e);
          return (
            <Box
              key={e.id}
              sx={{
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 0.75,
                px: 2,
                py: 1.75,
                mb: 1.25,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'primary.main', mb: 0.4 }}>
                  {label}
                </Typography>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{detail}</Typography>
              </Box>

              {e._kind === 'diet' && (
                <Tooltip title="Duplicate">
                  <IconButton size="small" onClick={() => onDuplicate(e.id)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 0.75, color: 'text.secondary', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }}>
                    <ContentCopyIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => onEdit(e._kind, e.id)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 0.75, color: 'text.secondary', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }}>
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => onDelete(e._kind, e.id)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 0.75, color: 'text.secondary', '&:hover': { borderColor: 'error.main', color: 'error.main' } }}>
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                {fmtDate(e.date)}
              </Typography>
            </Box>
          );
        })
      )}
    </Box>
  );
}
