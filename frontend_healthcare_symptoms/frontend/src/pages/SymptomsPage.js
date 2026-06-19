// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//     Container, Box, Card, Typography, Grid, Button, Chip,
//     TextField, Stepper, Step, StepLabel, Alert, CircularProgress,
//     LinearProgress, Slider, InputAdornment,
// } from '@mui/material';
// import {
//     Search as SearchIcon,
//     MonitorHeart as SymptomIcon,
//     ArrowForward as NextIcon,
//     ArrowBack as BackIcon,
//     AccessTime as DurationIcon,
//     LocalHospital as HospitalIcon,
//     Psychology as AiIcon,
//     Refresh as RefreshIcon,
//     Warning as WarnIcon,
// } from '@mui/icons-material';

// const SYMPTOM_CATEGORIES = [
//     { category: 'Head & Neuro', emoji: '🧠', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', symptoms: ['Headache','Migraine','Dizziness','Fainting','Confusion','Memory Loss','Seizures','Numbness'] },
//     { category: 'Eyes, Ears & Throat', emoji: '👁️', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', symptoms: ['Blurred Vision','Eye Pain','Ear Pain','Hearing Loss','Sore Throat','Runny Nose','Sneezing','Nasal Congestion'] },
//     { category: 'Chest & Heart', emoji: '❤️', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', symptoms: ['Chest Pain','Palpitations','Shortness of Breath','Rapid Heartbeat','Wheezing','Coughing'] },
//     { category: 'Digestive', emoji: '🫁', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', symptoms: ['Nausea','Vomiting','Stomach Pain','Bloating','Diarrhea','Constipation','Loss of Appetite','Heartburn'] },
//     { category: 'Skin', emoji: '🩹', color: '#ec4899', bg: 'rgba(236,72,153,0.08)', symptoms: ['Rash','Itching','Hives','Skin Redness','Bruising','Yellowing of Skin','Dry Skin','Acne'] },
//     { category: 'Muscles & Joints', emoji: '🦴', color: '#10b981', bg: 'rgba(16,185,129,0.08)', symptoms: ['Joint Pain','Muscle Pain','Back Pain','Neck Pain','Swelling','Stiffness','Weakness','Cramps'] },
//     { category: 'General', emoji: '🌡️', color: '#6366f1', bg: 'rgba(99,102,241,0.08)', symptoms: ['Fever','Chills','Fatigue','Weight Loss','Night Sweats','Loss of Smell','Loss of Taste'] },
//     { category: 'Mental Health', emoji: '🧘', color: '#14b8a6', bg: 'rgba(20,184,166,0.08)', symptoms: ['Anxiety','Depression','Insomnia','Mood Swings','Panic Attacks','Stress','Irritability'] },
// ];

// const DURATION_OPTIONS = ['Less than 1 day','1-3 days','4-7 days','1-2 weeks','2-4 weeks','More than 1 month'];
// const STEPS = ['Select Symptoms','Details','Results'];
// const sevLabel = (v) => v <= 2 ? 'Mild' : v <= 5 ? 'Moderate' : v <= 8 ? 'Severe' : 'Critical';
// const sevColor = (v) => v <= 2 ? '#10b981' : v <= 5 ? '#f59e0b' : v <= 8 ? '#ef4444' : '#7f1d1d';
// const riskColor = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };
// const riskBg    = { Low: 'rgba(16,185,129,0.1)', Medium: 'rgba(245,158,11,0.1)', High: 'rgba(239,68,68,0.1)' };

// const mockResults = [
//     { condition: 'Common Cold', probability: 72, risk: 'Low', description: 'Viral upper respiratory tract infection.' },
//     { condition: 'Influenza', probability: 55, risk: 'Medium', description: 'Seasonal flu with systemic involvement.' },
//     { condition: 'Tension Headache', probability: 40, risk: 'Low', description: 'Stress-related headache without aura.' },
// ];

// const fieldSx = {
//     '& .MuiOutlinedInput-root': {
//         borderRadius: '14px', bgcolor: '#f8fafc',
//         '&:hover fieldset': { borderColor: '#2563eb' },
//         '&.Mui-focused fieldset': { borderColor: '#2563eb' },
//     },
// };

// const SymptomsPage = () => {
//     const navigate = useNavigate();
//     const [step, setStep]           = useState(0);
//     const [search, setSearch]       = useState('');
//     const [selected, setSelected]   = useState([]);
//     const [severity, setSeverity]   = useState(3);
//     const [duration, setDuration]   = useState('');
//     const [notes, setNotes]         = useState('');
//     const [loading, setLoading]     = useState(false);
//     const [results, setResults]     = useState(null);
//     const [error, setError]         = useState('');

//     const toggle = (s) => setSelected((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

//     const filtered = SYMPTOM_CATEGORIES.map((c) => ({
//         ...c,
//         symptoms: c.symptoms.filter((s) => s.toLowerCase().includes(search.toLowerCase())),
//     })).filter((c) => c.symptoms.length > 0);

//     const analyze = async () => {
//         if (!selected.length) { setError('Please select at least one symptom.'); return; }
//         if (!duration)        { setError('Please select symptom duration.'); return; }
//         setError(''); setLoading(true);
//         await new Promise((r) => setTimeout(r, 2000));
//         setResults(mockResults); setLoading(false); setStep(2);
//     };

//     const reset = () => { setStep(0); setSelected([]); setSeverity(3); setDuration(''); setNotes(''); setResults(null); setError(''); };

//     return (
//         <Container maxWidth="md" sx={{ py: 5 }}>
//             {/* Header */}
//             <Box sx={{ mb: 4 }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.8 }}>
//                     <Box sx={{ width: 44, height: 44, borderRadius: '13px', background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                         <SymptomIcon sx={{ color: '#fff', fontSize: 22 }} />
//                     </Box>
//                     <Typography sx={{ fontFamily: '"Playfair Display",serif', fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>
//                         Symptom Checker
//                     </Typography>
//                 </Box>
//                 <Typography sx={{ fontSize: '0.9rem', color: '#64748b' }}>
//                     Select your symptoms and get an AI-powered health assessment
//                 </Typography>
//             </Box>

//             <Stepper activeStep={step} sx={{ mb: 4 }}>
//                 {STEPS.map((l) => (
//                     <Step key={l}>
//                         <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.8rem', fontWeight: 600 }, '& .MuiStepIcon-root.Mui-active': { color: '#2563eb' }, '& .MuiStepIcon-root.Mui-completed': { color: '#10b981' } }}>
//                             {l}
//                         </StepLabel>
//                     </Step>
//                 ))}
//             </Stepper>

//             <Card sx={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none', p: { xs: 2.5, md: 4 } }}>
//                 {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

