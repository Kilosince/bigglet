import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import useTheme from '../context/useTheme';
import '../styles/UpdateStore.css';

const UpdateStore = () => {
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [items, setItems] = useState([]);
  const [storeExists, setStoreExists] = useState(false);
  const [editItemIndex, setEditItemIndex] = useState(null);
  const [editItemData, setEditItemData] = useState({ title: '', description: '', price: '', quantity: '' });
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [newItemData, setNewItemData] = useState({ title: '', description: '', price: '', quantity: '' });
  const [flashMessage, setFlashMessage] = useState('');
  const navigate = useNavigate();
  const { authUser } = useContext(UserContext);

  const [originalStoreData, setOriginalStoreData] = useState({});

  const { accentColor } = useTheme();

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/store`);
        if (response.status === 200) {
          setStoreExists(true);
          setStoreName(response.data.name);
          setStoreDescription(response.data.description);
          setStoreLocation(response.data.location);
          setItems(response.data.items || []);
          setOriginalStoreData({
            name: response.data.name,
            description: response.data.description,
            location: response.data.location
          });
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

  const deleteStore = async () => {
    if (window.confirm('Are you sure you want to delete your store? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/store`);
        if (response.status === 200) {
          console.log('Store deleted successfully');
          setStoreExists(false);
          navigate('/authenticated');
        }
      } catch (error) {
        console.error('Error deleting store:', error);
      }
    }
  };

  const startEditItem = (index) => {
    setEditItemIndex(index);
    setEditItemData(items[index]);
  };

  const handleEditItemChange = (e) => {
    const { name, value } = e.target;
    setEditItemData({ ...editItemData, [name]: value });
  };

  const saveEditItem = async () => {
    try {
      const updatedItems = items.map((item, index) => index === editItemIndex ? editItemData : item);
      const itemId = editItemData._id; // Get the _id of the item being edited
      const response = await axios.put(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/store/items/${encodeURIComponent(itemId)}`, editItemData);

      if (response.status === 200) {
        console.log('Item updated successfully');
        setItems(updatedItems);
        setEditItemIndex(null);
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const removeItem = async (itemId, index) => {
    if (!itemId) {
      console.error('Invalid item ID');
      return;
    }
    try {
      const response = await axios.delete(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/store/items/${encodeURIComponent(itemId)}`);

      if (response.status === 200) {
        console.log('Item removed successfully');
        const updatedItems = items.filter((item, i) => i !== index); // Remove the item at the specified index
        setItems(updatedItems); // Update the items state
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const startEditStore = () => {
    setIsEditingStore(true);
    setFlashMessage('');
  };

  const cancelEditStore = () => {
    setStoreName(originalStoreData.name);
    setStoreDescription(originalStoreData.description);
    setStoreLocation(originalStoreData.location);
    setIsEditingStore(false);
    setFlashMessage('');
  };

  const saveEditStore = async () => {
    if (storeName === '' || storeDescription === '' || storeLocation === '') {
      setFlashMessage('Please fill in all fields before saving.');
      return;
    }
    try {
      const updatedStore = {
        name: storeName,
        description: storeDescription,
        location: storeLocation,
        items: items // Ensure items are saved correctly
      };
      const response = await axios.put(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/store`, updatedStore);
      if (response.status === 200) {
        setStoreExists(true);
        setIsEditingStore(false); // Set to false to revert back to original display mode
        setFlashMessage('');
        setOriginalStoreData({
          name: storeName,
          description: storeDescription,
          location: storeLocation,
        });
      } else {
        setFlashMessage('Failed to save store changes.');
      }
    } catch (error) {
      console.error('Cannot save unchanged fields. If no changes, please press cancel:', error);
      setFlashMessage('Cannot save unchanged fields. If no change, please press cancel');
    }
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItemData({ ...newItemData, [name]: value });
  };

  const compliments = (e) => {
    navigate('/compliments');
  };

  const addNewItem = async () => {
    if (newItemData.title === '' || newItemData.description === '' || newItemData.price === '' || newItemData.quantity === '') {
      setFlashMessage('Please fill in all fields before adding a new item.');
      return;
    }

    // Add unique ID and highlight color index
    const newItemWithIdAndColor = {
      ...newItemData,
      _id: generateUniqueItemId(),
      highlightColorIndex: 0
    };

    try {
      const response = await axios.post(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/store/items`, newItemWithIdAndColor);

      if (response.status === 200) {
        console.log('Item added successfully');
        const newItem = response.data; // Use the response data which includes the generated _id
        setItems([...items, newItem]);
        setNewItemData({ title: '', description: '', price: '', quantity: '' });
        setFlashMessage('');
      }
    } catch (error) {
      console.error('Error adding new item:', error);
    }
  };

  return (
    <div className="update-store-container">
      {flashMessage && <div className="update-store-flash-message">{flashMessage}</div>}
      {storeExists ? (
        <>
          {isEditingStore ? (
            <>
              <div className="update-store-input-group">
                <label>Store Name:</label>
                <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
              </div>
              <div className="update-store-input-group">
                <label>Store Description:</label>
                <input type="text" value={storeDescription} onChange={(e) => setStoreDescription(e.target.value)} required />
              </div>
              <div className="update-store-input-group">
                <label>Store Location:</label>
                <input type="text" value={storeLocation} onChange={(e) => setStoreLocation(e.target.value)} required />
              </div>
              <div className="update-store-button-group">
                <button onClick={saveEditStore} className="update-store-button">
                  <img src="save.png" alt="Save" className="icon" />
                </button>
                <button onClick={cancelEditStore} className="update-store-button update-store-button-cancel">
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="update-store-store-title-bona-nova">{storeName}</h1>
              <p className="update-store-store-description">{storeDescription}</p>
              <p className="update-store-store-location">{storeLocation}</p>
              <div className="update-store-button-group">
                <button onClick={startEditStore} className="update-store-button">
                  <img src="edit.png" alt="Edit" className="icon" />
                </button>
                <button onClick={compliments} className="update-store-button update-store-button-ticket">
                  <img src="ticket.png" alt="Compliments" className="icon" />
                </button>
                <button onClick={deleteStore} className="update-store-button update-store-button-remove">
                  Delete Store
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <h2 className="update-store-no-store">No Store Found</h2>
      )}
      <div>
        <h2 className="update-store-items-title">----</h2>
        {items.map((item, index) => (
          <div key={item._id} className="update-store-item-card">
            {editItemIndex === index ? (
              <>
                <div className="update-store-input-group">
                  <label>Title:</label>
                  <input type="text" name="title" value={editItemData.title} onChange={handleEditItemChange} required />
                </div>
                <div className="update-store-input-group">
                  <label>Price:</label>
                  <input type="number" name="price" value={editItemData.price} onChange={handleEditItemChange} required />
                </div>
                <div className="update-store-input-group">
                  <label>Quantity:</label>
                  <input type="number" name="quantity" value={editItemData.quantity} onChange={handleEditItemChange} required />
                </div>
                <div className="update-store-input-group">
                  <label>Description:</label>
                  <input type="text" name="description" value={editItemData.description} onChange={handleEditItemChange} required />
                </div>
                <div className="update-store-button-group">
                  <button onClick={saveEditItem} className="update-store-button">
                    <img src="save.png" alt="Save" className="icon" />
                  </button>
                  <button onClick={() => setEditItemIndex(null)} className="update-store-button update-store-button-cancel">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 className="update-store-item-title">{item.title}</h1>
                <p className="update-store-item-detail">Quantity: {item.quantity}</p>
                <p className="update-store-item-detail">Description: {item.description}</p>
                <p className="update-store-item-detail">Price: ${item.price}</p>
                <div className="update-store-button-group">
                  <button onClick={() => startEditItem(index)} className="update-store-button">
                    <img src="edit.png" alt="Edit" className="icon" />
                  </button>
                  <button onClick={() => removeItem(item._id, index)} className="update-store-button update-store-button-remove">
                    <img src="remove.png" alt="Remove" className="icon" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        <div className="update-store-new-item-card">
          <h2 className="update-store-new-item-title">New Item</h2>
          <div className="update-store-input-group">
            <label>Title:</label>
            <input type="text" name="title" value={newItemData.title} onChange={handleNewItemChange} required />
          </div>
          <div className="update-store-input-group">
            <label>Price:</label>
            <input type="number" name="price" value={newItemData.price} onChange={handleNewItemChange} required />
          </div>
          <div className="update-store-input-group">
            <label>Quantity:</label>
            <input type="number" name="quantity" value={newItemData.quantity} onChange={handleNewItemChange} required />
          </div>
          <div className="update-store-input-group">
            <label>Description:</label>
            <input type="text" name="description" value={newItemData.description} onChange={handleNewItemChange} required />
          </div>
          <button onClick={addNewItem} className="update-store-button update-store-add-item-button">
            Add New Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStore;
