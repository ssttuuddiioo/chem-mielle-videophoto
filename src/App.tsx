import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import Home from './pages/Home';
import VideoBooth from './pages/VideoBooth';
import PhotoStrip from './pages/PhotoStrip';
import InfoPage from './pages/InfoPage';
import SettingsPage from './pages/SettingsPage';
import './App.css'

// This component will contain the main app logic to use hooks
const AppContent = () => {
  const navigate = useNavigate();

  const handleSecretButtonClick = () => {
    const password = prompt('Enter password to access settings:');
    if (password === 'chemlab305') {
      navigate('/settings');
    } else if (password !== null) {
      alert('Incorrect password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div 
        className="secret-settings-button"
        onClick={handleSecretButtonClick}
        title="Access Settings"
      ></div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/video" element={<VideoBooth />} />
        <Route path="/photo-strip" element={<PhotoStrip />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <SettingsProvider>
      <Router>
        <AppContent />
      </Router>
    </SettingsProvider>
  );
}

export default App;