//                 {/* ── STEP 0 ── */}
//                 {step === 0 && (
//                     <Box>
//                         <TextField fullWidth placeholder="Search symptoms…" value={search}
//                             onChange={(e) => setSearch(e.target.value)} sx={{ ...fieldSx, mb: 3 }}
//                             InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94a3b8' }} /></InputAdornment> }}
//                         />
//                         {selected.length > 0 && (
//                             <Box sx={{ mb: 3, p: 2, borderRadius: '14px', bgcolor: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)' }}>
//                                 <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', mb: 1 }}>
//                                     Selected ({selected.length})
//                                 </Typography>
//                                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
//                                     {selected.map((s) => (
//                                         <Chip key={s} label={s} size="small" onDelete={() => toggle(s)}
//                                             sx={{ bgcolor: '#2563eb', color: '#fff', fontWeight: 600, borderRadius: '8px', '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)' } }} />
//                                     ))}
//                                 </Box>
//                             </Box>
//                         )}
//                         {filtered.map(({ category, emoji, color, bg, symptoms }) => (
//                             <Box key={category} sx={{ mb: 3 }}>
//                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
//                                     <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>{emoji}</Box>
//                                     <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>{category}</Typography>
//                                 </Box>
//                                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
//                                     {symptoms.map((s) => {
//                                         const sel = selected.includes(s);
//                                         return (
//                                             <Chip key={s} label={s} clickable onClick={() => toggle(s)}
//                                                 sx={{ borderRadius: '10px', fontWeight: sel ? 700 : 500, fontSize: '0.78rem', height: 30, bgcolor: sel ? color : '#f8fafc', color: sel ? '#fff' : '#475569', border: '1.5px solid', borderColor: sel ? color : '#e2e8f0', '&:hover': { bgcolor: sel ? color : bg, borderColor: color }, transition: 'all 0.15s' }} />
//                                         );
//                                     })}
//                                 </Box>
//                             </Box>
//                         ))}
//                     </Box>
//                 )}

//                 {/* ── STEP 1 ── */}
//                 {step === 1 && (
//                     <Box>
//                         <Card sx={{ p: 2.5, borderRadius: '16px', border: '1px solid rgba(37,99,235,0.15)', bgcolor: 'rgba(37,99,235,0.03)', mb: 3.5, boxShadow: 'none' }}>
//                             <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', mb: 1 }}>Your Symptoms ({selected.length})</Typography>
//                             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
//                                 {selected.map((s) => <Chip key={s} label={s} size="small" sx={{ bgcolor: '#2563eb', color: '#fff', fontWeight: 600, borderRadius: '8px', fontSize: '0.72rem' }} />)}
//                             </Box>
//                         </Card>

//                         <Box sx={{ mb: 4 }}>
//                             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//                                 <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>Overall Severity</Typography>
//                                 <Chip label={`${sevLabel(severity)} (${severity}/10)`} size="small"
//                                     sx={{ bgcolor: `${sevColor(severity)}18`, color: sevColor(severity), fontWeight: 700, fontSize: '0.72rem', height: 22 }} />
//                             </Box>
//                             <Slider value={severity} onChange={(_, v) => setSeverity(v)} min={1} max={10} step={1}
//                                 marks={[{ value: 1, label: 'Mild' }, { value: 5, label: 'Moderate' }, { value: 10, label: 'Critical' }]}
//                                 sx={{ color: sevColor(severity), '& .MuiSlider-thumb': { width: 22, height: 22, border: '3px solid currentColor', bgcolor: '#fff' }, '& .MuiSlider-markLabel': { fontSize: '0.72rem', color: '#94a3b8' } }}
//                             />
//                         </Box>

//                         <Box sx={{ mb: 3 }}>
//                             <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5 }}>How long have you had these symptoms?</Typography>
//                             <Grid container spacing={1.5}>
//                                 {DURATION_OPTIONS.map((d) => (
//                                     <Grid item xs={6} sm={4} key={d}>
//                                         <Box onClick={() => setDuration(d)}
//                                             sx={{ p: 1.5, borderRadius: '12px', cursor: 'pointer', textAlign: 'center', border: '1.5px solid', borderColor: duration === d ? '#2563eb' : '#e2e8f0', bgcolor: duration === d ? 'rgba(37,99,235,0.07)' : '#f8fafc', transition: 'all 0.15s', '&:hover': { borderColor: '#2563eb' } }}>
//                                             <DurationIcon sx={{ fontSize: 18, color: duration === d ? '#2563eb' : '#94a3b8', mb: 0.4 }} />
//                                             <Typography sx={{ fontSize: '0.73rem', fontWeight: duration === d ? 700 : 500, color: duration === d ? '#2563eb' : '#475569' }}>{d}</Typography>
//                                         </Box>
//                                     </Grid>
//                                 ))}
//                             </Grid>
//                         </Box>

//                         <Box>
//                             <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 1.2 }}>Additional Notes <Typography component="span" sx={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.8rem' }}>(optional)</Typography></Typography>
//                             <TextField fullWidth multiline rows={3} placeholder="Any other details about your symptoms, medications, allergies…" value={notes} onChange={(e) => setNotes(e.target.value)} sx={fieldSx} />
//                         </Box>
//                     </Box>
//                 )}

//                 {/* ── STEP 2 ── */}
//                 {step === 2 && results && (
//                     <Box>
//                         <Box sx={{ display: 'flex', gap: 1.5, p: 2, borderRadius: '14px', bgcolor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', mb: 3 }}>
//                             <WarnIcon sx={{ color: '#f59e0b', flexShrink: 0 }} />
//                             <Typography sx={{ fontSize: '0.8rem', color: '#92400e' }}>This is <strong>not a medical diagnosis</strong>. Always consult a qualified healthcare professional.</Typography>
//                         </Box>
//                         <Grid container spacing={2} sx={{ mb: 3 }}>
//                             {[
//                                 { label: 'Symptoms', value: selected.length, color: '#2563eb' },
//                                 { label: 'Severity', value: `${severity}/10`, color: sevColor(severity) },
//                                 { label: 'Duration', value: duration.split(' ')[0], color: '#10b981' },
//                             ].map(({ label, value, color }) => (
//                                 <Grid item xs={4} key={label}>
//                                     <Box sx={{ textAlign: 'center', p: 2, borderRadius: '14px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
//                                         <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color }}>{value}</Typography>
//                                         <Typography sx={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{label}</Typography>
//                                     </Box>
//                                 </Grid>
//                             ))}
//                         </Grid>

//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
//                             <AiIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
//                             <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>AI Analysis Results</Typography>
//                         </Box>

//                         {results.map((r, i) => (
//                             <Card key={r.condition} sx={{ mb: 2, p: 2.5, borderRadius: '16px', border: '1px solid', boxShadow: 'none', borderColor: i === 0 ? 'rgba(37,99,235,0.25)' : '#e2e8f0', bgcolor: i === 0 ? 'rgba(37,99,235,0.03)' : '#fff' }}>
//                                 <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.2 }}>
//                                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                                         {i === 0 && <Chip label="Most Likely" size="small" sx={{ bgcolor: '#2563eb', color: '#fff', fontWeight: 700, fontSize: '0.62rem', height: 18 }} />}
//                                         <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>{r.condition}</Typography>
//                                     </Box>
//                                     <Chip label={r.risk + ' Risk'} size="small" sx={{ bgcolor: riskBg[r.risk], color: riskColor[r.risk], fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
//                                 </Box>
//                                 <Typography sx={{ fontSize: '0.82rem', color: '#64748b', mb: 1.5 }}>{r.description}</Typography>
//                                 <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
//                                     <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Match probability</Typography>
//                                     <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#0f172a' }}>{r.probability}%</Typography>
//                                 </Box>
//                                 <LinearProgress variant="determinate" value={r.probability}
//                                     sx={{ height: 6, borderRadius: 3, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: i === 0 ? '#2563eb' : '#94a3b8', borderRadius: 3 } }} />
//                             </Card>
//                         ))}

