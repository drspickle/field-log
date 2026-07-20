import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nbbooydgsrririeranjh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_j6z9LiQMoTIs62Ry9v6Rpw_zu1NnyEj';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function rowToEntry(row) {
  return Object.assign({ id: row.id, type: row.type, date: row.date, created_at: row.created_at }, row.payload || {});
}

export function rowToDiet(row) {
  return Object.assign({ id: row.id, date: row.date, created_at: row.created_at }, row.payload || {});
}

export function rowToPlanChip(row) {
  return { id: row.id, day: row.day, chipType: row.chip_type, position: row.position };
}

export function entryToPayload(entry) {
  const p = {};
  Object.keys(entry).forEach((k) => {
    if (k !== 'id' && k !== 'type' && k !== 'date' && k !== 'created_at') p[k] = entry[k];
  });
  return p;
}

export async function authToken() {
  const { data } = await supabase.auth.getSession();
  if (!data || !data.session) throw new Error('Not signed in');
  return data.session.access_token;
}

export async function loadAllData() {
  const [entriesRes, dietRes, presetsRes, planRes] = await Promise.all([
    supabase.from('entries').select('*').order('date', { ascending: false }),
    supabase.from('diet').select('*').order('date', { ascending: false }),
    supabase.from('diet_presets').select('*').order('created_at', { ascending: true }),
    supabase.from('week_plan_chips').select('*').order('position', { ascending: true }),
  ]);
  return {
    entries: (entriesRes.data || []).map(rowToEntry),
    diet: (dietRes.data || []).map(rowToDiet),
    dietPresets: (presetsRes.data || []).map((r) => ({ id: r.id, name: r.name, food: r.food })),
    planChips: (planRes.data || []).map(rowToPlanChip),
  };
}

export async function insertEntry(type, date, payload) {
  const { data, error } = await supabase.from('entries').insert({ type, date, payload }).select().single();
  if (error) throw error;
  return rowToEntry(data);
}

export async function updateEntryRow(id, type, date, payload) {
  const { data, error } = await supabase.from('entries').update({ type, date, payload }).eq('id', id).select().single();
  if (error) throw error;
  return rowToEntry(data);
}

export async function deleteEntryRow(id) {
  const { error } = await supabase.from('entries').delete().eq('id', id);
  if (error) throw error;
}

export async function insertDiet(date, payload) {
  const { data, error } = await supabase.from('diet').insert({ date, payload }).select().single();
  if (error) throw error;
  return rowToDiet(data);
}

export async function updateDietRow(id, date, payload) {
  const { data, error } = await supabase.from('diet').update({ date, payload }).eq('id', id).select().single();
  if (error) throw error;
  return rowToDiet(data);
}

export async function deleteDietRow(id) {
  const { error } = await supabase.from('diet').delete().eq('id', id);
  if (error) throw error;
}

export async function insertPreset(name, food) {
  const { data, error } = await supabase.from('diet_presets').insert({ name, food }).select().single();
  if (error) throw error;
  return { id: data.id, name: data.name, food: data.food };
}

export async function deletePresetRow(id) {
  const { error } = await supabase.from('diet_presets').delete().eq('id', id);
  if (error) throw error;
}

export async function insertPlanChip(day, chipType, position) {
  const { data, error } = await supabase
    .from('week_plan_chips')
    .insert({ day, chip_type: chipType, position })
    .select()
    .single();
  if (error) throw error;
  return rowToPlanChip(data);
}

export async function updatePlanChip(id, day, position) {
  const { data, error } = await supabase
    .from('week_plan_chips')
    .update({ day, position })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return rowToPlanChip(data);
}

export async function deletePlanChip(id) {
  const { error } = await supabase.from('week_plan_chips').delete().eq('id', id);
  if (error) throw error;
}

export async function resetWeekPlan() {
  const { error } = await supabase.from('week_plan_chips').delete().not('id', 'is', null);
  if (error) throw error;
}
