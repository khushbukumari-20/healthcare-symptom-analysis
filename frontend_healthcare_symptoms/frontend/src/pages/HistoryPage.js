// import React, { useState } from 'react';
// import {
//     Container, Box, Card, Typography, Grid, Button, Chip,
//     Divider, TextField, InputAdornment, MenuItem, Dialog,
//     DialogTitle, DialogContent, DialogActions, LinearProgress, Avatar,
// } from '@mui/material';
// import {
//     History as HistIcon,
//     Search as SearchIcon,
//     FilterList as FilterIcon,
//     MonitorHeart as SymptomIcon,
//     CalendarMonth as DateIcon,
//     ExpandMore as ExpandIcon,
//     CheckCircle as OkIcon,
//     Warning as WarnIcon,
//     Error as DangerIcon,
//     Visibility as ViewIcon,
//     FileDownload as DownloadIcon,
//     TrendingUp as TrendIcon,
// } from '@mui/icons-material';

// /* ── risk styling ── */
// const RISK = {
//     Low:    { color:'#10b981', bg:'rgba(16,185,129,0.1)',  icon:<OkIcon     sx={{ fontSize:16 }} /> },
//     Medium: { color:'#f59e0b', bg:'rgba(245,158,11,0.1)',  icon:<WarnIcon   sx={{ fontSize:16 }} /> },
//     High:   { color:'#ef4444', bg:'rgba(239,68,68,0.1)',   icon:<DangerIcon sx={{ fontSize:16 }} /> },
// };

// /* ── mock history data ── */
// const MOCK_HISTORY = [
//     {
//         id:1, date:'2026-05-14', time:'11:30 AM', symptoms:['Headache','Fatigue','Runny nose'],
//         severity:'Moderate', duration:'3–7 days', risk:'Low',
//         conditions:[
//             { name:'Common Cold',        probability:74 },
//             { name:'Seasonal Allergies', probability:58 },
//             { name:'Sinusitis',          probability:32 },
//         ],
//         recommendations:['Rest and stay hydrated','Take antihistamines if allergy-related','Monitor temperature'],
//     },
//     {
//         id:2, date:'2026-05-08', time:'09:15 AM', symptoms:['Chest pain','Shortness of breath','Palpitations'],
//         severity:'Severe', duration:'< 1 day', risk:'High',
//         conditions:[
//             { name:'Anxiety / Panic Attack', probability:68 },
//             { name:'GERD',                   probability:45 },
//             { name:'Cardiac Arrhythmia',     probability:22 },
//         ],
//         recommendations:['Consult a cardiologist immediately','Avoid caffeine and stress','Monitor heart rate'],
//     },
//     {
//         id:3, date:'2026-04-29', time:'03:45 PM', symptoms:['Rash','Itching','Redness'],
//         severity:'Mild', duration:'1–3 days', risk:'Low',
//         conditions:[
//             { name:'Contact Dermatitis', probability:82 },
//             { name:'Eczema',             probability:54 },
//             { name:'Hives',              probability:38 },
//         ],
//         recommendations:['Apply hydrocortisone cream','Avoid allergen contact','See dermatologist if spreading'],
//     },
//     {
//         id:4, date:'2026-04-15', time:'08:00 AM', symptoms:['Fever','Chills','Muscle ache','Fatigue'],
//         severity:'Significant', duration:'1–2 weeks', risk:'Medium',
//         conditions:[
//             { name:'Influenza',       probability:79 },
//             { name:'Viral Infection', probability:61 },
//             { name:'COVID-19',        probability:42 },
//         ],
//         recommendations:['Take antiviral medication','Rest and isolate','Visit a doctor if fever persists >3 days'],
//     },
// ];

// /* ── history card ── */
// const HistoryCard = ({ record, onClick }) => {
//     const r = RISK[record.risk];
//     return (
//         <Card onClick={onClick}
//             sx={{ borderRadius:'18px', border:'1px solid rgba(0,0,0,0.06)', boxShadow:'none', p:3,
//                 cursor:'pointer', transition:'all 0.2s',
//                 '&:hover':{ boxShadow:'0 8px 24px rgba(0,0,0,0.09)', borderColor:'rgba(37,99,235,0.25)', transform:'translateY(-2px)' } }}>
//             <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:2 }}>
//                 <Box>
//                     <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:0.4 }}>
//                         <DateIcon sx={{ fontSize:15, color:'#94a3b8' }} />
//                         <Typography sx={{ fontSize:'0.78rem', color:'#64748b' }}>{record.date} · {record.time}</Typography>
//                     </Box>
//                     <Typography sx={{ fontWeight:700, color:'#0f172a', fontSize:'0.95rem' }}>
//                         {record.conditions[0].name}
//                         <Typography component="span" sx={{ fontWeight:400, color:'#94a3b8', fontSize:'0.8rem' }}>
//                             {' '}&amp; {record.conditions.length - 1} more
//                         </Typography>
//                     </Typography>
//                 </Box>
//                 <Chip
//                     label={record.risk + ' Risk'}
//                     icon={<Box sx={{ color:r.color, display:'flex', pl:0.5 }}>{r.icon}</Box>}
//                     size="small"
//                     sx={{ bgcolor:r.bg, color:r.color, fontWeight:700, fontSize:'0.7rem', height:26 }}
//                 />
//             </Box>