//                         <Grid container spacing={2} sx={{ mt: 1 }}>
//                             <Grid item xs={12} sm={6}>
//                                 <Button fullWidth variant="contained" startIcon={<HospitalIcon />} onClick={() => navigate('/appointments')}
//                                     sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700, background: 'linear-gradient(135deg,#0ea5e9,#2563eb)' }}>
//                                     Book Appointment
//                                 </Button>
//                             </Grid>
//                             <Grid item xs={12} sm={6}>
//                                 <Button fullWidth variant="outlined" startIcon={<RefreshIcon />} onClick={reset}
//                                     sx={{ py: 1.5, borderRadius: '12px', fontWeight: 700, borderColor: '#e2e8f0', color: '#475569' }}>
//                                     New Assessment
//                                 </Button>
//                             </Grid>
//                         </Grid>
//                     </Box>
//                 )}

//                 {/* Nav buttons */}
//                 {step < 2 && (
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid #f1f5f9' }}>
//                         <Button onClick={() => step === 0 ? navigate('/dashboard') : setStep(0)} startIcon={<BackIcon />} variant="outlined"
//                             sx={{ borderRadius: '12px', fontWeight: 600, borderColor: '#e2e8f0', color: '#475569', px: 3 }}>
//                             {step === 0 ? 'Dashboard' : 'Back'}
//                         </Button>
//                         {step === 0
//                             ? <Button onClick={() => { if (!selected.length) { setError('Please select at least one symptom.'); return; } setError(''); setStep(1); }}
//                                 endIcon={<NextIcon />} variant="contained"
//                                 sx={{ borderRadius: '12px', fontWeight: 700, px: 3, background: 'linear-gradient(135deg,#0ea5e9,#2563eb)' }}>
//                                 Continue ({selected.length} selected)
//                               </Button>
//                             : <Button onClick={analyze} disabled={loading} endIcon={loading ? null : <AiIcon />} variant="contained"
//                                 sx={{ borderRadius: '12px', fontWeight: 700, px: 3, background: 'linear-gradient(135deg,#0ea5e9,#2563eb)' }}>
//                                 {loading ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />Analyzing…</> : 'Analyze Symptoms'}
//                               </Button>
//                         }
//                     </Box>
//                 )}
//             </Card>
//         </Container>
//     );
// };

// export default SymptomsPage;


// import React, { useState, useEffect } from 'react';
// import {
//     Container, Box, Card, Typography, Grid, Button, Chip,
//     CircularProgress, Alert, Stepper, Step, StepLabel,
//     Slider, TextField, Divider, LinearProgress,
// } from '@mui/material';
// import {
//     MonitorHeart as SymptomIcon,
//     Search as SearchIcon,
//     ArrowForward as NextIcon,
//     ArrowBack as BackIcon,
//     CheckCircle as CheckIcon,
//     LocalHospital as HospitalIcon,
//     WarningAmber as WarnIcon,
//     Info as InfoIcon,
//     Refresh as ResetIcon,
// } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';

// const STEPS = ['Body Area', 'Symptoms', 'Details', 'Results'];

// const BODY_AREAS = [
//     { id: 'head',    label: 'Head & Neck', emoji: '🧠' },
//     { id: 'chest',   label: 'Chest',       emoji: '❤️' },
//     { id: 'abdomen', label: 'Abdomen',     emoji: '🫁' },
//     { id: 'limbs',   label: 'Limbs',       emoji: '💪' },
//     { id: 'skin',    label: 'Skin',        emoji: '🩹' },
//     { id: 'general', label: 'General',     emoji: '🌡️' },
// ];

// const AREA_KEYWORDS = {
//     head:    ['head','neck','ear','eye','nose','throat','dizz','vision','migraine','sneez','sinus'],
//     chest:   ['chest','breath','heart','cough','wheez','palpitat','lung'],
//     abdomen: ['stomach','abdomen','nausea','vomit','diarrhea','constip','bloat','appetite','gastro'],
//     limbs:   ['joint','muscle','knee','arm','leg','ankle','swelling','cramp','numb','weak'],
//     skin:    ['skin','rash','itch','red','dry','hive','blister','bruise','yellow'],
//     general: ['fever','fatigue','chill','sweat','weight','tired','malaise','loss'],
// };

// const SEV_LABEL = ['Minimal','Mild','Moderate','Significant','Severe'];
// const SEV_COLOR = ['#10b981','#84cc16','#f59e0b','#ef4444','#7f1d1d'];
// const RISK_COLOR = { Low:'#10b981', Medium:'#f59e0b', High:'#ef4444' };
// const RISK_BG    = { Low:'rgba(16,185,129,0.08)', Medium:'rgba(245,158,11,0.08)', High:'rgba(239,68,68,0.08)' };

// const SymptomsPage = () => {
//     const navigate = useNavigate();

//     const [step,        setStep]        = useState(0);
//     const [area,        setArea]        = useState('');
//     const [allSymptoms, setAllSymptoms] = useState([]);
//     const [selected,    setSelected]    = useState([]);
//     const [severity,    setSeverity]    = useState(3);
//     const [duration,    setDuration]    = useState('');
//     const [notes,       setNotes]       = useState('');
//     const [search,      setSearch]      = useState('');
//     const [loading,     setLoading]     = useState(false);
//     const [sympLoading, setSympLoading] = useState(false);
//     const [result,      setResult]      = useState(null);
//     const [error,       setError]       = useState('');

//     useEffect(() => {
//         const fetchSymptoms = async () => {
//             setSympLoading(true);
//             try {
//                 const res = await api.get('/symptoms/assessments/symptoms/');
//                 setAllSymptoms(res.data.symptoms || []);
//             } catch {
//                 setError('Could not load symptoms. Make sure the ML service is running.');
//             } finally {
//                 setSympLoading(false);
//             }
//         };
//         fetchSymptoms();
//     }, []);

//     const filteredByArea = area
//         ? allSymptoms.filter((s) => (AREA_KEYWORDS[area]||[]).some((kw) => s.toLowerCase().includes(kw)))
//         : allSymptoms;
//     const areaSymptoms     = filteredByArea.length >= 3 ? filteredByArea : allSymptoms;
//     const displayedSymptoms = areaSymptoms.filter((s) => s.toLowerCase().includes(search.toLowerCase()));

//     const toggleSymptom = (s) =>
//         setSelected((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

//     const reset = () => {
//         setStep(0); setArea(''); setSelected([]); setSeverity(3);
//         setDuration(''); setNotes(''); setSearch(''); setResult(null); setError('');
//     };

//     const analyze = async () => {
//         setLoading(true); setError('');
//         try {
//             const res = await api.post('/symptoms/assessments/predict/', {
//                 symptoms: selected, severity, duration, notes,
//             });
//             setResult(res.data);
//             setStep(3);
//         } catch (err) {
//             setError(err.response?.data?.error || 'Analysis failed. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const canNext = [!!area, selected.length > 0, !!duration, true];

//     return (
//         <Container maxWidth="md" sx={{ py:5 }}>
//             <Box sx={{ mb:4, display:'flex', alignItems:'center', gap:1.5 }}>
//                 <Box sx={{ width:42, height:42, borderRadius:'13px', background:'linear-gradient(135deg,#0ea5e9,#2563eb)', display:'flex', alignItems:'center', justifyContent:'center' }}>
//                     <SymptomIcon sx={{ color:'#fff', fontSize:22 }} />
//                 </Box>
//                 <Box>
//                     <Typography sx={{ fontFamily:'"Playfair Display",serif', fontWeight:700, fontSize:'1.5rem', color:'#0f172a', lineHeight:1.1 }}>
//                         Symptom Checker
//                     </Typography>
//                     <Typography sx={{ fontSize:'0.8rem', color:'#64748b' }}>AI-powered health assessment</Typography>
//                 </Box>
//             </Box>

