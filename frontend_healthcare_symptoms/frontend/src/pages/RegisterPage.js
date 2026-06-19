import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box, TextField, Button, Typography, Alert, CircularProgress,
    InputAdornment, IconButton, MenuItem, Stepper, Step, StepLabel,
    Grid, Chip, LinearProgress,
} from '@mui/material';
import {
    Visibility, VisibilityOff,
    HealthAndSafety as HealthIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    Phone as PhoneIcon,
    Cake as AgeIcon,
    MonitorWeight as WeightIcon,
    Height as HeightIcon,
    ArrowForward as NextIcon,
    ArrowBack as BackIcon,
    CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: '#f8fafc',
        '&:hover fieldset': { borderColor: '#2563eb' },
        '&.Mui-focused fieldset': { borderColor: '#2563eb', borderWidth: 2 },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#2563eb' },
};

const STEPS = ['Account', 'Personal', 'Health'];
const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ROLES = ['patient', 'doctor', 'nurse'];

const pwStrengthOf = (p) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s += 25;
    if (/[A-Z]/.test(p)) s += 25;
    if (/[0-9]/.test(p)) s += 25;
    if (/[^A-Za-z0-9]/.test(p)) s += 25;
    return s;
};

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, error, setError } = useAuth();

    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [showCPw, setShowCPw] = useState(false);

    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        phone: '',
        age: '',
        gender: '',
        weight: '',
        height: '',
        blood_type: '',
        role: 'patient',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleBloodType = (bt) => {
        setForm((prev) => ({ ...prev, blood_type: prev.blood_type === bt ? '' : bt }));
    };

    const pwStrength = pwStrengthOf(form.password);
    const pwColor = pwStrength < 50 ? '#ef4444' : pwStrength < 75 ? '#f59e0b' : '#10b981';
    const pwLabel = pwStrength < 50 ? 'Weak' : pwStrength < 75 ? 'Medium' : 'Strong';

    const goNext = () => {
        setError(null);
        if (step === 0) {
            if (!form.username.trim()) return setError('Username is required');
            if (!form.email.trim()) return setError('Email is required');
            if (!form.password) return setError('Password is required');
            if (form.password.length < 8) return setError('Password must be at least 8 characters');
            if (form.password !== form.password_confirm) return setError('Passwords do not match');
        }
        setStep((s) => s + 1);
    };

    const goBack = () => {
        setError(null);
        setStep((s) => s - 1);
    };

    const doSubmit = async () => {
        setError(null);

        if (!form.username.trim()) return setError('Username is required');
        if (!form.email.trim()) return setError('Email is required');
        if (!form.password) return setError('Password is required');
        if (form.password !== form.password_confirm) return setError('Passwords do not match');
        if (!form.role) return setError('Role is required');

        setLoading(true);
        try {
            await register(form);
            // navigate('/dashboard');
            navigate('/login');
        } catch {
            // handled in context
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        doSubmit();
    };

    const skipAndSubmit = () => doSubmit();

    const canNext = [
        !!form.username && !!form.email && !!form.password && !!form.password_confirm,
        true,
        true,
    ];

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Box sx={{
                flex: '0 0 38%',
                background: 'linear-gradient(155deg,#0f172a 0%,#1e3a5f 55%,#0ea5e9 100%)',
                display: { xs: 'none', lg: 'flex' },
                flexDirection: 'column',
                justifyContent: 'center',
                p: 6,
                position: 'relative',
                overflow: 'hidden',
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: -80,
                    right: -80,
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    bgcolor: 'rgba(14,165,233,0.15)',
                    filter: 'blur(60px)',
                }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6, zIndex: 1 }}>
                    <Box sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '13px',
                        bgcolor: 'rgba(255,255,255,0.18)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.3)',
                    }}>
                        <HealthIcon sx={{ color: '#fff', fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
                            HealthCare
                        </Typography>
                        <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
                            Symptom Analysis
                        </Typography>
                    </Box>
                </Box>

                <Typography sx={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(1.6rem,2.5vw,2.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.3, mb: 2, zIndex: 1 }}>
                    Join thousands of patients managing their health smarter.
                </Typography>
                <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, zIndex: 1 }}>
                    Create your free account in under 2 minutes.
                </Typography>

                <Box sx={{ mt: 6, zIndex: 1 }}>
                    {STEPS.map((s, i) => (
                        <Box key={s} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <Box sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                bgcolor: i < step ? '#10b981' : i === step ? '#fff' : 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                {i < step ? (
                                    <CheckIcon sx={{ fontSize: 16, color: '#fff' }} />
                                ) : (
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: i === step ? '#0f172a' : 'rgba(255,255,255,0.5)' }}>
                                        {i + 1}
                                    </Typography>
                                )}
                            </Box>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: i === step ? 700 : 400, color: i === step ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                                {s === 'Account' ? 'Account Details' : s === 'Personal' ? 'Personal Information' : 'Health Information'}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, sm: 5 }, backgroundColor: '#f8fafc', overflowY: 'auto' }}>
                <Box sx={{ width: '100%', maxWidth: 480 }}>
                    <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center', gap: 1.2, mb: 4 }}>
                        <Box sx={{ width: 38, height: 38, borderRadius: '11px', background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HealthIcon sx={{ color: '#fff', fontSize: 20 }} />
                        </Box>
                        <Typography sx={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
                            HealthCare
                        </Typography>
                    </Box>

                    <Stepper activeStep={step} sx={{ mb: 4 }}>
                        {STEPS.map((label) => (
                            <Step key={label}>
                                <StepLabel sx={{
                                    '& .MuiStepLabel-label': { fontSize: '0.78rem', fontWeight: 600 },
                                    '& .MuiStepIcon-root.Mui-active': { color: '#2563eb' },
                                    '& .MuiStepIcon-root.Mui-completed': { color: '#10b981' },
                                }}>
                                    {label}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    <Typography sx={{ fontFamily: '"Playfair Display",serif', fontSize: '1.7rem', fontWeight: 700, color: '#0f172a', mb: 0.8 }}>
                        {step === 0 ? 'Create your account' : step === 1 ? 'About you' : 'Your health profile'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: '#64748b', mb: 3 }}>
                        {step === 0 ? 'Set up your login credentials' : step === 1 ? 'Help us personalise your experience' : 'Optional — can be updated anytime'}
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

                    {step === 0 && (
                        <Grid container spacing={2.5}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    autoComplete="username"
                                    autoFocus
                                    sx={fieldSx}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email address"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    sx={fieldSx}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Role"
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    sx={fieldSx}
                                >
                                    <MenuItem value="patient">Patient</MenuItem>
                                    <MenuItem value="doctor">Doctor</MenuItem>
                                    <MenuItem value="nurse">Nurse</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    name="password"
                                    type={showPw ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    sx={fieldSx}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPw((v) => !v)} edge="end" tabIndex={-1}>
                                                    {showPw ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                {form.password && (
                                    <Box sx={{ mt: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={pwStrength}
                                            sx={{
                                                height: 5,
                                                borderRadius: 3,
                                                bgcolor: '#e2e8f0',
                                                '& .MuiLinearProgress-bar': { bgcolor: pwColor, borderRadius: 3 },
                                            }}
                                        />
                                        <Typography sx={{ fontSize: '0.72rem', color: pwColor, mt: 0.5, fontWeight: 600 }}>
                                            Password strength: {pwLabel}
                                        </Typography>
                                    </Box>
                                )}
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Confirm Password"
                                    name="password_confirm"
                                    type={showCPw ? 'text' : 'password'}
                                    value={form.password_confirm}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    sx={fieldSx}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowCPw((v) => !v)} edge="end" tabIndex={-1}>
                                                    {showCPw ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                {form.password_confirm && form.password !== form.password_confirm && (
                                    <Typography sx={{ fontSize: '0.72rem', color: '#ef4444', mt: 0.5 }}>
                                        Passwords do not match
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>
                    )}

                    {step === 1 && (
                        <Grid container spacing={2.5}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="First Name"
                                    name="first_name"
                                    value={form.first_name}
                                    onChange={handleChange}
                                    autoFocus
                                    autoComplete="given-name"
                                    sx={fieldSx}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Last Name"
                                    name="last_name"
                                    value={form.last_name}
                                    onChange={handleChange}
                                    autoComplete="family-name"
                                    sx={fieldSx}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                    autoComplete="tel"
                                    sx={fieldSx}
                                    inputProps={{
                                        maxLength: 10,
                                        pattern: '[0-9]{10}',
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PhoneIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Age"
                                    name="age"
                                    type="number"
                                    value={form.age}
                                    onChange={handleChange}
                                    inputProps={{ min: 1, max: 120 }}
                                    sx={fieldSx}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AgeIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Gender"
                                    name="gender"
                                    value={form.gender}
                                    onChange={handleChange}
                                    sx={fieldSx}
                                >
                                    <MenuItem value="">Select</MenuItem>
                                    {GENDERS.map((g) => (
                                        <MenuItem key={g} value={g}>{g}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>
                    )}

                    {step === 2 && (
                        <Grid container spacing={2.5}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Weight (kg)"
                                    name="weight"
                                    type="number"
                                    value={form.weight}
                                    onChange={handleChange}
                                    inputProps={{ step: 0.1, min: 0 }}
                                    sx={fieldSx}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <WeightIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Height (cm)"
                                    name="height"
                                    type="number"
                                    value={form.height}
                                    onChange={handleChange}
                                    inputProps={{ min: 0 }}
                                    sx={fieldSx}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <HeightIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            {form.weight && form.height && (
                                <Grid item xs={12}>
                                    <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb' }}>
                                                {(form.weight / ((form.height / 100) ** 2)).toFixed(1)}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>BMI</Typography>
                                        </Box>
                                        <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
                                            Your estimated BMI based on height and weight.
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', mb: 1.2 }}>
                                    Blood Type
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {BLOOD_TYPES.map((bt) => (
                                        <Chip
                                            key={bt}
                                            label={bt}
                                            clickable
                                            onClick={() => handleBloodType(bt)}
                                            sx={{
                                                borderRadius: '10px',
                                                fontWeight: 700,
                                                fontSize: '0.85rem',
                                                px: 0.5,
                                                height: 36,
                                                bgcolor: form.blood_type === bt ? '#2563eb' : '#f1f5f9',
                                                color: form.blood_type === bt ? '#fff' : '#475569',
                                                border: '1.5px solid',
                                                borderColor: form.blood_type === bt ? '#2563eb' : '#e2e8f0',
                                                '&:hover': { bgcolor: form.blood_type === bt ? '#1d4ed8' : '#e2e8f0' },
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Grid>
                        </Grid>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, mt: 3.5 }}>
                        {step > 0 && (
                            <Button
                                startIcon={<BackIcon />}
                                variant="outlined"
                                onClick={goBack}
                                disabled={loading}
                                sx={{
                                    flex: 1,
                                    py: 1.5,
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    borderColor: '#e2e8f0',
                                    color: '#475569',
                                    '&:hover': { borderColor: '#2563eb', color: '#2563eb' },
                                }}
                            >
                                Back
                            </Button>
                        )}

                        {step < 2 && (
                            <Button
                                variant="contained"
                                onClick={goNext}
                                disabled={!canNext[step] || loading}
                                endIcon={<NextIcon />}
                                sx={{
                                    flex: 2,
                                    py: 1.5,
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
                                    boxShadow: '0 4px 18px rgba(37,99,235,0.3)',
                                    '&:hover': { boxShadow: '0 6px 24px rgba(37,99,235,0.4)' },
                                    '&:disabled': { opacity: 0.45 },
                                }}
                            >
                                Continue
                            </Button>
                        )}

                        {step === 2 && (
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={loading}
                                endIcon={!loading && <CheckIcon />}
                                sx={{
                                    flex: 2,
                                    py: 1.5,
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
                                    boxShadow: '0 4px 18px rgba(37,99,235,0.3)',
                                }}
                            >
                                {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
                            </Button>
                        )}
                    </Box>

                    {step === 2 && (
                        <Button
                            variant="text"
                            onClick={skipAndSubmit}
                            disabled={loading}
                            sx={{ width: '100%', mt: 1.5, color: '#94a3b8', fontSize: '0.8rem' }}
                        >
                            Skip health info for now
                        </Button>
                    )}

                    <Typography sx={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748b', mt: 3 }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                            Sign in →
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default RegisterPage;