//             {/* Symptoms */}
//             <Box sx={{ display:'flex', flexWrap:'wrap', gap:0.7, mb:2 }}>
//                 {record.symptoms.slice(0,4).map((s) => (
//                     <Chip key={s} label={s} size="small"
//                         sx={{ bgcolor:'#f1f5f9', color:'#475569', fontSize:'0.72rem', height:22, borderRadius:'6px' }} />
//                 ))}
//                 {record.symptoms.length > 4 && (
//                     <Chip label={`+${record.symptoms.length - 4}`} size="small"
//                         sx={{ bgcolor:'#e2e8f0', color:'#64748b', fontSize:'0.72rem', height:22, borderRadius:'6px' }} />
//                 )}
//             </Box>

//             {/* Top match */}
//             <Box sx={{ p:1.5, borderRadius:'10px', bgcolor:'#f8fafc', border:'1px solid #e2e8f0' }}>
//                 <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:0.8 }}>
//                     <Typography sx={{ fontSize:'0.72rem', fontWeight:600, color:'#64748b' }}>Top match</Typography>
//                     <Typography sx={{ fontSize:'0.78rem', fontWeight:700, color:'#2563eb' }}>
//                         {record.conditions[0].probability}%
//                     </Typography>
//                 </Box>
//                 <LinearProgress variant="determinate" value={record.conditions[0].probability}
//                     sx={{ height:5, borderRadius:3, bgcolor:'#e2e8f0',
//                         '& .MuiLinearProgress-bar':{ bgcolor:'#2563eb', borderRadius:3 } }} />
//             </Box>

//             <Box sx={{ display:'flex', justifyContent:'flex-end', mt:2 }}>
//                 <Button size="small" endIcon={<ViewIcon sx={{ fontSize:14 }} />}
//                     sx={{ fontSize:'0.75rem', fontWeight:600, color:'#2563eb', textTransform:'none' }}>
//                     View details
//                 </Button>
//             </Box>
//         </Card>
//     );
// };

// /* ── detail dialog ── */
// const DetailDialog = ({ record, open, onClose }) => {
//     if (!record) return null;
//     const r = RISK[record.risk];
//     return (
//         <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
//             PaperProps={{ sx:{ borderRadius:'20px', p:1 } }}>
//             <DialogTitle>
//                 <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
//                     <Typography sx={{ fontFamily:'"Playfair Display",serif', fontWeight:700, fontSize:'1.15rem' }}>
//                         Assessment Details
//                     </Typography>
//                     <Chip label={record.risk + ' Risk'} size="small"
//                         sx={{ bgcolor:r.bg, color:r.color, fontWeight:700, fontSize:'0.72rem' }} />
//                 </Box>
//                 <Typography sx={{ fontSize:'0.78rem', color:'#94a3b8', mt:0.3 }}>
//                     {record.date} · {record.time} · Severity: {record.severity} · Duration: {record.duration}
//                 </Typography>
//             </DialogTitle>
//             <DialogContent>
//                 {/* Symptoms */}
//                 <Typography sx={{ fontWeight:700, color:'#0f172a', mb:1.5 }}>Reported Symptoms</Typography>
//                 <Box sx={{ display:'flex', flexWrap:'wrap', gap:0.8, mb:3 }}>
//                     {record.symptoms.map((s) => (
//                         <Chip key={s} label={s} size="small"
//                             sx={{ bgcolor:'rgba(37,99,235,0.08)', color:'#2563eb', fontWeight:600, fontSize:'0.78rem', borderRadius:'8px' }} />
//                     ))}
//                 </Box>

//                 <Divider sx={{ mb:3 }} />