//             <Stepper activeStep={step} sx={{ mb:4 }}>
//                 {STEPS.map((label) => (
//                     <Step key={label}>
//                         <StepLabel sx={{ '& .MuiStepLabel-label':{ fontSize:'0.78rem', fontWeight:600 }, '& .MuiStepIcon-root.Mui-active':{ color:'#2563eb' }, '& .MuiStepIcon-root.Mui-completed':{ color:'#10b981' } }}>
//                             {label}
//                         </StepLabel>
//                     </Step>
//                 ))}
//             </Stepper>

//             <Card sx={{ borderRadius:'20px', border:'1px solid rgba(0,0,0,0.06)', boxShadow:'none', p:3 }}>
//                 <Typography sx={{ fontFamily:'"Playfair Display",serif', fontSize:'1.2rem', fontWeight:700, color:'#0f172a', mb:0.5 }}>
//                     {['Select Body Area','Choose Symptoms','Describe Severity','Your Results'][step]}
//                 </Typography>
//                 <Divider sx={{ mb:3 }} />

//                 {error && <Alert severity="error" sx={{ mb:2, borderRadius:'12px' }}>{error}</Alert>}

//                 {loading ? (
//                     <Box sx={{ py:6, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
//                         <CircularProgress size={48} sx={{ color:'#2563eb' }} />
//                         <Typography sx={{ color:'#64748b', fontWeight:500 }}>Analysing your symptoms with AI...</Typography>
//                     </Box>
//                 ) : (
//                     <>
//                         {/* STEP 0 */}
//                         {step === 0 && (
//                             <Grid container spacing={2}>
//                                 {BODY_AREAS.map((b) => (
//                                     <Grid item xs={6} sm={4} key={b.id}>
//                                         <Card onClick={() => setArea(b.id)} sx={{ p:2.5, borderRadius:'16px', cursor:'pointer', textAlign:'center', border:'2px solid', borderColor: area===b.id ? '#2563eb' : 'rgba(0,0,0,0.07)', bgcolor: area===b.id ? 'rgba(37,99,235,0.06)' : '#fff', boxShadow:'none', transition:'all 0.2s', '&:hover':{ borderColor:'#2563eb', transform:'translateY(-2px)' } }}>
//                                             <Typography sx={{ fontSize:'2rem', mb:1 }}>{b.emoji}</Typography>
//                                             <Typography sx={{ fontSize:'0.82rem', fontWeight:600, color: area===b.id ? '#2563eb' : '#374151' }}>{b.label}</Typography>
//                                         </Card>
//                                     </Grid>
//                                 ))}
//                             </Grid>
//                         )}

//                         {/* STEP 1 */}
//                         {step === 1 && (
//                             <Box>
//                                 <Typography sx={{ fontSize:'0.875rem', color:'#64748b', mb:2.5 }}>Select all symptoms you are currently experiencing.</Typography>
//                                 {sympLoading ? (
//                                     <Box sx={{ display:'flex', justifyContent:'center', py:4 }}><CircularProgress size={36} sx={{ color:'#2563eb' }} /></Box>
//                                 ) : (
//                                     <>
//                                         <Box sx={{ position:'relative', mb:2.5 }}>
//                                             <SearchIcon sx={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', fontSize:20 }} />
//                                             <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search symptoms..." style={{ width:'100%', padding:'10px 12px 10px 38px', borderRadius:'12px', border:'1.5px solid #e2e8f0', fontSize:'0.875rem', outline:'none', fontFamily:'inherit', backgroundColor:'#f8fafc', boxSizing:'border-box' }} />
//                                         </Box>
//                                         {selected.length > 0 && (
//                                             <Box sx={{ mb:2, p:2, borderRadius:'12px', bgcolor:'rgba(37,99,235,0.05)', border:'1px dashed rgba(37,99,235,0.3)' }}>
//                                                 <Typography sx={{ fontSize:'0.72rem', fontWeight:700, color:'#2563eb', mb:1, textTransform:'uppercase', letterSpacing:'1px' }}>Selected ({selected.length})</Typography>
//                                                 <Box sx={{ display:'flex', flexWrap:'wrap', gap:0.8 }}>
//                                                     {selected.map((s) => <Chip key={s} label={s} size="small" onDelete={() => toggleSymptom(s)} sx={{ bgcolor:'#2563eb', color:'#fff', fontWeight:600, fontSize:'0.75rem', '& .MuiChip-deleteIcon':{ color:'rgba(255,255,255,0.7)' } }} />)}
//                                                 </Box>
//                                             </Box>
//                                         )}
//                                         <Box sx={{ display:'flex', flexWrap:'wrap', gap:1, maxHeight:320, overflowY:'auto', pr:1 }}>
//                                             {displayedSymptoms.map((s) => (
//                                                 <Chip key={s} label={s} clickable onClick={() => toggleSymptom(s)} sx={{ borderRadius:'10px', fontWeight:500, fontSize:'0.82rem', bgcolor: selected.includes(s)?'#2563eb':'#f1f5f9', color: selected.includes(s)?'#fff':'#374151', border:'1.5px solid', borderColor: selected.includes(s)?'#2563eb':'#e2e8f0', '&:hover':{ bgcolor: selected.includes(s)?'#1d4ed8':'#e2e8f0' } }} />
//                                             ))}
//                                             {displayedSymptoms.length === 0 && <Typography sx={{ fontSize:'0.875rem', color:'#94a3b8' }}>No symptoms found.</Typography>}
//                                         </Box>
//                                     </>
//                                 )}
//                             </Box>
//                         )}

//                         {/* STEP 2 */}
//                         {step === 2 && (
//                             <Box>
//                                 <Box sx={{ mb:4 }}>
//                                     <Box sx={{ display:'flex', justifyContent:'space-between', mb:1 }}>
//                                         <Typography sx={{ fontSize:'0.82rem', fontWeight:600, color:'#374151' }}>Overall Severity</Typography>
//                                         <Chip label={SEV_LABEL[severity-1]} size="small" sx={{ bgcolor:`${SEV_COLOR[severity-1]}20`, color:SEV_COLOR[severity-1], fontWeight:700, fontSize:'0.72rem' }} />
//                                     </Box>
//                                     <Slider value={severity} onChange={(_, v) => setSeverity(v)} min={1} max={5} step={1} marks sx={{ color:SEV_COLOR[severity-1], '& .MuiSlider-thumb':{ width:22, height:22 } }} />
//                                     <Box sx={{ display:'flex', justifyContent:'space-between' }}>
//                                         <Typography sx={{ fontSize:'0.7rem', color:'#94a3b8' }}>Minimal</Typography>
//                                         <Typography sx={{ fontSize:'0.7rem', color:'#94a3b8' }}>Severe</Typography>
//                                     </Box>
//                                 </Box>
//                                 <Typography sx={{ fontSize:'0.82rem', fontWeight:600, color:'#374151', mb:1.5 }}>How long have you had these symptoms?</Typography>
//                                 <Box sx={{ display:'flex', gap:1, flexWrap:'wrap', mb:3 }}>
//                                     {['< 1 day','1–3 days','3–7 days','1–2 weeks','> 2 weeks'].map((d) => (
//                                         <Chip key={d} label={d} clickable onClick={() => setDuration(d)} sx={{ borderRadius:'10px', fontWeight:500, bgcolor: duration===d?'#2563eb':'#f1f5f9', color: duration===d?'#fff':'#374151', border:'1.5px solid', borderColor: duration===d?'#2563eb':'#e2e8f0' }} />
//                                     ))}
//                                 </Box>
//                                 <Typography sx={{ fontSize:'0.82rem', fontWeight:600, color:'#374151', mb:1 }}>Additional notes (optional)</Typography>
//                                 <TextField fullWidth multiline rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. fever temperature, medications taken..." sx={{ '& .MuiOutlinedInput-root':{ borderRadius:'12px', bgcolor:'#f8fafc', '&:hover fieldset':{ borderColor:'#2563eb' }, '&.Mui-focused fieldset':{ borderColor:'#2563eb', borderWidth:2 } } }} />
//                             </Box>
//                         )}

