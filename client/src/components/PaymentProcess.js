import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import UserContext from '../context/UserContext';
import StripePay from './StripePay';
import '../styles/Payment.css';

const stripePromise = loadStripe('pk_test_gHRNbIXqJnr5ead25WqdZ4uX');

const PaymentProcess = () => {
  const { authUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [promotions, setPromotions] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [tip, setTip] = useState('');
  const [isEditingTip, setIsEditingTip] = useState(false);

  useEffect(() => {
    if (!authUser || !authUser._id) {
      console.error('User ID is undefined');
      return;
    }

    const fetchData = async () => {
      try {
        const cartResponse = await axios.get(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/cart`);
        const promotionsResponse = await axios.get(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/compliments/kitchen`);
        
        if (cartResponse.status === 200 && promotionsResponse.status === 200) {
          const validCartItems = cartResponse.data.cart.filter(item => item && item.price !== undefined && item.quantity !== undefined);
          setCart(validCartItems);
          setPromotions(promotionsResponse.data.compliments);
          updateTotal(validCartItems, promotionsResponse.data.compliments, tip);
        } else {
          console.error('Error fetching cart or promotions data: status', cartResponse.status, promotionsResponse.status);
        }
      } catch (error) {
        console.error('Error fetching cart or promotions data:', error);
      }
    };

    fetchData();
  }, [authUser, tip]);

  const updateTotal = (cartItems, promotions, tip) => {
    let totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    for (const promotion of promotions) {
      const storeItemsTotal = cartItems
        .filter(item => item.storeId === promotion.storeId)
        .reduce((acc, item) => acc + (item.price * item.quantity), 0);

      if (storeItemsTotal > 0) {
        totalAmount -= (storeItemsTotal * (promotion.amount / 100));
      }
    }

    if (tip) {
      totalAmount += parseFloat(tip);
    }

    setTotal(totalAmount);
  };

  const handleDeleteItem = async (index) => {
    try {
      const itemId = cart[index]._id;
      const response = await axios.delete(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/cart/items/${encodeURIComponent(itemId)}`);
      if (response.status === 200) {
        const updatedCart = [...cart];
        updatedCart.splice(index, 1);
        setCart(updatedCart);
        updateTotal(updatedCart, promotions, tip);
      } else {
        console.error('Error deleting cart item:', response.status);
      }
    } catch (error) {
      console.error('Error deleting cart item:', error);
    }
  };

  const handleEditItem = (index) => {
    const cartItem = cart[index];
    setEditIndex(index);
    setQuantity(cartItem.quantity);
    setNotes(cartItem.notes);
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setQuantity('');
    setNotes('');
  };

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  const handleSaveItem = async (index) => {
    const cartItem = cart[index];
    const updatedItem = { ...cartItem, quantity, notes };
  
    try {
      const response = await axios.put(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/cart/items/${encodeURIComponent(cartItem._id)}`, { cartItem: updatedItem });
      if (response.status === 200) {
        const updatedCart = [...cart];
        updatedCart[index] = updatedItem;
        setCart(updatedCart);
        updateTotal(updatedCart, promotions, tip);
        setEditIndex(null);
        setQuantity('');
        setNotes('');
      } else {
        console.error('Error saving cart item:', response.status);
      }
    } catch (error) {
      console.error('Error saving cart item:', error);
    }
  };

  const handleTipChange = (e) => {
    setTip(e.target.value);
  };

  const handleAddTip = () => {
    if (!isNaN(tip) && tip >= 0) {
      const confirmed = window.confirm(`Add $${parseFloat(tip).toFixed(2)} tip to the total?`);
      if (confirmed) {
        updateTotal(cart, promotions, tip);
        setIsEditingTip(false);
      }
    } else {
      alert('Please enter a valid tip amount.');
    }
  };

  const handleEditTip = () => {
    setIsEditingTip(true);
  };

  const handleNavigateToStore = (storeId) => {
    navigate(`/stores/${storeId}`);
  };

  return (
    <div className="payment-container-unique">
      <h1>My Cart</h1>
      {cart.length > 0 ? (
        cart.map((cartItem, index) => (
          <div key={index} className="payment-card-unique">
            {editIndex === index ? (
              <div>
                <p>Title: {cartItem.storeName}</p>
                <p>Price: ${parseFloat(cartItem.price).toFixed(2)}</p>
                <p>
                  Quantity: <input type="number" min="1" value={quantity} onChange={handleQuantityChange} className="payment-input-unique" />
                </p>
                <p>
                  Notes: <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="payment-input-unique" />
                </p>
                <button onClick={() => handleSaveItem(index)} className="payment-button-unique">Save</button>
                <button onClick={handleCancelEdit} className="payment-button-unique">Cancel</button>
              </div>
            ) : (
              <div>
                <h3 onClick={() => handleNavigateToStore(cartItem.storeId)} className="payment-link-unique">{cartItem.itemName}</h3>
                <p>Price: ${parseFloat(cartItem.price).toFixed(2)}</p>
                <p>Quantity: {cartItem.quantity}</p>
                <p>Notes: {cartItem.notes}</p>
                <button onClick={() => handleEditItem(index)} className="payment-button-unique" style={{ marginRight: '10px' }}>Edit</button>
                <button onClick={() => handleDeleteItem(index)} className="payment-button-unique">Delete</button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>Cart is empty</p>
      )}
      <div className="tip-container-unique">
        {isEditingTip ? (
          <>
            <input
              type="number"
              min="0"
              value={tip || ''}
              onChange={handleTipChange}
              className="tip-input-unique"
            />
            <button onClick={handleAddTip} className="tip-button-unique">Add Tip</button>
          </>
        ) : (
          <>
            <p>Tip: ${parseFloat(tip || 0).toFixed(2)}</p>
            <button onClick={handleEditTip} className="tip-button-unique">Edit Tip</button>
          </>
        )}
      </div>
      <h3>Total: ${total.toFixed(2)}</h3>
      <Elements stripe={stripePromise}>
        <StripePay total={total} tip={tip} />
      </Elements>
    </div>
  );
};

export default PaymentProcess;
