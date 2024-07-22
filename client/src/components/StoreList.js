import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/StoreList.css';

const StoresList = () => {
  const [stores, setStores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/stores');
        if (response.status === 200) {
          setStores(response.data.stores);
        } else {
          console.error('Error fetching stores: status', response.status);
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    };

    fetchStores();
  }, []);

  const handleStoreClick = (storeId) => {
    navigate(`/stores/${storeId}`);
  };

  return (
    <div className="stores-list-container">
      <h1 className="stores-list-header">All Stores</h1>
      {stores.length > 0 ? (
        stores.map((store) => (
          <div key={store.storeId} className="store-card" onClick={() => handleStoreClick(store.storeId)}>
            <h2 className="store-title">{store.name}</h2>
            <p className="store-description">Description: {store.description}</p>
            <p className="store-location">Location: {store.location}</p>
            <p className="store-owner">Owner: {store.userName} ({store.userEmail})</p>
          </div>
        ))
      ) : (
        <p className="no-stores">No stores found</p>
      )}
    </div>
  );
};

export default StoresList;
