import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Container,
    Box,
    Card,
    Typography,
    Grid,
    Button,
    Chip,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Divider,
    Alert,
    Tabs,
    Tab,
    Avatar,
} from '@mui/material';

import {
    CalendarMonth as CalIcon,
    Add as AddIcon,
    AccessTime as TimeIcon,
    LocationOn as LocIcon,
    Person as DoctorIcon,
    CheckCircle as ConfirmedIcon,
    Schedule as PendingIcon,
    Cancel as CancelledIcon,
    EventAvailable as AvailIcon,
} from '@mui/icons-material';

import API from '../services/api';

const STATUS_STYLE = {
    pending: {
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.1)',
        icon: <PendingIcon sx={{ fontSize: 16 }} />,
    },
    confirmed: {
        color: '#10b981',
        bg: 'rgba(16,185,129,0.1)',
        icon: <ConfirmedIcon sx={{ fontSize: 16 }} />,
    },
    cancelled: {
        color: '#ef4444',
        bg: 'rgba(239,68,68,0.1)',
        icon: <CancelledIcon sx={{ fontSize: 16 }} />,
    },
    completed: {
        color: '#2563eb',
        bg: 'rgba(37,99,235,0.1)',
        icon: <ConfirmedIcon sx={{ fontSize: 16 }} />,
    },
};

const fs = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: '#f8fafc',
        '&:hover fieldset': {
            borderColor: '#2563eb',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#2563eb',
            borderWidth: 2,
        },
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: '#2563eb',
    },
};

const formatDate = (date) =>
    new Date(date).toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

const normalizeStatus = (status) => {
    if (!status) return '';
    return status.toLowerCase();
};

const AppointmentCard = ({ appt, onCancel, onConfirm, isDoctor }) => {
    const status = normalizeStatus(appt.status);
    const st = STATUS_STYLE[status] || STATUS_STYLE.pending;

    const initials =
        appt.doctor_name
            ?.split(' ')
            ?.map((n) => n[0])
            ?.join('')
            ?.toUpperCase() || 'DR';

    return (
        <Card
            sx={{
                borderRadius: '18px',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: 'none',
                p: 3,
                transition: 'all 0.2s',
                '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                    flexWrap: 'wrap',
                    gap: 1,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                        sx={{
                            width: 44,
                            height: 44,
                            bgcolor: 'rgba(37,99,235,0.12)',
                            color: '#2563eb',
                            fontWeight: 700,
                        }}
                    >
                        {initials}
                    </Avatar>
                    <Box>
                        <Typography
                            sx={{
                                fontWeight: 700,
                                color: '#0f172a',
                                fontSize: '0.95rem',
                            }}
                        >
                            Dr. {appt.doctor_name}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: '0.78rem',
                                color: '#64748b',
                            }}
                        >
                            {appt.specialization}
                        </Typography>
                    </Box>
                </Box>

                <Chip
                    label={appt.status}
                    icon={
                        <Box
                            sx={{
                                color: st.color,
                                display: 'flex',
                                pl: 0.5,
                            }}
                        >
                            {st.icon}
                        </Box>
                    }
                    size="small"
                    sx={{
                        bgcolor: st.bg,
                        color: st.color,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        height: 26,
                        textTransform: 'capitalize',
                    }}
                />
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Grid container spacing={1.5}>
                <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <CalIcon sx={{ fontSize: 15, color: '#94a3b8' }} />
                        <Typography sx={{ fontSize: '0.8rem', color: '#475569' }}>
                            {formatDate(appt.appointment_date)}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <TimeIcon sx={{ fontSize: 15, color: '#94a3b8' }} />
                        <Typography sx={{ fontSize: '0.8rem', color: '#475569' }}>
                            {formatTime(appt.appointment_date)}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <LocIcon sx={{ fontSize: 15, color: '#94a3b8' }} />
                        <Typography sx={{ fontSize: '0.8rem', color: '#475569' }}>
                            {appt.hospital_name}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <DoctorIcon sx={{ fontSize: 15, color: '#94a3b8' }} />
                        <Typography sx={{ fontSize: '0.8rem', color: '#475569' }}>
                            Reason: {appt.reason}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            {/* Doctor: Confirm + Cancel for pending status */}
            {isDoctor && status === 'pending' && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                        size="small"
                        variant="contained"
                        onClick={() => onConfirm(appt.id)}
                        sx={{
                            borderRadius: '10px',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            background:
                                'linear-gradient(135deg,#10b981,#059669)',
                            flex: 1,
                        }}
                    >
                        Confirm
                    </Button>

                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onCancel(appt.id)}
                        sx={{
                            borderRadius: '10px',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            borderColor: '#fecaca',
                            color: '#ef4444',
                            '&:hover': {
                                borderColor: '#ef4444',
                                bgcolor: 'rgba(239,68,68,0.05)',
                            },
                            flex: 1,
                        }}
                    >
                        Cancel
                    </Button>
                </Box>
            )}

            {/* Doctor: Cancel only for confirmed status */}
            {isDoctor && status === 'confirmed' && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onCancel(appt.id)}
                        sx={{
                            borderRadius: '10px',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            borderColor: '#fecaca',
                            color: '#ef4444',
                            '&:hover': {
                                borderColor: '#ef4444',
                                bgcolor: 'rgba(239,68,68,0.05)',
                            },
                            flex: 1,
                        }}
                    >
                        Cancel
                    </Button>
                </Box>
            )}

            {/* Patient/Nurse: Cancel only for pending/confirmed */}
            {!isDoctor &&
                (status === 'pending' || status === 'confirmed') && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onCancel(appt.id)}
                            sx={{
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontSize: '0.78rem',
                                borderColor: '#fecaca',
                                color: '#ef4444',
                                '&:hover': {
                                    borderColor: '#ef4444',
                                    bgcolor: 'rgba(239,68,68,0.05)',
                                },
                                flex: 1,
                            }}
                        >
                            Cancel
                        </Button>
                    </Box>
                )}
        </Card>
    );
};

