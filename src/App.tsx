import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import Home from './pages/Home';
import VideoBooth from './pages/VideoBooth';
import PhotoStrip from './pages/PhotoStrip';
import InfoPage from './pages/InfoPage';
import SettingsPage from './pages/SettingsPage';
import './App.css'

function App() {
  return (
    <SettingsProvider>
      <Router>
        <div className="min-h-screen bg-gray-900">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/video" element={<VideoBooth />} />
            <Route path="/photo-strip" element={<PhotoStrip />} />
            <Route path="/info" element={<InfoPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </Router>
    </SettingsProvider>
  );
}

export default App;
