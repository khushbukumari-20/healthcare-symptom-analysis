import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem,
    Divider, IconButton, Drawer, List, ListItem, ListItemIcon,
    ListItemText, Chip, Tooltip, Badge, useMediaQuery, useTheme,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    CircularProgress, Alert, FormControlLabel, Switch, LinearProgress,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Close as CloseIcon,
    Dashboard as DashboardIcon,
    PersonOutlined as ProfileIcon,
    MonitorHeart as SymptomIcon,
    CalendarMonth as AppointmentIcon,
    History as HistoryIcon,
    Logout as LogoutIcon,
    KeyboardArrowDown as ArrowDownIcon,
    Notifications as NotificationsIcon,
    // Settings as SettingsIcon,
    HealthAndSafety as HealthIcon,
    Medication as MedicationIcon,
    Lightbulb as SuggestionIcon,
    Add as AddIcon,
    CloudUpload as UploadIcon,
    Article as ArticleIcon,
    Science as ResearchIcon,
    Cases as CaseIcon,
    Info as GeneralIcon,
    CheckCircle as CheckIcon,
    Delete as DeleteIcon,
    Biotech as NewDiseaseIcon,
    Groups as DoctorsIcon,
    CalendarToday as CalendarIcon,
    MedicalServices as MedicalIcon,
    DoneAll as DoneAllIcon,
    NotificationsNone as NotificationsEmptyIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { doctorSuggestionAPI, notificationAPI } from '../services/api';

const PATIENT_NAV = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon fontSize="small" /> },
    { label: 'Symptom Check', path: '/symptoms', icon: <SymptomIcon fontSize="small" /> },
    { label: 'Appointments', path: '/appointments', icon: <AppointmentIcon fontSize="small" /> },
    { label: 'History', path: '/history', icon: <HistoryIcon fontSize="small" /> },
    { label: 'Medications', path: '/medications', icon: <MedicationIcon fontSize="small" /> },
];

const DOCTOR_NAV = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon fontSize="small" /> },
    { label: 'Appointments', path: '/appointments', icon: <AppointmentIcon fontSize="small" /> },
    { label: 'Medications', path: '/medications', icon: <MedicationIcon fontSize="small" /> },
];

const NURSE_NAV = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon fontSize="small" /> },
    { label: 'Appointments', path: '/appointments', icon: <AppointmentIcon fontSize="small" /> },
];

const PATIENT_PROFILE_MENU = [
    { label: 'My Profile', path: '/profile', icon: <ProfileIcon fontSize="small" /> },
    { label: 'Medications', path: '/medications', icon: <MedicationIcon fontSize="small" /> },
    { label: 'Appointments', path: '/appointments', icon: <AppointmentIcon fontSize="small" /> },
    // { label: 'Settings', path: '/settings', icon: <SettingsIcon fontSize="small" /> },
];

const DOCTOR_PROFILE_MENU = [
    { label: 'My Profile', path: '/profile', icon: <ProfileIcon fontSize="small" /> },
    { label: 'Medications', path: '/medications', icon: <MedicationIcon fontSize="small" /> },
    { label: 'AI Assistance', path: '/doctor/ai-assistance', icon: <DoctorsIcon fontSize="small" /> },
    // { label: 'Settings', path: '/settings', icon: <SettingsIcon fontSize="small" /> },
];

const NURSE_PROFILE_MENU = [
    { label: 'My Profile', path: '/profile', icon: <ProfileIcon fontSize="small" /> },
    // { label: 'Settings', path: '/settings', icon: <SettingsIcon fontSize="small" /> },
];

const ROLE_CHIP = {
    patient: { bg: 'rgba(255,255,255,0.22)', color: '#fff' },
    doctor: { bg: 'rgba(16,185,129,0.30)', color: '#fff' },
    nurse: { bg: 'rgba(251,191,36,0.35)', color: '#fff' },
};

const SUGGESTION_TYPES = [
    { value: 'recommendation', label: 'Patient Recommendation', icon: <SuggestionIcon sx={{ fontSize: 16 }} />, color: '#1d4ed8', bg: '#eff6ff' },
    { value: 'research', label: 'Medical Research', icon: <ResearchIcon sx={{ fontSize: 16 }} />, color: '#7c3aed', bg: '#f5f3ff' },
    { value: 'case_study', label: 'Case Study', icon: <CaseIcon sx={{ fontSize: 16 }} />, color: '#0891b2', bg: '#ecfeff' },
    { value: 'general', label: 'General Advisory', icon: <GeneralIcon sx={{ fontSize: 16 }} />, color: '#059669', bg: '#ecfdf5' },
];

const TYPE_META = Object.fromEntries(SUGGESTION_TYPES.map(t => [t.value, t]));

const BLANK_SUGGESTION = {
    title: '',
    suggestion_type: 'recommendation',
    reason: '',
    content: '',
    disease_name: '',
    is_new_disease: false,
    document_title: '',
    is_public: true,
};

const fld = () => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        fontSize: '0.875rem',
        fontFamily: '"DM Sans", sans-serif',
        '&:hover fieldset': { borderColor: '#1d4ed8' },
        '&.Mui-focused fieldset': { borderColor: '#1d4ed8', borderWidth: '2px' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#1d4ed8' },
});

