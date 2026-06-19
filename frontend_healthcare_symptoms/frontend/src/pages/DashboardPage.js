import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Box, Card, Typography, Grid, Button,
  Chip, LinearProgress, Divider, Skeleton, List, ListItem,
  ListItemAvatar, ListItemText, Avatar
} from '@mui/material';
import {
  MonitorHeart as SymptomIcon,
  CalendarMonth as CalendarIcon,
  History as HistoryIcon,
  PersonOutlined as ProfileIcon,
  TrendingUp as TrendIcon,
  Favorite as HeartIcon,
  ArrowForward as ArrowIcon,
  CheckCircleOutlined as CheckIcon,
  WaterDrop as BloodIcon,
  MonitorWeight as WeightIcon,
  Height as HeightIcon,
  Thermostat as BmiIcon,
  WarningAmber as WarningIcon,
  People as PeopleIcon,
  MedicalServices as MedicalIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';
import { symptomsAPI, appointmentAPI, patientAPI } from '../services/api';

const daysSince = (isoDate) => {
  if (!isoDate) return 1;
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
};

const formatDate = (isoDate) => {
  if (!isoDate) return null;
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const calculateHealthScore = (user, assessmentList, completion) => {
  let score = 0;

  if (user?.height && user?.weight) {
    const bmi = user.weight / ((user.height / 100) ** 2);
    if (bmi >= 18.5 && bmi < 25) score += 25;
    else if (bmi < 18.5) score += 15;
    else if (bmi < 30) score += 12;
    else score += 5;
  }

  if (assessmentList.length > 0) {
    const avgRisk = assessmentList.reduce((sum, a) => sum + (a.risk_score || 0), 0) / assessmentList.length;
    score += Math.round((100 - avgRisk) * 0.35);

    const sorted = [...assessmentList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const lastRisk = sorted[0]?.risk_level || 'Low';
    if (lastRisk === 'Low') score += 20;
    else if (lastRisk === 'Medium') score += 12;
    else score += 4;

    score += 5;
  }

  score += Math.round(completion * 0.15);
  return Math.min(100, Math.round(score));
};

const healthScoreLabel = (score) => {
  if (score === 0) return { label: 'Not calculated', color: '#94a3b8' };
  if (score >= 80) return { label: 'Excellent', color: '#10b981' };
  if (score >= 60) return { label: 'Good', color: '#0ea5e9' };
  if (score >= 40) return { label: 'Fair', color: '#f59e0b' };
  return { label: 'Needs attention', color: '#ef4444' };
};

const StatCard = ({ icon, label, value, sub, color, bg, loading }) => (
  <Card
    sx={{
      p: 3,
      borderRadius: '18px',
      border: '1px solid',
      borderColor: 'rgba(0,0,0,0.06)',
      boxShadow: 'none',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', bgcolor: bg, opacity: 0.25 }} />
    <Box sx={{ width: 44, height: 44, borderRadius: '13px', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
    </Box>
    {loading ? (
      <Skeleton width={60} height={36} />
    ) : (
      <Typography sx={{ fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</Typography>
    )}
    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', mt: 0.5 }}>{label}</Typography>
    {loading ? <Skeleton width={80} height={16} /> : sub && <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', mt: 0.4 }}>{sub}</Typography>}
  </Card>
);

const ActionCard = ({ icon, title, desc, color, bg, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      p: 3,
      borderRadius: '18px',
      cursor: 'pointer',
      border: '1.5px solid',
      borderColor: 'rgba(0,0,0,0.06)',
      boxShadow: 'none',
      transition: 'all 0.2s',
      '&:hover': { borderColor: color, transform: 'translateY(-3px)', boxShadow: `0 12px 30px ${bg}` },
    }}
  >
    <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
      <Box sx={{ color, display: 'flex', fontSize: '1.4rem' }}>{icon}</Box>
    </Box>
    <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>{title}</Typography>
    <Typography sx={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>{desc}</Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color }}>Get started</Typography>
      <ArrowIcon sx={{ fontSize: 14, color }} />
    </Box>
  </Card>
);

const HealthRow = ({ icon, label, value, unit, color }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.8, borderBottom: '1px solid #f1f5f9', '&:last-child': { borderBottom: 'none' } }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
      <Typography sx={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>{label}</Typography>
    </Box>
    <Box sx={{ textAlign: 'right' }}>
      {value ? (
        <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>
          {value} <Typography component="span" sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 400 }}>{unit}</Typography>
        </Typography>
      ) : (
        <Chip label="Not set" size="small" sx={{ bgcolor: '#f1f5f9', color: '#94a3b8', fontSize: '0.7rem', height: 22 }} />
      )}
    </Box>
  </Box>
);

const ActivityItem = ({ icon, title, time, status }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1.8, borderBottom: '1px solid #f1f5f9', '&:last-child': { borderBottom: 'none' } }}>
    <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.3 }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{title}</Typography>
      <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>{time}</Typography>
    </Box>
    <Chip
      label={status}
      size="small"
      sx={{
        height: 22,
        fontSize: '0.68rem',
        fontWeight: 700,
        bgcolor: status === 'Completed' ? 'rgba(16,185,129,0.1)' : status === 'Pending' ? 'rgba(245,158,11,0.1)' : 'rgba(37,99,235,0.1)',
        color: status === 'Completed' ? '#059669' : status === 'Pending' ? '#d97706' : '#2563eb',
      }}
    />
  </Box>
);

const getCompletion = (user) => {
  const fields = ['first_name', 'last_name', 'phone', 'age', 'gender', 'weight', 'height', 'blood_type'];
  const filled = fields.filter((f) => user?.[f]).length;
  return Math.round((filled / fields.length) * 100);
};

const PatientPreviewCard = ({ patients, loading, error, onViewAll }) => (
  <Card sx={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none', height: '100%' }}>
    <Box sx={{ p: 3, pb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
          My Patients
        </Typography>
        <Button
          size="small"
          endIcon={<ArrowIcon sx={{ fontSize: 14 }} />}
          onClick={onViewAll}
          sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', textTransform: 'none' }}
        >
          View all
        </Button>
      </Box>
    </Box>
    <Divider />
    <Box sx={{ p: 3 }}>
      {loading ? (
        <>
          <Skeleton height={56} />
          <Skeleton height={56} />
          <Skeleton height={56} />
        </>
      ) : error ? (
        <Typography sx={{ color: 'error.main', fontSize: '0.9rem' }}>{error}</Typography>
      ) : patients.length === 0 ? (
        <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>No patients found.</Typography>
      ) : (
        <List sx={{ p: 0 }}>
          {patients.slice(0, 5).map((patient) => {
            const name =
              [patient.first_name, patient.last_name].filter(Boolean).join(' ').trim() ||
              patient.name ||
              patient.username ||
              'Patient';

            return (
              <ListItem key={patient.id || patient.pk || name} sx={{ px: 0, py: 1.2, borderBottom: '1px solid #f1f5f9', '&:last-child': { borderBottom: 'none' } }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'rgba(37,99,235,0.1)', color: '#2563eb' }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 700, color: '#0f172a' }}>{name}</Typography>}
                  secondary={
                    <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {patient.email || patient.username || patient.phone || 'No contact info'}
                    </Typography>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  </Card>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = user?.role || 'patient';
  const completion = getCompletion(user);

  const bmi = user?.height && user?.weight ? (user.weight / ((user.height / 100) ** 2)).toFixed(1) : null;
  const bmiStatus = bmi
    ? bmi < 18.5 ? { label: 'Underweight', color: '#f59e0b' }
    : bmi < 25 ? { label: 'Normal', color: '#10b981' }
    : bmi < 30 ? { label: 'Overweight', color: '#f59e0b' }
    : { label: 'Obese', color: '#ef4444' }
    : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const isPatient = role === 'patient';
  const isDoctor = role === 'doctor';
  const isNurse = role === 'nurse';

  const [stats, setStats] = useState({
    assessmentCount: 0,
    appointmentCount: 0,
    healthScore: 0,
    daysActive: 1,
    firstSymptomDate: null,
    accountCreatedDate: null,
    loading: true,
  });

  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const createdAt = user?.created_at || user?.createdat || null;
        const daysActive = daysSince(createdAt);
        const accountCreatedDate = formatDate(createdAt);

        if (isPatient) {
          const [assessmentsRes, appointmentsRes] = await Promise.allSettled([
            symptomsAPI.getAssessmentHistory(),
            appointmentAPI.getAppointments(),
          ]);

          const assessmentList =
            assessmentsRes.status === 'fulfilled'
              ? (Array.isArray(assessmentsRes.value.data) ? assessmentsRes.value.data : assessmentsRes.value.data?.results || [])
              : [];

          const appointmentList =
            appointmentsRes.status === 'fulfilled'
              ? (Array.isArray(appointmentsRes.value.data) ? appointmentsRes.value.data : appointmentsRes.value.data?.results || [])
              : [];

          let firstSymptomDate = null;
          if (assessmentList.length > 0) {
            const sorted = [...assessmentList].sort((a, b) => new Date(a.created_at || a.createdat) - new Date(b.created_at || b.createdat));
            firstSymptomDate = formatDate(sorted[0].created_at || sorted[0].createdat);
          }

          const healthScore = calculateHealthScore(user, assessmentList, completion);

          setStats({
            assessmentCount: assessmentList.length,
            appointmentCount: appointmentList.length,
            healthScore,
            daysActive,
            firstSymptomDate,
            accountCreatedDate,
            loading: false,
          });
        } else {
          const appointmentsRes = await appointmentAPI.getAppointments().catch(() => ({ data: [] }));
          const appointmentList = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : appointmentsRes.data?.results || [];

          setStats({
            assessmentCount: 0,
            appointmentCount: appointmentList.length,
            healthScore: 0,
            daysActive,
            firstSymptomDate: null,
            accountCreatedDate,
            loading: false,
          });
        }
      } catch (err) {
        console.error('Dashboard stats fetch error:', err);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    if (user) fetchStats();
  }, [user, isPatient, completion]);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!isDoctor) return;
      try {
        setPatientsLoading(true);
        setPatientsError('');
        const res = await patientAPI.getAll();
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setPatients(data);
      } catch (err) {
        console.error('Failed to fetch patients:', err);
        setPatientsError('Unable to load patients.');
      } finally {
        setPatientsLoading(false);
      }
    };

    fetchPatients();
  }, [isDoctor]);

  const { assessmentCount, appointmentCount, healthScore, daysActive, firstSymptomDate, accountCreatedDate, loading } = stats;

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box
        sx={{
          borderRadius: '24px',
          mb: 4,
          background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0ea5e9 100%)',
          p: { xs: 3, md: 4.5 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ position: 'absolute', bottom: -60, right: 80, width: 240, height: 240, borderRadius: '50%', bgcolor: 'rgba(14,165,233,0.12)' }} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
          <Box>
            <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, mb: 0.8 }}>
              {greeting} 👋
            </Typography>
            <Typography sx={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, color: '#fff', mb: 1 }}>
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
            </Typography>

            <Chip
              label={role.charAt(0).toUpperCase() + role.slice(1)}
              size="small"
              sx={{
                bgcolor: role === 'doctor' ? 'rgba(16,185,129,0.15)' : role === 'patient' ? 'rgba(37,99,235,0.15)' : 'rgba(236,72,153,0.15)',
                color: role === 'doctor' ? '#059669' : role === 'patient' ? '#2563eb' : '#ec4899',
                fontWeight: 700,
                fontSize: '0.75rem',
                mt: 1,
              }}
            />

            <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', mt: 1 }}>
              {isPatient && "Here's your health overview for today."}
              {isDoctor && "Here's an overview of your appointments and patients."}
              {isNurse && "Here's your patient overview and tasks."}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {isPatient && (
              <>
                <Button onClick={() => navigate('/symptoms')} variant="contained" startIcon={<SymptomIcon />} sx={{ bgcolor: '#fff', color: '#0f172a', fontWeight: 700, borderRadius: '12px', px: 3, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}>
                  Check Symptoms
                </Button>
                <Button onClick={() => navigate('/appointments')} variant="outlined" startIcon={<CalendarIcon />} sx={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff', borderRadius: '12px', px: 3, '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
                  Book Appointment
                </Button>
              </>
            )}

            {isDoctor && (
              <>
                <Button onClick={() => navigate('/doctors/my-appointments')} variant="contained" startIcon={<CalendarIcon />} sx={{ bgcolor: '#fff', color: '#0f172a', fontWeight: 700, borderRadius: '12px', px: 3, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}>
                  My Appointments
                </Button>
                <Button onClick={() => navigate('/doctors/patients')} variant="outlined" startIcon={<PeopleIcon />} sx={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff', borderRadius: '12px', px: 3, '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
                  My Patients
                </Button>
              </>
            )}

            {isNurse && (
              <>
                <Button onClick={() => navigate('/nurses/patients')} variant="contained" startIcon={<PeopleIcon />} sx={{ bgcolor: '#fff', color: '#0f172a', fontWeight: 700, borderRadius: '12px', px: 3, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}>
                  All Patients
                </Button>
                <Button onClick={() => navigate('/nurses/tasks')} variant="outlined" startIcon={<MedicalIcon />} sx={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff', borderRadius: '12px', px: 3, '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
                  My Tasks
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {isPatient && (
          <>
            <Grid item xs={6} md={3}>
              <StatCard icon={<SymptomIcon />} label="Assessments" value={assessmentCount} sub={assessmentCount === 1 ? '1 total check' : `${assessmentCount} total checks`} color="#2563eb" bg="rgba(37,99,235,0.12)" loading={loading} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={<CalendarIcon />} label="Appointments" value={appointmentCount} sub={appointmentCount === 0 ? 'None scheduled' : `${appointmentCount} scheduled`} color="#0ea5e9" bg="rgba(14,165,233,0.12)" loading={loading} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={<HeartIcon />} label="Health Score" value={healthScore > 0 ? `${healthScore}` : '--'} sub={healthScoreLabel(healthScore).label} color="#ec4899" bg="rgba(236,72,153,0.12)" loading={loading} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={<TrendIcon />} label="Days Active" value={daysActive} sub={daysActive === 1 ? 'Since today' : `Since ${accountCreatedDate || '—'}`} color="#10b981" bg="rgba(16,185,129,0.12)" loading={loading} />
            </Grid>
          </>
        )}

        {isDoctor && (
          <>
            <Grid item xs={6} md={3}>
              <StatCard icon={<CalendarIcon />} label="Appointments" value={appointmentCount} sub={appointmentCount === 0 ? 'None today' : `${appointmentCount} today`} color="#0ea5e9" bg="rgba(14,165,233,0.12)" loading={loading} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={<PeopleIcon />} label="Patients" value={patients.length} sub="Total patients" color="#10b981" bg="rgba(16,185,129,0.12)" loading={patientsLoading} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={<MedicalIcon />} label="Consultations" value="0" sub="This month" color="#8b5cf6" bg="rgba(139,92,246,0.12)" loading={loading} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={<TrendIcon />} label="Days Active" value={daysActive} sub={daysActive === 1 ? 'Since today' : `Since ${accountCreatedDate || '—'}`} color="#f59e0b" bg="rgba(245,158,11,0.12)" loading={loading} />
            </Grid>
          </>
        )}

        {isNurse && (
          <>
            <Grid item xs={6} md={3}>
              <StatCard icon={<PeopleIcon />} label="Patients" value="0" sub="Assigned" color="#2563eb" bg="rgba(37,99,235,0.12)" loading={loading} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={<MedicalIcon />} label="Tasks" value="0" sub="Pending" color="#f59e0b" bg="rgba(245,158,11,0.12)" loading={loading} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={<CalendarIcon />} label="Shifts" value="0" sub="This week" color="#0ea5e9" bg="rgba(14,165,233,0.12)" loading={loading} />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={<TrendIcon />} label="Days Active" value={daysActive} sub={daysActive === 1 ? 'Since today' : `Since ${accountCreatedDate || '—'}`} color="#10b981" bg="rgba(16,185,129,0.12)" loading={loading} />
            </Grid>
          </>
        )}
      </Grid>

      <Grid container spacing={3}>
        {isPatient && (
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none', height: '100%' }}>
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Health Profile</Typography>
                  <Button size="small" onClick={() => navigate('/profile')} endIcon={<ArrowIcon sx={{ fontSize: 14 }} />} sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', textTransform: 'none' }}>
                    Edit
                  </Button>
                </Box>

                <Box sx={{ mb: 3, p: 2, borderRadius: '14px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>Profile Completion</Typography>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: completion >= 80 ? '#10b981' : '#f59e0b' }}>{completion}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={completion}
                    sx={{
                      height: 7,
                      borderRadius: 4,
                      bgcolor: '#e2e8f0',
                      '& .MuiLinearProgress-bar': { bgcolor: completion >= 80 ? '#10b981' : '#f59e0b', borderRadius: 4 },
                    }}
                  />
                  {completion < 100 && (
                    <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', mt: 0.8 }}>
                      Complete your profile for better health insights
                    </Typography>
                  )}
                </Box>

                <HealthRow icon={<BloodIcon sx={{ fontSize: 20 }} />} label="Blood Type" value={user?.blood_type} color="#ef4444" />
                <HealthRow icon={<WeightIcon sx={{ fontSize: 20 }} />} label="Weight" value={user?.weight} unit="kg" color="#8b5cf6" />
                <HealthRow icon={<HeightIcon sx={{ fontSize: 20 }} />} label="Height" value={user?.height} unit="cm" color="#0ea5e9" />
                <HealthRow icon={<BmiIcon sx={{ fontSize: 20 }} />} label="Age" value={user?.age} unit="yrs" color="#f59e0b" />

                {bmi && (
                  <Box sx={{ mt: 2.5, p: 2, borderRadius: '14px', bgcolor: `${bmiStatus.color}10`, border: `1px solid ${bmiStatus.color}30` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>BMI Index</Typography>
                      <Chip label={bmiStatus.label} size="small" sx={{ bgcolor: `${bmiStatus.color}20`, color: bmiStatus.color, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                    </Box>
                    <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: bmiStatus.color, lineHeight: 1, mt: 0.5 }}>{bmi}</Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        )}

        {isDoctor && (
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none', height: '100%' }}>
              <Box sx={{ p: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', mb: 2 }}>Doctor Information</Typography>
                <HealthRow icon={<EmailIcon sx={{ fontSize: 20 }} />} label="Email" value={user?.email || user?.username} color="#2563eb" />
                <HealthRow icon={<PhoneIcon sx={{ fontSize: 20 }} />} label="Phone" value={user?.phone || 'Not set'} color="#0ea5e9" />
                <HealthRow icon={<PeopleIcon sx={{ fontSize: 20 }} />} label="Patients" value={patients.length} color="#10b981" />
              </Box>
            </Card>
          </Grid>
        )}

        {isNurse && (
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none', height: '100%' }}>
              <Box sx={{ p: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', mb: 2 }}>Nurse Information</Typography>
                <HealthRow icon={<EmailIcon sx={{ fontSize: 20 }} />} label="Email" value={user?.email || user?.username} color="#2563eb" />
                <HealthRow icon={<PhoneIcon sx={{ fontSize: 20 }} />} label="Phone" value={user?.phone || 'Not set'} color="#0ea5e9" />
                <HealthRow icon={<PeopleIcon sx={{ fontSize: 20 }} />} label="Patients" value="0" color="#10b981" />
              </Box>
            </Card>
          </Grid>
        )}

        <Grid item xs={12} md={8}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', mb: 2 }}>Quick Actions</Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {isPatient && (
              <>
                <Grid item xs={12} sm={6}>
                  <ActionCard icon={<SymptomIcon />} title="Symptom Checker" desc="Describe your symptoms and get an AI-powered health assessment" color="#2563eb" bg="rgba(37,99,235,0.1)" onClick={() => navigate('/symptoms')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ActionCard icon={<CalendarIcon />} title="Book Appointment" desc="Schedule a visit with a specialist doctor near you" color="#0ea5e9" bg="rgba(14,165,233,0.1)" onClick={() => navigate('/appointments')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ActionCard icon={<HistoryIcon />} title="View History" desc="Review your past assessments and health reports" color="#8b5cf6" bg="rgba(139,92,246,0.1)" onClick={() => navigate('/history')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ActionCard icon={<ProfileIcon />} title="Update Profile" desc="Keep your health information up-to-date for accurate analysis" color="#10b981" bg="rgba(16,185,129,0.1)" onClick={() => navigate('/profile')} />
                </Grid>
              </>
            )}

            {isDoctor && (
              <>
                <Grid item xs={12} sm={6}>
                  <ActionCard icon={<CalendarIcon />} title="My Appointments" desc="View and manage your scheduled appointments" color="#0ea5e9" bg="rgba(14,165,233,0.1)" onClick={() => navigate('/doctors/my-appointments')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  {/* <ActionCard icon={<PeopleIcon />} title="My Patients" desc="View the list of patients under your care" color="#10b981" bg="rgba(16,185,129,0.1)" onClick={() => navigate('/doctors/patients')} /> */}
                    <ActionCard
                    icon={<PeopleIcon />}
                    title="My Patients"
                    desc="View the list of patients under your care"
                    color="#10b981"
                    bg="rgba(16,185,129,0.1)"
                    onClick={() => navigate('/doctors/patients')}
                />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ActionCard icon={<MedicalIcon />} title="Add Consultation" desc="Record a new consultation for a patient" color="#8b5cf6" bg="rgba(139,92,246,0.1)" onClick={() => navigate('/doctors/consultations')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ActionCard icon={<ProfileIcon />} title="Update Profile" desc="Update your doctor information and availability" color="#f59e0b" bg="rgba(245,158,11,0.1)" onClick={() => navigate('/profile')} />
                </Grid>
              </>
            )}

            {isNurse && (
              <>
                <Grid item xs={12} sm={6}>
                  <ActionCard icon={<PeopleIcon />} title="All Patients" desc="View and assist patients under your care" color="#2563eb" bg="rgba(37,99,235,0.1)" onClick={() => navigate('/nurses/patients')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ActionCard icon={<MedicalIcon />} title="My Tasks" desc="View and manage your nursing tasks" color="#f59e0b" bg="rgba(245,158,11,0.1)" onClick={() => navigate('/nurses/tasks')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ActionCard icon={<CalendarIcon />} title="My Shifts" desc="View your upcoming shifts" color="#0ea5e9" bg="rgba(14,165,233,0.1)" onClick={() => navigate('/nurses/shifts')} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ActionCard icon={<ProfileIcon />} title="Update Profile" desc="Update your nurse information" color="#10b981" bg="rgba(16,185,129,0.1)" onClick={() => navigate('/profile')} />
                </Grid>
              </>
            )}
          </Grid>

          {isDoctor && (
            <PatientPreviewCard
              patients={patients}
              loading={patientsLoading}
              error={patientsError}
              onViewAll={() => navigate('/doctors/patients')}
            />
          )}

          {!isDoctor && (
            <Card sx={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'none' }}>
              <Box sx={{ p: 3, pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Recent Activity</Typography>
                  <Button size="small" endIcon={<ArrowIcon sx={{ fontSize: 14 }} />} sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', textTransform: 'none' }}>
                    View all
                  </Button>
                </Box>
              </Box>
              <Divider />
              <Box sx={{ px: 3 }}>
                <ActivityItem icon={<CheckIcon sx={{ fontSize: 18, color: '#10b981' }} />} title="Account Created" time={accountCreatedDate ? `Joined on ${accountCreatedDate}` : 'Just now'} status="Completed" />
                {isPatient && <ActivityItem icon={<ProfileIcon sx={{ fontSize: 18, color: '#2563eb' }} />} title="Profile Setup" time="Complete your profile" status={completion >= 80 ? 'Completed' : 'Pending'} />}
                {isPatient && <ActivityItem icon={<SymptomIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />} title="First Symptom Check" time={firstSymptomDate ? `Completed on ${firstSymptomDate}` : 'Not done yet'} status={firstSymptomDate ? 'Completed' : 'Try now'} />}
                {isDoctor && <ActivityItem icon={<CalendarIcon sx={{ fontSize: 18, color: '#0ea5e9' }} />} title="First Appointment" time="Not scheduled yet" status="Pending" />}
                {isNurse && <ActivityItem icon={<MedicalIcon sx={{ fontSize: 18, color: '#f59e0b' }} />} title="First Task" time="Not assigned yet" status="Pending" />}
              </Box>
            </Card>
          )}
        </Grid>
      </Grid>

      {isPatient && completion < 60 && (
        <Box sx={{ mt: 4, p: 3, borderRadius: '20px', background: 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(239,68,68,0.06))', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <WarningIcon sx={{ color: '#f59e0b', fontSize: 28, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 0.3 }}>Complete your health profile</Typography>
            <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
              Adding your health information helps us provide more accurate symptom analysis and recommendations.
            </Typography>
          </Box>
          <Button onClick={() => navigate('/profile')} variant="contained" sx={{ bgcolor: '#f59e0b', borderRadius: '10px', fontWeight: 700, whiteSpace: 'nowrap', '&:hover': { bgcolor: '#d97706' } }}>
            Complete Profile
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default DashboardPage;