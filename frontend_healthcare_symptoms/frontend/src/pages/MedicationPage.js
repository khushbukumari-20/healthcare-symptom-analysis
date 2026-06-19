import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, Typography, Button, Grid, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Alert, CircularProgress,
    Tooltip, Avatar, Tab, Tabs, Checkbox,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Medication as MedIcon,
    LocalHospital as HospitalIcon,
    CheckCircle as CheckIcon,
    Warning as WarningIcon,
    Error as UrgentIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    CalendarMonth as CalIcon,
    MedicalServices as RxIcon,
    Healing as HealingIcon,
    FiberManualRecord as DotIcon,
    Close as CloseIcon,
    Lightbulb as TipIcon,
    Groups as DoctorIcon,
    Lock as LockIcon,
} from '@mui/icons-material';
import {
    medicationAPI,
    recommendationAPI,
    doctorAPI,
    patientAPI,
    symptomsAPI,
} from '../services/api';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const FREQUENCIES = [
    'Once daily', 'Twice daily', 'Three times daily',
    'Every 4 hours', 'Every 6 hours', 'Every 8 hours',
    'Every 12 hours', 'Weekly', 'As needed (PRN)', 'Other',
];
const STATUSES = ['active', 'completed', 'paused', 'discontinued'];
const URGENCY_LEVELS = ['routine', 'soon', 'urgent'];

