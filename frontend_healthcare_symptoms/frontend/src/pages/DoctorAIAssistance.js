import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Card,
  Typography,
  IconButton,
  TextField,
  Button,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  AppBar,
  Toolbar,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  SmartToy as SmartToyIcon,
  Person as PersonIcon,
  WarningAmber as WarningIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { doctorChatAPI } from '../services/api';

function getDoctorUserId() {
  try {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) return null;

    const payloadPart = token.split('.')[1];
    const payload = JSON.parse(atob(payloadPart));
    return payload.user_id || payload.userid || payload.id || null;
  } catch {
    return null;
  }
}

function FilePreview({ file, onRemove }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const isImage = file.type?.startsWith('image/');
  const isPdf = file.type === 'application/pdf';

  useEffect(() => {
    if (!file) return;
    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, isImage]);

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1,
        border: '1.5px solid #bfdbfe',
        borderRadius: 2,
        bgcolor: '#eff6ff',
        maxWidth: 340,
        position: 'relative',
      }}
    >
      {isImage && previewUrl ? (
        <Box
          component="img"
          src={previewUrl}
          alt="preview"
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1,
            objectFit: 'cover',
            border: '1px solid #bfdbfe',
            flexShrink: 0,
          }}
        />
      ) : (
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1,
            bgcolor: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isPdf ? (
            <PdfIcon sx={{ color: '#2563eb', fontSize: 26 }} />
          ) : (
            <ImageIcon sx={{ color: '#2563eb', fontSize: 26 }} />
          )}
        </Box>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ color: '#1e40af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {file.name}
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          {(file.size / 1024).toFixed(1)} KB • {isPdf ? 'PDF' : isImage ? 'Image' : 'File'}
        </Typography>
      </Box>

      <IconButton size="small" onClick={onRemove} sx={{ color: '#94a3b8' }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
}

function AttachmentBadge({ fileName, fileType }) {
  const isImage = fileType?.startsWith('image/');
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.25,
        py: 0.5,
        borderRadius: 1,
        bgcolor: 'rgba(255,255,255,0.18)',
        mb: 0.75,
        width: 'fit-content',
      }}
    >
      {isImage ? (
        <ImageIcon sx={{ fontSize: 15, color: 'rgba(255,255,255,0.85)' }} />
      ) : (
        <PdfIcon sx={{ fontSize: 15, color: 'rgba(255,255,255,0.85)' }} />
      )}
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: '0.72rem' }}>
        {fileName}
      </Typography>
    </Box>
  );
}

