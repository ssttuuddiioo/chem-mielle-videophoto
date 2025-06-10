import { useNavigate } from 'react-router-dom';
import uxFlow from '../assets/ux-flow.png';
import './InfoPage.css';

const InfoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="info-page-body">
      <div className="info-page-container">
        <h1 className="info-page-title">Terms and Conditions</h1>
        <p className="info-page-text">
          If you use this video booth, you agree to the following terms and conditions. Mielle has the right to use the content for marketing and promotional purposes. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <img 
          src={uxFlow} 
          alt="UX Flow Diagram" 
          className="info-page-image"
        />
        <button className="back-button" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    </div>
  );
};

export default InfoPage; 