const URGENCY_META = {
    routine: { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', Icon: CheckIcon,   label: 'Routine' },
    soon:    { color: '#b45309', bg: '#fffbeb', border: '#fcd34d', Icon: WarningIcon, label: 'See Doctor Soon' },
    urgent:  { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', Icon: UrgentIcon,  label: 'See Doctor Immediately' },
};
const STATUS_META = {
    active:       { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', label: 'Active' },
    completed:    { color: '#1d4ed8', bg: '#eff6ff', border: '#93c5fd', label: 'Completed' },
    paused:       { color: '#b45309', bg: '#fffbeb', border: '#fcd34d', label: 'Paused' },
    discontinued: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'Discontinued' },
};

const BLANK_MED = {
    medicine_name: '', dosage: '', frequency: '', start_date: '',
    end_date: '', reason: '', status: 'active', notes: '', prescribed_by: '',
};
const BLANK_REC = {
    assessment: '', urgency_level: 'routine',
    lifestyle_recommendations: '', medical_advice: '',
    home_remedies: '', preventive_measures: '',
    doctor_consultation_needed: false, doctor_suggestions: [],
};

const fld = (disabled = false) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px', fontSize: '0.875rem',
        backgroundColor: disabled ? '#f9fafb' : '#fff',
        fontFamily: '"DM Sans",sans-serif',
        '&:hover fieldset':       { borderColor: disabled ? undefined : '#1d4ed8' },
        '&.Mui-focused fieldset': { borderColor: '#1d4ed8', borderWidth: '2px' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#1d4ed8' },
});

const FieldLabel = ({ children }) => (
    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#6b7280',
        textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>
        {children}
    </Typography>
);
const DField = ({ label, children }) => (
    <Box><FieldLabel>{label}</FieldLabel>{children}</Box>
);

const patientLabel = (p) =>
    (p.first_name || p.last_name)
        ? `${p.first_name || ''} ${p.last_name || ''}`.trim()
        : p.username ?? `Patient ${p.id}`;

// ✅ Shows top predicted disease as assessment name
const assessmentLabel = (a) => {
    const disease = a.predictions?.[0]?.disease || '';
    return disease ? `#${a.id} — ${disease}` : `#${a.id}`;
};

// ✅ Shows symptoms (underscore → space, max 3)
const symptomsText = (a) => {
    if (!Array.isArray(a.symptoms) || a.symptoms.length === 0) return '';
    return a.symptoms
        .slice(0, 3)
        .map(s => s.replace(/_/g, ' '))
        .join(', ') + (a.symptoms.length > 3 ? '…' : '');
};

const Empty = ({ label, onAdd }) => (
    <Box sx={{ py: 6, textAlign: 'center', border: '1.5px dashed #e5e7eb', borderRadius: '16px' }}>
        <MedIcon sx={{ fontSize: 40, color: '#e5e7eb', mb: 1 }} />
        <Typography sx={{ fontSize: '0.85rem', color: '#9ca3af', mb: 2 }}>No {label} found</Typography>
        {onAdd && (
            <Button size="small" startIcon={<AddIcon />} onClick={onAdd} variant="outlined"
                sx={{ borderRadius: '10px', fontWeight: 700, fontSize: '0.78rem' }}>
                Add {label}
            </Button>
        )}
    </Box>
);

const MedCard = ({ med, onEdit, onDelete, canEdit }) => {
    const sm = STATUS_META[med.status] || STATUS_META.active;
    const isActive = med.status === 'active';
    return (
        <Box sx={{
            p: 2.5, mb: 1.5, borderRadius: '16px',
            border: `1.5px solid ${sm.border}`, bgcolor: sm.bg,
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
        }}>
            <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                <Avatar sx={{ width: 44, height: 44, borderRadius: '12px',
                    bgcolor: isActive ? '#1e3a5f' : '#f1f5f9',
                    color:   isActive ? '#93c5fd' : '#9ca3af' }}>
                    <RxIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827', fontFamily: '"Sora",sans-serif' }}>
                            {med.medicine_name}
                        </Typography>
                        <Chip label={sm.label} size="small"
                            sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700,
                                bgcolor: `${sm.color}18`, color: sm.color, border: `1px solid ${sm.border}` }} />
                    </Box>
                    {med.patient_name && (
                        <Typography sx={{ fontSize: '0.72rem', color: '#6b7280', mt: 0.5 }}>
                            <PersonIcon sx={{ fontSize: 12, verticalAlign: 'middle' }} /> Patient: {med.patient_name}
                        </Typography>
                    )}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <DotIcon sx={{ fontSize: 8, color: sm.color }} />
                            <Typography sx={{ fontSize: '0.78rem', color: '#374151', fontWeight: 600 }}>{med.dosage}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ScheduleIcon sx={{ fontSize: 13, color: '#9ca3af' }} />
                            <Typography sx={{ fontSize: '0.78rem', color: '#6b7280' }}>{med.frequency}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalIcon sx={{ fontSize: 13, color: '#9ca3af' }} />
                            <Typography sx={{ fontSize: '0.78rem', color: '#6b7280' }}>
                                {med.start_date}{med.end_date ? ` → ${med.end_date}` : ''}
                            </Typography>
                        </Box>
                    </Box>
                    {med.reason && (
                        <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', mt: 0.5 }}>
                            <b>Reason:</b> {med.reason}
                        </Typography>
                    )}
                    {med.prescribed_by_name && (
                        <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af', mt: 0.3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PersonIcon sx={{ fontSize: 12 }} /> Dr. {med.prescribed_by_name}
                            {med.prescribed_by_specialization && (
                                <Chip label={med.prescribed_by_specialization} size="small"
                                    sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700, bgcolor: '#eff6ff', color: '#1d4ed8', ml: 0.5 }} />
                            )}
                        </Typography>
                    )}
                    {med.notes && (
                        <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af', mt: 0.3, fontStyle: 'italic' }}>
                            {med.notes}
                        </Typography>
                    )}
                </Box>
            </Box>
            {canEdit && (
                <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                    <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => onEdit(med)}
                            sx={{ borderRadius: '8px', '&:hover': { bgcolor: '#dbeafe' } }}>
                            <EditIcon sx={{ fontSize: 15, color: '#1d4ed8' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => onDelete(med.id)}
                            sx={{ borderRadius: '8px', '&:hover': { bgcolor: '#fee2e2' } }}>
                            <DeleteIcon sx={{ fontSize: 15, color: '#ef4444' }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
        </Box>
    );
};

const RecommendationCard = ({ rec, canEdit, onEdit, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const um = URGENCY_META[rec.urgency_level] || URGENCY_META.routine;
    const UIcon = um.Icon;

    const Section = ({ icon: Icon, title, content, color = '#1d4ed8' }) => (
        <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Icon sx={{ fontSize: 16, color }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {title}
                </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.82rem', color: '#4b5563', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {content}
            </Typography>
        </Box>
    );

    return (
        <Box sx={{ mb: 2, borderRadius: '16px', border: `1.5px solid ${um.border}`,
            overflow: 'hidden', transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' } }}>
            <Box sx={{ p: 2.5, bgcolor: um.bg, display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: `${um.color}20` }}>
                        <UIcon sx={{ fontSize: 20, color: um.color }} />
                    </Avatar>
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827', fontFamily: '"Sora",sans-serif' }}>
                            Assessment #{rec.assessment_id || rec.assessment}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#6b7280' }}>
                            {rec.patient_name && `for ${rec.patient_name}`}
                            {' • '}
                            {new Date(rec.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={um.label} size="small"
                        sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700,
                            bgcolor: `${um.color}15`, color: um.color, border: `1px solid ${um.border}` }} />
                    {rec.doctor_consultation_needed && (
                        <Chip icon={<HospitalIcon sx={{ fontSize: 12 }} />} label="Doctor Needed" size="small"
                            sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700,
                                bgcolor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }} />
                    )}
                </Box>
            </Box>
            {expanded && (
                <Box sx={{ p: 2.5, bgcolor: 'white', position: 'relative' }}>
                    {canEdit && (
                        <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Edit">
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(rec); }}
                                    sx={{ borderRadius: '8px', '&:hover': { bgcolor: '#dbeafe' } }}>
                                    <EditIcon sx={{ fontSize: 15, color: '#1d4ed8' }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(rec.id); }}
                                    sx={{ borderRadius: '8px', '&:hover': { bgcolor: '#fee2e2' } }}>
                                    <DeleteIcon sx={{ fontSize: 15, color: '#ef4444' }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                    <Section icon={TipIcon}      title="Lifestyle Recommendations" content={rec.lifestyle_recommendations} color="#059669" />
                    <Section icon={HealingIcon}  title="Medical Advice"            content={rec.medical_advice}            color="#1d4ed8" />
                    <Section icon={HospitalIcon} title="Home Remedies"             content={rec.home_remedies}             color="#7c3aed" />
                    <Section icon={CheckIcon}    title="Preventive Measures"       content={rec.preventive_measures}       color="#0891b2" />
                    {rec.doctor_suggestions?.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <DoctorIcon sx={{ fontSize: 16, color: '#1d4ed8' }} />
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Suggested Specialists
                                </Typography>
                            </Box>
                            {rec.doctor_suggestions.map((ds, i) => (
                                <Box key={i} sx={{ p: 2, mb: 1, borderRadius: '10px', bgcolor: '#eff6ff',
                                    border: '1px solid #bfdbfe', display: 'flex', gap: 1.5 }}>
                                    <Avatar sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#1d4ed8', fontSize: '0.7rem', fontWeight: 800 }}>
                                        {ds.specialization?.[0]}
                                    </Avatar>
                                    <Box>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e3a5f' }}>{ds.specialization}</Typography>
                                        <Typography sx={{ fontSize: '0.75rem', color: '#6b7280' }}>{ds.reason}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

const MedicationPage = () => {
    const { user } = useAuth();
    const isDoctor = user?.role === 'doctor';

    const [tab,               setTab]               = useState(0);
    const [medications,       setMedications]       = useState([]);
    const [recommendations,   setRecommendations]   = useState([]);
    const [assessments,       setAssessments]       = useState([]);
    const [loading,           setLoading]           = useState(false);
    const [recLoading,        setRecLoading]        = useState(false);
    const [error,             setError]             = useState(null);
    const [success,           setSuccess]           = useState('');
    const [patients,          setPatients]          = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [currentDoctor,     setCurrentDoctor]     = useState(null);
    const [medDialog, setMedDialog] = useState({ open: false, data: null });
    const [recDialog, setRecDialog] = useState({ open: false, data: null });
    const [medForm,   setMedForm]   = useState(BLANK_MED);
    const [recForm,   setRecForm]   = useState(BLANK_REC);
    const [saving,    setSaving]    = useState(false);
    const [filter,    setFilter]    = useState('all');

    const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); };

    const fetchMedications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await medicationAPI.getAll();
            setMedications(res.data);
        } catch (e) {
            setError('Failed to load medications.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCurrentDoctor = useCallback(async () => {
        if (!isDoctor) return;
        try {
            const res = await doctorAPI.getCurrentDoctor();
            setCurrentDoctor(res.data);
        } catch (e) {
            console.error('Could not load doctor profile:', e);
        }
    }, [isDoctor]);

    const fetchPatients = useCallback(async () => {
        if (!isDoctor) return;
        try {
            const res = await patientAPI.getAll();
            setPatients(res.data);
            if (res.data.length > 0) setSelectedPatientId(res.data[0].id);
        } catch (e) {
            console.error('Could not load patients:', e);
        }
    }, [isDoctor]);

    const fetchRecommendations = useCallback(async () => {
        setRecLoading(true);
        try {
            const res = await recommendationAPI.getRecommendations();
            setRecommendations(res.data);
        } catch (e) {
            setError('Failed to load recommendations.');
        } finally {
            setRecLoading(false);
        }
    }, []);

    // ✅ For doctor: fetch selected patient's assessments; for patient: fetch own
    const fetchAssessments = useCallback(async () => {
        try {
            let res;
            if (isDoctor && selectedPatientId) {
                res = await api.get(`/symptoms/assessments/?user=${selectedPatientId}`);
            } else {
                res = await symptomsAPI.getAssessmentHistory();
            }
            setAssessments(res.data);
        } catch (e) {
            console.error('Could not load assessments:', e.response?.data);
        }
    }, [isDoctor, selectedPatientId]);

    useEffect(() => {
        fetchMedications();
        fetchCurrentDoctor();
        if (isDoctor) fetchPatients();
    }, [fetchMedications, fetchCurrentDoctor, fetchPatients, isDoctor]);

    useEffect(() => {
        if (tab === 1) {
            fetchRecommendations();
            fetchAssessments();
        }
    }, [tab, fetchRecommendations, fetchAssessments, selectedPatientId]);

    const openMedDialog = (existing = null) => {
        if (existing) {
            setMedForm({
                medicine_name: existing.medicine_name || '',
                dosage:        existing.dosage        || '',
                frequency:     existing.frequency     || '',
                start_date:    existing.start_date    || '',
                end_date:      existing.end_date      || '',
                reason:        existing.reason        || '',
                status:        existing.status        || 'active',
                notes:         existing.notes         || '',
                prescribed_by: existing.prescribed_by ?? '',
            });
        } else {
            setMedForm({ ...BLANK_MED, prescribed_by: currentDoctor?.id ?? '' });
        }
        setError(null);
        setMedDialog({ open: true, data: existing });
    };
    const closeMedDialog = () => { setMedDialog({ open: false, data: null }); setError(null); };

    const openRecDialog = (existing = null) => {
        if (existing) {
            setRecForm({
                assessment:                 existing.assessment                 || '',
                urgency_level:              existing.urgency_level              || 'routine',
                lifestyle_recommendations:  existing.lifestyle_recommendations  || '',
                medical_advice:             existing.medical_advice             || '',
                home_remedies:              existing.home_remedies              || '',
                preventive_measures:        existing.preventive_measures        || '',
                doctor_consultation_needed: existing.doctor_consultation_needed || false,
                doctor_suggestions:         existing.doctor_suggestions         || [],
            });
        } else {
            setRecForm({ ...BLANK_REC });
        }
        fetchAssessments(); // reload when dialog opens
        setError(null);
        setRecDialog({ open: true, data: existing });
    };
    const closeRecDialog = () => { setRecDialog({ open: false, data: null }); setError(null); };

    const handleSaveMed = async () => {
        if (!medForm.medicine_name.trim()) return setError('Medicine name is required.');
        if (!medForm.dosage.trim())        return setError('Dosage is required.');
        if (!medForm.frequency)            return setError('Frequency is required.');
        if (!medForm.start_date)           return setError('Start date is required.');
        if (!medForm.reason.trim())        return setError('Reason is required.');
        if (isDoctor && !selectedPatientId) return setError('Please select a patient.');

        setError(null);
        setSaving(true);
        try {
            const payload = {
                medicine_name: medForm.medicine_name,
                dosage:        medForm.dosage,
                frequency:     medForm.frequency,
                start_date:    medForm.start_date,
                end_date:      medForm.end_date || null,
                reason:        medForm.reason,
                status:        medForm.status,
                notes:         medForm.notes || '',
                prescribed_by: currentDoctor?.id ?? null,
                patient:       isDoctor && selectedPatientId ? Number(selectedPatientId) : undefined,
            };
            if (medDialog.data?.id) {
                await medicationAPI.update(medDialog.data.id, payload);
                flash('Medication updated!');
            } else {
                await medicationAPI.create(payload);
                flash('Medication added!');
            }
            closeMedDialog();
            fetchMedications();
        } catch (e) {
            const data = e.response?.data;
            setError(data ? Object.values(data).flat().join(' ') : 'Could not save medication.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteMed = async (id) => {
        if (!window.confirm('Delete this medication?')) return;
        try {
            await medicationAPI.remove(id);
            flash('Medication deleted.');
            fetchMedications();
        } catch (e) {
            setError('Could not delete medication.');
        }
    };

    const handleSaveRec = async () => {
        if (!recForm.assessment)                       return setError('Please select an assessment.');
        if (!recForm.lifestyle_recommendations.trim()) return setError('Lifestyle recommendations is required.');
        setError(null);
        setSaving(true);
        try {
            const payload = {
                ...recForm,
                patient: isDoctor && selectedPatientId ? selectedPatientId : (user?.id || null),
            };
            if (recDialog.data?.id) {
                await recommendationAPI.update(recDialog.data.id, payload);
                flash('Recommendation updated!');
            } else {
                await recommendationAPI.create(payload);
                flash('Recommendation added!');
            }
            closeRecDialog();
            fetchRecommendations();
        } catch (e) {
            const data = e.response?.data;
            setError(data ? Object.values(data).flat().join(' ') : 'Could not save recommendation.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRec = async (id) => {
        if (!window.confirm('Delete this recommendation?')) return;
        try {
            await recommendationAPI.remove(id);
            flash('Recommendation deleted.');
            fetchRecommendations();
        } catch (e) {
            setError('Could not delete recommendation.');
        }
    };

    const filtered = filter === 'all' ? medications : medications.filter(m => m.status === filter);
    const stats = {
        total:        medications.length,
        active:       medications.filter(m => m.status === 'active').length,
        completed:    medications.filter(m => m.status === 'completed').length,
        discontinued: medications.filter(m => m.status === 'discontinued').length,
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9', fontFamily: '"DM Sans",sans-serif' }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap" rel="stylesheet" />

            <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, minWidth: 300 }}>
                {success && (
                    <Alert severity="success" onClose={() => setSuccess('')}
                        sx={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
                        {success}
                    </Alert>
                )}
                {error && !medDialog.open && !recDialog.open && (
                    <Alert severity="error" onClose={() => setError(null)}
                        sx={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', mt: 1 }}>
                        {error}
                    </Alert>
                )}
            </Box>

            <Box sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.6rem', color: '#0f172a', fontFamily: '"Sora",sans-serif', lineHeight: 1.2 }}>
                            Medications & Recommendations
                        </Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: '#6b7280', mt: 0.5 }}>
                            {isDoctor ? 'Manage patient medications and health recommendations' : 'View your prescribed medications and health recommendations'}
                        </Typography>
                    </Box>
                </Box>

                {isDoctor && patients.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <DField label="Select Patient">
                            <TextField fullWidth select size="small" sx={fld()}
                                value={selectedPatientId || ''}
                                onChange={(e) => setSelectedPatientId(Number(e.target.value))}>
                                {patients.map((p) => (
                                    <MenuItem key={p.id} value={p.id}>{patientLabel(p)}</MenuItem>
                                ))}
                            </TextField>
                        </DField>
                    </Box>
                )}

                {tab === 0 && (
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {[
                            { label: 'Total',        value: stats.total,        color: '#1d4ed8', bg: '#eff6ff' },
                            { label: 'Active',       value: stats.active,       color: '#059669', bg: '#ecfdf5' },
                            { label: 'Completed',    value: stats.completed,    color: '#7c3aed', bg: '#f5f3ff' },
                            { label: 'Discontinued', value: stats.discontinued, color: '#dc2626', bg: '#fef2f2' },
                        ].map((s) => (
                            <Grid item xs={6} sm={3} key={s.label}>
                                <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', p: 2, textAlign: 'center', bgcolor: s.bg }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: '1.8rem', color: s.color, fontFamily: '"Sora",sans-serif', lineHeight: 1 }}>{s.value}</Typography>
                                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#6b7280', mt: 0.4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</Typography>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <Box sx={{ borderBottom: '1px solid #f1f5f9', px: 2 }}>
                        <Tabs value={tab} onChange={(_, v) => setTab(v)}
                            sx={{
                                '& .MuiTab-root': { fontFamily: '"DM Sans",sans-serif', fontWeight: 700, fontSize: '0.82rem', textTransform: 'none', minHeight: 48 },
                                '& .Mui-selected': { color: '#1d4ed8' },
                                '& .MuiTabs-indicator': { bgcolor: '#1d4ed8', height: 3, borderRadius: '3px 3px 0 0' },
                            }}>
                            <Tab label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <RxIcon sx={{ fontSize: 16 }} /> Medications
                                    <Box sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontSize: '0.65rem', fontWeight: 700, px: 0.8, borderRadius: '10px' }}>{stats.active}</Box>
                                </Box>
                            } />
                            <Tab label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TipIcon sx={{ fontSize: 16 }} /> Recommendations
                                    <Box sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontSize: '0.65rem', fontWeight: 700, px: 0.8, borderRadius: '10px' }}>{recommendations.length}</Box>
                                </Box>
                            } />
                        </Tabs>
                    </Box>

                    {tab === 0 && (
                        <Box sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {['all', ...STATUSES].map((f) => {
                                        const isSelected = filter === f;
                                        const meta = STATUS_META[f];
                                        return (
                                            <Chip key={f}
                                                label={f === 'all' ? `All (${stats.total})` : `${meta?.label} (${medications.filter(m => m.status === f).length})`}
                                                onClick={() => setFilter(f)} size="small"
                                                sx={{ fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer',
                                                    bgcolor: isSelected ? (meta?.bg || '#f1f5f9') : 'white',
                                                    color:   isSelected ? (meta?.color || '#374151') : '#6b7280',
                                                    border:  `1.5px solid ${isSelected ? (meta?.border || '#e2e8f0') : '#e5e7eb'}` }} />
                                        );
                                    })}
                                </Box>
                                {isDoctor && (
                                    <Button onClick={() => openMedDialog()} startIcon={<AddIcon />} variant="contained"
                                        sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: '#0f172a', px: 2 }}>
                                        Add Medication
                                    </Button>
                                )}
                            </Box>
                            {loading
                                ? <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress size={28} /></Box>
                                : filtered.length === 0
                                    ? <Empty label="medications" onAdd={isDoctor ? () => openMedDialog() : undefined} />
                                    : filtered.map((med) => (
                                        <MedCard key={med.id} med={med}
                                            onEdit={isDoctor ? openMedDialog : undefined}
                                            onDelete={isDoctor ? handleDeleteMed : undefined}
                                            canEdit={isDoctor} />
                                    ))
                            }
                        </Box>
                    )}

                    {tab === 1 && (
                        <Box sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2.5 }}>
                                {isDoctor && (
                                    <Button onClick={() => openRecDialog()} startIcon={<AddIcon />} variant="contained"
                                        sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: '#0f172a', px: 2 }}>
                                        Add Recommendation
                                    </Button>
                                )}
                            </Box>
                            {recLoading
                                ? <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress size={28} /></Box>
                                : recommendations.length === 0
                                    ? <Empty label="recommendations" onAdd={isDoctor ? () => openRecDialog() : undefined} />
                                    : recommendations.map((rec) => (
                                        <RecommendationCard key={rec.id} rec={rec}
                                            canEdit={isDoctor}
                                            onEdit={isDoctor ? openRecDialog : undefined}
                                            onDelete={isDoctor ? handleDeleteRec : undefined} />
                                    ))
                            }
                        </Box>
                    )}
                </Card>
            </Box>

            {/* ════════════ MEDICATION DIALOG ════════════ */}
            <Dialog open={medDialog.open} onClose={closeMedDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RxIcon sx={{ color: '#1d4ed8', fontSize: 20 }} />
                        <Typography sx={{ fontWeight: 800, fontFamily: '"Sora",sans-serif' }}>
                            {medDialog.data ? 'Edit Medication' : 'Add Medication'}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={closeMedDialog}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
                </DialogTitle>
                <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSaveMed(); }}>
                    <DialogContent sx={{ pt: 1 }}>
                        {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={8}>
                                <DField label="Medicine Name *">
                                    <TextField fullWidth size="small" sx={fld()} value={medForm.medicine_name}
                                        onChange={(e) => setMedForm(p => ({ ...p, medicine_name: e.target.value }))} />
                                </DField>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <DField label="Dosage *">
                                    <TextField fullWidth size="small" sx={fld()} placeholder="e.g. 500mg" value={medForm.dosage}
                                        onChange={(e) => setMedForm(p => ({ ...p, dosage: e.target.value }))} />
                                </DField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DField label="Frequency *">
                                    <TextField fullWidth select size="small" sx={fld()} value={medForm.frequency}
                                        onChange={(e) => setMedForm(p => ({ ...p, frequency: e.target.value }))}>
                                        <MenuItem value="">Select frequency</MenuItem>
                                        {FREQUENCIES.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                                    </TextField>
                                </DField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DField label="Status">
                                    <TextField fullWidth select size="small" sx={fld()} value={medForm.status}
                                        onChange={(e) => setMedForm(p => ({ ...p, status: e.target.value }))}>
                                        {STATUSES.map(s => <MenuItem key={s} value={s}>{STATUS_META[s].label}</MenuItem>)}
                                    </TextField>
                                </DField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DField label="Start Date *">
                                    <TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }}
                                        sx={fld()} value={medForm.start_date}
                                        onChange={(e) => setMedForm(p => ({ ...p, start_date: e.target.value }))} />
                                </DField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DField label="End Date">
                                    <TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }}
                                        sx={fld()} value={medForm.end_date}
                                        onChange={(e) => setMedForm(p => ({ ...p, end_date: e.target.value }))} />
                                </DField>
                            </Grid>
                            <Grid item xs={12}>
                                <DField label="Reason / Condition *">
                                    <TextField fullWidth size="small" sx={fld()} placeholder="e.g. Hypertension, Diabetes"
                                        value={medForm.reason}
                                        onChange={(e) => setMedForm(p => ({ ...p, reason: e.target.value }))} />
                                </DField>
                            </Grid>
                            {isDoctor && (
                                <Grid item xs={12}>
                                    <DField label="Patient *">
                                        <TextField fullWidth select size="small" sx={fld()}
                                            value={selectedPatientId || ''}
                                            onChange={(e) => setSelectedPatientId(Number(e.target.value))}>
                                            <MenuItem value="">Select patient</MenuItem>
                                            {patients.map((p) => (
                                                <MenuItem key={p.id} value={p.id}>{patientLabel(p)}</MenuItem>
                                            ))}
                                        </TextField>
                                    </DField>
                                </Grid>
                            )}
                            {/* ✅ Read-only prescribed by box */}
                            <Grid item xs={12}>
                                <DField label="Prescribed By">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
                                        borderRadius: '10px', border: '1.5px solid #e2e8f0', bgcolor: '#f9fafb' }}>
                                        <Avatar sx={{ width: 34, height: 34, borderRadius: '8px',
                                            bgcolor: '#1e3a5f', color: '#93c5fd', fontSize: '0.75rem', fontWeight: 800 }}>
                                            {currentDoctor?.doctor_name?.[0] || user?.first_name?.[0] || 'D'}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            {currentDoctor ? (
                                                <>
                                                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                                                        Dr. {currentDoctor.doctor_name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '0.72rem', color: '#6b7280' }}>
                                                        {currentDoctor.specialization}
                                                    </Typography>
                                                </>
                                            ) : (
                                                <Typography sx={{ fontSize: '0.82rem', color: '#9ca3af', fontStyle: 'italic' }}>
                                                    Loading doctor profile…
                                                </Typography>
                                            )}
                                        </Box>
                                        <LockIcon sx={{ fontSize: 14, color: '#d1d5db' }} />
                                    </Box>
                                </DField>
                            </Grid>
                            <Grid item xs={12}>
                                <DField label="Notes (optional)">
                                    <TextField fullWidth multiline rows={2} size="small" sx={fld()}
                                        placeholder="Any additional notes..." value={medForm.notes}
                                        onChange={(e) => setMedForm(p => ({ ...p, notes: e.target.value }))} />
                                </DField>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                        <Button type="button" onClick={closeMedDialog}
                            sx={{ borderRadius: '10px', fontWeight: 700, color: '#6b7280', border: '1px solid #e2e8f0' }}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={saving}
                            sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: '#0f172a', px: 3, boxShadow: 'none' }}>
                            {saving ? <CircularProgress size={16} color="inherit" /> : medDialog.data ? 'Update' : 'Add Medication'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* ════════════ RECOMMENDATION DIALOG ════════════ */}
            <Dialog open={recDialog.open} onClose={closeRecDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TipIcon sx={{ color: '#1d4ed8', fontSize: 20 }} />
                        <Typography sx={{ fontWeight: 800, fontFamily: '"Sora",sans-serif' }}>
                            {recDialog.data ? 'Edit Recommendation' : 'Add Recommendation'}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={closeRecDialog}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
                </DialogTitle>
                <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSaveRec(); }}>
                    <DialogContent sx={{ pt: 1 }}>
                        {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}
                        <Grid container spacing={2}>

                            {/* ✅ Assessment dropdown — disease name + symptoms + date */}
                            <Grid item xs={12} sm={6}>
                                <DField label="Assessment *">
                                    <TextField fullWidth select size="small" sx={fld()}
                                        value={recForm.assessment}
                                        onChange={(e) => setRecForm(p => ({ ...p, assessment: e.target.value }))}
                                        SelectProps={{ displayEmpty: true }}>
                                        <MenuItem value="" disabled>Select an assessment</MenuItem>
                                        {assessments.length === 0 ? (
                                            <MenuItem disabled value="">
                                                <Typography sx={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic' }}>
                                                    {isDoctor ? 'No assessments for selected patient' : 'No assessments found'}
                                                </Typography>
                                            </MenuItem>
                                        ) : (
                                            assessments.map((a) => (
                                                <MenuItem key={a.id} value={a.id}>
                                                    <Box>
                                                        {/* e.g. #20 — Diabetes */}
                                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>
                                                            {assessmentLabel(a)}
                                                        </Typography>
                                                        {/* e.g. distention of abdomen, increased appetite… · May 22, 2026 */}
                                                        <Typography sx={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                                                            {symptomsText(a)}
                                                            {symptomsText(a) && ' · '}
                                                            {a.created_at && new Date(a.created_at).toLocaleDateString('en-US', {
                                                                year: 'numeric', month: 'short', day: 'numeric',
                                                            })}
                                                        </Typography>
                                                    </Box>
                                                </MenuItem>
                                            ))
                                        )}
                                    </TextField>
                                </DField>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <DField label="Urgency Level *">
                                    <TextField fullWidth select size="small" sx={fld()} value={recForm.urgency_level}
                                        onChange={(e) => setRecForm(p => ({ ...p, urgency_level: e.target.value }))}>
                                        {URGENCY_LEVELS.map(level => (
                                            <MenuItem key={level} value={level}>{URGENCY_META[level].label}</MenuItem>
                                        ))}
                                    </TextField>
                                </DField>
                            </Grid>
                            <Grid item xs={12}>
                                <DField label="Lifestyle Recommendations *">
                                    <TextField fullWidth multiline rows={3} size="small" sx={fld()}
                                        placeholder="Diet, exercise, sleep, stress management..."
                                        value={recForm.lifestyle_recommendations}
                                        onChange={(e) => setRecForm(p => ({ ...p, lifestyle_recommendations: e.target.value }))} />
                                </DField>
                            </Grid>
                            <Grid item xs={12}>
                                <DField label="Medical Advice">
                                    <TextField fullWidth multiline rows={3} size="small" sx={fld()}
                                        placeholder="Medical guidance, medication instructions..."
                                        value={recForm.medical_advice}
                                        onChange={(e) => setRecForm(p => ({ ...p, medical_advice: e.target.value }))} />
                                </DField>
                            </Grid>
                            <Grid item xs={12}>
                                <DField label="Home Remedies">
                                    <TextField fullWidth multiline rows={2} size="small" sx={fld()}
                                        placeholder="Natural remedies, self-care tips..."
                                        value={recForm.home_remedies}
                                        onChange={(e) => setRecForm(p => ({ ...p, home_remedies: e.target.value }))} />
                                </DField>
                            </Grid>
                            <Grid item xs={12}>
                                <DField label="Preventive Measures">
                                    <TextField fullWidth multiline rows={2} size="small" sx={fld()}
                                        placeholder="How to prevent symptoms from worsening..."
                                        value={recForm.preventive_measures}
                                        onChange={(e) => setRecForm(p => ({ ...p, preventive_measures: e.target.value }))} />
                                </DField>
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Checkbox
                                        checked={recForm.doctor_consultation_needed}
                                        onChange={(e) => setRecForm(p => ({ ...p, doctor_consultation_needed: e.target.checked }))}
                                        color="error" />
                                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>Doctor consultation needed</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                        <Button type="button" onClick={closeRecDialog}
                            sx={{ borderRadius: '10px', fontWeight: 700, color: '#6b7280', border: '1px solid #e2e8f0' }}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={saving}
                            sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: '#0f172a', px: 3, boxShadow: 'none' }}>
                            {saving ? <CircularProgress size={16} color="inherit" /> : recDialog.data ? 'Update' : 'Add Recommendation'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
};

export default MedicationPage;