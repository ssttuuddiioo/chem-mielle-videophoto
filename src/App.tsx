import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import VideoBooth from './pages/VideoBooth';
import PhotoStrip from './pages/PhotoStrip';
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/video" element={<VideoBooth />} />
          <Route path="/photo-strip" element={<PhotoStrip />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