const DoctorAIAssistance = () => {
  const navigate = useNavigate();
  const doctorUserId = getDoctorUserId();

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      text: 'Hello Doctor! I am your AI Assistance chatbot. I can help with patient guidance, differential diagnosis support, medication suggestions, medical summaries, clinical precautions, and uploaded PDFs/images.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const quickQuestions = [
    'Suggest treatment options for fever',
    'What are red flags in cough?',
    'How to manage hypertension?',
    'Medication review for diabetes?',
    'When to refer a patient?',
    'Possible causes of chest pain?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only PNG, JPG, WEBP, GIF images and PDF files are supported.');
      e.target.value = '';
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be under 20 MB.');
      e.target.value = '';
      return;
    }

    setAttachedFile(file);
    setError('');
    e.target.value = '';
  };

  const removeFile = () => setAttachedFile(null);

  const sendMessage = async () => {
    if (loading) return;
    if (!input.trim() && !attachedFile) return;

    const messageText = input.trim() || (attachedFile ? 'Please analyse this file.' : '');
    const fileToSend = attachedFile;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: messageText,
      timestamp: new Date(),
      attachedFile: fileToSend ? { name: fileToSend.name, type: fileToSend.type } : null,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setAttachedFile(null);
    setLoading(true);
    setError('');

    try {
      let responseData;

      if (fileToSend) {
        const formData = new FormData();
        formData.append('message', messageText);
        formData.append('file', fileToSend);

        if (doctorUserId) {
          formData.append('doctor_user_id', String(doctorUserId));
        }

        const res = await doctorChatAPI.chatWithFile(formData);
        responseData = res.data;
      } else {
        const history = nextMessages
          .map((msg) => ({
            user: msg.type === 'user' ? msg.text : '',
            assistant: msg.type === 'assistant' ? msg.text : '',
          }))
          .filter((m) => m.user || m.assistant);

        const res = await doctorChatAPI.chat(messageText, history, {
          doctor_user_id: doctorUserId,
        });

        responseData = res.data;
      }

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        text: responseData.response || 'No response received.',
        timestamp: new Date(),
        sources: responseData.sources || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Doctor chat error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to get response. Make sure the doctor AI service is running.');

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'assistant',
          text: 'I am having trouble connecting right now. Please check the doctor AI service.',
          timestamp: new Date(),
          isError: true,
        },
      ]);
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
        text: 'Chat cleared! What would you like to discuss, Doctor?',
        timestamp: new Date(),
      },
    ]);
    setError('');
    setAttachedFile(null);
    setInput('');
  };

  const canSend = (input.trim() || attachedFile) && !loading;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        sx={{
          background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ color: 'white' }}>
              <BackIcon />
            </IconButton>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <SmartToyIcon sx={{ fontSize: 24 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: 'white' }}>
                Doctor AI Assistance
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Powered by Groq LLM • PDF/Image support
              </Typography>
            </Box>
          </Box>

          <Button
            onClick={clearChat}
            startIcon={<RefreshIcon />}
            sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
          >
            Clear Chat
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ flex: 1, py: 4, display: 'flex', flexDirection: 'column' }}>
        <Card sx={{ flex: 1, borderRadius: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: '#f8fafc' }}>
            {error && (
              <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2, borderRadius: 2 }}>
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
                  alignItems: 'flex-start',
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: msg.type === 'user' ? '#2563eb' : '#0ea5e9',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  {msg.type === 'user' ? <PersonIcon sx={{ fontSize: 22 }} /> : <SmartToyIcon sx={{ fontSize: 22 }} />}
                </Avatar>

                <Box sx={{ maxWidth: '70%', display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: msg.type === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                      bgcolor: msg.type === 'user' ? '#2563eb' : 'white',
                      color: msg.type === 'user' ? 'white' : '#0f172a',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.attachedFile && (
                      <AttachmentBadge fileName={msg.attachedFile.name} fileType={msg.attachedFile.type} />
                    )}

                    <Typography variant="body1" sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                      {msg.text}
                    </Typography>
                  </Box>

                  {msg.sources && msg.sources.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ color: '#94a3b8', mr: 0.5 }}>
                        Sources:
                      </Typography>
                      {msg.sources.map((source, idx) => (
                        <Chip
                          key={idx}
                          label={source}
                          size="small"
                          sx={{
                            fontSize: '0.7rem',
                            height: 24,
                            bgcolor: 'rgba(14,165,233,0.08)',
                            color: '#0ea5e9',
                            fontWeight: 600,
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.7rem',
                      color: '#94a3b8',
                      mt: 0.5,
                      ml: msg.type === 'user' ? 'auto' : 0,
                    }}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: '#0ea5e9' }}>
                  <SmartToyIcon sx={{ fontSize: 22 }} />
                </Avatar>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: '20px 20px 20px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ color: '#0ea5e9' }} />
                    <Typography variant="body2" color="#64748b">
                      {attachedFile ? 'Analysing file...' : 'Thinking...'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          <Divider />

          {messages.length === 1 && (
            <Box sx={{ px: 3, py: 2, bgcolor: '#f8fafc' }}>
              <Typography variant="subtitle2" sx={{ color: '#64748b', mb: 1.5, fontWeight: 600 }}>
                Quick questions
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
                        bgcolor: '#e0f2fe',
                        borderColor: '#0ea5e9',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ p: 3, bgcolor: 'white' }}>
            {attachedFile && (
              <Box sx={{ mb: 2 }}>
                <FilePreview file={attachedFile} onRemove={removeFile} />
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,application/pdf"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <Tooltip title="Attach PDF or image" placement="top">
                <IconButton
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  sx={{
                    mb: 0.5,
                    color: attachedFile ? '#0ea5e9' : '#94a3b8',
                    bgcolor: attachedFile ? '#e0f2fe' : 'transparent',
                    border: '1.5px solid',
                    borderColor: attachedFile ? '#0ea5e9' : '#e2e8f0',
                    borderRadius: 2,
                    width: 46,
                    height: 46,
                    flexShrink: 0,
                    '&:hover': {
                      bgcolor: '#e0f2fe',
                      borderColor: '#0ea5e9',
                      color: '#0ea5e9',
                    },
                  }}
                >
                  <AttachFileIcon />
                </IconButton>
              </Tooltip>

              <TextField
                fullWidth
                multiline
                maxRows={5}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={attachedFile ? 'Ask a question about the attached file...' : 'Ask about patient care, treatments, or clinical guidance...'}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#f8fafc',
                    '&:hover fieldset': { borderColor: '#0ea5e9' },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0ea5e9',
                      borderWidth: 2,
                    },
                  },
                }}
              />

              <Button
                variant="contained"
                onClick={sendMessage}
                disabled={!canSend}
                startIcon={<SendIcon />}
                sx={{
                  borderRadius: 2,
                  bgcolor: '#0ea5e9',
                  minWidth: 110,
                  mb: 0.5,
                  height: 46,
                  flexShrink: 0,
                  '&:hover': { bgcolor: '#0284c7' },
                  '&:disabled': { opacity: 0.45 },
                }}
              >
                Send
              </Button>
            </Box>

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 1.5,
                color: '#94a3b8',
                fontSize: '0.7rem',
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              Supports PNG, JPG, WEBP, GIF, PDF. Max 20 MB. For clinical assistance only. Always verify with medical guidelines.
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default DoctorAIAssistance;