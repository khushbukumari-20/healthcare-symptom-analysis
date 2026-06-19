import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box, TextField, Button, Typography, Alert,
    CircularProgress, InputAdornment, IconButton, Divider,
} from '@mui/material';
import {
    Visibility, VisibilityOff,
    HealthAndSafety as HealthIcon,
    LockOutlined as LockIcon,
    PersonOutlined as PersonIcon,
    ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

/* ── tiny feature bullet ── */
const Feature = ({ emoji, text }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.8 }}>
        <Box sx={{
            width: 36, height: 36, borderRadius: '10px',
            bgcolor: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', flexShrink: 0,
        }}>{emoji}</Box>
        <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>
            {text}
        </Typography>
    </Box>
);

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, error, setError } = useAuth();
    const [form, setForm]       = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw]   = useState(false);

    const handleChange = (e) =>
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(form.username, form.password);
            navigate('/dashboard');
        } catch { /* error set by context */ }
        finally { setLoading(false); }
    };

    /* ── shared TextField style ── */
    const fieldSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            '&:hover fieldset': { borderColor: '#2563eb' },
            '&.Mui-focused fieldset': { borderColor: '#2563eb', borderWidth: 2 },
        },
        '& .MuiInputLabel-root.Mui-focused': { color: '#2563eb' },
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>

            {/* ══ LEFT PANEL ══════════════════════════════════════ */}
            <Box sx={{
                flex: '0 0 42%',
                background: 'linear-gradient(155deg,#0f172a 0%,#1e3a5f 50%,#0ea5e9 100%)',
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 5,
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* background blur circles */}
                <Box sx={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', bgcolor: 'rgba(14,165,233,0.18)', filter: 'blur(50px)' }} />
                <Box sx={{ position: 'absolute', bottom: 100, left: -40, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(37,99,235,0.2)', filter: 'blur(40px)' }} />

                {/* logo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 1 }}>
                    <Box sx={{
                        width: 44, height: 44, borderRadius: '13px',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.3)',
                    }}>
                        <HealthIcon sx={{ color: '#fff', fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
                            HealthCare
                        </Typography>
                        <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
                            Symptom Analysis
                        </Typography>
                    </Box>
                </Box>

                {/* hero text */}
                <Box sx={{ zIndex: 1 }}>
                    <Typography sx={{
                        fontFamily: '"Playfair Display",serif',
                        fontSize: 'clamp(1.8rem,3vw,2.4rem)',
                        fontWeight: 700, color: '#fff', lineHeight: 1.25, mb: 1.5,
                    }}>
                        Your health,<br />analyzed<br />intelligently.
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', mb: 4, maxWidth: 280 }}>
                        AI-powered symptom analysis trusted by thousands of patients.
                    </Typography>
                    <Feature emoji="🔬" text="AI-powered symptom analysis" />
                    <Feature emoji="📅" text="Book doctor appointments instantly" />
                    <Feature emoji="📊" text="Track your health history" />
                    <Feature emoji="🔒" text="HIPAA-compliant & fully secure" />
                </Box>

                {/* bottom quote */}
                <Box sx={{
                    bgcolor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)',
                    borderRadius: '16px', p: 2.5, border: '1px solid rgba(255,255,255,0.12)', zIndex: 1,
                }}>
                    <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', mb: 1, fontStyle: 'italic' }}>
                        "This platform helped me identify my symptoms early. Absolutely life-changing."
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                        — Sarah M., Patient
                    </Typography>
                </Box>
            </Box>

            {/* ══ RIGHT PANEL ═════════════════════════════════════ */}
            <Box sx={{
                flex: 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', p: { xs: 3, sm: 6 },
                backgroundColor: '#f8fafc',
            }}>
                <Box sx={{ width: '100%', maxWidth: 420 }}>

                    {/* Mobile logo */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.2, mb: 4 }}>
                        <Box sx={{ width: 38, height: 38, borderRadius: '11px', background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HealthIcon sx={{ color: '#fff', fontSize: 20 }} />
                        </Box>
                        <Typography sx={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
                            HealthCare
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography sx={{ fontFamily: '"Playfair Display",serif', fontSize: '1.9rem', fontWeight: 700, color: '#0f172a', mb: 0.8 }}>
                            Welcome back
                        </Typography>
                        <Typography sx={{ fontSize: '0.9rem', color: '#64748b' }}>
                            Sign in to your account to continue
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', mb: 0.8 }}>
                            Username
                        </Typography>
                        <TextField
                            fullWidth name="username" placeholder="Enter your username"
                            value={form.username} onChange={handleChange}
                            required disabled={loading} sx={{ ...fieldSx, mb: 2.5 }}
                            InputProps={{ startAdornment: (
                                <InputAdornment position="start">
                                    <PersonIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                                </InputAdornment>
                            )}}
                        />

                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', mb: 0.8 }}>
                            Password
                        </Typography>
                        <TextField
                            fullWidth name="password" type={showPw ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={form.password} onChange={handleChange}
                            required disabled={loading} sx={{ ...fieldSx, mb: 3 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPw(!showPw)} edge="end" disabled={loading}>
                                            {showPw ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit" fullWidth variant="contained" disabled={loading}
                            endIcon={!loading && <ArrowIcon />}
                            sx={{
                                py: 1.6, borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700,
                                background: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
                                boxShadow: '0 4px 18px rgba(37,99,235,0.35)',
                                '&:hover': { boxShadow: '0 6px 24px rgba(37,99,235,0.45)', background: 'linear-gradient(135deg,#0284c7,#1d4ed8)' },
                                transition: 'all 0.2s',
                            }}
                        >
                            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
                        </Button>
                    </Box>

                    <Divider sx={{ my: 3, color: '#cbd5e1', fontSize: '0.78rem' }}>
                        OR
                    </Divider>

                    <Box sx={{
                        textAlign: 'center', p: 2.5, borderRadius: '14px',
                        border: '1.5px dashed #e2e8f0', bgcolor: '#fff',
                    }}>
                        <Typography sx={{ fontSize: '0.875rem', color: '#64748b' }}>
                            New to HealthCare?{' '}
                            <Link to="/register" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                                Create a free account →
                            </Link>
                        </Typography>
                    </Box>

                    <Typography sx={{ textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', mt: 3 }}>
                        By signing in, you agree to our{' '}
                        <Link to="/terms" style={{ color: '#64748b' }}>Terms</Link>
                        {' & '}
                        <Link to="/privacy" style={{ color: '#64748b' }}>Privacy Policy</Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default LoginPage;
