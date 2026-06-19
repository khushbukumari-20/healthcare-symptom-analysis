import React, { useState, useEffect, useRef } from 'react';
import {
    Container, Box, Card, Typography, IconButton, TextField,
    Button, Avatar, Chip, Alert, CircularProgress, Divider,
    AppBar, Toolbar, Dialog, DialogTitle, DialogContent,
    DialogActions, Autocomplete
} from '@mui/material';
import {
    ArrowBack as BackIcon,
    Send as SendIcon,
    Refresh as RefreshIcon,
    SmartToy as SmartToyIcon,
    Person as PersonIcon,
    WarningAmber as WarningIcon,
    AttachFile as AttachFileIcon,
    CloudUpload as CloudUploadIcon,
    AutoFixHigh as AutoFixIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../services/api';


const AIMedicalAssistant = () => {
    const navigate = useNavigate();
    
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'assistant',
            text: 'Hello! I\'m your AI Medical Assistant powered by Groq LLM + Agentic AI.\n\nI can help you with:\n• Disease information and descriptions\n• Symptoms and their meanings\n• Precautions and preventive measures\n• General health advice\n• Upload PDFs, images, text files for analysis\n\nWhat would you like to know?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileUploadMode, setFileUploadMode] = useState(false);
    const [symptoms, setSymptoms] = useState([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [showSymptomPredictor, setShowSymptomPredictor] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
        loadSymptoms();
    }, [messages]);

    const loadSymptoms = async () => {
        try {
            const response = await chatAPI.getSymptoms();
            setSymptoms(response.data.symptoms_detail);
        } catch (err) {
            console.error('Failed to load symptoms:', err);
        }
    };

    const sendMessage = async () => {
        if ((!input.trim() && !fileUploadMode) || loading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: input.trim() || `Uploaded file: ${selectedFile?.name}`,
            timestamp: new Date(),
            file: selectedFile
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

            let response;
            if (fileUploadMode && selectedFile) {
                response = await chatAPI.chatWithFile(userMessage.text, selectedFile);
            } else {
                response = await chatAPI.chat(userMessage.text, history);
            }

            const assistantMessage = {
                id: Date.now() + 1,
                type: 'assistant',
                text: response.data.response,
                timestamp: new Date(),
                sources: response.data.sources || [],
                agenticActions: response.data.agentic_actions || []  // ← FIXED: Use [] instead of null
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            console.error('Chat error:', err);
            setError(err.response?.data?.detail || 'Failed to get response. Make sure ML service is running on port 8001.');
            
            const errorMessage = {
                id: Date.now() + 1,
                type: 'assistant',
                text: 'I\'m having trouble connecting. Please make sure:\n• ML service is running (port 8001)\n• Groq API key is set in .env',
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
            setSelectedFile(null);
            setFileUploadMode(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const validTypes = ['image/', 'application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            const isValid = validTypes.some(type => file.type.startsWith(type) || file.name.endsWith('.pdf') || file.name.endsWith('.docx'));
            
            if (isValid) {
                setSelectedFile(file);
                setFileUploadMode(true);
                setError('');
            } else {
                setError('Invalid file type. Please upload PDF, image (JPG/PNG), TXT, or DOCX files only.');
            }
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFileUploadMode(false);
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
        setSelectedFile(null);
        setFileUploadMode(false);
    };

    const predictDisease = async () => {
        if (selectedSymptoms.length === 0) return;

        setShowSymptomPredictor(false);
        setLoading(true);

        try {
            const response = await chatAPI.predict(selectedSymptoms);
            
            const predictionMessage = {
                id: Date.now(),
                type: 'assistant',
                text: `🔍 **Disease Prediction Based on Symptoms**\n\n`,
                timestamp: new Date(),
                prediction: response.data
            };

            response.data.predictions.forEach(pred => {
                predictionMessage.text += `**${pred.rank}. ${pred.disease}** - ${pred.probability}% probability\n`;
            });

            predictionMessage.text += `\n⚠️ **Risk Level**: ${response.data.risk_level} (${response.data.risk_score}/100)\n`;
            predictionMessage.text += `\n📋 **Matched Symptoms**: ${response.data.matched_symptoms.map(s => s.name).join(', ')}`;

            setMessages(prev => [...prev, predictionMessage]);
            setSelectedSymptoms([]);
        } catch (err) {
            console.error('Prediction error:', err);
            setError('Failed to predict disease. Please try different symptoms.');
        } finally {
            setLoading(false);
        }
    };

    const quickQuestions = [
        "What are symptoms of fever?",
        "How to treat headache?",
        "What precautions for dengue?",
        "When should I see a doctor?",
        "What causes cough?",
        "How to prevent flu?"
    ];

    const agenticQuickActions = [
        { label: "Use Symptom Predictor", action: "predict", icon: AutoFixIcon },
        { label: "Upload Medical File", action: "upload", icon: CloudUploadIcon }
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
                            <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(255,255,255,0.2)' }}>
                                <SmartToyIcon sx={{ fontSize: 24 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={700} sx={{ color: 'white' }}>
                                    AI Medical Assistant
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                    Powered by Groq LLM + Agentic AI
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
                        '&::-webkit-scrollbar': { width: 8 },
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
                                
                                <Box sx={{ maxWidth: '70%', display: 'flex', flexDirection: 'column' }}>
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
                                        
                                        {msg.file && (
                                            <Chip
                                                label={`📎 ${msg.file.name}`}
                                                size="small"
                                                sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                            />
                                        )}

                                        {msg.prediction && (
                                            <Box sx={{ mt: 1.5, bgcolor: 'rgba(16,185,129,0.05)', p: 1.5, borderRadius: '8px' }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#10b981' }}>
                                                    📊 Prediction Details
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                    Risk: {msg.prediction.risk_level} ({msg.prediction.risk_score}/100)
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                    
                                    {msg.sources && msg.sources.length > 0 && (
                                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            <Typography variant="caption" sx={{ color: '#94a3b8', mr: 0.5 }}>About:</Typography>
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

                                    {/*FIXED: Agentic Actions with Doctor List Display */}
                                    {msg.agenticActions && msg.agenticActions?.length > 0 && (
                                        <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'rgba(251,191,36,0.08)', borderRadius: '8px', border: '1px solid rgba(251,191,36,0.3)' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#f59e0b', mb: 1 }}>
                                                🤖 Agentic AI Suggestions:
                                            </Typography>
                                            {msg.agenticActions?.map((action, idx) => (
                                                <Box key={idx} sx={{ mb: 1 }}>
                                                    {action.action === 'show_doctor_list' && action.doctors && action.doctors.length > 0 ? (
                                                        <Box>
                                                            <Typography variant="body2" sx={{ color: '#f59e0b', mb: 1 }}>
                                                                {action.message}
                                                            </Typography>
                                                            {action.doctors.map((doctor, docIdx) => (
                                                                <Chip
                                                                    key={docIdx}
                                                                    label={`${doctor.name} - ${doctor.specialization}`}
                                                                    size="small"
                                                                    clickable
                                                                    sx={{
                                                                        mr: 0.5,
                                                                        mb: 0.5,
                                                                        bgcolor: 'rgba(16,185,129,0.15)',
                                                                        color: '#10b981',
                                                                        fontWeight: 600,
                                                                        '&:hover': { bgcolor: 'rgba(16,185,129,0.25)' }
                                                                    }}
                                                                    onClick={() => setInput(`Book appointment with ${doctor.name}`)}
                                                                />
                                                            ))}
                                                        </Box>
                                                    ) : (
                                                        <Chip
                                                            label={action.message}
                                                            size="small"
                                                            clickable
                                                            sx={{
                                                                mr: 0.5,
                                                                mb: 0.5,
                                                                bgcolor: 'rgba(251,191,36,0.15)',
                                                                color: '#f59e0b',
                                                                fontWeight: 600,
                                                                '&:hover': { bgcolor: 'rgba(251,191,36,0.25)' }
                                                            }}
                                                            onClick={() => setInput(action.message)}
                                                        />
                                                    )}
                                                </Box>
                                            ))}
                                        </Box>
                                    )}

                                    
                                    <Typography variant="caption" sx={{
                                        fontSize: '0.7rem',
                                        color: '#94a3b8',
                                        mt: 0.5,
                                        ml: msg.type === 'user' ? 'auto' : 0
                                    }}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}


                        {loading && (
                            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: '#10b981' }}>
                                    <SmartToyIcon sx={{ fontSize: 22 }} />
                                </Avatar>
                                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: '20px 20px 20px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <CircularProgress size={20} sx={{ color: '#10b981' }} />
                                        <Typography variant="body2" color="#64748b">
                                            Thinking...
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
                            <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1.5, fontWeight: 600 }}>
                                Quick questions:
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
                                            '&:hover': { bgcolor: '#e8fdf0', borderColor: '#10b981' }
                                        }}
                                    />
                                ))}
                            </Box>

                            <Typography variant="subtitle2" sx={{ color: '#64748b', mt: 2, mb: 1.5, fontWeight: 600 }}>
                                🤖 Agentic AI Quick Actions:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {agenticQuickActions.map((action, idx) => (
                                    <Button
                                        key={idx}
                                        variant="outlined"
                                        startIcon={<action.icon />}
                                        onClick={() => {
                                            if (action.action === 'predict') setShowSymptomPredictor(true);
                                            if (action.action === 'upload') document.getElementById('file-upload').click();
                                        }}
                                        sx={{
                                            fontSize: '0.8rem',
                                            height: 36,
                                            bgcolor: 'white',
                                            border: '1px solid #10b981',
                                            color: '#10b981',
                                            '&:hover': { bgcolor: '#e8fdf0', borderColor: '#10b981' }
                                        }}
                                    >
                                        {action.label}
                                    </Button>
                                ))}
                            </Box>
                        </Box>
                    )}


                    {/* Input */}
                    <Box sx={{ p: 3, bgcolor: 'white' }}>
                        {fileUploadMode && selectedFile && (
                            <Box sx={{ mb: 2, p: 1.5, bgcolor: '#e8fdf0', borderRadius: '8px', display: 'flex', gap: 1, alignItems: 'center' }}>
                                <CloudUploadIcon sx={{ color: '#10b981' }} />
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                    📎 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                </Typography>
                                <IconButton onClick={removeFile} size="small" sx={{ color: '#ef4444' }}>
                                    ✕
                                </IconButton>
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                multiline
                                maxRows={5}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={fileUploadMode ? "Ask about your uploaded file..." : "Ask about diseases, symptoms, precautions..."}
                                size="medium"
                                disabled={loading}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        bgcolor: '#f8fafc',
                                        '&:hover fieldset': { borderColor: '#10b981' },
                                        '&.Mui-focused fieldset': { borderColor: '#10b981', borderWidth: 2 }
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={sendMessage}
                                disabled={(!input.trim() && !fileUploadMode) || loading}
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
                            <IconButton
                                onClick={() => document.getElementById('file-upload').click()}
                                sx={{
                                    bgcolor: '#e8fdf0',
                                    color: '#10b981',
                                    borderRadius: '12px',
                                    '&:hover': { bgcolor: '#d1fae5' }
                                }}
                            >
                                <AttachFileIcon />
                            </IconButton>
                        </Box>
                        
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*,.pdf,.txt,.docx"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        
                        <Typography variant="caption" sx={{ 
                            display: 'block', 
                            mt: 1.5, 
                            color: '#94a3b8', 
                            fontSize: '0.7rem',
                            textAlign: 'center',
                            lineHeight: 1.5
                        }}>
                            For informational purposes only. Always consult a qualified healthcare provider.<br/>
                            This AI is not a substitute for professional medical diagnosis.
                        </Typography>
                    </Box>
                </Card>
            </Container>

            {/* ========== Symptom Predictor Dialog ========== */}
            <Dialog open={showSymptomPredictor} onClose={() => setShowSymptomPredictor(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#10b981', color: 'white' }}>
                    🔍 Symptom Predictor - AI Disease Diagnosis
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Select your symptoms to get AI-powered disease predictions:
                    </Typography>
                    <Autocomplete
                        multiple
                        options={symptoms}
                        getOptionLabel={(option) => option.name}
                        value={selectedSymptoms}
                        onChange={(event, newValue) => setSelectedSymptoms(newValue)}
                        renderInput={(params) => (
                            <TextField {...params} label="Symptoms" placeholder="Select symptoms" />
                        )}
                        sx={{ mb: 3 }}
                    />
                    {selectedSymptoms.length > 0 && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Selected {selectedSymptoms.length} symptoms: {selectedSymptoms.map(s => s.name).join(', ')}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ pb: 3, px: 3 }}>
                    <Button onClick={() => setShowSymptomPredictor(false)}>Cancel</Button>
                    <Button 
                        onClick={predictDisease} 
                        variant="contained" 
                        disabled={selectedSymptoms.length === 0}
                        sx={{ bgcolor: '#10b981' }}
                    >
                        Predict Disease
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};


export default AIMedicalAssistant;