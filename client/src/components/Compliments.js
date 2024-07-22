import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import UserContext from '../context/UserContext';
import useTheme from '../context/useTheme';
import '../styles/compliment.css';

const generateRandomKey = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const Compliment = () => {
  const { authUser } = useContext(UserContext);
  const { accentColor } = useTheme();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [quantity, setQuantity] = useState('');
  const [createdCompliments, setCreatedCompliments] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [inputVisible, setInputVisible] = useState(true);
  const [collapseSent, setCollapseSent] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchCompliments = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/compliments`);
        console.log('Fetched compliments:', response.data.compliments); // Log fetched compliments
        setCreatedCompliments(response.data.compliments);
        if (response.data.compliments.length > 0) {
          setInputVisible(true);
        }
      } catch (error) {
        console.error('Error fetching compliments:', error);
      }
    };

    const fetchFollowers = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/all`);
        console.log('Fetched followers:', response.data.users); // Log fetched followers
        setFollowers(response.data.users);
      } catch (error) {
        console.error('Error fetching followers:', error);
      }
    };

    fetchCompliments();
    fetchFollowers();
  }, [authUser._id]);

  useEffect(() => {
    console.log('Component rendered with state:', { createdCompliments, followers }); // Log component render
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authUser.store) {
      alert('You need to create a store before sending promotions.');
      return;
    }
    if (!title || !amount || !startDate || !startTime || !endTime || !quantity) {
      alert('Please fill in all fields before creating a promotion.');
      return;
    }

    const groupId = generateRandomKey();
    const complimentsArray = Array.from({ length: quantity }, () => ({
      groupId,
      title,
      amount,
      startDate,
      startTime,
      endTime,
      sent: false,
      claimed: false,
      id: generateRandomKey(),
      storeId: authUser.store._id, // Add store ID to compliment
      storeName: authUser.store.name // Add store name to compliment
    }));

    try {
      await axios.post(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/create-compliment`, [complimentsArray]);
      setCreatedCompliments(prevCompliments => {
        const newCompliments = [...prevCompliments, complimentsArray];
        console.log('Updated compliments state:', newCompliments); // Log state update
        return newCompliments;
      });
      setTitle('');
      setAmount('');
      setStartDate('');
      setStartTime('');
      setEndTime('');
      setQuantity('');
      setInputVisible(true);
    } catch (error) {
      console.error('Error creating compliments:', error);
    }
  };

  const handleDeleteComplimentGroup = async (groupId) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/compliments/group/${groupId}`);
      setCreatedCompliments(prevCompliments => {
        const updatedCompliments = prevCompliments.filter(group => Array.isArray(group) && group[0]?.groupId !== groupId);
        console.log('Updated compliments state after delete:', updatedCompliments); // Log state update
        return updatedCompliments;
      });
    } catch (error) {
      console.error('Error deleting compliment group:', error);
    }
  };

  const toggleCollapseSent = () => {
    setCollapseSent(!collapseSent);
  };

  const handleSendComplimentToFollower = async (follower) => {
    if (!selectedGroupId) {
      setErrorMessage('Please select a group before sending a promotion.');
      return;
    }

    const selectedGroup = createdCompliments.find(group => Array.isArray(group) && group[0]?.groupId === selectedGroupId);
    console.log('Selected group:', selectedGroup); // Log selected group
    if (!selectedGroup) {
      console.error('Selected group is not an array:', selectedGroup); // Log error if selected group is not an array
      return;
    }
    const remainingCompliments = selectedGroup.filter(compliment => !compliment.sent);
    console.log('Remaining compliments:', remainingCompliments); // Log remaining compliments

    if (remainingCompliments.length > 0) {
      const complimentToSend = remainingCompliments[0];
      try {
        await axios.post(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/send-compliments`, {
          compliments: [complimentToSend],
          followers: [follower],
        });
        setCreatedCompliments(prevCompliments => {
          const updatedCompliments = prevCompliments.map(group => {
            if (!Array.isArray(group)) {
              console.error('Group is not an array:', group); // Log error if group is not an array
              return group;
            }
            return group.map(compliment =>
              compliment.id === complimentToSend.id
                ? { ...compliment, sent: true, recipient: follower.email }
                : compliment
            );
          });
          console.log('Updated compliments state after send:', updatedCompliments); // Log state update
          return updatedCompliments;
        });
        setErrorMessage('');
      } catch (error) {
        console.error('Error sending promotion:', error);
      }
    } else {
      alert('No promotions available to send in the selected group');
    }
  };

  const handleCheckboxChange = (groupId) => {
    setSelectedGroupId(groupId === selectedGroupId ? null : groupId);
  };

  const unsentComplimentsCount = createdCompliments.flat().filter(compliment => !compliment.sent).length;

  const formatTimeToPST = (date, time) => {
    const dateTimeString = `${date}T${time}:00Z`;
    const dateObj = new Date(dateTimeString);
    return dateObj.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="compliment-container">
      <div className="compliment-card">
        {inputVisible && (
          <div>
            <h2 style={{ textAlign: 'center' }}>Create Promotion</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                type="number"
                placeholder="Amount (%)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <input
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="time"
                placeholder="Start Time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <input
                type="time"
                placeholder="End Time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <button type="submit">Create Promotion</button>
            </form>
          </div>
        )}
        <hr />
        <h3>Unsent Promotions: ({unsentComplimentsCount})</h3>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <div className="compliments-list">
          {createdCompliments.map((complimentGroup, index) => (
            <div key={index} className="compliment-group">
              {complimentGroup[0] && (
                <>
                  <div className="compliment-header">
                    <input
                      type="checkbox"
                      checked={selectedGroupId === complimentGroup[0].groupId}
                      onChange={() => handleCheckboxChange(complimentGroup[0].groupId)}
                      className="group-checkbox"
                    />
                    <h4 style={{ marginLeft: '8px' }}>Group ID: {complimentGroup[0].groupId}</h4>
                  </div>
                  <p><strong>Title:</strong> {complimentGroup[0].title}</p>
                  <p><strong>Amount:</strong> {complimentGroup[0].amount}%</p>
                  <p><strong>Start Date:</strong> {complimentGroup[0].startDate}</p>
                  <p><strong>Start Time:</strong> {formatTimeToPST(complimentGroup[0].startDate, complimentGroup[0].startTime)}</p>
                  <p><strong>End Time:</strong> {formatTimeToPST(complimentGroup[0].startDate, complimentGroup[0].endTime)}</p>
                  <p><strong>Remaining:</strong> ({complimentGroup.filter(compliment => !compliment.sent).length})</p>
                  <button onClick={() => handleDeleteComplimentGroup(complimentGroup[0].groupId)} className="delete-button">
                    <img src="/remove.png" alt="Delete" />
                  </button>
                  <hr />
                </>
              )}
            </div>
          ))}
        </div>
        <div className="sent-compliments">
          <h3 onClick={toggleCollapseSent} style={{ cursor: 'pointer' }}>
            {collapseSent ? 'Show Sent Promotions' : 'Hide Sent Promotions'}
          </h3>
          {!collapseSent && (
            <div>
              {createdCompliments.flat().filter(compliment => compliment.sent).map((compliment, index) => (
                <div key={index} className="compliment-item">
                  <p><strong>Amount:</strong> {compliment.amount}%</p>
                  <p><strong>Start Time:</strong> {formatTimeToPST(compliment.startDate, compliment.startTime)}</p>
                  <p><strong>End Time:</strong> {formatTimeToPST(compliment.startDate, compliment.endTime)}</p>
                  <p><strong>Recipient:</strong> {compliment.recipient}</p>
                  <p><strong>Recipient's Name:</strong> {followers.find(f => f.email === compliment.recipient)?.username}</p>
                  <span className="red-mark">✔</span>
                  <hr />
                </div>
              ))}
            </div>
          )}
        </div>
        {followers.length > 0 && (
          <div style={{ border: `1px solid ${accentColor}` }} className="followers-container">
            <h2>Followers</h2>
            <ul>
              {followers.map((follower, index) => (
                <li key={index} className="follower-item">
                  <p>Username: {follower.username}</p>
                  {follower.username !== authUser.username && (
                    <button onClick={() => handleSendComplimentToFollower(follower)} className="send-button">
                      Send Compliment
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compliment;
