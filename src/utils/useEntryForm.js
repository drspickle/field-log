import { useState, useEffect, useRef } from 'react';
import { localDateStr } from './stats';

// Shared behavior for the 4 simple "entries"-table forms (cardio, strength,
// strength_test, vo2max): field state, populate-on-edit, disabled-until-dirty
// (ignoring select-backed fields, matching the previous vanilla-JS behavior),
// save/flash-message, and reset after a successful new-entry save.
export function useEntryForm({ type, editing, entries, commitEntry, cancelEdit, initialFields, trackedFields }) {
  const [fields, setFields] = useState(initialFields);
  const [message, setMessage] = useState({ text: '', isError: false });
  const messageTimer = useRef(null);

  useEffect(() => {
    if (editing && editing.arr === 'entries') {
      const entry = entries.find((e) => e.id === editing.id);
      if (entry && entry.type === type) {
        setFields((prev) => {
          const next = { ...prev };
          Object.keys(entry).forEach((k) => {
            if (k === 'id' || k === 'type' || k === 'created_at') return;
            next[k] = entry[k];
          });
          return next;
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

  const reset = () => setFields(initialFields);

  const submit = async (validate) => {
    const err = validate(fields);
    if (err) {
      flash(err, true);
      return;
    }
    try {
      const wasEditing = await commitEntry('entries', { type, ...fields });
      if (wasEditing) {
        cancelEdit();
      } else {
        flash('Saved.', false);
        reset();
      }
    } catch {
      flash('Save failed, try again.', true);
    }
  };

  const isEditingThis = editing && editing.arr === 'entries';
  const hasData = trackedFields.some((k) => String(fields[k] ?? '').trim() !== '');

  return { fields, setField, message, submit, hasData, isEditingThis };
}

export function todayFields(rest) {
  return { date: localDateStr(), ...rest };
}
