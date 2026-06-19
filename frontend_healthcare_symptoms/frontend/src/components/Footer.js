import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Grid, Divider,
    IconButton, Link, Chip,
} from '@mui/material';
import {
    HealthAndSafety as HealthIcon,
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    LinkedIn as LinkedInIcon,
    Instagram as InstagramIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationIcon,
    Favorite as HeartIcon,
} from '@mui/icons-material';

const FOOTER_LINKS = [
    {
        heading: 'Services',
        links: [
            { label: 'Symptom Checker',   path: '/symptoms'     },
            { label: 'Health Assessment', path: '/assessment'   },
            { label: 'Appointments',      path: '/appointments' },
            { label: 'Medical History',   path: '/history'      },
        ],
    },
    {
        heading: 'Account',
        links: [
            { label: 'Dashboard',     path: '/dashboard'     },
            { label: 'My Profile',    path: '/profile'       },
            { label: 'Settings',      path: '/settings'      },
            { label: 'Notifications', path: '/notifications' },
        ],
    },
    {
        heading: 'Support',
        links: [
            { label: 'Help Center',      path: '/help'    },
            { label: 'Privacy Policy',   path: '/privacy' },
            { label: 'Terms of Service', path: '/terms'   },
            { label: 'Contact Us',       path: '/contact' },
        ],
    },
];

const SOCIALS = [
    { icon: <FacebookIcon  fontSize="small" />, label: 'Facebook'  },
    { icon: <TwitterIcon   fontSize="small" />, label: 'Twitter'   },
    { icon: <LinkedInIcon  fontSize="small" />, label: 'LinkedIn'  },
    { icon: <InstagramIcon fontSize="small" />, label: 'Instagram' },
];

const CONTACT = [
    { icon: <PhoneIcon    fontSize="small" />, text: '+1 (800) 123-4567'        },
    { icon: <EmailIcon    fontSize="small" />, text: 'support@healthcare.com'   },
    { icon: <LocationIcon fontSize="small" />, text: '123 Health Ave, CA 90210' },
];