const AppointmentPage = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState(0);
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [dialog, setDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        doctor: '',
        date: '',
        time: '',
        reason: '',
    });

    const role = user?.role?.toLowerCase() || 'patient';
    const isDoctor = role === 'doctor';

    useEffect(() => {
        fetchAppointments();
        if (!isDoctor) {
            fetchDoctors();
        }
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await API.get('appointments/');
            setAppointments(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load appointments.');
        }
    };

    const fetchDoctors = async () => {
        try {
            const res = await API.get('users/doctors/');
            setDoctors(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleBook = async () => {
        try {
            setLoading(true);
            setError('');

            if (!form.doctor || !form.date || !form.time || !form.reason) {
                setError('Please fill all fields.');
                return;
            }

            const payload = {
                doctor: Number(form.doctor),
                appointment_date: new Date(
                    `${form.date}T${form.time}:00`
                ).toISOString(),
                duration_minutes: 30,
                reason: form.reason,
            };

            await API.post('appointments/', payload);
            await fetchAppointments();

            setDialog(false);
            setSuccess('Appointment booked successfully!');
            setForm({
                doctor: '',
                date: '',
                time: '',
                reason: '',
            });

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error(err);
            setError(
                err?.response?.data?.detail ||
                    err?.response?.data?.message ||
                    'Failed to book appointment.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        try {
            setError('');
            await API.post(`appointments/${id}/cancel/`);
            await fetchAppointments();
            setSuccess('Appointment cancelled successfully!');
            setTimeout(() => setSuccess(''), 2500);
        } catch (err) {
            console.error(err);
            setError('Failed to cancel appointment.');
        }
    };

    const handleConfirm = async (id) => {
        try {
            setError('');
            await API.post(`appointments/${id}/confirm/`);
            await fetchAppointments();
            setSuccess('Appointment confirmed successfully!');
            setTimeout(() => setSuccess(''), 2500);
        } catch (err) {
            console.error(err);
            setError('Failed to confirm appointment.');
        }
    };

    const upcoming = appointments.filter((a) =>
        ['pending', 'confirmed'].includes(normalizeStatus(a.status))
    );

    const past = appointments.filter((a) =>
        ['completed', 'cancelled'].includes(normalizeStatus(a.status))
    );

    const displayed = tab === 0 ? upcoming : past;

    return (
        <Container maxWidth="lg" sx={{ py: 5 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 4,
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                <Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            mb: 0.5,
                        }}
                    >
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: '13px',
                                background:
                                    'linear-gradient(135deg,#0ea5e9,#2563eb)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <CalIcon sx={{ color: '#fff', fontSize: 22 }} />
                        </Box>
                        <Typography
                            sx={{
                                fontWeight: 700,
                                fontSize: '1.6rem',
                                color: '#0f172a',
                            }}
                        >
                            Appointments
                        </Typography>
                    </Box>
                    <Typography
                        sx={{
                            fontSize: '0.875rem',
                            color: '#64748b',
                            ml: 7,
                        }}
                    >
                        Manage your doctor visits and consultations
                    </Typography>
                </Box>

                {!isDoctor && (
                    <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        onClick={() => {
                            setError('');
                            setDialog(true);
                        }}
                        sx={{
                            borderRadius: '12px',
                            fontWeight: 700,
                            background:
                                'linear-gradient(135deg,#0ea5e9,#2563eb)',
                        }}
                    >
                        Book Appointment
                    </Button>
                )}
            </Box>

            {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                    {success}
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                    {error}
                </Alert>
            )}

            <Box
                sx={{
                    borderBottom: '1px solid #f1f5f9',
                    mb: 3,
                }}
            >
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                        },
                        '& .MuiTabs-indicator': {
                            bgcolor: '#2563eb',
                        },
                    }}
                >
                    <Tab
                        label={`Upcoming (${upcoming.length})`}
                        icon={<AvailIcon sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                    />
                    <Tab
                        label={`Past (${past.length})`}
                        icon={<CalIcon sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                    />
                </Tabs>
            </Box>

            {displayed.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CalIcon sx={{ fontSize: 56, color: '#e2e8f0', mb: 2 }} />
                    <Typography
                        sx={{ fontWeight: 600, color: '#94a3b8', mb: 1 }}
                    >
                        No {tab === 0 ? 'upcoming' : 'past'} appointments
                    </Typography>

                    {!isDoctor && tab === 0 && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setDialog(true)}
                            sx={{
                                mt: 2,
                                borderRadius: '12px',
                                fontWeight: 700,
                                background:
                                    'linear-gradient(135deg,#0ea5e9,#2563eb)',
                            }}
                        >
                            Book your first appointment
                        </Button>
                    )}
                </Box>
            ) : (
                <Grid container spacing={2.5}>
                    {displayed.map((a) => (
                        <Grid item xs={12} md={6} key={a.id}>
                            <AppointmentCard
                                appt={a}
                                onCancel={handleCancel}
                                onConfirm={handleConfirm}
                                isDoctor={isDoctor}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {!isDoctor && (
                <Dialog
                    open={dialog}
                    onClose={() => setDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
                >
                    <DialogTitle sx={{ fontWeight: 700 }}>
                        Book Appointment
                    </DialogTitle>

                    <DialogContent sx={{ pt: '12px !important' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Doctor"
                                    name="doctor"
                                    value={form.doctor}
                                    onChange={handleChange}
                                    sx={fs}
                                >
                                    <MenuItem value="">
                                        Select Doctor
                                    </MenuItem>
                                    {doctors.map((doctor) => (
                                        <MenuItem
                                            key={doctor.id}
                                            value={String(doctor.id)}
                                        >
                                            {doctor.doctor_name} -{' '}
                                            {doctor.specialization}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Date"
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    sx={fs}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Time"
                                    type="time"
                                    name="time"
                                    value={form.time}
                                    onChange={handleChange}
                                    sx={fs}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Reason"
                                    name="reason"
                                    value={form.reason}
                                    onChange={handleChange}
                                    sx={fs}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setDialog(false)}>
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleBook}
                            disabled={
                                loading ||
                                !form.doctor ||
                                !form.date ||
                                !form.time ||
                                !form.reason
                            }
                        >
                            {loading ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : (
                                'Confirm Booking'
                            )}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Container>
    );
};

export default AppointmentPage;