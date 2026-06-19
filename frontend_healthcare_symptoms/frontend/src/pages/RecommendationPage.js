import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, Alert, Paper } from '@mui/material';
import { doctorSuggestionAPI } from '../services/api';

const RecommendationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [suggestion, setSuggestion] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await doctorSuggestionAPI.getOne(id);
                setSuggestion(res.data);
            } catch (err) {
                console.error(err);
                setError('Could not load recommendation.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
                <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </Box>
        );
    }

    if (!suggestion) return null;

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                    {suggestion.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Dr. {suggestion.doctor_name} · {suggestion.specialization}
                </Typography>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                        Summary
                    </Typography>
                    <Typography sx={{ mt: 1 }}>{suggestion.reason}</Typography>
                </Box>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                        Detailed Content
                    </Typography>
                    <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                        {suggestion.content}
                    </Typography>
                </Box>

                <Button sx={{ mt: 3 }} variant="outlined" onClick={() => navigate(-1)}>
                    Back
                </Button>
            </Paper>
        </Box>
    );
};

export default RecommendationPage;