//                 {/* Conditions */}
//                 <Typography sx={{ fontWeight:700, color:'#0f172a', mb:2 }}>Possible Conditions</Typography>
//                 {record.conditions.map((c, i) => (
//                     <Box key={c.name} sx={{ mb:1.8 }}>
//                         <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.6 }}>
//                             <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
//                                 <Box sx={{ width:22, height:22, borderRadius:'50%', bgcolor:'rgba(37,99,235,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', fontWeight:700, color:'#2563eb' }}>
//                                     {i+1}
//                                 </Box>
//                                 <Typography sx={{ fontSize:'0.875rem', fontWeight:600, color:'#0f172a' }}>{c.name}</Typography>
//                             </Box>
//                             <Typography sx={{ fontSize:'0.875rem', fontWeight:700, color:'#2563eb' }}>{c.probability}%</Typography>
//                         </Box>
//                         <LinearProgress variant="determinate" value={c.probability}
//                             sx={{ height:6, borderRadius:3, bgcolor:'#f1f5f9',
//                                 '& .MuiLinearProgress-bar':{ bgcolor: i===0?'#2563eb':'#94a3b8', borderRadius:3 } }} />
//                     </Box>
//                 ))}

//                 <Divider sx={{ my:3 }} />

//                 {/* Recommendations */}
//                 <Typography sx={{ fontWeight:700, color:'#0f172a', mb:1.5 }}>Recommendations</Typography>
//                 {record.recommendations.map((rec, i) => (
//                     <Box key={i} sx={{ display:'flex', alignItems:'flex-start', gap:1.2, mb:1 }}>
//                         <OkIcon sx={{ color:'#10b981', fontSize:17, mt:0.2, flexShrink:0 }} />
//                         <Typography sx={{ fontSize:'0.875rem', color:'#374151' }}>{rec}</Typography>
//                     </Box>
//                 ))}
//             </DialogContent>
//             <DialogActions sx={{ px:3, pb:3, gap:1 }}>
//                 <Button startIcon={<DownloadIcon />} variant="outlined"
//                     sx={{ borderRadius:'10px', fontWeight:600, borderColor:'#e2e8f0', color:'#475569' }}>
//                     Export PDF
//                 </Button>
//                 <Button onClick={onClose} variant="contained"
//                     sx={{ borderRadius:'10px', fontWeight:700, background:'linear-gradient(135deg,#0ea5e9,#2563eb)', px:3 }}>
//                     Close
//                 </Button>
//             </DialogActions>
//         </Dialog>
//     );
// };

// const HistoryPage = () => {
//     const [search,    setSearch]    = useState('');
//     const [riskFilter,setRiskFilter]= useState('All');
//     const [selected,  setSelected]  = useState(null);

//     const filtered = MOCK_HISTORY.filter((r) => {
//         const matchRisk   = riskFilter === 'All' || r.risk === riskFilter;
//         const matchSearch = r.symptoms.some((s) => s.toLowerCase().includes(search.toLowerCase()))
//                          || r.conditions.some((c) => c.name.toLowerCase().includes(search.toLowerCase()));
//         return matchRisk && matchSearch;
//     });

//     return (
//         <Container maxWidth="lg" sx={{ py:5 }}>

//             {/* Header */}
//             <Box sx={{ mb:4 }}>
//                 <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:0.5 }}>
//                     <Box sx={{ width:42, height:42, borderRadius:'13px', background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center' }}>
//                         <HistIcon sx={{ color:'#fff', fontSize:22 }} />
//                     </Box>
//                     <Typography sx={{ fontFamily:'"Playfair Display",serif', fontWeight:700, fontSize:'1.6rem', color:'#0f172a' }}>
//                         Health History
//                     </Typography>
//                 </Box>
//                 <Typography sx={{ fontSize:'0.875rem', color:'#64748b', ml:7 }}>
//                     Your past symptom assessments and AI analysis results
//                 </Typography>
//             </Box>

//             {/* Summary cards */}
//             <Grid container spacing={2} sx={{ mb:4 }}>
//                 {[
//                     { label:'Total Checks',  value: MOCK_HISTORY.length, color:'#2563eb', bg:'rgba(37,99,235,0.08)'  },
//                     { label:'Low Risk',      value: MOCK_HISTORY.filter((r)=>r.risk==='Low').length,    color:'#10b981', bg:'rgba(16,185,129,0.08)' },
//                     { label:'Medium Risk',   value: MOCK_HISTORY.filter((r)=>r.risk==='Medium').length, color:'#f59e0b', bg:'rgba(245,158,11,0.08)'  },
//                     { label:'High Risk',     value: MOCK_HISTORY.filter((r)=>r.risk==='High').length,   color:'#ef4444', bg:'rgba(239,68,68,0.08)'   },
//                 ].map((s) => (
//                     <Grid item xs={6} sm={3} key={s.label}>
//                         <Card sx={{ borderRadius:'16px', border:'1px solid rgba(0,0,0,0.06)', boxShadow:'none', p:2.5, textAlign:'center' }}>
//                             <Typography sx={{ fontSize:'2rem', fontWeight:800, color:s.color }}>{s.value}</Typography>
//                             <Typography sx={{ fontSize:'0.78rem', color:'#64748b', fontWeight:600 }}>{s.label}</Typography>
//                         </Card>
//                     </Grid>
//                 ))}
//             </Grid>

