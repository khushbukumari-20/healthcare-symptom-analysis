import React, { useState, useEffect, useRef } from 'react';
import {
    Container, Box, Card, Typography, IconButton, TextField,
    Button, Avatar, Chip, Alert, CircularProgress, Divider,
    AppBar, Toolbar, Paper
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Send as SendIcon,
    Refresh as RefreshIcon,
    SmartToy as SmartToyIcon,
    Person as PersonIcon,
    WarningAmber as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AIMedicalAssistant = () => {
    const navigate = useNavigate();
    
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'assistant',
            text: '👋 Hello! I\'m your AI Medical Assistant powered by Groq LLM.\n\nI can help you with:\n• Disease information and descriptions\n• Symptoms and their meanings\n• Precautions and preventive measures\n• General health advice\n\nWhat would you like to know?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setError('');

        try {
            // Build conversation history
            const history = messages.map(msg => ({
                user: msg.type === 'user' ? msg.text : '',
                assistant: msg.type === 'assistant' ? msg.text : ''
            })).filter(m => m.user || m.assistant);

            const response = await api.post('/chat', {
                message: userMessage.text,
                history: history
            });

            const assistantMessage = {
                id: Date.now() + 1,
                type: 'assistant',
                text: response.data.response,
                timestamp: new Date(),
                sources: response.data.sources || []
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            console.error('Chat error:', err);
            setError(err.response?.data?.detail || 'Failed to get response. Make sure ML service is running on port 8001.');
            
            const errorMessage = {
                id: Date.now() + 1,
                type: 'assistant',
                text: '⚠️ I\'m having trouble connecting right now. Please make sure:\n• The ML service is running (port 8001)\n• Your Groq API key is set properly',
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([
            {
                id: 1,
                type: 'assistant',
                text: 'Chat cleared! What would you like to know about diseases or symptoms?',
                timestamp: new Date()
            }
        ]);
        setError('');
    };

    const quickQuestions = [
        "What are symptoms of fever?",
        "How to treat headache?",
        "What precautions for dengue?",
        "When should I see a doctor?",
        "What causes cough?",
        "How to prevent flu?"
    ];

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            bgcolor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* ========== APP BAR ========== */}
            <AppBar position="sticky" sx={{ 
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton 
                            onClick={() => navigate(-1)} 
                            sx={{ color: 'white' }}
                        >
                            <BackIcon />
                        </IconButton>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ 
                                width: 40, 
                                height: 40, 
                                bgcolor: 'rgba(255,255,255,0.2)'
                            }}>
                                <SmartToyIcon sx={{ fontSize: 24 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={700} sx={{ color: 'white' }}>
                                    AI Medical Assistant
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                    ⚡ Powered by Groq LLM
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    
                    <Button
                        onClick={clearChat}
                        startIcon={<RefreshIcon />}
                        sx={{
                            color: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                        }}
                    >
                        Clear Chat
                    </Button>
                </Toolbar>
            </AppBar>

            {/* ========== CHAT AREA ========== */}
            <Container maxWidth="md" sx={{ 
                flex: 1, 
                py: 4,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Card sx={{ 
                    flex: 1, 
                    borderRadius: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                    {/* Messages */}
                    <Box sx={{ 
                        flex: 1, 
                        overflowY: 'auto', 
                        p: 3,
                        bgcolor: '#f8fafc',
                        '&::-webkit-scrollbar': {
                            width: 8
                        },
                        '&::-webkit-scrollbar-thumb': {
                            bgcolor: '#cbd5e1',
                            borderRadius: 4
                        }
                    }}>
                        {error && (
                            <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2, borderRadius: '12px' }}>
                                {error}
                            </Alert>
                        )}

                        {messages.map((msg) => (
                            <Box
                                key={msg.id}
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    mb: 3,
                                    flexDirection: msg.type === 'user' ? 'row-reverse' : 'row',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <Avatar sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: msg.type === 'user' ? '#2563eb' : '#10b981',
                                    flexShrink: 0,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                }}>
                                    {msg.type === 'user' ? (
                                        <PersonIcon sx={{ fontSize: 22 }} />
                                    ) : (
                                        <SmartToyIcon sx={{ fontSize: 22 }} />
                                    )}
                                </Avatar>
                                
                                <Box sx={{ 
                                    maxWidth: '70%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <Box sx={{
                                        p: 2,
                                        borderRadius: msg.type === 'user' 
                                            ? '20px 20px 0 20px' 
                                            : '20px 20px 20px 0',
                                        bgcolor: msg.type === 'user' ? '#2563eb' : 'white',
                                        color: msg.type === 'user' ? 'white' : '#0f172a',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        <Typography variant="body1" sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                                            {msg.text}
                                        </Typography>
                                    </Box>
                                    
                                    {msg.sources && msg.sources.length > 0 && (
                                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', mr: 0.5 }}>
                                                About:
                                            </Typography>
                                            {msg.sources.map((source, idx) => (
                                                <Chip
                                                    key={idx}
                                                    label={source}
                                                    size="small"
                                                    sx={{
                                                        fontSize: '0.7rem',
                                                        height: 24,
                                                        bgcolor: 'rgba(16,185,129,0.08)',
                                                        color: '#10b981',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                    
                                    <Typography variant="caption" sx={{
                                        fontSize: '0.7rem',
                                        color: '#94a3b8',
                                        mt: 0.5,
                                        ml: msg.type === 'user' ? 'auto' : 0
                                    }}>
                                        {msg.timestamp.toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}

                        {loading && (
                            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: '#10b981' }}>
                                    <SmartToyIcon sx={{ fontSize: 22 }} />
                                </Avatar>
                                <Box sx={{ 
                                    p: 2, 
                                    bgcolor: 'white', 
                                    borderRadius: '20px 20px 20px 0',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                }}>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <CircularProgress size={20} sx={{ color: '#10b981' }} />
                                        <Typography variant="body2" color="#64748b">
                                            Thinking... ⚡
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        <div ref={messagesEndRef} />
                    </Box>

                    <Divider />

                    {/* Quick questions */}
                    {messages.length === 1 && (
                        <Box sx={{ px: 3, py: 2, bgcolor: '#f8fafc' }}>
                            <Typography variant="subtitle2" sx={{ 
                                color: '#64748b', 
                                mb: 1.5,
                                fontWeight: 600
                            }}>
                                💡 Quick questions:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {quickQuestions.map((q, idx) => (
                                    <Chip
                                        key={idx}
                                        label={q}
                                        onClick={() => setInput(q)}
                                        clickable
                                        sx={{
                                            fontSize: '0.8rem',
                                            height: 36,
                                            bgcolor: 'white',
                                            border: '1px solid #e2e8f0',
                                            color: '#374151',
                                            '&:hover': { 
                                                bgcolor: '#e8fdf0',
                                                borderColor: '#10b981'
                                            }
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Input */}
                    <Box sx={{ p: 3, bgcolor: 'white' }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                multiline
                                maxRows={5}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about diseases, symptoms, precautions..."
                                size="medium"
                                disabled={loading}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        bgcolor: '#f8fafc',
                                        '&:hover fieldset': { borderColor: '#10b981' },
                                        '&.Mui-focused fieldset': { 
                                            borderColor: '#10b981', 
                                            borderWidth: 2 
                                        }
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={sendMessage}
                                disabled={!input.trim() || loading}
                                startIcon={<SendIcon />}
                                sx={{
                                    borderRadius: '12px',
                                    bgcolor: '#10b981',
                                    minWidth: 120,
                                    '&:hover': { bgcolor: '#059669' },
                                    '&:disabled': { opacity: 0.45 }
                                }}
                            >
                                Send
                            </Button>
                        </Box>
                        
                        <Typography variant="caption" sx={{ 
                            display: 'block', 
                            mt: 1.5, 
                            color: '#94a3b8', 
                            fontSize: '0.7rem',
                            textAlign: 'center',
                            lineHeight: 1.5
                        }}>
                            ⚠️ For informational purposes only. Always consult a qualified healthcare provider for medical advice.<br/>
                            This AI assistant is not a substitute for professional medical diagnosis.
                        </Typography>
                    </Box>
                </Card>
            </Container>
        </Box>
    );
};

export default AIMedicalAssistant;