const Footer = () => {
    const navigate = useNavigate();
    const year = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                background: 'linear-gradient(180deg,#0f172a 0%,#0c1526 100%)',
                color: '#cbd5e1',
                pt: 8,
                mt: 'auto',
            }}
        >
            <Container maxWidth="lg">

                {/* Top Grid */}
                <Grid container spacing={4} sx={{ pb: 6 }}>

                    {/* Brand column */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                            <Box sx={{
                                width: 46, height: 46, borderRadius: '14px',
                                background: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 18px rgba(14,165,233,0.4)', flexShrink: 0,
                            }}>
                                <HealthIcon sx={{ color: '#fff', fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography sx={{
                                    fontFamily: '"Playfair Display",serif',
                                    fontWeight: 700, fontSize: '1.2rem',
                                    color: '#f1f5f9', letterSpacing: '-0.3px',
                                }}>
                                    HealthCare
                                </Typography>
                                <Typography sx={{
                                    fontSize: '0.58rem', fontWeight: 700,
                                    letterSpacing: '2.5px', textTransform: 'uppercase',
                                    color: '#0ea5e9',
                                }}>
                                    Symptom Analysis
                                </Typography>
                            </Box>
                        </Box>

                        <Typography sx={{ fontSize: '0.875rem', lineHeight: 1.8, color: '#94a3b8', mb: 3, maxWidth: 300 }}>
                            AI-powered symptom analysis and health assessment platform.
                            Your wellness, analyzed intelligently — anytime, anywhere.
                        </Typography>

                        {/* Trust Badges */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3.5 }}>
                            {['HIPAA Compliant', 'SSL Secured', 'ISO 27001'].map((badge) => (
                                <Chip key={badge} label={badge} size="small" sx={{
                                    bgcolor: 'rgba(14,165,233,0.1)', color: '#7dd3fc',
                                    fontSize: '0.62rem', fontWeight: 700,
                                    border: '1px solid rgba(14,165,233,0.22)', borderRadius: '6px',
                                }} />
                            ))}
                        </Box>

                        {/* Contact */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                            {CONTACT.map(({ icon, text }) => (
                                <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                                    <Box sx={{ color: '#0ea5e9', display: 'flex', alignItems: 'center' }}>
                                        {icon}
                                    </Box>
                                    <Typography sx={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                                        {text}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Grid>

                    {/* Link columns */}
                    {FOOTER_LINKS.map(({ heading, links }) => (
                        <Grid item xs={6} sm={4} md={2} key={heading}>
                            <Typography sx={{
                                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1.8px',
                                textTransform: 'uppercase', color: '#f1f5f9', mb: 2.5,
                            }}>
                                {heading}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.3 }}>
                                {links.map(({ label, path }) => (
                                    <Link
                                        key={label}
                                        component="button"
                                        onClick={() => navigate(path)}
                                        underline="none"
                                        sx={{
                                            fontSize: '0.84rem', color: '#94a3b8',
                                            textAlign: 'left', cursor: 'pointer',
                                            transition: 'color 0.18s',
                                            '&:hover': { color: '#38bdf8' },
                                        }}
                                    >
                                        {label}
                                    </Link>
                                ))}
                            </Box>
                        </Grid>
                    ))}

                    {/* Social + Emergency */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography sx={{
                            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '1.8px',
                            textTransform: 'uppercase', color: '#f1f5f9', mb: 2.5,
                        }}>
                            Follow Us
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
                            {SOCIALS.map(({ icon, label }) => (
                                <IconButton key={label} aria-label={label} size="small" sx={{
                                    border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8',
                                    width: 36, height: 36, borderRadius: '10px',
                                    '&:hover': { bgcolor: 'rgba(14,165,233,0.15)', color: '#38bdf8', borderColor: 'rgba(14,165,233,0.4)' },
                                    transition: 'all 0.2s',
                                }}>
                                    {icon}
                                </IconButton>
                            ))}
                        </Box>

                        {/* Emergency Box */}
                        <Box sx={{
                            border: '1px solid rgba(239,68,68,0.28)', borderRadius: '14px',
                            p: 2.2, bgcolor: 'rgba(239,68,68,0.06)',
                        }}>
                            <Typography sx={{
                                fontSize: '0.68rem', fontWeight: 700,
                                textTransform: 'uppercase', letterSpacing: '1px',
                                color: '#fca5a5', mb: 0.8,
                            }}>
                                🚨 Medical Emergency?
                            </Typography>
                            <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', mb: 1.2 }}>
                                Do not use this platform. Call emergency services immediately.
                            </Typography>
                            <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#f87171', letterSpacing: 0.5 }}>
                                Call 911 / 112
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Divider */}
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />

                {/* Bottom Bar */}
                <Box sx={{
                    display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between', alignItems: 'center',
                    py: 3, gap: 2,
                }}>
                    <Typography sx={{ fontSize: '0.78rem', color: '#475569', textAlign: { xs: 'center', sm: 'left' } }}>
                        © {year} HealthCare Symptom Analysis. All rights reserved.
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <Typography sx={{ fontSize: '0.78rem', color: '#475569' }}>
                            Built with
                        </Typography>
                        <HeartIcon sx={{ fontSize: 13, color: '#ef4444' }} />
                        <Typography sx={{ fontSize: '0.78rem', color: '#475569' }}>
                            for better healthcare
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {['Privacy', 'Terms', 'Cookies'].map((item) => (
                            <Link
                                key={item}
                                component="button"
                                onClick={() => navigate(`/${item.toLowerCase()}`)}
                                underline="none"
                                sx={{
                                    fontSize: '0.78rem', color: '#475569', cursor: 'pointer',
                                    '&:hover': { color: '#38bdf8' }, transition: 'color 0.18s',
                                }}
                            >
                                {item}
                            </Link>
                        ))}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;