//                         {/* STEP 3 */}
//                         {step === 3 && result && (
//                             <Box>
//                                 <Box sx={{ mb:3, p:2.5, borderRadius:'14px', bgcolor:RISK_BG[result.risk_level], border:`1px solid ${RISK_COLOR[result.risk_level]}40`, display:'flex', alignItems:'center', gap:2 }}>
//                                     {result.risk_level === 'Low' ? <CheckIcon sx={{ color:'#10b981', fontSize:30, flexShrink:0 }} /> : <WarnIcon sx={{ color:RISK_COLOR[result.risk_level], fontSize:30, flexShrink:0 }} />}
//                                     <Box sx={{ flex:1 }}>
//                                         <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.8 }}>
//                                             <Typography sx={{ fontWeight:700, color:'#0f172a' }}>
//                                                 {result.risk_level === 'Low' ? 'Low Risk — Monitor symptoms' : result.risk_level === 'Medium' ? 'Medium Risk — Consider seeing a doctor' : 'High Risk — See a doctor soon'}
//                                             </Typography>
//                                             <Typography sx={{ fontWeight:800, color:RISK_COLOR[result.risk_level] }}>{result.risk_score}%</Typography>
//                                         </Box>
//                                         <LinearProgress variant="determinate" value={result.risk_score} sx={{ height:6, borderRadius:3, bgcolor:'#e2e8f0', '& .MuiLinearProgress-bar':{ bgcolor:RISK_COLOR[result.risk_level], borderRadius:3 } }} />
//                                         <Typography sx={{ fontSize:'0.75rem', color:'#64748b', mt:0.8 }}>Based on {result.matched_symptoms?.length||0} recognised symptom(s).</Typography>
//                                     </Box>
//                                 </Box>
//                                 {result.unknown_symptoms?.length > 0 && (
//                                     <Alert severity="warning" sx={{ mb:2, borderRadius:'12px' }}>Unrecognised symptoms: {result.unknown_symptoms.join(', ')}</Alert>
//                                 )}
//                                 <Typography sx={{ fontWeight:700, color:'#0f172a', mb:2 }}>Possible Conditions</Typography>
//                                 <Box sx={{ display:'flex', flexDirection:'column', gap:1.5, mb:3 }}>
//                                     {result.predictions?.map((p, i) => (
//                                         <Box key={p.disease} sx={{ p:2.5, borderRadius:'14px', border:'1px solid #e2e8f0', bgcolor:'#fff' }}>
//                                             <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:1 }}>
//                                                 <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
//                                                     <Box sx={{ width:24, height:24, borderRadius:'50%', bgcolor:'rgba(37,99,235,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.68rem', fontWeight:700, color:'#2563eb' }}>{i+1}</Box>
//                                                     <Typography sx={{ fontWeight:700, color:'#0f172a', fontSize:'0.9rem' }}>{p.disease}</Typography>
//                                                 </Box>
//                                                 <Typography sx={{ fontWeight:800, color:'#2563eb', fontSize:'0.9rem' }}>{p.probability}%</Typography>
//                                             </Box>
//                                             <LinearProgress variant="determinate" value={p.probability} sx={{ height:6, borderRadius:3, bgcolor:'#f1f5f9', '& .MuiLinearProgress-bar':{ bgcolor: i===0?'#2563eb':'#94a3b8', borderRadius:3 } }} />
//                                         </Box>
//                                     ))}
//                                 </Box>
//                                 <Alert severity="info" sx={{ borderRadius:'14px' }} icon={<InfoIcon />}>
//                                     This analysis is for informational purposes only. Please consult a qualified healthcare provider.
//                                 </Alert>
//                             </Box>
//                         )}
//                     </>
//                 )}

//                 {/* Navigation */}
//                 {!loading && (
//                     <Box sx={{ display:'flex', justifyContent:'space-between', mt:4, gap:2 }}>
//                         <Box>
//                             {step > 0 && step < 3 && (
//                                 <Button startIcon={<BackIcon />} variant="outlined" onClick={() => setStep((s) => s-1)} sx={{ borderRadius:'12px', fontWeight:600, borderColor:'#e2e8f0', color:'#475569', '&:hover':{ borderColor:'#2563eb', color:'#2563eb' } }}>Back</Button>
//                             )}
//                         </Box>
//                         <Box sx={{ display:'flex', gap:1 }}>
//                             {step === 3 && (
//                                 <>
//                                     <Button startIcon={<ResetIcon />} variant="outlined" onClick={reset} sx={{ borderRadius:'12px', fontWeight:600, borderColor:'#e2e8f0', color:'#475569' }}>New Check</Button>
//                                     <Button startIcon={<HospitalIcon />} variant="contained" onClick={() => navigate('/appointments')} sx={{ borderRadius:'12px', fontWeight:700, background:'linear-gradient(135deg,#0ea5e9,#2563eb)' }}>Book Appointment</Button>
//                                 </>
//                             )}
//                             {step < 2 && (
//                                 <Button endIcon={<NextIcon />} variant="contained" disabled={!canNext[step]} onClick={() => setStep((s) => s+1)} sx={{ borderRadius:'12px', fontWeight:700, background:'linear-gradient(135deg,#0ea5e9,#2563eb)', '&:disabled':{ opacity:0.45 } }}>Continue</Button>
//                             )}
//                             {step === 2 && (
//                                 <Button endIcon={<SymptomIcon />} variant="contained" disabled={selected.length===0} onClick={analyze} sx={{ borderRadius:'12px', fontWeight:700, background:'linear-gradient(135deg,#0ea5e9,#2563eb)' }}>Analyse Symptoms</Button>
//                             )}
//                         </Box>
//                     </Box>
//                 )}
//             </Card>
//         </Container>
//     );
// };

// export default SymptomsPage;