//             {/* Filters */}
//             <Box sx={{ display:'flex', gap:2, mb:3, flexWrap:'wrap', alignItems:'center' }}>
//                 <TextField size="small" placeholder="Search symptoms or conditions..."
//                     value={search} onChange={(e) => setSearch(e.target.value)}
//                     InputProps={{ startAdornment:<InputAdornment position="start"><SearchIcon sx={{ fontSize:18, color:'#94a3b8' }} /></InputAdornment> }}
//                     sx={{ flex:1, minWidth:200,
//                         '& .MuiOutlinedInput-root':{ borderRadius:'12px', bgcolor:'#fff',
//                             '&:hover fieldset':{ borderColor:'#2563eb' },
//                             '&.Mui-focused fieldset':{ borderColor:'#2563eb' } } }}
//                 />
//                 <Box sx={{ display:'flex', gap:1 }}>
//                     {['All','Low','Medium','High'].map((r) => (
//                         <Chip key={r} label={r} clickable onClick={() => setRiskFilter(r)}
//                             sx={{
//                                 borderRadius:'10px', fontWeight:600,
//                                 bgcolor:     riskFilter === r ? '#2563eb' : '#f1f5f9',
//                                 color:       riskFilter === r ? '#fff'    : '#475569',
//                                 border:'1.5px solid',
//                                 borderColor: riskFilter === r ? '#2563eb' : '#e2e8f0',
//                             }}
//                         />
//                     ))}
//                 </Box>
//             </Box>

//             {/* List */}
//             {filtered.length === 0 ? (
//                 <Box sx={{ textAlign:'center', py:8 }}>
//                     <HistIcon sx={{ fontSize:56, color:'#e2e8f0', mb:2 }} />
//                     <Typography sx={{ fontWeight:600, color:'#94a3b8' }}>No assessments found</Typography>
//                 </Box>
//             ) : (
//                 <Grid container spacing={2.5}>
//                     {filtered.map((r) => (
//                         <Grid item xs={12} md={6} key={r.id}>
//                             <HistoryCard record={r} onClick={() => setSelected(r)} />
//                         </Grid>
//                     ))}
//                 </Grid>
//             )}

//             <DetailDialog record={selected} open={!!selected} onClose={() => setSelected(null)} />
//         </Container>
//     );
// };

// export default HistoryPage;


