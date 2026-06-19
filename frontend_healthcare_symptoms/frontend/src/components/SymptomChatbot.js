import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, TextField, Button, IconButton,
    Paper, Chip, Alert, CircularProgress, Avatar, Slide
} from '@mui/material';
import {
    Chat as ChatIcon,
    Send as SendIcon,
    Close as CloseIcon,
    Person as PersonIcon,
    Refresh as RefreshIcon,
    WarningAmber as WarningIcon,
    SmartToy as SmartToyIcon
} from '@mui/icons-material';
import api from '../services/api';

const SymptomChatbot = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'assistant',
            text: '👋 Hello! I\'m your AI Health Assistant powered by Groq LLM.\n\nI can help you with:\n• Disease information\n• Symptoms & precautions\n• Medical advice (general info only)\n\nWhat would you like to know?',
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

    const inputRef = useRef(null);
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 100);
        }
    }, [isOpen]);

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
                text: '⚠️ I\'m having trouble connecting right now. Please make sure:\n• The ML service is running (port 8001)\n• Your Groq API key is set in .env file',
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
        "When to see a doctor?"
    ];

    if (!isOpen) return null;

    return (
        <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
            <Box sx={{
                position: 'fixed',
                right: 20,
                bottom: 100,
                width: 400,
                height: 600,
                zIndex: 1500,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Paper elevation={8} sx={{
                    borderRadius: '20px 20px 0 0',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.08)'
                }}>
                    {/* ========== HEADER ========== */}
                    <Box sx={{
                        p: 2,
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ 
                                width: 36, 
                                height: 36, 
                                bgcolor: 'rgba(255,255,255,0.2)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}>
                                <SmartToyIcon sx={{ fontSize: 20 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={700} lineHeight={1.1}>
                                    AI Health Assistant
                                </Typography>
                                <Typography variant="caption" opacity={0.95}>
                                    ⚡ Powered by Groq LLM
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton 
                                size="small" 
                                onClick={clearChat}
                                sx={{ 
                                    color: 'white', 
                                    p: 0.5,
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                <RefreshIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                            <IconButton 
                                size="small" 
                                onClick={onClose}
                                sx={{ 
                                    color: 'white', 
                                    p: 0.5,
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                <CloseIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* ========== MESSAGES AREA ========== */}
                    <Box sx={{ 
                        flex: 1, 
                        overflowY: 'auto', 
                        p: 2, 
                        bgcolor: '#f8fafc',
                        '&::-webkit-scrollbar': {
                            width: 6
                        },
                        '&::-webkit-scrollbar-thumb': {
                            bgcolor: '#cbd5e1',
                            borderRadius: 3
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
                                    gap: 1,
                                    mb: 2,
                                    flexDirection: msg.type === 'user' ? 'row-reverse' : 'row',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <Avatar sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: msg.type === 'user' ? '#2563eb' : '#10b981',
                                    flexShrink: 0,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }}>
                                    {msg.type === 'user' ? (
                                        <PersonIcon sx={{ fontSize: 18 }} />
                                    ) : (
                                        <SmartToyIcon sx={{ fontSize: 18 }} />
                                    )}
                                </Avatar>
                                
                                <Box sx={{
                                    maxWidth: '75%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <Box sx={{
                                        p: 1.5,
                                        borderRadius: msg.type === 'user' 
                                            ? '20px 20px 0 20px' 
                                            : '20px 20px 20px 0',
                                        bgcolor: msg.type === 'user' ? '#2563eb' : 'white',
                                        color: msg.type === 'user' ? 'white' : '#0f172a',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        <Typography variant="body2" sx={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                                            {msg.text}
                                        </Typography>
                                    </Box>
                                    
                                    {msg.sources && msg.sources.length > 0 && (
                                        <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', mr: 0.5 }}>
                                                About:
                                            </Typography>
                                            {msg.sources.map((source, idx) => (
                                                <Chip
                                                    key={idx}
                                                    label={source}
                                                    size="small"
                                                    sx={{
                                                        fontSize: '0.65rem',
                                                        height: 20,
                                                        bgcolor: 'rgba(16,185,129,0.08)',
                                                        color: '#10b981',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                    
                                    <Typography variant="caption" sx={{
                                        fontSize: '0.65rem',
                                        color: '#94a3b8',
                                        mt: 0.3,
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
                            <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#10b981' }}>
                                    <SmartToyIcon sx={{ fontSize: 18 }} />
                                </Avatar>
                                <Box sx={{ 
                                    p: 1.5, 
                                    bgcolor: 'white', 
                                    borderRadius: '20px 20px 20px 0',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                                }}>
                                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                        <CircularProgress size={16} sx={{ color: '#10b981' }} />
                                        <Typography variant="caption" color="#64748b">
                                            Thinking... ⚡
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        <div ref={messagesEndRef} />
                    </Box>

                    {messages.length === 1 && (
                        <Box sx={{ px: 2, pb: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                            <Typography variant="caption" sx={{ 
                                color: '#64748b', 
                                mb: 1, 
                                display: 'block',
                                fontWeight: 600
                            }}>
                                💡 Quick questions:
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {quickQuestions.map((q, idx) => (
                                    <Chip
                                        key={idx}
                                        label={q}
                                        onClick={() => setInput(q)}
                                        clickable
                                        sx={{
                                            fontSize: '0.75rem',
                                            height: 32,
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

                    {/* ========== INPUT AREA ========== */}
                    <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                inputRef={inputRef}
                                fullWidth
                                multiline
                                maxRows={4}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about diseases, symptoms, or precautions..."
                                size="small"
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
                                sx={{
                                    borderRadius: '12px',
                                    bgcolor: '#10b981',
                                    '&:hover': { bgcolor: '#059669' },
                                    '&:disabled': { opacity: 0.45 },
                                    minWidth: 50,
                                    px: 0
                                }}
                            >
                                <SendIcon />
                            </Button>
                        </Box>
                        
                        <Typography variant="caption" sx={{ 
                            display: 'block', 
                            mt: 1.25, 
                            color: '#94a3b8', 
                            fontSize: '0.65rem',
                            textAlign: 'center',
                            lineHeight: 1.4
                        }}>
                            ⚠️ For informational purposes only. Always consult a qualified healthcare provider for medical advice.
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Slide>
    );
};

export default SymptomChatbot;