import React, { useState, useEffect } from 'react';
import {
    Container, Box, Card, Typography, Grid, Button, Chip,
    CircularProgress, Alert, Stepper, Step, StepLabel,
    Slider, TextField, Divider, LinearProgress, Badge
} from '@mui/material';
import {
    MonitorHeart as SymptomIcon,
    Search as SearchIcon,
    ArrowForward as NextIcon,
    ArrowBack as BackIcon,
    CheckCircle as CheckIcon,
    LocalHospital as HospitalIcon,
    WarningAmber as WarnIcon,
    Info as InfoIcon,
    Refresh as ResetIcon,
    SmartToy as SmartToyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api, { symptomsAPI } from '../services/api';


const STEPS = ['Body Area', 'Symptoms', 'Details', 'Results'];


const BODY_AREAS = [
    { id: 'head',    label: 'Head & Neck', emoji: '🧠' },
    { id: 'chest',   label: 'Chest',       emoji: '❤️' },
    { id: 'abdomen', label: 'Abdomen',     emoji: '🫁' },
    { id: 'limbs',   label: 'Limbs',       emoji: '💪' },
    { id: 'skin',    label: 'Skin',        emoji: '🩹' },
    { id: 'general', label: 'General',     emoji: '🌡️' },
];


const AREA_KEYWORDS = {
    head:    ['head','neck','ear','eye','nose','throat','dizz','vision','migraine','sneez','sinus'],
    chest:   ['chest','breath','heart','cough','wheez','palpitat','lung'],
    abdomen: ['stomach','abdomen','nausea','vomit','diarrhea','constip','bloat','appetite','gastro'],
    limbs:   ['joint','muscle','knee','arm','leg','ankle','swelling','cramp','numb','weak'],
    skin:    ['skin','rash','itch','red','dry','hive','blister','bruise','yellow'],
    general: ['fever','fatigue','chill','sweat','weight','tired','malaise','loss'],
};


const SEV_LABEL = ['Minimal','Mild','Moderate','Significant','Severe'];
const SEV_COLOR = ['#10b981','#84cc16','#f59e0b','#ef4444','#7f1d1d'];
const RISK_COLOR = { Low:'#10b981', Medium:'#f59e0b', High:'#ef4444' };
const RISK_BG    = { Low:'rgba(16,185,129,0.08)', Medium:'rgba(245,158,11,0.08)', High:'rgba(239,68,68,0.08)' };


const SymptomsPage = () => {
    const navigate = useNavigate();


    const [step,        setStep]        = useState(0);
    const [area,        setArea]        = useState('');
    const [allSymptoms, setAllSymptoms] = useState([]);
    const [selected,    setSelected]    = useState([]);
    const [severity,    setSeverity]    = useState(3);
    const [duration,    setDuration]    = useState('');
    const [notes,       setNotes]       = useState('');
    const [search,      setSearch]      = useState('');
    const [loading,     setLoading]     = useState(false);
    const [saving,      setSaving]      = useState(false);
    const [sympLoading, setSympLoading] = useState(false);
    const [result,      setResult]      = useState(null);
    const [error,       setError]       = useState('');
    const [success,     setSuccess]     = useState('');


    useEffect(() => {
        const fetchSymptoms = async () => {
            setSympLoading(true);
            try {
                const res = await api.get('/symptoms/assessments/symptoms/');
                setAllSymptoms(res.data.symptoms || []);
            } catch {
                setError('Could not load symptoms. Make sure the ML service is running.');
            } finally {
                setSympLoading(false);
            }
        };
        fetchSymptoms();
    }, []);


    const filteredByArea = area
        ? allSymptoms.filter((s) => (AREA_KEYWORDS[area]||[]).some((kw) => s.toLowerCase().includes(kw)))
        : allSymptoms;
    const areaSymptoms     = filteredByArea.length >= 3 ? filteredByArea : allSymptoms;
    const displayedSymptoms = areaSymptoms.filter((s) => s.toLowerCase().includes(search.toLowerCase()));


    const toggleSymptom = (s) =>
        setSelected((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);


    const reset = () => {
        setStep(0); setArea(''); setSelected([]); setSeverity(3);
        setDuration(''); setNotes(''); setSearch(''); setResult(null); setError(''); setSuccess('');
    };


    const analyze = async () => {
        setLoading(true); setError('');
        try {
            const res = await api.post('/symptoms/assessments/predict/', {
                symptoms: selected, severity, duration, notes,
            });
            setResult(res.data);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || 'Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    /* ── Save assessment to database ─────────────────────────── */
    const saveAssessment = async () => {
        if (saving) return;
        
        if (!result) return;
        setSaving(true); 
        setError('');
        
        try {
            await symptomsAPI.createAssessment({
                symptoms: selected,
                severity: severity,
                duration: duration,
                risk_level: result.risk_level,
                risk_score: result.risk_score,
                top_prediction: result.predictions?.[0] || null,
                predictions: result.predictions || [],
                matched_symptoms: result.matched_symptoms || [],
                unknown_symptoms: result.unknown_symptoms || [],
                notes: notes,
            });
            setSuccess('Assessment saved to your health history!');
            setTimeout(() => {
                navigate('/history');
            }, 1500);
        } catch (err) {
            setSaving(false);
            setError('Failed to save assessment. Please try again.');
        }
    };


    const canNext = [!!area, selected.length > 0, !!duration, true];


    return (
        <Container maxWidth="md" sx={{ py:5 }}>
            {/* ========== AI MEDICAL ASSISTANT BUTTON (TOP RIGHT) ========== */}
            <Box
                onClick={() => navigate('/ai-assistant')}
                sx={{
                    position: 'fixed',
                    top: 100,
                    right: 20,
                    minWidth: 200,
                    py: 1.5,
                    px: 2.5,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 4px 14px rgba(16,185,129,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2,
                    cursor: 'pointer',
                    zIndex: 1400,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(16,185,129,0.5)'
                    },
                    '&:active': {
                        transform: 'translateY(0)'
                    }
                }}
            >
                <SmartToyIcon sx={{ 
                    color: 'white', 
                    fontSize: 26,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }} />
                <Box>
                    <Typography sx={{ 
                        color: 'white', 
                        fontWeight: 700, 
                        fontSize: '0.9rem',
                        letterSpacing: '0.3px',
                        lineHeight: 1.2
                    }}>
                        AI Medical
                    </Typography>
                    <Typography sx={{ 
                        color: 'rgba(255,255,255,0.95)', 
                        fontWeight: 600, 
                        fontSize: '0.8rem',
                        letterSpacing: '0.2px',
                        lineHeight: 1.2
                    }}>
                        Assistant
                    </Typography>
                </Box>
            </Box>


            <Box sx={{ mb:4, display:'flex', alignItems:'center', gap:1.5 }}>
                <Box sx={{ width:42, height:42, borderRadius:'13px', background:'linear-gradient(135deg,#0ea5e9,#2563eb)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <SymptomIcon sx={{ color:'#fff', fontSize:22 }} />
                </Box>
                <Box>
                    <Typography sx={{ fontFamily:'"Playfair Display",serif', fontWeight:700, fontSize:'1.5rem', color:'#0f172a', lineHeight:1.1 }}>
                        Symptom Checker
                    </Typography>
                    <Typography sx={{ fontSize:'0.8rem', color:'#64748b' }}>AI-powered health assessment</Typography>
                </Box>
            </Box>


            <Stepper activeStep={step} sx={{ mb:4 }}>
                {STEPS.map((label) => (
                    <Step key={label}>
                        <StepLabel sx={{ 
                            '& .MuiStepLabel-label':{ fontSize:'0.78rem', fontWeight:600 }, 
                            '& .MuiStepIcon-root.Mui-active':{ color:'#2563eb' }, 
                            '& .MuiStepIcon-root.Mui-completed':{ color:'#10b981' } 
                        }}>
                            {label}
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>


            <Card sx={{ borderRadius:'20px', border:'1px solid rgba(0,0,0,0.06)', boxShadow:'none', p:3 }}>
                <Typography sx={{ fontFamily:'"Playfair Display",serif', fontSize:'1.2rem', fontWeight:700, color:'#0f172a', mb:0.5 }}>
                    {['Select Body Area','Choose Symptoms','Describe Severity','Your Results'][step]}
                </Typography>
                <Divider sx={{ mb:3 }} />


                {error && <Alert severity="error" sx={{ mb:2, borderRadius:'12px' }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb:2, borderRadius:'12px' }} onClose={() => setSuccess('')}>{success}</Alert>}


                {loading ? (
                    <Box sx={{ py:6, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                        <CircularProgress size={48} sx={{ color:'#2563eb' }} />
                        <Typography sx={{ color:'#64748b', fontWeight:500 }}>Analysing your symptoms with AI...</Typography>
                    </Box>
                ) : (
                    <>
                        {/* STEP 0 */}
                        {step === 0 && (
                            <Grid container spacing={2}>
                                {BODY_AREAS.map((b) => (
                                    <Grid item xs={6} sm={4} key={b.id}>
                                        <Card onClick={() => setArea(b.id)} sx={{ 
                                            p:2.5, 
                                            borderRadius:'16px', 
                                            cursor:'pointer', 
                                            textAlign:'center', 
                                            border:'2px solid', 
                                            borderColor: area===b.id ? '#2563eb' : 'rgba(0,0,0,0.07)', 
                                            bgcolor: area===b.id ? 'rgba(37,99,235,0.06)' : '#fff', 
                                            boxShadow:'none', 
                                            transition:'all 0.2s', 
                                            '&:hover':{ 
                                                borderColor:'#2563eb', 
                                                transform:'translateY(-2px)' 
                                            } 
                                        }}>
                                            <Typography sx={{ fontSize:'2rem', mb:1 }}>{b.emoji}</Typography>
                                            <Typography sx={{ fontSize:'0.82rem', fontWeight:600, color: area===b.id ? '#2563eb' : '#374151' }}>{b.label}</Typography>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}


                        {/* STEP 1 */}
                        {step === 1 && (
                            <Box>
                                <Typography sx={{ fontSize:'0.875rem', color:'#64748b', mb:2.5 }}>Select all symptoms you are currently experiencing.</Typography>
                                {sympLoading ? (
                                    <Box sx={{ display:'flex', justifyContent:'center', py:4 }}><CircularProgress size={36} sx={{ color:'#2563eb' }} /></Box>
                                ) : (
                                    <>
                                        <Box sx={{ position:'relative', mb:2.5 }}>
                                            <SearchIcon sx={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', fontSize:20 }} />
                                            <input 
                                                value={search} 
                                                onChange={(e) => setSearch(e.target.value)} 
                                                placeholder="Search symptoms..." 
                                                style={{ 
                                                    width:'100%', 
                                                    padding:'10px 12px 10px 38px', 
                                                    borderRadius:'12px', 
                                                    border:'1.5px solid #e2e8f0', 
                                                    fontSize:'0.875rem', 
                                                    outline:'none', 
                                                    fontFamily:'inherit', 
                                                    backgroundColor:'#f8fafc', 
                                                    boxSizing:'border-box' 
                                                }} 
                                            />
                                        </Box>
                                        {selected.length > 0 && (
                                            <Box sx={{ mb:2, p:2, borderRadius:'12px', bgcolor:'rgba(37,99,235,0.05)', border:'1px dashed rgba(37,99,235,0.3)' }}>
                                                <Typography sx={{ fontSize:'0.72rem', fontWeight:700, color:'#2563eb', mb:1, textTransform:'uppercase', letterSpacing:'1px' }}>Selected ({selected.length})</Typography>
                                                <Box sx={{ display:'flex', flexWrap:'wrap', gap:0.8 }}>
                                                    {selected.map((s) => (
                                                        <Chip 
                                                            key={s} 
                                                            label={s} 
                                                            size="small" 
                                                            onDelete={() => toggleSymptom(s)} 
                                                            sx={{ 
                                                                bgcolor:'#2563eb', 
                                                                color:'#fff', 
                                                                fontWeight:600, 
                                                                fontSize:'0.75rem', 
                                                                '& .MuiChip-deleteIcon':{ color:'rgba(255,255,255,0.7)' } 
                                                            }} 
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                        <Box sx={{ display:'flex', flexWrap:'wrap', gap:1, maxHeight:320, overflowY:'auto', pr:1 }}>
                                            {displayedSymptoms.map((s) => (
                                                <Chip 
                                                    key={s} 
                                                    label={s} 
                                                    clickable 
                                                    onClick={() => toggleSymptom(s)} 
                                                    sx={{ 
                                                        borderRadius:'10px', 
                                                        fontWeight:500, 
                                                        fontSize:'0.82rem', 
                                                        bgcolor: selected.includes(s)?'#2563eb':'#f1f5f9', 
                                                        color: selected.includes(s)?'#fff':'#374151', 
                                                        border:'1.5px solid', 
                                                        borderColor: selected.includes(s)?'#2563eb':'#e2e8f0', 
                                                        '&:hover':{ 
                                                            bgcolor: selected.includes(s)?'#1d4ed8':'#e2e8f0' 
                                                        } 
                                                    }} 
                                                />
                                            ))}
                                            {displayedSymptoms.length === 0 && <Typography sx={{ fontSize:'0.875rem', color:'#94a3b8' }}>No symptoms found.</Typography>}
                                        </Box>
                                    </>
                                )}
                            </Box>
                        )}


                        {/* STEP 2 */}
                        {step === 2 && (
                            <Box>
                                <Box sx={{ mb:4 }}>
                                    <Box sx={{ display:'flex', justifyContent:'space-between', mb:1 }}>
                                        <Typography sx={{ fontSize:'0.82rem', fontWeight:600, color:'#374151' }}>Overall Severity</Typography>
                                        <Chip 
                                            label={SEV_LABEL[severity-1]} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor:`${SEV_COLOR[severity-1]}20`, 
                                                color:SEV_COLOR[severity-1], 
                                                fontWeight:700, 
                                                fontSize:'0.72rem' 
                                            }} 
                                        />
                                    </Box>
                                    <Slider 
                                        value={severity} 
                                        onChange={(_, v) => setSeverity(v)} 
                                        min={1} 
                                        max={5} 
                                        step={1} 
                                        marks 
                                        sx={{ 
                                            color:SEV_COLOR[severity-1], 
                                            '& .MuiSlider-thumb':{ width:22, height:22 } 
                                        }} 
                                    />
                                    <Box sx={{ display:'flex', justifyContent:'space-between' }}>
                                        <Typography sx={{ fontSize:'0.7rem', color:'#94a3b8' }}>Minimal</Typography>
                                        <Typography sx={{ fontSize:'0.7rem', color:'#94a3b8' }}>Severe</Typography>
                                    </Box>
                                </Box>
                                <Typography sx={{ fontSize:'0.82rem', fontWeight:600, color:'#374151', mb:1.5 }}>How long have you had these symptoms?</Typography>
                                <Box sx={{ display:'flex', gap:1, flexWrap:'wrap', mb:3 }}>
                                    {['< 1 day','1–3 days','3–7 days','1–2 weeks','> 2 weeks'].map((d) => (
                                        <Chip 
                                            key={d} 
                                            label={d} 
                                            clickable 
                                            onClick={() => setDuration(d)} 
                                            sx={{ 
                                                borderRadius:'10px', 
                                                fontWeight:500, 
                                                bgcolor: duration===d?'#2563eb':'#f1f5f9', 
                                                color: duration===d?'#fff':'#374151', 
                                                border:'1.5px solid', 
                                                borderColor: duration===d?'#2563eb':'#e2e8f0' 
                                            }} 
                                        />
                                    ))}
                                </Box>
                                <Typography sx={{ fontSize:'0.82rem', fontWeight:600, color:'#374151', mb:1 }}>Additional notes (optional)</Typography>
                                <TextField 
                                    fullWidth 
                                    multiline 
                                    rows={3} 
                                    value={notes} 
                                    onChange={(e) => setNotes(e.target.value)} 
                                    placeholder="e.g. fever temperature, medications taken..." 
                                    sx={{ 
                                        '& .MuiOutlinedInput-root':{ 
                                            borderRadius:'12px', 
                                            bgcolor:'#f8fafc', 
                                            '&:hover fieldset':{ borderColor:'#2563eb' }, 
                                            '&.Mui-focused fieldset':{ borderColor:'#2563eb', borderWidth:2 } 
                                        } 
                                    }} 
                                />
                            </Box>
                        )}


                        {/* STEP 3 */}
                        {step === 3 && result && (
                            <Box>
                                <Box sx={{ mb:3, p:2.5, borderRadius:'14px', bgcolor:RISK_BG[result.risk_level], border:`1px solid ${RISK_COLOR[result.risk_level]}40`, display:'flex', alignItems:'center', gap:2 }}>
                                    {result.risk_level === 'Low' ? <CheckIcon sx={{ color:'#10b981', fontSize:30, flexShrink:0 }} /> : <WarnIcon sx={{ color:RISK_COLOR[result.risk_level], fontSize:30, flexShrink:0 }} />}
                                    <Box sx={{ flex:1 }}>
                                        <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.8 }}>
                                            <Typography sx={{ fontWeight:700, color:'#0f172a' }}>
                                                {result.risk_level === 'Low' ? 'Low Risk — Monitor symptoms' : result.risk_level === 'Medium' ? 'Medium Risk — Consider seeing a doctor' : 'High Risk — See a doctor soon'}
                                            </Typography>
                                            <Typography sx={{ fontWeight:800, color:RISK_COLOR[result.risk_level] }}>{result.risk_score}%</Typography>
                                        </Box>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={result.risk_score} 
                                            sx={{ 
                                                height:6, 
                                                borderRadius:3, 
                                                bgcolor:'#e2e8f0', 
                                                '& .MuiLinearProgress-bar':{ 
                                                    bgcolor:RISK_COLOR[result.risk_level], 
                                                    borderRadius:3 
                                                } 
                                            }} 
                                        />
                                        <Typography sx={{ fontSize:'0.75rem', color:'#64748b', mt:0.8 }}>
                                            Based on {result.matched_symptoms?.length||0} recognised symptom(s).
                                        </Typography>
                                    </Box>
                                </Box>
                                {result.unknown_symptoms?.length > 0 && (
                                    <Alert severity="warning" sx={{ mb:2, borderRadius:'12px' }}>
                                        Unrecognised symptoms: {result.unknown_symptoms.join(', ')}
                                    </Alert>
                                )}
                                <Typography sx={{ fontWeight:700, color:'#0f172a', mb:2 }}>Possible Conditions</Typography>
                                <Box sx={{ display:'flex', flexDirection:'column', gap:1.5, mb:3 }}>
                                    {result.predictions?.map((p, i) => (
                                        <Box key={p.disease} sx={{ p:2.5, borderRadius:'14px', border:'1px solid #e2e8f0', bgcolor:'#fff' }}>
                                            <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:1 }}>
                                                <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                                                    <Box sx={{ 
                                                        width:24, 
                                                        height:24, 
                                                        borderRadius:'50%', 
                                                        bgcolor:'rgba(37,99,235,0.1)', 
                                                        display:'flex', 
                                                        alignItems:'center', 
                                                        justifyContent:'center', 
                                                        fontSize:'0.68rem', 
                                                        fontWeight:700, 
                                                        color:'#2563eb' 
                                                    }}>
                                                        {i+1}
                                                    </Box>
                                                    <Typography sx={{ fontWeight:700, color:'#0f172a', fontSize:'0.9rem' }}>{p.disease}</Typography>
                                                </Box>
                                                <Typography sx={{ fontWeight:800, color:'#2563eb', fontSize:'0.9rem' }}>{p.probability}%</Typography>
                                            </Box>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={p.probability} 
                                                sx={{ 
                                                    height:6, 
                                                    borderRadius:3, 
                                                    bgcolor:'#f1f5f9', 
                                                    '& .MuiLinearProgress-bar':{ 
                                                        bgcolor: i===0?'#2563eb':'#94a3b8', 
                                                        borderRadius:3 
                                                    } 
                                                }} 
                                            />
                                        </Box>
                                    ))}
                                </Box>
                                <Alert severity="info" sx={{ borderRadius:'14px', mb:3 }} icon={<InfoIcon />}>
                                    This analysis is for informational purposes only. Please consult a qualified healthcare provider.
                                </Alert>
                            </Box>
                        )}
                    </>
                )}


                {/* Navigation Buttons */}
                {!loading && (
                    <Box sx={{ display:'flex', justifyContent:'space-between', mt:4, gap:2 }}>
                        <Box>
                            {step > 0 && step < 3 && (
                                <Button 
                                    startIcon={<BackIcon />} 
                                    variant="outlined" 
                                    onClick={() => setStep((s) => s-1)} 
                                    sx={{ 
                                        borderRadius:'12px', 
                                        fontWeight:600, 
                                        borderColor:'#e2e8f0', 
                                        color:'#475569', 
                                        '&:hover':{ borderColor:'#2563eb', color:'#2563eb' } 
                                    }}
                                >
                                    Back
                                </Button>
                            )}
                        </Box>
                        <Box sx={{ display:'flex', gap:1 }}>
                            {step === 3 && (
                                <>
                                    <Button 
                                        startIcon={<ResetIcon />} 
                                        variant="outlined" 
                                        onClick={reset} 
                                        disabled={saving}
                                        sx={{ 
                                            borderRadius:'12px', 
                                            fontWeight:600, 
                                            borderColor:'#e2e8f0', 
                                            color:'#475569',
                                            '&:disabled':{ opacity:0.6, cursor:'not-allowed' }
                                        }}
                                    >
                                        New Check
                                    </Button>
                                    <Button 
                                        startIcon={<HospitalIcon />} 
                                        variant="contained" 
                                        disabled={saving} 
                                        onClick={saveAssessment}
                                        sx={{ 
                                            borderRadius:'12px', 
                                            fontWeight:700, 
                                            background:'linear-gradient(135deg,#0ea5e9,#2563eb)',
                                            cursor: saving ? 'not-allowed' : 'pointer',
                                            '&:disabled':{ opacity:0.6, cursor:'not-allowed' }
                                        }}
                                    >
                                        {saving ? (
                                            <>
                                                <CircularProgress size={18} sx={{ mr:1, color:'inherit' }} />
                                                Saving…
                                            </>
                                        ) : (
                                            'Save & Continue'
                                        )}
                                    </Button>
                                </>
                            )}
                            {step < 2 && (
                                <Button 
                                    endIcon={<NextIcon />} 
                                    variant="contained" 
                                    disabled={!canNext[step]} 
                                    onClick={() => setStep((s) => s+1)} 
                                    sx={{ 
                                        borderRadius:'12px', 
                                        fontWeight:700, 
                                        background:'linear-gradient(135deg,#0ea5e9,#2563eb)', 
                                        '&:disabled':{ opacity:0.45 } 
                                    }}
                                >
                                    Continue
                                </Button>
                            )}
                            {step === 2 && (
                                <Button 
                                    endIcon={<SymptomIcon />} 
                                    variant="contained" 
                                    disabled={selected.length===0} 
                                    onClick={analyze} 
                                    sx={{ 
                                        borderRadius:'12px', 
                                        fontWeight:700, 
                                        background:'linear-gradient(135deg,#0ea5e9,#2563eb)' 
                                    }}
                                >
                                    Analyse Symptoms
                                </Button>
                            )}
                        </Box>
                    </Box>
                )}
            </Card>
        </Container>
    );
};


export default SymptomsPage;