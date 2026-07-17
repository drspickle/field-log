import { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { supabase } from '../utils/supabase';

export default function AuthGate() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const attempt = async () => {
    if (!email.trim() || !password) {
      showError('Enter your email and password.');
      return;
    }
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setSubmitting(false);
    if (signInError) {
      showError(signInError.message || 'Sign-in failed.');
    }
    // On success, the onAuthStateChange listener in App.jsx picks up the new session.
  };

  const showError = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 300);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2.75,
        textAlign: 'center',
        px: 2.5,
        animation: shake ? 'shake 0.3s' : 'none',
        '@keyframes shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-8px)' },
          '75%': { transform: 'translateX(8px)' },
        },
      }}
    >
      <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', color: 'primary.main', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase' }}>
        Restricted Access
      </Typography>
      <Typography variant="h1" sx={{ fontSize: 28, letterSpacing: 2, textTransform: 'uppercase', m: 0 }}>
        Field Log
      </Typography>
      <TextField
        type="email"
        placeholder="EMAIL"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('gate-password')?.focus(); }}
        autoFocus
        sx={{ width: 220 }}
        inputProps={{ style: { textAlign: 'center', letterSpacing: 1, fontFamily: 'IBM Plex Mono, monospace' } }}
      />
      <TextField
        id="gate-password"
        type="password"
        placeholder="PASSWORD"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') attempt(); }}
        sx={{ width: 220 }}
        inputProps={{ style: { textAlign: 'center', letterSpacing: 4, fontFamily: 'IBM Plex Mono, monospace', fontSize: 18 } }}
      />
      <Button variant="contained" color="primary" disabled={submitting} onClick={attempt} sx={{ px: 3.5, py: 1.25 }}>
        {submitting ? 'Signing in...' : 'Sign In'}
      </Button>
      <Typography sx={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, letterSpacing: 1, color: 'error.main', minHeight: 16 }}>
        {error}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, lineHeight: 1.5 }}>
        Signed in with a real Supabase account. Sessions persist in this browser until you sign out.
      </Typography>
    </Box>
  );
}
