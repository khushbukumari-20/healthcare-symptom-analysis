import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, TextField, Button, Typography, Grid,
    Alert, CircularProgress, MenuItem, Dialog, DialogTitle,
    DialogContent, DialogActions, InputAdornment, IconButton,
    Divider, Avatar, Chip, Tooltip,
} from '@mui/material';
import {
    Visibility, VisibilityOff,
    Edit as EditIcon, Save as SaveIcon,
    Lock as LockIcon,
    MonitorWeight as WeightIcon, Height as HeightIcon,
    Phone as PhoneIcon, Cake as AgeIcon,
    Add as AddIcon, Delete as DeleteIcon,
    LocalHospital as HospitalIcon,
    ReportProblem as AllergyIcon,
    CheckCircle as CheckCircleIcon,
    WatchLater as ActiveIcon,
    Autorenew as ChronicIcon,
    Person as PersonIcon,
    Favorite as HeartIcon,
    MedicalInformation as MedInfoIcon,
    Groups as GroupsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { medicalHistoryAPI, allergyAPI, doctorProfileAPI } from '../services/api';

const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const SEVERITIES = ['mild', 'moderate', 'severe'];
const STATUSES = ['active', 'resolved', 'chronic'];
const RELATIONS = [
    'Father', 'Mother',
    'Grandfather (Paternal)', 'Grandmother (Paternal)',
    'Grandfather (Maternal)', 'Grandmother (Maternal)',
    'Sibling', 'Uncle', 'Aunt', 'Other',
];

const SPECIALIZATIONS = [
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Neurologist',
    'Pediatrician',
    'Orthopedic',
    'Gynecologist',
    'Psychiatrist',
    'ENT Specialist',
    'Ophthalmologist',
    'Other',
];

const SEV = {
    mild: { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', dot: '#10b981' },
    moderate: { color: '#b45309', bg: '#fffbeb', border: '#fcd34d', dot: '#f59e0b' },
    severe: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444' },
};

const STA = {
    active: { color: '#b45309', bg: '#fffbeb', border: '#fcd34d', Icon: ActiveIcon, label: 'Active' },
    resolved: { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', Icon: CheckCircleIcon, label: 'Resolved' },
    chronic: { color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', Icon: ChronicIcon, label: 'Chronic' },
};

const calcBMI = (w, h) => (!w || !h) ? null : (parseFloat(w) / ((parseFloat(h) / 100) ** 2)).toFixed(1);

const bmiMeta = (b) => {
    if (!b) return null;
    if (b < 18.5) return { label: 'Underweight', color: '#b45309', fill: '#f59e0b', pct: Math.min(100, (b / 18.5) * 30) };
    if (b < 25) return { label: 'Normal', color: '#059669', fill: '#10b981', pct: 30 + ((b - 18.5) / 6.5) * 35 };
    if (b < 30) return { label: 'Overweight', color: '#b45309', fill: '#f59e0b', pct: 65 + ((b - 25) / 5) * 20 };
    return { label: 'Obese', color: '#dc2626', fill: '#ef4444', pct: Math.min(100, 85 + ((b - 30) / 10) * 15) };
};

const profilePct = (u, isDoctor) => {
    if (!u) return 0;
    if (isDoctor) {
        const d = u.doctor_profile || {};
        const f = ['doctor_name', 'phone', 'gender', 'specialization', 'qualification', 'experience', 'hospital_name', 'address', 'consultation_fee'];
        return Math.round(f.filter((k) => d[k]).length / f.length * 100);
    }
    const f = ['first_name', 'last_name', 'phone', 'age', 'gender', 'weight', 'height', 'blood_type'];
    return Math.round(f.filter((k) => u[k]).length / f.length * 100);
};

const fld = (disabled) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        fontFamily: '"DM Sans", sans-serif',
        fontSize: '0.875rem',
        backgroundColor: disabled ? '#f9fafb' : '#fff',
        '&:hover fieldset': { borderColor: disabled ? undefined : '#1d4ed8' },
        '&.Mui-focused fieldset': { borderColor: '#1d4ed8', borderWidth: '2px' },
    },
    '& .MuiInputLabel-root': { fontFamily: '"DM Sans", sans-serif', fontSize: '0.875rem' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#1d4ed8' },
});

const FieldLabel = ({ children }) => (
    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.6 }}>
        {children}
    </Typography>
);