import React, { useState, useEffect } from 'react';
import {
    Container, Box, Card, Typography, Grid, Button, Chip,
    Divider, TextField, InputAdornment, Dialog, DialogTitle,
    DialogContent, DialogActions, LinearProgress, CircularProgress,
    Alert,
} from '@mui/material';
import {
    History as HistIcon,
    Search as SearchIcon,
    CheckCircle as OkIcon,
    Warning as WarnIcon,
    Error as DangerIcon,
    Visibility as ViewIcon,
    Refresh as RefreshIcon,
    DeleteOutlined as DeleteIcon,
    LocalHospital as HospIcon,
    Shield as ShieldIcon,
    CalendarMonth as DateIcon,
    MonitorHeart as SymptomIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { symptomsAPI } from '../services/api';

/* ── Risk styles ─────────────────────────────────────────── */
const RISK = {
    Low   : { color:'#10b981', bg:'rgba(16,185,129,0.1)',  icon:<OkIcon     sx={{ fontSize:16 }} /> },
    Medium: { color:'#f59e0b', bg:'rgba(245,158,11,0.1)',  icon:<WarnIcon   sx={{ fontSize:16 }} /> },
    High  : { color:'#ef4444', bg:'rgba(239,68,68,0.1)',   icon:<DangerIcon sx={{ fontSize:16 }} /> },
};

/*
  Backend API field names (from symptoms/serializers.py):
  LIST  → id, symptoms, severity, duration, risk_level, risk_score,
           top_prediction:{disease,probability}, total_severity, created_at
  DETAIL→ + predictions:[{rank,disease,probability,description,precautions}],
             matched_symptoms:[{name,severity}], unknown_symptoms[], notes
*/

/* ── History Card ────────────────────────────────────────── */
const HistoryCard = ({ record, onView, onDelete }) => {
    // API uses risk_level, not risk
    const rStyle  = RISK[record.risk_level] || RISK['Low'];
    const topPred = record.top_prediction;   // { disease, probability }
    const date    = new Date(record.created_at);

    return (
        <Card sx={{
            borderRadius:'18px', border:'1px solid rgba(0,0,0,0.06)',
            boxShadow:'none', p:3, transition:'all 0.2s',
            '&:hover':{ boxShadow:'0 8px 24px rgba(0,0,0,0.09)',
                        borderColor:'rgba(37,99,235,0.25)', transform:'translateY(-2px)' },
        }}>
            {/* Top row */}
            <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:2 }}>
                <Box>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:0.4 }}>
                        <DateIcon sx={{ fontSize:15, color:'#94a3b8' }} />
                        <Typography sx={{ fontSize:'0.78rem', color:'#64748b' }}>
                            {date.toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' })}
                            {' · '}
                            {date.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
                        </Typography>
                    </Box>
                    <Typography sx={{ fontWeight:700, color:'#0f172a', fontSize:'0.95rem' }}>
                        {topPred ? topPred.disease : 'Assessment Result'}
                        {topPred && (
                            <Typography component="span" sx={{ fontWeight:400, color:'#94a3b8', fontSize:'0.8rem' }}>
                                {' '}(top match)
                            </Typography>
                        )}
                    </Typography>
                </Box>
                <Chip
                    label={`${record.risk_level} Risk`}
                    icon={<Box sx={{ color:rStyle.color, display:'flex', pl:0.5 }}>{rStyle.icon}</Box>}
                    size="small"
                    sx={{ bgcolor:rStyle.bg, color:rStyle.color, fontWeight:700, fontSize:'0.7rem', height:26 }}
                />
            </Box>

            {/* Symptoms chips */}
            <Box sx={{ display:'flex', flexWrap:'wrap', gap:0.7, mb:2 }}>
                {record.symptoms.slice(0, 4).map((s) => (
                    <Chip key={s} label={s} size="small"
                        sx={{ bgcolor:'#f1f5f9', color:'#475569', fontSize:'0.72rem', height:22, borderRadius:'6px' }} />
                ))}
                {record.symptoms.length > 4 && (
                    <Chip label={`+${record.symptoms.length - 4}`} size="small"
                        sx={{ bgcolor:'#e2e8f0', color:'#64748b', fontSize:'0.72rem', height:22, borderRadius:'6px' }} />
                )}
            </Box>

            {/* Top match progress bar */}
            {topPred && (
                <Box sx={{ p:1.5, borderRadius:'10px', bgcolor:'#f8fafc', border:'1px solid #e2e8f0', mb:2 }}>
                    <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.8 }}>
                        <Typography sx={{ fontSize:'0.72rem', fontWeight:600, color:'#64748b' }}>
                            {topPred.disease}
                        </Typography>
                        <Typography sx={{ fontSize:'0.78rem', fontWeight:700, color:'#2563eb' }}>
                            {topPred.probability}%
                        </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={topPred.probability}
                        sx={{ height:5, borderRadius:3, bgcolor:'#e2e8f0',
                            '& .MuiLinearProgress-bar':{ bgcolor:'#2563eb', borderRadius:3 } }} />
                </Box>
            )}

            {/* Severity + actions */}
            <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <Box sx={{ display:'flex', gap:2 }}>
                    {record.duration && (
                        <Typography sx={{ fontSize:'0.73rem', color:'#94a3b8' }}>
                            Duration: <strong style={{ color:'#475569' }}>{record.duration}</strong>
                        </Typography>
                    )}
                    {record.total_severity != null && (
                        <Typography sx={{ fontSize:'0.73rem', color:'#94a3b8' }}>
                            Severity weight: <strong style={{ color:'#475569' }}>{record.total_severity}</strong>
                        </Typography>
                    )}
                </Box>
                <Box sx={{ display:'flex', gap:1 }}>
                    <Button size="small" startIcon={<DeleteIcon sx={{ fontSize:14 }} />}
                        onClick={(e) => { e.stopPropagation(); onDelete(record.id); }}
                        sx={{ fontSize:'0.72rem', color:'#ef4444', textTransform:'none', p:'4px 8px',
                            '&:hover':{ bgcolor:'rgba(239,68,68,0.06)' } }}>
                        Delete
                    </Button>
                    <Button size="small" endIcon={<ViewIcon sx={{ fontSize:14 }} />}
                        onClick={() => onView(record.id)}
                        sx={{ fontSize:'0.72rem', fontWeight:600, color:'#2563eb', textTransform:'none', p:'4px 8px',
                            '&:hover':{ bgcolor:'rgba(37,99,235,0.06)' } }}>
                        Details
                    </Button>
                </Box>
            </Box>
        </Card>
    );
};

