import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import UserContext from '../context/UserContext';
import '../styles/StripePay.css';

const StripePay = ({ total, tip }) => {
  const { authUser } = useContext(UserContext);
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [name, setName] = useState('');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/cart`);
        if (response.status === 200) {
          setCart(response.data.cart);
        } else {
          console.error('Error fetching cart data: status', response.status);
        }
      } catch (error) {
        console.error('Error fetching cart data:', error);
      }
    };

    const createPaymentIntent = async () => {
      try {
        const amountInCents = Math.round(total * 100);
        const response = await axios.post('http://localhost:5000/api/create-payment-intent', { amount: amountInCents });
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
      }
    };

    if (total > 0) {
      fetchCartData();
      createPaymentIntent();
    }
  }, [total, authUser]);

  const generateRandomString = (length = 8) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const generateRandomOrderNumber = () => {
    return Math.floor(Math.random() * 500) + 1;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const confirmed = window.confirm("Do you want to process this payment?");
    if (!confirmed) return;

    setProcessing(true);

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: name,
        },
      },
    });

    if (payload.error) {
      setError(`Payment failed: ${payload.error.message}`);
      setProcessing(false);
    } else {
      setError(null);
      setSucceeded(true);
      setProcessing(false);

      const mainkey = generateRandomString();
      const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
      const orderNumber = generateRandomOrderNumber();

      const groupedCartItems = cart.reduce((acc, item) => {
        const storeOwnerId = item.storeId.split('-')[0];
        if (!acc[storeOwnerId]) {
          acc[storeOwnerId] = [];
        }
        acc[storeOwnerId].push(item);
        return acc;
      }, {});

      for (const [storeOwnerId, items] of Object.entries(groupedCartItems)) {
        const newOrder = {
          items,
          mainkey,
          timestamp,
          ccname: name,
          cartTotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
          orderNumber,
          PatronId: authUser._id,
          tip: parseFloat(tip || 0),
        };

        await axios.post(`http://localhost:5000/api/users/${storeOwnerId}/orders`, newOrder);
        await axios.post(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/patronOrders`, {
          ...newOrder,
          storeName: items[0].storeName,
        });

        await axios.post('http://localhost:5000/api/send-purchase-email', {
          email: authUser.email,
          storeName: items[0].storeName,
          ccName: name,
          cartTotal: newOrder.cartTotal,
          items: newOrder.items.map(item => ({
            itemName: item.itemName,
            price: item.price,
            quantity: item.quantity,
          })),
          timestamp,
        });
      }

      await axios.delete(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/cart/clear`);

      navigate('/authenticated');

      setName('');
      elements.getElement(CardElement).clear();
    }
  };

  return (
    <form id="stripe-pay-form" onSubmit={handleSubmit} className="stripe-pay-container">
      <div>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="stripe-pay-form-input"
          />
        </label>
      </div>
      <CardElement className="CardElement" />
      <button disabled={processing || succeeded} className="stripe-pay-form-button">
        {processing ? 'Processing...' : 'Pay'}
      </button>
      {error && <div className="error-message">{error}</div>}
      {succeeded && <div className="success-message">Payment succeeded!</div>}
    </form>
  );
};

export default StripePay;
