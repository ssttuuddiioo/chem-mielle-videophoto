import { useNavigate } from 'react-router-dom';
import './Home.css'; // Import the new styles

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-body">
      <div className="home-container">
        {/* Top row - Four gray squares */}
        <div className="image-grid">
          <div className="image-container"></div>
          <div className="image-container"></div>
          <div className="image-container"></div>
          <div className="image-container"></div>
        </div>

        {/* Headline */}
        <h1 className="question-text">
          WHEN DID YOU FIRST FALL IN LOVE WITH YOUR HAIR?
        </h1>

        {/* Call-to-action button */}
        <button className="start-button" onClick={() => navigate('/video')}>
          Start
        </button>
      </div>
    </div>
  );
};

export default Home; 