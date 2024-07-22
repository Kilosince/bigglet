import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import UserContext from '../context/UserContext';
import { useDefaultStyles, paragraphStyles, marginStyles } from '../context/Default_Designs';
import useTheme from '../context/useTheme'; // Ensure this path is correct
import '../styles/createStore.css'; // Ensure this path is correct

const CreateStore = () => {
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [items, setItems] = useState([{ _id: '', title: '', price: '', quantity: '', description: '', highlightColorIndex: 0 }]);
  const [storeExists, setStoreExists] = useState(false);
  const { authUser } = useContext(UserContext);
  const [highlightColorIndex, setHighlightColorIndex] = useState(1);

  const defaultStyles = useDefaultStyles();
  const { accentColor } = useTheme();
  const highlightColors = ['white', 'lightblue', 'lightgreen'];

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/store`);
        if (response.status === 200) {
          setStoreExists(true);
          setStoreName(response.data.name);
          setStoreDescription(response.data.description);
          setStoreLocation(response.data.location);
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
      }
    };

    fetchStoreData();
  }, [authUser._id]);

  const generateUniqueItemId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    for (let i = 0; i < 7; i++) {
      randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return randomString;
  };

  const handleStoreNameChange = (e) => {
    setStoreName(e.target.value);
  };

  const handleStoreDescriptionChange = (e) => {
    setStoreDescription(e.target.value);
  };

  const handleStoreLocationChange = (e) => {
    setStoreLocation(e.target.value);
  };

  const handleItemChange = (index, e) => {
    const updatedItems = [...items];
    updatedItems[index][e.target.name] = e.target.value;
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems(prevItems => [
      ...prevItems,
      { _id: generateUniqueItemId(), title: '', price: '', quantity: '', description: '', highlightColorIndex }
    ]);
    setHighlightColorIndex((prevIndex) => (prevIndex + 1) % highlightColors.length);
  };

  const removeItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const clearItemFields = () => {
    setItems([{ _id: '', title: '', price: '', quantity: '', description: '', highlightColorIndex: 0 }]);
  };

  const deleteStore = async () => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/store`);
      if (response.status === 200) {
        console.log('Store deleted successfully');
        setStoreExists(false);
        setStoreName('');
        setStoreDescription('');
        setStoreLocation('');
        clearItemFields();
      }
    } catch (error) {
      console.error('Error deleting store:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = authUser._id;
    const baseURL = 'http://localhost:5000/api/users/';
    const requestURL = `${baseURL}${encodeURIComponent(userId)}/store`;

    // Ensure all items have an _id before sending
    const itemsWithId = items.map(item => ({
      ...item,
      _id: item._id || generateUniqueItemId()
    }));

    if (!storeExists) {
      const store = { name: storeName, description: storeDescription, location: storeLocation, items: itemsWithId };
      console.log('Store data being sent:', store); // Log the store data being sent to the backend

      try {
        const response = await axios.post(requestURL, store);
        if (response.status === 201) {
          console.log('Store added successfully:', response.data);
          setStoreExists(true);
          clearItemFields();
        }
      } catch (error) {
        console.error('Error adding store:', error);
      }
    } else {
      const newItem = itemsWithId[itemsWithId.length - 1];
      console.log('New item being sent:', newItem); // Log the item data being sent to the backend

      try {
        const response = await axios.post(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/store/items`, newItem);
        if (response.status === 200) {
          console.log('Item added successfully:', response.data);
          clearItemFields();
        }
      } catch (error) {
        console.error('Error adding item:', error);
      }
    }
  };

  return (
    <div className="card" style={{ borderColor: accentColor }}>
      {storeExists ? (
        <>
          <h1 style={{ fontWeight: 800, color: 'black' }}>{storeName}</h1>
          <p className="paragraph">{storeDescription}</p>
          <p className="paragraph">{storeLocation}</p>
          <div style={{ marginBottom: '20px' }}>
            <button type="button" onClick={deleteStore} className="button button-remove">Delete Store</button>
          </div>
          <div className="separator"></div>
        </>
      ) : (
        <h2 className="paragraph">Create Store</h2>
      )}
      <form onSubmit={handleSubmit}>
        {!storeExists && (
          <>
            <div className="margin-medium">
              <label>Store Name:</label>
              <input type="text" value={storeName} onChange={handleStoreNameChange} required />
            </div>
            <div className="margin-medium">
              <label>Store Description:</label>
              <input type="text" value={storeDescription} onChange={handleStoreDescriptionChange} required />
            </div>
            <div className="margin-medium">
              <label>Store Location:</label>
              <input type="text" value={storeLocation} onChange={handleStoreLocationChange} required />
            </div>
          </>
        )}
        <h2 className="paragraph text-center">Items</h2>
        {items.map((item, index) => (
          <div key={item._id || index} style={{ backgroundColor: highlightColors[item.highlightColorIndex || 0], marginBottom: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <div className="margin-medium">
              <label>Title:</label>
              <input type="text" name="title" value={item.title} onChange={(e) => handleItemChange(index, e)} required />
            </div>
            <div className="margin-medium">
              <label>Price:</label>
              <input type="number" name="price" value={item.price} onChange={(e) => handleItemChange(index, e)} required />
            </div>
            <div className="margin-medium">
              <label>Quantity:</label>
              <input type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e)} required />
            </div>
            <div className="margin-medium">
              <label>Description:</label>
              <input type="text" name="description" value={item.description} onChange={(e) => handleItemChange(index, e)} required />
            </div>
            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(index)} className="button button-remove">Remove Field</button>
            )}
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button type="button" onClick={addItem} className="button">New Field</button>
          <button type="submit" className="button">{storeExists ? 'Add Item' : 'Create Store'}</button>
        </div>
      </form>
    </div>
  );
};

export default CreateStore;
