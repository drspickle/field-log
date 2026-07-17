import { useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export default function PhotoDropzone({ label, sublabel, onExtract, onResult, successMessage }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ text: '', kind: '' }); // kind: '' | 'ok' | 'err'

  const handleFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setStatus({ text: 'Unsupported file type. Use a PNG, JPG, or WEBP file.', kind: 'err' });
      return;
    }
    setBusy(true);
    setStatus({ text: 'Reading...', kind: '' });
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      try {
        const data = await onExtract(base64, file.type);
        onResult(data);
        setBusy(false);
        setStatus({ text: successMessage, kind: 'ok' });
      } catch (err) {
        setBusy(false);
        setStatus({ text: 'Could not read the file. Enter the numbers manually.', kind: 'err' });
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
      }}
      sx={{
        border: '1px dashed',
        borderColor: busy ? 'secondary.main' : dragOver ? 'primary.main' : 'divider',
        borderRadius: 0.75,
        p: 2.25,
        textAlign: 'center',
        cursor: 'pointer',
        color: busy ? 'secondary.main' : dragOver ? 'primary.main' : 'text.secondary',
        fontSize: 13,
        mb: 2,
        transition: 'border-color 0.15s, color 0.15s',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        style={{ display: 'none' }}
        onChange={(e) => { if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]); }}
      />
      <Typography sx={{ fontSize: 13, color: 'inherit' }}>{label}</Typography>
      <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>{sublabel}</Typography>
      {status.text && (
        <Typography
          sx={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: 11,
            mt: 1,
            color: status.kind === 'err' ? 'error.main' : status.kind === 'ok' ? 'secondary.main' : 'text.secondary',
          }}
        >
          {status.text}
        </Typography>
      )}
    </Box>
  );
}
