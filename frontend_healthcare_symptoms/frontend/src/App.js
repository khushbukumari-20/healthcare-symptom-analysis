import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';



// ── Pages ──────────────────────────────────────────────
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import DashboardPage    from './pages/DashboardPage';
import ProfilePage      from './pages/ProfilePage';
import SymptomsPage     from './pages/SymptomsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import HistoryPage      from './pages/HistoryPage';
import AIMedicalAssistant from './pages/AIMedicalAssistant';
import MedicationPage   from './pages/MedicationPage';
import RecommendationPage from './pages/RecommendationPage';
import DoctorsPatientsPage from './pages/DoctorsPatientsPage'

import DoctorAIAssistance from './pages/DoctorAIAssistance';


// ── Layout ─────────────────────────────────────────────
import Header         from './components/Header';
import Footer         from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';



// ── Theme ───────────────────────────────────────────────
const theme = createTheme({
    palette: {
        primary:    { main: '#2563eb' },
        secondary:  { main: '#0ea5e9' },
        background: { default: '#f8fafc' },
    },
    typography: {
        fontFamily: '"Plus Jakarta Sans","Segoe UI","Roboto",sans-serif',
    },
    shape: { borderRadius: 12 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { textTransform: 'none', fontWeight: 600 },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: { backgroundImage: 'none' },
            },
        },
    },
});



// ── Layout wrapper (Header + Footer) ────────────────────
const AppLayout = ({ children }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Box component="main" sx={{ flexGrow: 1, backgroundColor: '#f8fafc' }}>
            {children}
        </Box>
        <Footer />
    </Box>
);



// ── Protected page shorthand ────────────────────────────
const P = ({ children }) => (
    <ProtectedRoute>
        <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
);



// ── App ─────────────────────────────────────────────────
function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AuthProvider>
                    <Routes>
                        {/* Public — no header/footer */}
                        <Route path="/login"    element={<LoginPage />}    />
                        <Route path="/register" element={<RegisterPage />} />



                        {/* Protected — wrapped in Header + Footer */}
                        <Route path="/dashboard"    element={<P><DashboardPage /></P>}    />
                        <Route path="/profile"      element={<P><ProfilePage /></P>}      />
                        <Route path="/symptoms"     element={<P><SymptomsPage /></P>}     />
                        <Route path="/appointments" element={<P><AppointmentsPage /></P>} />
                        <Route path="/history"      element={<P><HistoryPage /></P>}      />
                        <Route path="/medications"  element={<P><MedicationPage /></P>}  />
                        <Route path="/recommendation/:id" element={<RecommendationPage />} />
                        <Route path="/doctors/patients" element={<DoctorsPatientsPage />} />
                        
                        {/* AI Medical Assistant Chat Page — NO Header/Footer */}
                        <Route path="/ai-assistant" element={<AIMedicalAssistant />} />
                        <Route path="/doctor/ai-assistance" element={<DoctorAIAssistance />} />




                        {/* Redirects */}
                        <Route path="/"  element={<Navigate to="/login"     replace />} />
                        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}



export default App;