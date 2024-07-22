import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import UserContext from '../context/UserContext';
import useTheme from '../context/useTheme';
import { Link } from 'react-router-dom';
import '../styles/kitchenCompliments.css';

const KitchenCompliments = () => {
  const { authUser } = useContext(UserContext);
  const { accentColor } = useTheme();
  const [kitchenCompliments, setKitchenCompliments] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const fetchKitchenCompliments = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/compliments/kitchen`);
        console.log('Fetched kitchen compliments:', response.data.compliments); // Debugging log
        setKitchenCompliments(response.data.compliments);
      } catch (error) {
        console.error('Error fetching kitchen compliments:', error);
        setErrorMessage('An error occurred while fetching compliments. Please try again later.');
      }
    };

    fetchKitchenCompliments();
  }, [authUser._id]);

  const formatToPacificTime = (dateString, timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date(dateString);
    date.setHours(hours, minutes);

    const options = {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    };

    return date.toLocaleString('en-US', options);
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const renderCompliment = (compliment, index) => (
    <div key={compliment.id} className="promotion-section">
      <div onClick={() => toggleExpand(index)} style={{ cursor: 'pointer', marginBottom: '10px' }}>
        <Link to={`/stores/${compliment.storeId}`} className="store-link">
          <p><strong style={{ fontFamily: 'Changa, sans-serif', fontSize: '1.2em' }}>Store Name:</strong> {compliment.storeName}</p>
        </Link>
        <p><strong>Title:</strong> {compliment.title}</p>
        <p>
          <strong>Amount:</strong> {compliment.amount}% <span className="small-text">(off order)</span>
        </p>
        <p><strong>End Time:</strong> {formatToPacificTime(compliment.startDate, compliment.endTime)}</p>
      </div>
      {expandedIndex === index && (
        <div>
          <p><strong>Group ID:</strong> {compliment.groupId}</p>
          <p><strong>Start Date:</strong> {compliment.startDate}</p>
          <hr />
        </div>
      )}
      <hr className="promotion-divider" />
    </div>
  );

  return (
    <div className="kitchen-compliment-container">
      <div className="kitchen-compliment-card no-background">
        <h2 style={{ textAlign: 'center' }}>Promotions</h2>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <div className="kitchen-compliments-list">
          {kitchenCompliments.length > 0 ? (
            kitchenCompliments.map((compliment, index) => (
              renderCompliment(compliment, index)
            ))
          ) : (
            <p>Keep an eye out for promotions!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KitchenCompliments;