/* ── Detail Dialog — fetches full record on open ─────────── */
const DetailDialog = ({ assessmentId, open, onClose }) => {
    const navigate    = useNavigate();
    const [detail,    setDetail]    = useState(null);
    const [loading,   setLoading]   = useState(false);
    const [error,     setError]     = useState('');

    useEffect(() => {
        if (!open || !assessmentId) return;
        const fetch = async () => {
            setLoading(true); setError('');
            try {
                const res = await symptomsAPI.getAssessment(assessmentId);
                setDetail(res.data);
            } catch {
                setError('Could not load assessment details.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [open, assessmentId]);

    const handleClose = () => { setDetail(null); onClose(); };
    const rStyle = detail ? (RISK[detail.risk_level] || RISK['Low']) : null;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
            PaperProps={{ sx:{ borderRadius:'20px', p:1 } }}>
            <DialogTitle>
                <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <Typography sx={{ fontFamily:'"Playfair Display",serif', fontWeight:700, fontSize:'1.1rem' }}>
                        Assessment Details
                    </Typography>
                    {detail && rStyle && (
                        <Chip label={`${detail.risk_level} Risk`} size="small"
                            sx={{ bgcolor:rStyle.bg, color:rStyle.color, fontWeight:700 }} />
                    )}
                </Box>
                {detail && (
                    <Typography sx={{ fontSize:'0.76rem', color:'#94a3b8', mt:0.5 }}>
                        {new Date(detail.created_at).toLocaleString()}
                        {detail.severity  ? ` · Severity ${detail.severity}/5` : ''}
                        {detail.duration  ? ` · ${detail.duration}` : ''}
                        {detail.risk_score != null ? ` · Risk score ${detail.risk_score}%` : ''}
                    </Typography>
                )}
            </DialogTitle>

            <DialogContent sx={{ pt:'8px !important' }}>

                {/* Loading */}
                {loading && (
                    <Box sx={{ display:'flex', justifyContent:'center', py:6 }}>
                        <CircularProgress size={36} sx={{ color:'#2563eb' }} />
                    </Box>
                )}

                {/* Error */}
                {error && <Alert severity="error" sx={{ borderRadius:'10px' }}>{error}</Alert>}

                {/* Content */}
                {detail && !loading && (
                    <>
                        {/* Reported symptoms */}
                        <Typography sx={{ fontWeight:700, color:'#0f172a', mb:1.5 }}>
                            Reported Symptoms
                        </Typography>
                        <Box sx={{ display:'flex', flexWrap:'wrap', gap:0.8, mb:2.5 }}>
                            {detail.symptoms.map((s) => (
                                <Chip key={s} label={s} size="small"
                                    sx={{ bgcolor:'rgba(37,99,235,0.08)', color:'#2563eb',
                                        fontWeight:600, fontSize:'0.78rem', borderRadius:'8px' }} />
                            ))}
                        </Box>

                        {/* Matched symptoms with severity weights from Symptom-severity.csv */}
                        {detail.matched_symptoms?.length > 0 && (
                            <>
                                <Typography sx={{ fontWeight:700, color:'#0f172a', mb:1 }}>
                                    Symptom Severity Weights
                                </Typography>
                                <Box sx={{ display:'flex', flexWrap:'wrap', gap:0.8, mb:2.5 }}>
                                    {detail.matched_symptoms.map((s) => (
                                        <Chip
                                            key={s.name}
                                            label={`${s.name}  (weight: ${s.severity})`}
                                            size="small"
                                            sx={{ bgcolor:'#f1f5f9', color:'#374151',
                                                fontWeight:600, fontSize:'0.73rem', borderRadius:'8px' }}
                                        />
                                    ))}
                                </Box>
                            </>
                        )}

                        {/* Unknown symptoms */}
                        {detail.unknown_symptoms?.length > 0 && (
                            <Alert severity="warning" sx={{ mb:2, borderRadius:'10px', py:0.5 }}>
                                Not recognised by model: {detail.unknown_symptoms.join(', ')}
                            </Alert>
                        )}

                        <Divider sx={{ mb:2.5 }} />

                        {/* Predictions with description + precautions from all 4 CSVs */}
                        <Typography sx={{ fontWeight:700, color:'#0f172a', mb:2 }}>
                            Possible Conditions
                        </Typography>

                        {detail.predictions?.map((p, i) => (
                            <Box key={p.disease} sx={{ mb:2.5, p:2, borderRadius:'14px', border:'1px solid #e2e8f0', bgcolor:'#fff' }}>
                                {/* Rank + name + probability */}
                                <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:1 }}>
                                    <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                                        <Box sx={{ width:22, height:22, borderRadius:'50%',
                                            bgcolor:'rgba(37,99,235,0.1)', display:'flex',
                                            alignItems:'center', justifyContent:'center',
                                            fontSize:'0.65rem', fontWeight:700, color:'#2563eb' }}>
                                            {p.rank || i + 1}
                                        </Box>
                                        <Typography sx={{ fontWeight:700, color:'#0f172a', fontSize:'0.9rem' }}>
                                            {p.disease}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ fontWeight:800, color:'#2563eb' }}>
                                        {p.probability}%
                                    </Typography>
                                </Box>

                                {/* Progress bar */}
                                <LinearProgress variant="determinate" value={p.probability}
                                    sx={{ height:5, borderRadius:3, bgcolor:'#f1f5f9', mb:1.5,
                                        '& .MuiLinearProgress-bar':{ bgcolor:i===0?'#2563eb':'#94a3b8', borderRadius:3 } }} />

                                {/* Description from symptom_Description.csv */}
                                {p.description && (
                                    <Box sx={{ display:'flex', gap:1, mb:1.2 }}>
                                        <HospIcon sx={{ fontSize:15, color:'#64748b', mt:0.3, flexShrink:0 }} />
                                        <Typography sx={{ fontSize:'0.78rem', color:'#64748b', lineHeight:1.6 }}>
                                            {p.description}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Precautions from symptom_precaution.csv */}
                                {p.precautions?.length > 0 && (
                                    <Box sx={{ mt:1, p:1.5, borderRadius:'10px', bgcolor:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.15)' }}>
                                        <Box sx={{ display:'flex', alignItems:'center', gap:0.8, mb:1 }}>
                                            <ShieldIcon sx={{ fontSize:14, color:'#10b981' }} />
                                            <Typography sx={{ fontSize:'0.72rem', fontWeight:700, color:'#10b981',
                                                textTransform:'uppercase', letterSpacing:'0.5px' }}>
                                                Precautions
                                            </Typography>
                                        </Box>
                                        {p.precautions.map((prec, pi) => (
                                            <Box key={pi} sx={{ display:'flex', gap:1, mb:0.6 }}>
                                                <OkIcon sx={{ fontSize:13, color:'#10b981', mt:0.3, flexShrink:0 }} />
                                                <Typography sx={{ fontSize:'0.78rem', color:'#374151' }}>
                                                    {prec}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        ))}

                        {/* User notes */}
                        {detail.notes && (
                            <Box sx={{ p:2, bgcolor:'#f8fafc', borderRadius:'12px', border:'1px solid #e2e8f0' }}>
                                <Typography sx={{ fontSize:'0.73rem', fontWeight:700, color:'#64748b', mb:0.5 }}>
                                    Your Notes
                                </Typography>
                                <Typography sx={{ fontSize:'0.85rem', color:'#374151' }}>
                                    {detail.notes}
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ px:3, pb:3, gap:1 }}>
                <Button onClick={() => navigate('/appointments')} variant="outlined"
                    sx={{ borderRadius:'10px', fontWeight:600, borderColor:'#e2e8f0', color:'#475569' }}>
                    Book Appointment
                </Button>
                <Button onClick={handleClose} variant="contained"
                    sx={{ borderRadius:'10px', fontWeight:700,
                        background:'linear-gradient(135deg,#0ea5e9,#2563eb)', px:3 }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

/* ════════════════════════════════════════════════════════════
   HistoryPage
════════════════════════════════════════════════════════════ */
const HistoryPage = () => {
    const [records,    setRecords]    = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState('');
    const [search,     setSearch]     = useState('');
    const [riskFilter, setRiskFilter] = useState('All');
    const [selectedId, setSelectedId] = useState(null);  // open dialog with this ID

    /* ── Fetch all assessments ───────────────────────────── */
    const fetchHistory = async () => {
        setLoading(true); setError('');
        try {
            const res = await symptomsAPI.getAssessmentHistory();
            // API returns array directly or { results: [] } if paginated
            const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setRecords(data);
        } catch {
            setError('Could not load history. Make sure you are logged in and the server is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    /* ── Delete assessment ───────────────────────────────── */
    const handleDelete = async (id) => {
        try {
            await symptomsAPI.deleteAssessment(id);
            setRecords((prev) => prev.filter((r) => r.id !== id));
        } catch {
            setError('Could not delete this assessment.');
        }
    };

    /* ── Filter ──────────────────────────────────────────── */
    const filtered = records.filter((r) => {
        // risk_level is the API field (not risk)
        const matchRisk   = riskFilter === 'All' || r.risk_level === riskFilter;
        const matchSearch = !search
            || r.symptoms.some((s) => s.toLowerCase().includes(search.toLowerCase()))
            || r.top_prediction?.disease?.toLowerCase().includes(search.toLowerCase());
        return matchRisk && matchSearch;
    });

    /* ── Stats ───────────────────────────────────────────── */
    const statCards = [
        { label:'Total Checks', value:records.length,                                              color:'#2563eb', bg:'rgba(37,99,235,0.08)'  },
        { label:'Low Risk',     value:records.filter((r) => r.risk_level==='Low').length,          color:'#10b981', bg:'rgba(16,185,129,0.08)' },
        { label:'Medium Risk',  value:records.filter((r) => r.risk_level==='Medium').length,       color:'#f59e0b', bg:'rgba(245,158,11,0.08)'  },
        { label:'High Risk',    value:records.filter((r) => r.risk_level==='High').length,         color:'#ef4444', bg:'rgba(239,68,68,0.08)'   },
    ];

    /* ── Render ──────────────────────────────────────────── */
    return (
        <Container maxWidth="lg" sx={{ py:5 }}>

            {/* Header */}
            <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:4, flexWrap:'wrap', gap:2 }}>
                <Box>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:0.5 }}>
                        <Box sx={{ width:42, height:42, borderRadius:'13px',
                            background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                            display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <HistIcon sx={{ color:'#fff', fontSize:22 }} />
                        </Box>
                        <Typography sx={{ fontFamily:'"Playfair Display",serif', fontWeight:700, fontSize:'1.6rem', color:'#0f172a' }}>
                            Health History
                        </Typography>
                    </Box>
                    <Typography sx={{ fontSize:'0.875rem', color:'#64748b', ml:7 }}>
                        Your past symptom assessments and AI analysis results
                    </Typography>
                </Box>
                <Button startIcon={<RefreshIcon />} variant="outlined" onClick={fetchHistory}
                    sx={{ borderRadius:'12px', fontWeight:600, borderColor:'#e2e8f0', color:'#475569',
                        '&:hover':{ borderColor:'#8b5cf6', color:'#8b5cf6' } }}>
                    Refresh
                </Button>
            </Box>

            {/* Error */}
            {error && (
                <Alert severity="error" sx={{ mb:3, borderRadius:'12px' }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Stats */}
            {!loading && (
                <Grid container spacing={2} sx={{ mb:4 }}>
                    {statCards.map((s) => (
                        <Grid item xs={6} sm={3} key={s.label}>
                            <Card sx={{ borderRadius:'16px', border:'1px solid rgba(0,0,0,0.06)', boxShadow:'none', p:2.5, textAlign:'center' }}>
                                <Typography sx={{ fontSize:'2rem', fontWeight:800, color:s.color }}>{s.value}</Typography>
                                <Typography sx={{ fontSize:'0.78rem', color:'#64748b', fontWeight:600 }}>{s.label}</Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Filters */}
            <Box sx={{ display:'flex', gap:2, mb:3, flexWrap:'wrap', alignItems:'center' }}>
                <TextField size="small" placeholder="Search symptoms or conditions..."
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    InputProps={{ startAdornment:
                        <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize:18, color:'#94a3b8' }} />
                        </InputAdornment>
                    }}
                    sx={{ flex:1, minWidth:200,
                        '& .MuiOutlinedInput-root':{ borderRadius:'12px', bgcolor:'#fff',
                            '&:hover fieldset':{ borderColor:'#8b5cf6' },
                            '&.Mui-focused fieldset':{ borderColor:'#8b5cf6' } } }}
                />
                <Box sx={{ display:'flex', gap:1 }}>
                    {['All','Low','Medium','High'].map((r) => (
                        <Chip key={r} label={r} clickable onClick={() => setRiskFilter(r)}
                            sx={{ borderRadius:'10px', fontWeight:600,
                                bgcolor:     riskFilter===r ? '#2563eb' : '#f1f5f9',
                                color:       riskFilter===r ? '#fff'    : '#475569',
                                border:'1.5px solid',
                                borderColor: riskFilter===r ? '#2563eb' : '#e2e8f0' }}
                        />
                    ))}
                </Box>
            </Box>

            {/* Content */}
            {loading ? (
                <Box sx={{ display:'flex', justifyContent:'center', py:10 }}>
                    <CircularProgress size={44} sx={{ color:'#8b5cf6' }} />
                </Box>
            ) : filtered.length === 0 ? (
                <Box sx={{ textAlign:'center', py:10 }}>
                    <HistIcon sx={{ fontSize:56, color:'#e2e8f0', mb:2 }} />
                    <Typography sx={{ fontWeight:600, color:'#94a3b8', mb:1 }}>
                        {records.length === 0 ? 'No assessments yet' : 'No results match your filter'}
                    </Typography>
                    {records.length === 0 && (
                        <Button variant="contained" href="/symptoms"
                            sx={{ mt:2, borderRadius:'12px', fontWeight:700,
                                background:'linear-gradient(135deg,#0ea5e9,#2563eb)' }}>
                            Start Symptom Check
                        </Button>
                    )}
                </Box>
            ) : (
                <Grid container spacing={2.5}>
                    {filtered.map((r) => (
                        <Grid item xs={12} md={6} key={r.id}>
                            <HistoryCard
                                record={r}
                                onView={(id) => setSelectedId(id)}
                                onDelete={handleDelete}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Detail dialog — fetches full record when opened */}
            <DetailDialog
                assessmentId={selectedId}
                open={!!selectedId}
                onClose={() => setSelectedId(null)}
            />
        </Container>
    );
};

export default HistoryPage;