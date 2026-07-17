import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, CssBaseline, Box, Typography, Button, Tabs, Tab } from '@mui/material';
import theme from './theme';
import AuthGate from './components/AuthGate';
import HeaderStats from './components/HeaderStats';
import OverviewTab from './components/OverviewTab';
import LogEntryTab from './components/LogEntryTab';
import HistoryTab from './components/HistoryTab';
import {
  supabase,
  loadAllData,
  insertEntry,
  updateEntryRow,
  deleteEntryRow,
  insertDiet,
  updateDietRow,
  deleteDietRow,
  entryToPayload,
} from './utils/supabase';
import { computeStats, localDateStr } from './utils/stats';

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = still loading, null = signed out
  const [entries, setEntries] = useState([]);
  const [diet, setDiet] = useState([]);
  const [dietPresets, setDietPresets] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [formType, setFormType] = useState('cardio');
  const [editing, setEditing] = useState(null); // { arr: 'entries'|'diet', id }
  const [historyFilter, setHistoryFilter] = useState('all');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === 'SIGNED_OUT') {
        setEntries([]);
        setDiet([]);
        setDietPresets([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      loadAllData().then(({ entries: e, diet: d, dietPresets: p }) => {
        setEntries(e);
        setDiet(d);
        setDietPresets(p);
      });
    }
  }, [session]);

  const commitEntry = useCallback(
    async (kind, entryData) => {
      const arrName = kind === 'diet' ? 'diet' : 'entries';
      if (editing && editing.arr === arrName) {
        const savedRow =
          arrName === 'entries'
            ? await updateEntryRow(editing.id, entryData.type, entryData.date, entryToPayload(entryData))
            : await updateDietRow(editing.id, entryData.date, entryToPayload(entryData));
        if (arrName === 'entries') {
          setEntries((prev) => prev.map((e) => (e.id === editing.id ? savedRow : e)));
        } else {
          setDiet((prev) => prev.map((e) => (e.id === editing.id ? savedRow : e)));
        }
        setEditing(null);
        return true;
      }
      const newRow =
        arrName === 'entries'
          ? await insertEntry(entryData.type, entryData.date, entryToPayload(entryData))
          : await insertDiet(entryData.date, entryToPayload(entryData));
      if (arrName === 'entries') {
        setEntries((prev) => [...prev, newRow]);
      } else {
        setDiet((prev) => [...prev, newRow]);
      }
      return false;
    },
    [editing]
  );

  const startEdit = useCallback(
    (kind, id) => {
      const arrName = kind === 'diet' ? 'diet' : 'entries';
      const arr = arrName === 'diet' ? diet : entries;
      const entry = arr.find((e) => e.id === id);
      if (!entry) return;
      setEditing({ arr: arrName, id });
      setFormType(kind === 'diet' ? 'diet' : entry.type);
      setActiveTab('log');
    },
    [entries, diet]
  );

  const cancelEdit = useCallback(() => {
    setEditing(null);
    setActiveTab('history');
  }, []);

  const deleteEntry = useCallback(async (kind, id) => {
    if (kind === 'diet') {
      await deleteDietRow(id);
      setDiet((prev) => prev.filter((e) => e.id !== id));
    } else {
      await deleteEntryRow(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  }, []);

  const duplicateDiet = useCallback(
    async (id) => {
      const original = diet.find((e) => e.id === id);
      if (!original) return;
      const newRow = await insertDiet(localDateStr(), {
        food: original.food,
        calories: original.calories,
        protein: original.protein,
        notes: original.notes,
      });
      setDiet((prev) => [...prev, newRow]);
    },
    [diet]
  );

  const signOut = () => supabase.auth.signOut();

  if (session === undefined) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh' }} />
      </ThemeProvider>
    );
  }

  const stats = computeStats(entries, diet);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!session ? (
        <AuthGate />
      ) : (
        <Box sx={{ maxWidth: 960, mx: 'auto', px: 2.5, pb: 7.5 }}>
          <Box component="header" sx={{ pt: 3.5, pb: 2.25, borderBottom: '1px solid', borderColor: 'divider', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75, gap: 1 }}>
              <Typography
                sx={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: { xs: 9, sm: 11 },
                  letterSpacing: { xs: 1.5, sm: 3 },
                  color: 'primary.main',
                  textTransform: 'uppercase',
                  minWidth: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Brian Helton <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>&middot; Personal Telemetry</Box>
              </Typography>
              <Button size="small" variant="outlined" color="inherit" onClick={signOut} sx={{ fontSize: 10, color: 'text.secondary', borderColor: 'divider', flexShrink: 0 }}>
                Sign Out
              </Button>
            </Box>
            <Typography variant="h1" sx={{ fontSize: 26, letterSpacing: 1, textTransform: 'uppercase', mb: 1.75 }}>
              Field Log
            </Typography>
            <HeaderStats stats={stats} />
          </Box>

          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider', minHeight: 'auto' }}
          >
            <Tab label="Overview" value="overview" sx={{ minHeight: 'auto', py: 1.25 }} />
            <Tab label="Log Entry" value="log" sx={{ minHeight: 'auto', py: 1.25 }} />
            <Tab label="History" value="history" sx={{ minHeight: 'auto', py: 1.25 }} />
          </Tabs>

          {activeTab === 'overview' && <OverviewTab entries={entries} stats={stats} />}
          {activeTab === 'log' && (
            <LogEntryTab
              formType={formType}
              setFormType={setFormType}
              editing={editing}
              entries={entries}
              diet={diet}
              dietPresets={dietPresets}
              setDietPresets={setDietPresets}
              commitEntry={commitEntry}
              cancelEdit={cancelEdit}
            />
          )}
          {activeTab === 'history' && (
            <HistoryTab
              entries={entries}
              diet={diet}
              historyFilter={historyFilter}
              setHistoryFilter={setHistoryFilter}
              onEdit={startEdit}
              onDelete={deleteEntry}
              onDuplicate={duplicateDiet}
            />
          )}
        </Box>
      )}
    </ThemeProvider>
  );
}
