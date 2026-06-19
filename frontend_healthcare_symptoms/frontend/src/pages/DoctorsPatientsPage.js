import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  Typography,
  Grid,
  Button,
  Avatar,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { patientAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const DoctorsPatientsPage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await patientAPI.getAll();
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setPatients(data);
      } catch (err) {
        console.error('Failed to load patients:', err);
        setError('Unable to load patients.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const getName = (p) =>
    [p.first_name, p.last_name].filter(Boolean).join(' ').trim() ||
    p.name ||
    p.username ||
    'Patient';

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      <Header />

      <Box sx={{ flex: 1, py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
              <Box>
                <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                  My Patients
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
                  View all patients under your care
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={<PeopleIcon />}
              label={`${patients.length} Patients`}
              sx={{ fontWeight: 700 }}
              color="primary"
              variant="outlined"
            />
          </Box>

          <Card sx={{ borderRadius: '20px', boxShadow: 'none', border: '1px solid rgba(0,0,0,0.06)' }}>
            <Box sx={{ p: 3 }}>
              {loading ? (
                <Grid container spacing={2}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Grid item xs={12} md={6} key={i}>
                      <Skeleton variant="rounded" height={92} />
                    </Grid>
                  ))}
                </Grid>
              ) : error ? (
                <Typography sx={{ color: 'error.main' }}>{error}</Typography>
              ) : patients.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                  <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>No patients found</Typography>
                  <Typography sx={{ color: '#64748b' }}>
                    There are no patients available right now.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {patients.map((patient) => (
                    <Grid item xs={12} md={6} key={patient.id || patient.pk || patient.username}>
                      <Card
                        sx={{
                          p: 2.5,
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          boxShadow: 'none',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'rgba(37,99,235,0.1)', color: '#2563eb', width: 52, height: 52 }}>
                            <PersonIcon />
                          </Avatar>

                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 800, color: '#0f172a' }}>
                              {getName(patient)}
                            </Typography>

                            <Box sx={{ mt: 0.8, display: 'grid', gap: 0.6 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailIcon sx={{ fontSize: 18, color: '#2563eb' }} />
                                <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
                                  {patient.email || patient.username || 'No email'}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon sx={{ fontSize: 18, color: '#0ea5e9' }} />
                                <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
                                  {patient.phone || 'No phone'}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarIcon sx={{ fontSize: 18, color: '#10b981' }} />
                                <Typography sx={{ fontSize: '0.85rem', color: '#64748b' }}>
                                  {patient.created_at ? `Joined ${new Date(patient.created_at).toLocaleDateString()}` : 'No date available'}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Card>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default DoctorsPatientsPage;