const FieldLabel = ({ children }) => (
    <Typography sx={{
        fontSize: '0.68rem',
        fontWeight: 700,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        mb: 0.5,
        fontFamily: '"DM Sans", sans-serif',
    }}>
        {children}
    </Typography>
);

const SuggestionDetailDialog = ({ open, onClose, suggestion }) => {
    if (!suggestion) return null;
    const tm = TYPE_META[suggestion.suggestion_type] || TYPE_META.general;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: '20px', fontFamily: '"DM Sans", sans-serif' } }}
        >
            <DialogTitle sx={{ p: 0 }}>
                <Box sx={{
                    px: 3, py: 2.5,
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 38, height: 38, borderRadius: '10px',
                            bgcolor: 'rgba(255,255,255,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {tm.icon}
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#fff', fontFamily: '"Sora", sans-serif' }}>
                                {suggestion.title}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                Dr. {suggestion.doctor_name} · {suggestion.specialization}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff' } }}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 0.8,
                        px: 1.5, py: 0.7, borderRadius: '8px',
                        bgcolor: tm.bg, color: tm.color,
                        fontSize: '0.78rem', fontWeight: 700,
                        border: `1.5px solid ${tm.color}33`,
                    }}>
                        {tm.icon} {tm.label}
                    </Box>

                    {suggestion.is_new_disease && (
                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 0.8,
                            px: 1.5, py: 0.7, borderRadius: '8px',
                            bgcolor: '#fef3c7', color: '#d97706',
                            fontSize: '0.78rem', fontWeight: 700,
                            border: '1.5px solid #fcd34d',
                        }}>
                            <NewDiseaseIcon sx={{ fontSize: 14 }} /> New / Emerging Disease
                        </Box>
                    )}

                    <Box sx={{
                        ml: 'auto', px: 1.5, py: 0.7, borderRadius: '8px',
                        bgcolor: suggestion.is_public ? '#ecfdf5' : '#fef3c7',
                        color: suggestion.is_public ? '#059669' : '#d97706',
                        fontSize: '0.75rem', fontWeight: 700,
                        border: `1.5px solid ${suggestion.is_public ? '#a7f3d0' : '#fcd34d'}`,
                    }}>
                        {suggestion.is_public ? '🌐 Public' : '🔒 Private'}
                    </Box>
                </Box>

                {suggestion.disease_name && (
                    <Box sx={{ mb: 2, p: 1.5, borderRadius: '10px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.3 }}>
                            Related Disease / Condition
                        </Typography>
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
                            {suggestion.disease_name}
                        </Typography>
                    </Box>
                )}

                <Box sx={{ mb: 2.5 }}>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
                        Summary
                    </Typography>
                    <Typography sx={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.7 }}>
                        {suggestion.reason}
                    </Typography>
                </Box>

                {suggestion.content && (
                    <Box sx={{ mb: 2.5 }}>
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
                            Detailed Content
                        </Typography>
                        <Box sx={{ p: 2, borderRadius: '10px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <Typography sx={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                {suggestion.content}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {suggestion.document && (
                    <Box sx={{
                        mt: 2, p: 2, borderRadius: '10px',
                        bgcolor: '#eff6ff', border: '1px solid #bfdbfe',
                        display: 'flex', alignItems: 'center', gap: 1.5,
                    }}>
                        <ArticleIcon sx={{ color: '#2563eb', fontSize: 22 }} />
                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1d4ed8' }}>
                                {suggestion.document_title || 'Attached Document'}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: '#3b82f6' }}>Click to open</Typography>
                        </Box>
                        <Button
                            size="small"
                            variant="outlined"
                            href={suggestion.document}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, borderColor: '#2563eb', color: '#2563eb', textTransform: 'none' }}
                        >
                            View
                        </Button>
                    </Box>
                )}

                <Typography sx={{ mt: 3, fontSize: '0.72rem', color: '#9ca3af', textAlign: 'right' }}>
                    Posted on {new Date(suggestion.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        borderRadius: '10px', fontWeight: 700, textTransform: 'none',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const DoctorSuggestionDialog = ({ open, onClose, onSuccess, currentUser }) => {
    const [form, setForm] = useState(BLANK_SUGGESTION);
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [uploadPct, setUploadPct] = useState(0);
    const fileRef = useRef();

    useEffect(() => {
        if (open) {
            setForm(BLANK_SUGGESTION);
            setFile(null);
            setError(null);
            setUploadPct(0);
        }
    }, [open]);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (f.size > 10 * 1024 * 1024) {
            setError('File must be under 10 MB.');
            return;
        }
        setFile(f);
        if (!form.document_title) set('document_title', f.name.replace(/\.[^.]+$/, ''));
    };

    const handleSave = async () => {
        if (!form.title.trim()) return setError('Title is required.');
        if (!form.reason.trim()) return setError('Reason / summary is required.');
        if (!form.content.trim()) return setError('Detailed content is required.');

        setError(null);
        setSaving(true);

        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (file) fd.append('document', file);

            const interval = setInterval(() => setUploadPct(p => Math.min(p + 15, 85)), 200);

            await doctorSuggestionAPI.create(fd, {
                onUploadProgress: (e) => {
                    clearInterval(interval);
                    setUploadPct(Math.round((e.loaded * 100) / e.total));
                },
            });

            clearInterval(interval);
            setUploadPct(100);
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 400);
        } catch (e) {
            const data = e.response?.data;
            setError(data ? Object.values(data).flat().join(' ') : 'Could not save suggestion.');
        } finally {
            setSaving(false);
        }
    };

    const tm = TYPE_META[form.suggestion_type];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px', fontFamily: '"DM Sans", sans-serif' } }}>
            <DialogTitle sx={{ p: 0 }}>
                <Box sx={{
                    px: 3, py: 2.5,
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 38, height: 38, borderRadius: '10px',
                            bgcolor: 'rgba(255,255,255,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <SuggestionIcon sx={{ color: '#93c5fd', fontSize: 20 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#fff', fontFamily: '"Sora", sans-serif' }}>
                                New Doctor Suggestion
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                Dr. {currentUser?.first_name || currentUser?.username} · {currentUser?.specialization}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff' } }}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>
                {saving && <LinearProgress variant="determinate" value={uploadPct} sx={{ height: 3 }} />}
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.82rem' }}>{error}</Alert>}

                <Box sx={{ mb: 3 }}>
                    <FieldLabel>Suggestion Type *</FieldLabel>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {SUGGESTION_TYPES.map(t => (
                            <Box key={t.value} onClick={() => set('suggestion_type', t.value)} sx={{
                                display: 'flex', alignItems: 'center', gap: 0.8, px: 1.5, py: 0.9,
                                borderRadius: '10px', cursor: 'pointer',
                                border: `1.5px solid ${form.suggestion_type === t.value ? t.color : '#e5e7eb'}`,
                                bgcolor: form.suggestion_type === t.value ? t.bg : '#fff',
                                color: form.suggestion_type === t.value ? t.color : '#6b7280',
                                fontWeight: form.suggestion_type === t.value ? 700 : 500,
                                fontSize: '0.78rem', transition: 'all 0.15s',
                                fontFamily: '"DM Sans", sans-serif',
                                '&:hover': { borderColor: t.color, bgcolor: t.bg, color: t.color },
                            }}>
                                {t.icon}
                                {t.label}
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                    <Box sx={{ gridColumn: '1 / -1' }}>
                        <FieldLabel>Title *</FieldLabel>
                        <TextField fullWidth size="small" sx={fld()} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. New findings on Type-2 Diabetes treatment" />
                    </Box>
                    <Box>
                        <FieldLabel>Related Disease / Condition</FieldLabel>
                        <TextField fullWidth size="small" sx={fld()} value={form.disease_name} onChange={e => set('disease_name', e.target.value)} placeholder="e.g. Type-2 Diabetes" />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', pb: 0.5 }}>
                        <FormControlLabel
                            control={<Switch checked={form.is_new_disease} onChange={e => set('is_new_disease', e.target.checked)} />}
                            label={<Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>New / Emerging Disease</Typography>}
                        />
                    </Box>
                    <Box sx={{ gridColumn: '1 / -1' }}>
                        <FieldLabel>Summary / Reason *</FieldLabel>
                        <TextField fullWidth size="small" sx={fld()} value={form.reason} onChange={e => set('reason', e.target.value)} placeholder="Brief summary of this suggestion" />
                    </Box>
                    <Box sx={{ gridColumn: '1 / -1' }}>
                        <FieldLabel>Detailed Content *</FieldLabel>
                        <TextField fullWidth multiline rows={5} size="small" sx={fld()} value={form.content} onChange={e => set('content', e.target.value)} placeholder="Full details, findings, recommendations..." />
                    </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <FieldLabel>Attach Document (optional)</FieldLabel>
                    <Box
                        onClick={() => fileRef.current?.click()}
                        sx={{
                            border: `2px dashed ${file ? '#2563eb' : '#e5e7eb'}`,
                            borderRadius: '12px', p: 2.5, cursor: 'pointer', textAlign: 'center',
                            bgcolor: file ? '#eff6ff' : '#fafafa',
                            transition: 'all 0.15s',
                            '&:hover': { borderColor: '#2563eb', bgcolor: '#eff6ff' },
                        }}
                    >
                        <input ref={fileRef} type="file" hidden onChange={handleFile} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                        {file ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <ArticleIcon sx={{ color: '#2563eb', fontSize: 18 }} />
                                <Typography sx={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 600 }}>{file.name}</Typography>
                            </Box>
                        ) : (
                            <>
                                <UploadIcon sx={{ color: '#9ca3af', fontSize: 24, mb: 0.5 }} />
                                <Typography sx={{ fontSize: '0.82rem', color: '#9ca3af' }}>Click to upload · PDF, DOC, PNG, JPG · max 10 MB</Typography>
                            </>
                        )}
                    </Box>
                </Box>

                {file && (
                    <Box sx={{ mb: 2 }}>
                        <FieldLabel>Document Title</FieldLabel>
                        <TextField fullWidth size="small" sx={fld()} value={form.document_title} onChange={e => set('document_title', e.target.value)} />
                    </Box>
                )}

                <Box sx={{
                    p: 2, borderRadius: '12px',
                    bgcolor: form.is_public ? '#ecfdf5' : '#fef3c7',
                    border: `1px solid ${form.is_public ? '#a7f3d0' : '#fcd34d'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <Box>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: form.is_public ? '#065f46' : '#92400e' }}>
                            {form.is_public ? '🌐 Visible to all doctors' : '🔒 Private suggestion (only you)'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: form.is_public ? '#059669' : '#d97706', mt: 0.2 }}>
                            {form.is_public ? 'Other doctors in the network can read this' : 'Only you can see this suggestion'}
                        </Typography>
                    </Box>
                    <Switch checked={form.is_public} onChange={e => set('is_public', e.target.checked)} />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button onClick={onClose} disabled={saving} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={saving}
                    sx={{
                        borderRadius: '10px', textTransform: 'none', fontWeight: 700,
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                        px: 3,
                    }}
                >
                    {saving ? 'Posting...' : 'Post Suggestion'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const SuggestionsFeedPanel = ({ anchorEl, open, onClose, onNew, currentUser }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        doctorSuggestionAPI.getAll()
            .then(r => setSuggestions(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [open]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this suggestion?')) return;
        try {
            await doctorSuggestionAPI.remove(id);
            setSuggestions(p => p.filter(s => s.id !== id));
            if (selectedSuggestion?.id === id) setSelectedSuggestion(null);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={onClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        mt: 1.5, width: 440, maxHeight: 600,
                        borderRadius: '18px',
                        border: '1px solid rgba(0,0,0,0.08)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                    },
                }}
            >
                <Box sx={{
                    px: 2.5, py: 2,
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexShrink: 0,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DoctorsIcon sx={{ color: '#93c5fd', fontSize: 20 }} />
                        <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem', fontFamily: '"Sora", sans-serif' }}>
                            Doctor Suggestions
                        </Typography>
                        {suggestions.length > 0 && (
                            <Box sx={{ px: 0.8, py: 0.1, borderRadius: '6px', bgcolor: 'rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: '0.68rem', fontWeight: 700 }}>
                                {suggestions.length}
                            </Box>
                        )}
                    </Box>
                    <Button
                        onClick={onNew}
                        startIcon={<AddIcon />}
                        size="small"
                        sx={{
                            borderRadius: '8px', fontWeight: 700, fontSize: '0.72rem',
                            bgcolor: 'rgba(255,255,255,0.12)', color: '#fff',
                            textTransform: 'none',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
                        }}
                    >
                        New
                    </Button>
                </Box>

                <Box sx={{ overflowY: 'auto', flexGrow: 1, p: 1.5 }}>
                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 5 }}>
                            <CircularProgress size={24} />
                            <Typography sx={{ fontSize: '0.78rem', color: '#9ca3af', mt: 1 }}>Loading suggestions...</Typography>
                        </Box>
                    ) : suggestions.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <SuggestionIcon sx={{ fontSize: 36, color: '#e5e7eb', mb: 1 }} />
                            <Typography sx={{ fontSize: '0.82rem', color: '#9ca3af', fontWeight: 600 }}>No suggestions yet</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#d1d5db', mt: 0.5 }}>Be the first to post one</Typography>
                        </Box>
                    ) : (
                        suggestions.map((s) => {
                            const tm = TYPE_META[s.suggestion_type] || TYPE_META.general;
                            const isOwn = s.doctor_user_id === currentUser?.id;
                            return (
                                <Box
                                    key={s.id}
                                    onClick={() => setSelectedSuggestion(s)}
                                    sx={{
                                        p: 1.8, mb: 1, borderRadius: '12px',
                                        border: `1.5px solid ${tm.color}22`,
                                        bgcolor: tm.bg,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        '&:hover': {
                                            border: `1.5px solid ${tm.color}66`,
                                            boxShadow: `0 4px 14px ${tm.color}22`,
                                            transform: 'translateY(-1px)',
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5, flexWrap: 'wrap' }}>
                                                <Box sx={{
                                                    display: 'flex', alignItems: 'center', gap: 0.4,
                                                    px: 0.8, py: 0.2, borderRadius: '6px',
                                                    bgcolor: `${tm.color}18`, color: tm.color,
                                                    fontSize: '0.65rem', fontWeight: 700,
                                                }}>
                                                    {tm.icon} {tm.label}
                                                </Box>
                                                {s.is_new_disease && (
                                                    <Box sx={{
                                                        px: 0.8, py: 0.2, borderRadius: '6px',
                                                        bgcolor: '#fef3c7', color: '#d97706',
                                                        fontSize: '0.65rem', fontWeight: 700,
                                                    }}>
                                                        New Disease
                                                    </Box>
                                                )}
                                            </Box>

                                            <Typography sx={{
                                                fontWeight: 700, fontSize: '0.85rem', color: '#111827',
                                                fontFamily: '"Sora", sans-serif', mb: 0.4,
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            }}>
                                                {s.title}
                                            </Typography>

                                            <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', mb: 0.5, lineHeight: 1.5 }}>
                                                {s.reason?.length > 90 ? s.reason.slice(0, 90) + '…' : s.reason}
                                            </Typography>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                <Typography sx={{ fontSize: '0.68rem', color: '#9ca3af' }}>
                                                    Dr. {s.doctor_name} · {s.specialization}
                                                </Typography>
                                                {s.document && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, color: '#3b82f6', fontSize: '0.65rem', fontWeight: 600 }}>
                                                        <ArticleIcon sx={{ fontSize: 11 }} /> Doc attached
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>

                                        {isOwn && (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                                                sx={{ flexShrink: 0, '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}
                                            >
                                                <DeleteIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                                            </IconButton>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })
                    )}
                </Box>
            </Menu>

            <SuggestionDetailDialog
                open={Boolean(selectedSuggestion)}
                onClose={() => setSelectedSuggestion(null)}
                suggestion={selectedSuggestion}
            />
        </>
    );
};

const NOTIF_META = {
    appointment_upcoming:  { color: '#2563eb', bg: '#eff6ff', icon: <CalendarIcon sx={{ fontSize: 15 }} /> },
    appointment_confirmed: { color: '#059669', bg: '#ecfdf5', icon: <CheckIcon sx={{ fontSize: 15 }} /> },
    appointment_cancelled: { color: '#ef4444', bg: '#fef2f2', icon: <CloseIcon sx={{ fontSize: 15 }} /> },
    appointment_completed: { color: '#0891b2', bg: '#ecfeff', icon: <CalendarIcon sx={{ fontSize: 15 }} /> },
    suggestion_posted:     { color: '#7c3aed', bg: '#f5f3ff', icon: <SuggestionIcon sx={{ fontSize: 15 }} /> },
    medication_added:      { color: '#d97706', bg: '#fffbeb', icon: <MedicalIcon sx={{ fontSize: 15 }} /> },
    medication_updated:    { color: '#d97706', bg: '#fffbeb', icon: <MedicalIcon sx={{ fontSize: 15 }} /> },
    general:               { color: '#475569', bg: '#f8fafc', icon: <NotificationsIcon sx={{ fontSize: 15 }} /> },
};

const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationPanel = ({ anchorEl, open, onClose, onCountChange, navigate }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [suggestionDetail, setSuggestionDetail] = useState(null);
    const [suggestionLoading, setSuggestionLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        notificationAPI.getAll()
            .then(r => setNotifications(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [open]);

    const handleMarkRead = async (notif, e) => {
        e?.stopPropagation();

        if (!notif.is_read) {
            try {
                await notificationAPI.markRead(notif.id);
                setNotifications(p => p.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
                onCountChange(c => Math.max(0, c - 1));
            } catch (err) {
                console.error(err);
            }
        }

        if (notif.notif_type === 'suggestion_posted') {
            onClose();
            navigate(`/recommendation/${notif.related_object_id}`);
            return;
        }

        if (notif.navigate_to) {
            onClose();
            navigate(notif.navigate_to);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAllRead();
            setNotifications(p => p.map(n => ({ ...n, is_read: true })));
            onCountChange(0);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            await notificationAPI.delete(id);
            const deleted = notifications.find(n => n.id === id);
            setNotifications(p => p.filter(n => n.id !== id));
            if (deleted && !deleted.is_read) onCountChange(c => Math.max(0, c - 1));
        } catch (e) {
            console.error(e);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={onClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        mt: 1.5, width: 400, maxHeight: 560,
                        borderRadius: '18px',
                        border: '1px solid rgba(0,0,0,0.08)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                    },
                }}
            >
                <Box sx={{
                    px: 2.5, py: 2,
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexShrink: 0,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <NotificationsIcon sx={{ color: '#93c5fd', fontSize: 20 }} />
                        <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem', fontFamily: '"Sora", sans-serif' }}>
                            Notifications
                        </Typography>
                        {unreadCount > 0 && (
                            <Box sx={{ px: 0.8, py: 0.1, borderRadius: '6px', bgcolor: '#ef4444', color: '#fff', fontSize: '0.68rem', fontWeight: 700 }}>
                                {unreadCount}
                            </Box>
                        )}
                    </Box>
                    {unreadCount > 0 && (
                        <Button
                            onClick={handleMarkAllRead}
                            startIcon={<DoneAllIcon sx={{ fontSize: 14 }} />}
                            size="small"
                            sx={{
                                borderRadius: '8px', fontWeight: 700, fontSize: '0.72rem',
                                bgcolor: 'rgba(255,255,255,0.12)', color: '#fff',
                                textTransform: 'none',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
                            }}
                        >
                            Mark all read
                        </Button>
                    )}
                </Box>

                <Box sx={{ overflowY: 'auto', flexGrow: 1, p: 1.5 }}>
                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 5 }}>
                            <CircularProgress size={24} />
                            <Typography sx={{ fontSize: '0.78rem', color: '#9ca3af', mt: 1 }}>Loading...</Typography>
                        </Box>
                    ) : notifications.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <NotificationsEmptyIcon sx={{ fontSize: 40, color: '#e5e7eb', mb: 1 }} />
                            <Typography sx={{ fontSize: '0.82rem', color: '#9ca3af', fontWeight: 600 }}>All caught up!</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#d1d5db', mt: 0.5 }}>No notifications yet</Typography>
                        </Box>
                    ) : (
                        notifications.map((n) => {
                            const meta = NOTIF_META[n.notif_type] || NOTIF_META.general;
                            const isRecommendation = n.notif_type === 'suggestion_posted' && n.related_object_id;
                            return (
                                <Box
                                    key={n.id}
                                    onClick={(e) => handleMarkRead(n, e)}
                                    sx={{
                                        p: 1.5, mb: 0.8, borderRadius: '12px',
                                        border: `1.5px solid ${n.is_read ? '#f1f5f9' : `${meta.color}33`}`,
                                        bgcolor: n.is_read ? '#fafafa' : meta.bg,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        position: 'relative',
                                        '&:hover': {
                                            border: `1.5px solid ${meta.color}66`,
                                            boxShadow: `0 2px 10px ${meta.color}18`,
                                            transform: 'translateY(-1px)',
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'flex-start' }}>
                                        <Box sx={{
                                            width: 30, height: 30, borderRadius: '8px', flexShrink: 0,
                                            bgcolor: n.is_read ? '#f1f5f9' : `${meta.color}18`,
                                            color: n.is_read ? '#94a3b8' : meta.color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {meta.icon}
                                        </Box>

                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.2 }}>
                                                <Typography sx={{
                                                    fontSize: '0.82rem', fontWeight: n.is_read ? 500 : 700,
                                                    color: n.is_read ? '#6b7280' : '#0f172a',
                                                    fontFamily: '"Sora", sans-serif',
                                                }}>
                                                    {n.title}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 1 }}>
                                                    <Typography sx={{ fontSize: '0.65rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                                                        {timeAgo(n.created_at)}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleDelete(e, n.id)}
                                                        sx={{ p: 0.2, '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}
                                                    >
                                                        <CloseIcon sx={{ fontSize: 11, color: '#cbd5e1' }} />
                                                    </IconButton>
                                                </Box>
                                            </Box>

                                            <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.5 }}>
                                                {n.message}
                                            </Typography>

                                            <Typography sx={{ fontSize: '0.68rem', color: meta.color, fontWeight: 600, mt: 0.4 }}>
                                                {isRecommendation ? '📋 Tap to read recommendation →' : n.navigate_to ? 'Tap to view →' : ''}
                                            </Typography>
                                        </Box>

                                        {!n.is_read && (
                                            <Box sx={{
                                                width: 8, height: 8, borderRadius: '50%',
                                                bgcolor: meta.color, flexShrink: 0, mt: 0.5,
                                            }} />
                                        )}
                                    </Box>
                                </Box>
                            );
                        })
                    )}
                </Box>
            </Menu>

            {suggestionLoading && (
                <Box sx={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: 'rgba(0,0,0,0.35)',
                }}>
                    <Box sx={{ bgcolor: '#fff', borderRadius: '16px', p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={22} />
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                            Loading recommendation...
                        </Typography>
                    </Box>
                </Box>
            )}

            <SuggestionDetailDialog
                open={Boolean(suggestionDetail)}
                onClose={() => setSuggestionDetail(null)}
                suggestion={suggestionDetail}
            />
        </>
    );
};

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, loading } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [profileAnchor, setProfileAnchor] = useState(null);
    const [suggestAnchor, setSuggestAnchor] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [suggestDialog, setSuggestDialog] = useState(false);
    const [suggestCount, setSuggestCount] = useState(0);
    const [notifAnchor, setNotifAnchor] = useState(null);
    const [notifCount, setNotifCount] = useState(0);
    const [successFlash, setSuccessFlash] = useState('');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (user?.role?.toLowerCase() !== 'doctor') return;
        doctorSuggestionAPI.getAll()
            .then(r => setSuggestCount(r.data?.length || 0))
            .catch(() => {});
    }, [user]);

    useEffect(() => {
        if (!user) return;
        notificationAPI.getUnreadCount()
            .then(r => setNotifCount(r.data?.count || 0))
            .catch(() => {});
    }, [user]);

    if (loading) return null;
    if (!user) return null;

    const role = (user?.role || 'patient').toLowerCase();
    const isPatient = role === 'patient';
    const isDoctor = role === 'doctor';

    const NAV_ITEMS = isPatient ? PATIENT_NAV : isDoctor ? DOCTOR_NAV : NURSE_NAV;
    const PROFILE_MENU = isPatient ? PATIENT_PROFILE_MENU : isDoctor ? DOCTOR_PROFILE_MENU : NURSE_PROFILE_MENU;
    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
    const chipStyle = ROLE_CHIP[role] || ROLE_CHIP.patient;

    const flash = (msg) => {
        setSuccessFlash(msg);
        setTimeout(() => setSuccessFlash(''), 3000);
    };

    const initials = () => {
        if (user?.first_name && user?.last_name) return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        return user?.username?.[0]?.toUpperCase() || 'U';
    };

    const displayName = () => user?.first_name || user?.username || 'User';
    const fullName = () => user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username;

    const go = (path) => {
        navigate(path);
        setProfileAnchor(null);
        setDrawerOpen(false);
        setSuggestAnchor(null);
        setNotifAnchor(null);
    };

    const handleLogout = async () => {
        setProfileAnchor(null);
        setDrawerOpen(false);
        await logout();
        navigate('/login');
    };

    const active = (path) => location.pathname === path;

    const navBtnSx = (path) => ({
        px: 1.8, py: 0.9, borderRadius: '10px', textTransform: 'none',
        fontSize: '0.85rem', letterSpacing: 0, gap: 0.7,
        fontWeight: active(path) ? 700 : 500,
        color: active(path) ? '#2563eb' : '#475569',
        backgroundColor: active(path) ? 'rgba(37,99,235,0.08)' : 'transparent',
        ...(path === '/medications' && {
            color: '#0891b2',
            backgroundColor: active(path) ? 'rgba(8,145,178,0.10)' : 'transparent',
            '&:hover': { backgroundColor: 'rgba(8,145,178,0.10)', color: '#0891b2' },
        }),
        '&:hover': { backgroundColor: 'rgba(37,99,235,0.1)', color: '#2563eb' },
        transition: 'all 0.18s ease',
    });

    const menuItemSx = (danger = false, highlight = false) => ({
        mx: 1, my: 0.3, borderRadius: '10px', py: 1.2, gap: 1.5,
        color: danger ? '#ef4444' : highlight ? '#0891b2' : '#374151',
        '&:hover': {
            backgroundColor: danger ? 'rgba(239,68,68,0.08)' : highlight ? 'rgba(8,145,178,0.08)' : 'rgba(37,99,235,0.07)',
            color: danger ? '#ef4444' : highlight ? '#0891b2' : '#2563eb',
        },
    });

    const drawerItemSx = (path) => ({
        borderRadius: '12px', mb: 0.5, cursor: 'pointer',
        backgroundColor: active(path) ? (path === '/medications' ? 'rgba(8,145,178,0.10)' : 'rgba(37,99,235,0.08)') : 'transparent',
        '&:hover': { backgroundColor: path === '/medications' ? 'rgba(8,145,178,0.08)' : 'rgba(37,99,235,0.06)' },
    });

    return (
        <>
            {successFlash && (
                <Box sx={{
                    position: 'fixed', top: 16, right: 16, zIndex: 9999,
                    bgcolor: '#ecfdf5', border: '1px solid #a7f3d0',
                    borderRadius: '12px', px: 2, py: 1.2,
                    display: 'flex', alignItems: 'center', gap: 1,
                    boxShadow: '0 4px 20px rgba(5,150,105,0.15)',
                }}>
                    <CheckIcon sx={{ color: '#059669', fontSize: 18 }} />
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#059669', fontFamily: '"DM Sans", sans-serif' }}>
                        {successFlash}
                    </Typography>
                </Box>
            )}

            <AppBar position="sticky" elevation={scrolled ? 3 : 0} sx={{
                backgroundColor: 'rgba(255,255,255,0.98)',
                backdropFilter: 'blur(14px)',
                borderBottom: '1px solid rgba(0,0,0,0.07)',
                color: '#1a202c',
            }}>
                <Toolbar sx={{ px: { xs: 2, md: 4 }, minHeight: { xs: 64, md: 70 }, gap: 1 }}>
                    <Box onClick={() => go('/dashboard')} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer', mr: { xs: 0, md: 3 }, flexShrink: 0 }}>
                        <Box sx={{ width: 42, height: 42, borderRadius: '13px', background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HealthIcon sx={{ color: '#fff', fontSize: 22 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.1, color: '#0f172a' }}>HealthCare</Typography>
                            <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#0ea5e9', lineHeight: 1 }}>Symptom Analysis</Typography>
                        </Box>
                    </Box>

                    {!isMobile && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, flexGrow: 1 }}>
                            {NAV_ITEMS.map((item) => (
                                <Button key={item.path} onClick={() => go(item.path)} startIcon={item.icon} sx={navBtnSx(item.path)}>
                                    {item.label}
                                </Button>
                            ))}
                        </Box>
                    )}

                    <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

                    {isDoctor && !isMobile && (
                        <Tooltip title="Doctor Suggestions">
                            <Box
                                onClick={(e) => setSuggestAnchor(e.currentTarget)}
                                sx={{
                                    display: 'flex', alignItems: 'center', gap: 0.8,
                                    px: 1.5, py: 0.7, borderRadius: '10px', cursor: 'pointer', mr: 0.5,
                                    border: '1.5px solid',
                                    borderColor: suggestAnchor ? '#1d4ed8' : 'rgba(0,0,0,0.08)',
                                    bgcolor: suggestAnchor ? 'rgba(37,99,235,0.05)' : 'transparent',
                                    transition: 'all 0.15s',
                                    '&:hover': { borderColor: '#1d4ed8', bgcolor: 'rgba(37,99,235,0.05)' },
                                }}
                            >
                                <Badge badgeContent={suggestCount} max={99} color="primary">
                                    <SuggestionIcon sx={{ fontSize: 18, color: suggestAnchor ? '#1d4ed8' : '#64748b' }} />
                                </Badge>
                                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: suggestAnchor ? '#1d4ed8' : '#475569' }}>Suggestions</Typography>
                                <ArrowDownIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                            </Box>
                        </Tooltip>
                    )}

                    {!isMobile && (
                        <Tooltip title="Notifications">
                            <IconButton
                                onClick={(e) => setNotifAnchor(e.currentTarget)}
                                sx={{
                                    color: notifAnchor ? '#2563eb' : '#64748b', mr: 0.5,
                                    bgcolor: notifAnchor ? 'rgba(37,99,235,0.08)' : 'transparent',
                                    borderRadius: '10px',
                                    transition: 'all 0.15s',
                                }}
                            >
                                <Badge badgeContent={notifCount} color="error" max={99}>
                                    <NotificationsIcon fontSize="small" />
                                </Badge>
                            </IconButton>
                        </Tooltip>
                    )}

                    <Box
                        onClick={(e) => setProfileAnchor(e.currentTarget)}
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer',
                            borderRadius: '40px', border: '1.5px solid',
                            borderColor: profileAnchor ? 'rgba(37,99,235,0.45)' : 'rgba(0,0,0,0.10)',
                            px: 1.2, py: 0.55,
                            transition: 'all 0.15s',
                        }}
                    >
                        <Avatar sx={{ width: 30, height: 30, fontSize: '0.78rem', fontWeight: 700, background: 'linear-gradient(135deg,#0ea5e9,#2563eb)' }}>
                            {initials()}
                        </Avatar>
                        {!isMobile && (
                            <Box sx={{ lineHeight: 1 }}>
                                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>{displayName()}</Typography>
                                <Typography sx={{ fontSize: '0.62rem', color: '#94a3b8' }}>{roleLabel}</Typography>
                            </Box>
                        )}
                        <ArrowDownIcon sx={{ fontSize: 15, color: '#94a3b8' }} />
                    </Box>

                    {isMobile && (
                        <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: '#475569', ml: 0.5 }}>
                            <MenuIcon />
                        </IconButton>
                    )}
                </Toolbar>
            </AppBar>

            <SuggestionsFeedPanel
                anchorEl={suggestAnchor}
                open={Boolean(suggestAnchor)}
                onClose={() => setSuggestAnchor(null)}
                currentUser={user}
                onNew={() => { setSuggestAnchor(null); setSuggestDialog(true); }}
            />

            <NotificationPanel
                anchorEl={notifAnchor}
                open={Boolean(notifAnchor)}
                onClose={() => setNotifAnchor(null)}
                onCountChange={setNotifCount}
                navigate={navigate}
            />

            <DoctorSuggestionDialog
                open={suggestDialog}
                onClose={() => setSuggestDialog(false)}
                currentUser={user}
                onSuccess={() => {
                    flash('Suggestion posted successfully!');
                    setSuggestCount(p => p + 1);
                }}
            />

            <Menu
                anchorEl={profileAnchor}
                open={Boolean(profileAnchor)}
                onClose={() => setProfileAnchor(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{ sx: { borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', minWidth: 240 } }}
            >
                <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 44, height: 44, fontSize: '1rem', fontWeight: 700, background: 'linear-gradient(135deg,#0ea5e9,#2563eb)' }}>{initials()}</Avatar>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{fullName()}</Typography>
                        <Typography sx={{ fontSize: '0.73rem', color: '#64748b' }}>{user?.email}</Typography>
                        <Chip label={roleLabel} size="small" sx={{ mt: 0.4, height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: chipStyle.bg, color: chipStyle.color }} />
                    </Box>
                </Box>

                <Divider sx={{ borderColor: 'rgba(0,0,0,0.06)' }} />

                {isDoctor && (
                    <MenuItem onClick={() => { setProfileAnchor(null); navigate('/doctor/ai-assistance'); }} sx={menuItemSx(false, true)}>
                        <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}><DoctorsIcon fontSize="small" /></ListItemIcon>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>AI Assistance</Typography>
                        <Box component="span" sx={{ ml: 'auto', px: 0.8, py: 0.1, borderRadius: '6px', bgcolor: 'rgba(29,78,216,0.10)', color: '#1d4ed8', fontSize: '0.6rem', fontWeight: 800 }}>New</Box>
                    </MenuItem>
                )}

                {PROFILE_MENU.map((item) => (
                    <MenuItem key={item.path} onClick={() => go(item.path)} sx={menuItemSx(false, item.path === '/medications')}>
                        <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>{item.icon}</ListItemIcon>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</Typography>
                    </MenuItem>
                ))}

                <Divider sx={{ my: 1, borderColor: 'rgba(0,0,0,0.06)' }} />

                <MenuItem onClick={handleLogout} sx={{ ...menuItemSx(true), mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}><LogoutIcon fontSize="small" /></ListItemIcon>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Logout</Typography>
                </MenuItem>
            </Menu>

            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: 290, borderRadius: '16px 0 0 16px' } }}>
                {/* same drawer code as your file */}
            </Drawer>
        </>
    );
};

export default Header;