const StatBox = ({ value, label, color }) => (
    <Box sx={{ textAlign: 'center', flex: 1, px: 1, py: 1.5, borderRadius: '12px', bgcolor: '#f8fafc' }}>
        <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1, fontFamily: '"DM Sans", sans-serif' }}>{value}</Typography>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#9ca3af', mt: 0.4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</Typography>
    </Box>
);

const SectionTitle = ({ icon: Icon, label, count, onAdd }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon sx={{ fontSize: 15, color: '#93c5fd' }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#111827', fontFamily: '"DM Sans", sans-serif' }}>{label}</Typography>
            <Box sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontSize: '0.68rem', fontWeight: 700, px: 1, py: 0.2, borderRadius: '20px' }}>{count}</Box>
        </Box>
        <Tooltip title={`Add ${label}`}>
            <IconButton size="small" onClick={onAdd}
                sx={{ bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', '&:hover': { bgcolor: '#dbeafe', borderColor: '#93c5fd' } }}>
                <AddIcon sx={{ fontSize: 16, color: '#1d4ed8' }} />
            </IconButton>
        </Tooltip>
    </Box>
);

const Empty = ({ label }) => (
    <Box sx={{ py: 3, textAlign: 'center', border: '1.5px dashed #e5e7eb', borderRadius: '12px' }}>
        <Typography sx={{ fontSize: '0.78rem', color: '#d1d5db', fontFamily: '"DM Sans", sans-serif' }}>No {label} recorded</Typography>
    </Box>
);

const DField = ({ label, children }) => (
    <Box>
        <FieldLabel>{label}</FieldLabel>
        {children}
    </Box>
);

const ProfilePage = () => {
    const { user, updateProfile, changePassword, logout, error, setError } = useAuth();
    const isDoctor = user?.role === 'doctor';
    const [activeSection, setActiveSection] = useState('profile');
    const [edit, setEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pwDialog, setPwDialog] = useState(false);
    const [success, setSuccess] = useState('');
    const [medLoading, setMedLoading] = useState(false);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        first_name: '', last_name: '', phone: '', age: '',
        gender: '', weight: '', height: '', blood_type: '',
    });

    const [doctorForm, setDoctorForm] = useState({
        doctor_name: '',
        email: '',
        phone: '',
        gender: '',
        specialization: '',
        qualification: '',
        experience: '',
        hospital_name: '',
        address: '',
        consultation_fee: '',
        available: true,
    });

    const [medHistory, setMedHistory] = useState([]);
    const [famHistory, setFamHistory] = useState([]);
    const [allergies, setAllergies] = useState([]);

    const blankMed = { condition_name: '', diagnosis_date: '', status: 'active', notes: '', parent_relation: '' };
    const blankAllergy = { allergen: '', severity: 'mild', reaction: '' };

    const [medDialog, setMedDialog] = useState({ open: false, data: null, type: 'patient' });
    const [allergyDialog, setAllergyDialog] = useState({ open: false, data: null });
    const [medForm, setMedForm] = useState(blankMed);
    const [allergyForm, setAllergyForm] = useState(blankAllergy);

    const [pw, setPw] = useState({ old_password: '', new_password: '', password_confirm: '' });
    const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });

    useEffect(() => {
        if (!user) return;

        if (isDoctor) {
            const d = user.doctor_profile || {};
            setDoctorForm({
                doctor_name: d.doctor_name || '',
                email: d.email || user.email || '',
                phone: d.phone || '',
                gender: d.gender || '',
                specialization: d.specialization || '',
                qualification: d.qualification || '',
                experience: d.experience || '',
                hospital_name: d.hospital_name || '',
                address: d.address || '',
                consultation_fee: d.consultation_fee || '',
                available: d.available ?? true,
            });
        } else {
            setForm({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                age: user.age || '',
                gender: user.gender || '',
                weight: user.weight || '',
                height: user.height || '',
                blood_type: user.blood_type || '',
            });
        }
    }, [user, isDoctor]);

    const flash = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3500);
    };

    const fetchMedical = useCallback(async () => {
        if (isDoctor) return;
        setMedLoading(true);
        try {
            const [mhRes, alRes] = await Promise.all([
                medicalHistoryAPI.getAll(),
                allergyAPI.getAll(),
            ]);
            const allMed = mhRes.data;
            setMedHistory(allMed.filter((r) => r.history_type === 'patient'));
            setFamHistory(allMed.filter((r) => r.history_type === 'family'));
            setAllergies(alRes.data);
        } catch {
            setError('Failed to load medical data.');
        } finally {
            setMedLoading(false);
        }
    }, [isDoctor, setError]);

    useEffect(() => {
        fetchMedical();
    }, [fetchMedical]);

    const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    const setDoctor = (e) => setDoctorForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSave = async () => {
        setError(null);
        setLoading(true);
        try {
            if (isDoctor) {
                await doctorProfileAPI.updateMe(doctorForm);
                flash('Doctor profile saved!');
            } else {
                await updateProfile(form);
                flash('Profile saved!');
            }
            setEdit(false);
        } catch (e) {
            const data = e.response?.data;
            setError(data ? Object.values(data).flat().join(' ') : 'Could not save profile.');
        } finally {
            setLoading(false);
        }
    };

    const handlePwChange = async () => {
        setError(null);
        setLoading(true);
        try {
            await changePassword(pw);
            flash('Password changed! Logging out...');
            setPwDialog(false);
            setPw({ old_password: '', new_password: '', password_confirm: '' });
            await logout();
            navigate('/login', { replace: true });
        } catch (e) {
            const data = e.response?.data;
            setError(data ? Object.values(data).flat().join(' ') : 'Could not change password.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMedical = async () => {
        if (!medForm.condition_name.trim()) return setError('Condition name is required.');
        if (!medForm.diagnosis_date) return setError('Diagnosis date is required.');
        if (medDialog.type === 'family' && !medForm.parent_relation) return setError('Please select the relation.');

        setError(null);
        setLoading(true);
        try {
            const payload = { ...medForm, history_type: medDialog.type };
            if (medDialog.data?.id) await medicalHistoryAPI.update(medDialog.data.id, payload);
            else await medicalHistoryAPI.create(payload);
            flash(medDialog.type === 'family' ? 'Family history saved!' : 'Medical history saved!');
            setMedDialog({ open: false, data: null, type: 'patient' });
            fetchMedical();
        } catch (e) {
            const data = e.response?.data;
            setError(data ? Object.values(data).flat().join(' ') : 'Network error.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMedical = async (id) => {
        if (!window.confirm('Delete this record?')) return;
        try {
            await medicalHistoryAPI.remove(id);
            flash('Record deleted.');
            fetchMedical();
        } catch {
            setError('Could not delete record.');
        }
    };

    const handleSaveAllergy = async () => {
        if (!allergyForm.allergen.trim()) return setError('Allergen name is required.');
        if (!allergyForm.reaction.trim()) return setError('Reaction/symptoms are required.');

        setError(null);
        setLoading(true);
        try {
            if (allergyDialog.data?.id) await allergyAPI.update(allergyDialog.data.id, allergyForm);
            else await allergyAPI.create(allergyForm);
            flash('Allergy saved!');
            setAllergyDialog({ open: false, data: null });
            fetchMedical();
        } catch (e) {
            const data = e.response?.data;
            setError(data ? Object.values(data).flat().join(' ') : 'Network error.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAllergy = async (id) => {
        if (!window.confirm('Delete this allergy?')) return;
        try {
            await allergyAPI.remove(id);
            flash('Allergy deleted.');
            fetchMedical();
        } catch {
            setError('Could not delete allergy.');
        }
    };

    const openMedDialog = (type, existing = null) => {
        setMedForm(existing ? {
            condition_name: existing.condition_name || '',
            diagnosis_date: existing.diagnosis_date || '',
            status: existing.status || 'active',
            notes: existing.notes || '',
            parent_relation: existing.parent_relation || '',
        } : blankMed);
        setError(null);
        setMedDialog({ open: true, data: existing, type });
    };

    const openAllergyDialog = (existing = null) => {
        setAllergyForm(existing ? {
            allergen: existing.allergen || '',
            severity: existing.severity || 'mild',
            reaction: existing.reaction || '',
        } : blankAllergy);
        setError(null);
        setAllergyDialog({ open: true, data: existing });
    };

    const completion = profilePct(user, isDoctor);
    const bmi = !isDoctor ? calcBMI(form.weight, form.height) : null;
    const bm = bmi ? bmiMeta(bmi) : null;

    const initials = () => {
        if (isDoctor) return (doctorForm.doctor_name?.[0] || user?.username?.[0] || 'D').toUpperCase();
        if (user?.first_name && user?.last_name) return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        return user?.username?.[0]?.toUpperCase() || 'U';
    };

    const NAV = isDoctor
        ? [{ key: 'profile', label: 'Doctor Info', Icon: HospitalIcon }]
        : [
            { key: 'profile', label: 'Personal', Icon: PersonIcon },
            { key: 'health', label: 'Health', Icon: HeartIcon },
            { key: 'history', label: 'Conditions', Icon: MedInfoIcon },
            { key: 'family', label: 'Family', Icon: GroupsIcon },
            { key: 'allergy', label: 'Allergies', Icon: AllergyIcon },
        ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9', fontFamily: '"DM Sans", sans-serif' }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap" rel="stylesheet" />

            <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, minWidth: 300 }}>
                {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>{success}</Alert>}
                {error && <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', mt: 1 }}>{error}</Alert>}
            </Box>

            <Box sx={{ display: 'flex', maxWidth: 1400, mx: 'auto', p: { xs: 2, md: 3 }, gap: 3, alignItems: 'flex-start' }}>
                <Box sx={{ width: 260, flexShrink: 0, display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', gap: 2 }}>
                    <Card elevation={0} sx={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <Box sx={{ height: 70, background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1d4ed8 100%)', position: 'relative' }}>
                            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 35, background: 'white', borderRadius: '20px 20px 0 0' }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 3, pb: 3, mt: -4 }}>
                            <Avatar sx={{ width: 72, height: 72, fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,#1d4ed8,#0ea5e9)', border: '4px solid white' }}>
                                {initials()}
                            </Avatar>
                            <Typography sx={{ mt: 1.5, fontWeight: 800, fontSize: '1rem', color: '#111827', fontFamily: '"Sora", sans-serif', textAlign: 'center' }}>
                                {isDoctor ? (doctorForm.doctor_name || user?.username) : (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username)}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', mt: 0.3, mb: 1.5 }}>
                                {isDoctor ? doctorForm.email : user?.email}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', justifyContent: 'center' }}>
                                <Chip label={isDoctor ? 'Doctor' : 'Patient'} size="small" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                                {!isDoctor && user?.gender && <Chip label={user.gender} size="small" sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: '0.65rem', height: 20 }} />}
                                {isDoctor && doctorForm.specialization && <Chip label={doctorForm.specialization} size="small" sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: '0.65rem', height: 20 }} />}
                            </Box>
                        </Box>
                        <Divider />
                        <Box sx={{ px: 3, py: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>Profile Completion</Typography>
                                <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: completion === 100 ? '#059669' : '#f59e0b' }}>{completion}%</Typography>
                            </Box>
                        </Box>
                        {!isDoctor && (
                            <>
                                <Divider />
                                <Box sx={{ px: 2, py: 2, display: 'flex', gap: 1 }}>
                                    <StatBox value={medHistory.length} label="Conditions" color="#dc2626" />
                                    <StatBox value={famHistory.length} label="Family" color="#7c3aed" />
                                    <StatBox value={allergies.length} label="Allergies" color="#f59e0b" />
                                </Box>
                            </>
                        )}
                        <Divider />
                        <Box sx={{ px: 3, py: 2 }}>
                            <Button fullWidth startIcon={<LockIcon sx={{ fontSize: 15 }} />} onClick={() => setPwDialog(true)} variant="outlined"
                                sx={{ borderRadius: '10px', fontWeight: 700, fontSize: '0.75rem', py: 1, borderColor: '#e2e8f0', color: '#374151' }}>
                                Change Password
                            </Button>
                        </Box>
                    </Card>
                </Box>

                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {NAV.map(({ key, label, Icon }) => {
                            const active = activeSection === key;
                            return (
                                <Box key={key} onClick={() => setActiveSection(key)}
                                    sx={{
                                        display: 'flex', alignItems: 'center', gap: 0.8,
                                        px: 2, py: 1, borderRadius: '10px', cursor: 'pointer',
                                        fontSize: '0.82rem', fontWeight: 700,
                                        bgcolor: active ? '#0f172a' : 'white',
                                        color: active ? 'white' : '#6b7280',
                                        border: active ? '1px solid #0f172a' : '1px solid #e5e7eb',
                                    }}>
                                    <Icon sx={{ fontSize: 15 }} />
                                    {label}
                                </Box>
                            );
                        })}

                        <Box sx={{ ml: 'auto' }}>
                            {!edit ? (
                                <Button size="small" onClick={() => setEdit(true)} startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                                    sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: 'white', border: '1px solid #e5e7eb', color: '#374151' }}>
                                    Edit Profile
                                </Button>
                            ) : (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button size="small" onClick={() => setEdit(false)} disabled={loading}
                                        sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: 'white', border: '1px solid #e5e7eb', color: '#6b7280' }}>
                                        Cancel
                                    </Button>
                                    <Button size="small" onClick={handleSave} disabled={loading} variant="contained"
                                        sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: '#0f172a' }}>
                                        {loading ? <CircularProgress size={14} color="inherit" /> : <><SaveIcon sx={{ fontSize: 14, mr: 0.5 }} />Save</>}
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {activeSection === 'profile' && !isDoctor && (
                        <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <PersonIcon sx={{ color: '#1d4ed8', fontSize: 20 }} />
                                <Box>
                                    <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#111827', fontFamily: '"Sora", sans-serif' }}>Personal Information</Typography>
                                    <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af' }}>Your name, contact and demographics</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ p: 3 }}>
                                <Grid container spacing={2.5}>
                                    <Grid item xs={12} sm={6}><DField label="First Name"><TextField fullWidth name="first_name" value={form.first_name} onChange={set} disabled={!edit} size="small" sx={fld(!edit)} /></DField></Grid>
                                    <Grid item xs={12} sm={6}><DField label="Last Name"><TextField fullWidth name="last_name" value={form.last_name} onChange={set} disabled={!edit} size="small" sx={fld(!edit)} /></DField></Grid>
                                    <Grid item xs={12} sm={6}><DField label="Phone Number"><TextField fullWidth name="phone" value={form.phone} onChange={set} disabled={!edit} size="small" sx={fld(!edit)} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: 16, color: '#9ca3af' }} /></InputAdornment> }} /></DField></Grid>
                                    <Grid item xs={12} sm={6}><DField label="Age"><TextField fullWidth name="age" type="number" value={form.age} onChange={set} disabled={!edit} size="small" sx={fld(!edit)} inputProps={{ min: 1, max: 120 }} InputProps={{ startAdornment: <InputAdornment position="start"><AgeIcon sx={{ fontSize: 16, color: '#9ca3af' }} /></InputAdornment> }} /></DField></Grid>
                                    <Grid item xs={12} sm={6}><DField label="Gender"><TextField fullWidth select name="gender" value={form.gender} onChange={set} disabled={!edit} size="small" sx={fld(!edit)}><MenuItem value="">Select</MenuItem>{GENDERS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}</TextField></DField></Grid>
                                    <Grid item xs={12} sm={6}><DField label="Email"><TextField fullWidth value={user?.email || ''} disabled size="small" sx={fld(true)} /></DField></Grid>
                                </Grid>
                            </Box>
                        </Card>
                    )}

                    {activeSection === 'profile' && isDoctor && (
                        <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <HospitalIcon sx={{ color: '#1d4ed8', fontSize: 20 }} />
                                <Box>
                                    <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#111827', fontFamily: '"Sora", sans-serif' }}>Doctor Information</Typography>
                                    <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af' }}>Professional details from doctor profile</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ p: 3 }}>
                                <Grid container spacing={2.5}>
                                    <Grid item xs={12} sm={6}><DField label="Doctor Name"><TextField fullWidth name="doctor_name" value={doctorForm.doctor_name} onChange={setDoctor} disabled={!edit} size="small" sx={fld(!edit)} /></DField></Grid>
                                    <Grid item xs={12} sm={6}><DField label="Email"><TextField fullWidth name="email" value={doctorForm.email} onChange={setDoctor} disabled={!edit} size="small" sx={fld(!edit)} /></DField></Grid>
                                    <Grid item xs={12} sm={6}><DField label="Phone"><TextField fullWidth name="phone" value={doctorForm.phone} onChange={setDoctor} disabled={!edit} size="small" sx={fld(!edit)} /></DField></Grid>
                                    <Grid item xs={12} sm={6}><DField label="Gender"><TextField fullWidth select name="gender" value={doctorForm.gender} onChange={setDoctor} disabled={!edit} size="small" sx={fld(!edit)}><MenuItem value="">Select</MenuItem>{GENDERS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}</TextField></DField></Grid>
                                    <Grid item xs={12} sm={6}><DField label="Specialization"><TextField fullWidth select name="specialization" value={doctorForm.specialization} onChange={setDoctor} disabled={!edit} size="small" sx={fld(!edit)}><MenuItem value="">Select Specialization</MenuItem>{SPECIALIZATIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField></DField></Grid>
                                    <Grid item xs={12} sm={6}><DField label="Qualification"><TextField fullWidth name="qualification" value={doctorForm.qualification} onChange={setDoctor} disabled={!edit} size="small" sx={fld(!edit)} /></DField></Grid>
                                    <Grid item xs={12} sm={6}><DField label="Experience (years)"><TextField fullWidth name="experience" type="number" value={doctorForm.experience} onChange={setDoctor} disabled={!edit} size="small" sx={fld(!edit)} /></DField></Grid>
                                    <Grid item xs={12} sm={6}><DField label="Consultation Fee"><TextField fullWidth name="consultation_fee" type="number" value={doctorForm.consultation_fee} onChange={setDoctor} disabled={!edit} size="small" sx={fld(!edit)} /></DField></Grid>
                                    <Grid item xs={12}><DField label="Hospital Name"><TextField fullWidth name="hospital_name" value={doctorForm.hospital_name} onChange={setDoctor} disabled={!edit} size="small" sx={fld(!edit)} /></DField></Grid>
                                    <Grid item xs={12}><DField label="Address"><TextField fullWidth multiline rows={3} name="address" value={doctorForm.address} onChange={setDoctor} disabled={!edit} size="small" sx={fld(!edit)} /></DField></Grid>
                                    <Grid item xs={12} sm={6}><DField label="Availability"><TextField fullWidth select name="available" value={String(doctorForm.available)} onChange={(e) => setDoctorForm((p) => ({ ...p, available: e.target.value === 'true' }))} disabled={!edit} size="small" sx={fld(!edit)}><MenuItem value="true">Available</MenuItem><MenuItem value="false">Not Available</MenuItem></TextField></DField></Grid>
                                </Grid>
                            </Box>
                        </Card>
                    )}

                    {!isDoctor && activeSection === 'health' && (
                        <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <HeartIcon sx={{ color: '#dc2626', fontSize: 20 }} />
                                <Box>
                                    <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#111827', fontFamily: '"Sora", sans-serif' }}>Health Metrics</Typography>
                                    <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af' }}>Body measurements and blood type</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ p: 3 }}>
                                <Grid container spacing={2.5}>
                                    <Grid item xs={12} sm={6}><DField label="Weight (kg)"><TextField fullWidth name="weight" type="number" value={form.weight} onChange={set} disabled={!edit} size="small" sx={fld(!edit)} /></DField></Grid>
                                    <Grid item xs={12} sm={6}><DField label="Height (cm)"><TextField fullWidth name="height" type="number" value={form.height} onChange={set} disabled={!edit} size="small" sx={fld(!edit)} /></DField></Grid>
                                    {bmi && bm && (
                                        <Grid item xs={12}>
                                            <Box sx={{ borderRadius: '14px', border: `1.5px solid ${bm.fill}50`, overflow: 'hidden' }}>
                                                <Box sx={{ px: 3, py: 2, bgcolor: `${bm.fill}10`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Box>
                                                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Body Mass Index</Typography>
                                                        <Typography sx={{ fontSize: '2.2rem', fontWeight: 800, color: bm.color, lineHeight: 1, fontFamily: '"Sora", sans-serif' }}>{bmi}</Typography>
                                                    </Box>
                                                    <Box sx={{ px: 2, py: 0.8, borderRadius: '8px', bgcolor: `${bm.fill}20`, border: `1px solid ${bm.fill}40` }}>
                                                        <Typography sx={{ fontWeight: 800, color: bm.color, fontSize: '0.85rem' }}>{bm.label}</Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    )}
                                    <Grid item xs={12}>
                                        <DField label="Blood Type">
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                                {BLOOD_TYPES.map((bt) => {
                                                    const sel = form.blood_type === bt;
                                                    return (
                                                        <Box key={bt} onClick={() => edit && setForm((p) => ({ ...p, blood_type: p.blood_type === bt ? '' : bt }))}
                                                            sx={{
                                                                width: 52, height: 52, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontWeight: 800, fontSize: '0.85rem', cursor: edit ? 'pointer' : 'default',
                                                                bgcolor: sel ? '#0f172a' : '#f8fafc',
                                                                color: sel ? 'white' : '#6b7280',
                                                                border: sel ? '2px solid #0f172a' : '2px solid #e5e7eb',
                                                                opacity: !edit && !sel ? 0.45 : 1,
                                                            }}>
                                                            {bt}
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        </DField>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Card>
                    )}

                    {!isDoctor && activeSection === 'history' && (
                        <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f1f5f9' }}>
                                <SectionTitle icon={MedInfoIcon} label="My Medical History" count={medHistory.length} onAdd={() => openMedDialog('patient')} />
                            </Box>
                            <Box sx={{ p: 3 }}>
                                {medLoading ? <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={24} /></Box> :
                                    medHistory.length === 0 ? <Empty label="medical history" /> :
                                        medHistory.map((rec) => {
                                            const s = STA[rec.status] || STA.active;
                                            return (
                                                <Box key={rec.id} sx={{ p: 2.5, mb: 1.5, borderRadius: '14px', border: `1.5px solid ${s.border}`, bgcolor: s.bg, display: 'flex', justifyContent: 'space-between' }}>
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 700 }}>{rec.condition_name}</Typography>
                                                        <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>Diagnosed: {rec.diagnosis_date}</Typography>
                                                        {rec.notes && <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af', mt: 0.3 }}>{rec.notes}</Typography>}
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
                                                        <IconButton size="small" onClick={() => openMedDialog('patient', rec)}><EditIcon sx={{ fontSize: 14 }} /></IconButton>
                                                        <IconButton size="small" onClick={() => handleDeleteMedical(rec.id)}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                            </Box>
                        </Card>
                    )}

                    {!isDoctor && activeSection === 'family' && (
                        <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f1f5f9' }}>
                                <SectionTitle icon={GroupsIcon} label="Family Medical History" count={famHistory.length} onAdd={() => openMedDialog('family')} />
                            </Box>
                            <Box sx={{ p: 3 }}>
                                {medLoading ? <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={24} /></Box> :
                                    famHistory.length === 0 ? <Empty label="family history" /> :
                                        famHistory.map((rec) => (
                                            <Box key={rec.id} sx={{ p: 2.5, mb: 1.5, borderRadius: '14px', border: '1.5px solid #e9d5ff', bgcolor: '#faf5ff', display: 'flex', justifyContent: 'space-between' }}>
                                                <Box>
                                                    <Typography sx={{ fontWeight: 700 }}>{rec.condition_name}</Typography>
                                                    <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>{rec.parent_relation ? `Relation: ${rec.parent_relation}` : ''}</Typography>
                                                    {rec.notes && <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af', mt: 0.3 }}>{rec.notes}</Typography>}
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
                                                    <IconButton size="small" onClick={() => openMedDialog('family', rec)}><EditIcon sx={{ fontSize: 14 }} /></IconButton>
                                                    <IconButton size="small" onClick={() => handleDeleteMedical(rec.id)}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                                                </Box>
                                            </Box>
                                        ))}
                            </Box>
                        </Card>
                    )}

                    {!isDoctor && activeSection === 'allergy' && (
                        <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f1f5f9' }}>
                                <SectionTitle icon={AllergyIcon} label="Allergies & Reactions" count={allergies.length} onAdd={() => openAllergyDialog()} />
                            </Box>
                            <Box sx={{ p: 3 }}>
                                {medLoading ? <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={24} /></Box> :
                                    allergies.length === 0 ? <Empty label="allergies" /> :
                                        allergies.map((al) => {
                                            const sv = SEV[al.severity] || SEV.mild;
                                            return (
                                                <Box key={al.id} sx={{ p: 2.5, mb: 1.5, borderRadius: '14px', border: `1.5px solid ${sv.border}`, bgcolor: sv.bg, display: 'flex', justifyContent: 'space-between' }}>
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 700 }}>{al.allergen}</Typography>
                                                        <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>{al.reaction}</Typography>
                                                        <Chip label={al.severity} size="small"
                                                            sx={{ mt: 0.5, height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: `${sv.dot}20`, color: sv.color }} />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
                                                        <IconButton size="small" onClick={() => openAllergyDialog(al)}><EditIcon sx={{ fontSize: 14 }} /></IconButton>
                                                        <IconButton size="small" onClick={() => handleDeleteAllergy(al.id)}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                            </Box>
                        </Card>
                    )}
                </Box>
            </Box>

            <Dialog open={pwDialog} onClose={() => { setPwDialog(false); setError(null); }} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {[
                        { name: 'old_password', label: 'Current Password', key: 'old' },
                        { name: 'new_password', label: 'New Password', key: 'new' },
                        { name: 'password_confirm', label: 'Confirm Password', key: 'confirm' },
                    ].map(({ name, label, key }) => (
                        <Box key={name} sx={{ mb: 2 }}>
                            <FieldLabel>{label}</FieldLabel>
                            <TextField
                                fullWidth size="small" name={name}
                                type={showPw[key] ? 'text' : 'password'}
                                value={pw[name]}
                                onChange={(e) => setPw((p) => ({ ...p, [name]: e.target.value }))}
                                sx={fld(false)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}>
                                                {showPw[key] ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => { setPwDialog(false); setError(null); }}>Cancel</Button>
                    <Button onClick={handlePwChange} variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={16} color="inherit" /> : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfilePage;