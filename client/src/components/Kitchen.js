import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import UserContext from '../context/UserContext';
import '../styles/Kitchen.css'; // Ensure this import is correct

const Kitchen = () => {
  const { authUser } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [checkedItems, setCheckedItems] = useState(() => {
    const savedCheckedItems = localStorage.getItem('checkedItems');
    return savedCheckedItems ? JSON.parse(savedCheckedItems) : {};
  });
  const [updateCounts, setUpdateCounts] = useState(() => {
    const savedCounts = localStorage.getItem('updateCounts');
    return savedCounts ? JSON.parse(savedCounts) : {};
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/orders`);
        if (response.status === 200) {
          setOrders(response.data.orders);
          const initialExpanded = response.data.orders.reduce((acc, _, index) => {
            acc[index] = true;
            return acc;
          }, {});
          setExpandedOrders(initialExpanded);
        } else {
          console.error('Error fetching orders: status', response.status);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    if (authUser && authUser._id) {
      fetchOrders();
    }
  }, [authUser]);

  const toggleOrder = (index) => {
    setExpandedOrders(prevState => ({
      ...prevState,
      [index]: !prevState[index]
    }));
  };

  const handleDeleteOrder = async (mainkey) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}/orders/${encodeURIComponent(mainkey)}`);
        if (response.status === 200) {
          setOrders(orders.filter(order => order.mainkey !== mainkey));
        } else {
          console.error('Error deleting order:', response.status);
        }
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const handleCheckItem = (orderIndex, itemIndex) => {
    const updatedCheckedItems = { ...checkedItems };
    if (!updatedCheckedItems[orderIndex]) {
      updatedCheckedItems[orderIndex] = {};
    }

    const isChecked = updatedCheckedItems[orderIndex][itemIndex];
    if (isChecked) {
      if (window.confirm('Are you sure you want to unmark this item as completed?')) {
        updatedCheckedItems[orderIndex][itemIndex] = !isChecked;
      }
    } else {
      updatedCheckedItems[orderIndex][itemIndex] = !isChecked;
    }

    setCheckedItems(updatedCheckedItems);
    localStorage.setItem('checkedItems', JSON.stringify(updatedCheckedItems));
  };

  const isOrderComplete = (orderIndex) => {
    const orderCheckedItems = checkedItems[orderIndex] || {};
    return orders[orderIndex].items.every((_, itemIndex) => orderCheckedItems[itemIndex]);
  };

  const updateOrderStatus = async (mainkey, status, PatronId) => {
    try {
      const endpoint = status === 'Ready'
        ? `http://localhost:5000/api/users/${encodeURIComponent(PatronId)}/orders/${encodeURIComponent(mainkey)}/status/ready`
        : `http://localhost:5000/api/users/${encodeURIComponent(PatronId)}/orders/${encodeURIComponent(mainkey)}/status/ready-in-10-minutes`;

      const response = await axios.put(endpoint);
      if (response.status === 200) {
        const updatedOrders = orders.map(order =>
          order.mainkey === mainkey ? { ...order, status } : order
        );
        setOrders(updatedOrders);

        const newCounts = { ...updateCounts };
        if (!newCounts[mainkey]) {
          newCounts[mainkey] = { ready: 0, readyIn10: 0 };
        }
        if (status === 'Ready') {
          newCounts[mainkey].ready += 1;
        } else {
          newCounts[mainkey].readyIn10 += 1;
        }
        setUpdateCounts(newCounts);
        localStorage.setItem('updateCounts', JSON.stringify(newCounts));
      } else {
        console.error('Error updating order status:', response.status);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return (
    <div className="kitchen-container">
      <h2 className="kitchen-header">Kitchen Orders</h2>
      <div className="kitchen-container">
        <p className="kitchen-paragraph" style={{ color: 'black' }}>Total Orders: {orders.length}</p>
      </div>
      {orders.length > 0 ? (
        orders.map((order, index) => (
          <div key={order.mainkey} className="kitchen-order">
            <div onClick={() => toggleOrder(index)} className="kitchen-order-header">
              <h2 style={{ color: '#333' }}>Order {order.orderNumber} {isOrderComplete(index) && <span style={{ color: 'red' }}>X</span>}</h2>
              <p>Main Key: {order.mainkey}</p>
              <p>Timestamp: {order.timestamp}</p>
              <p>Items Count: {order.items.reduce((count, item) => count + Number(item.quantity), 0)}</p>
              <p>Cart Total: ${order.cartTotal.toFixed(2)}</p>
            </div>
            {expandedOrders[index] && (
              <div>
                <h3>Items:</h3>
                {order.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="kitchen-item">
                    <p className="kitchen-item-name">{item.itemName}</p>
                    <p>Item ID: {item.foodId}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Notes: {item.notes || 'N/A'}</p>
                    <p>Price: ${item.price}</p>
                    <label>
                      <input
                        type="checkbox"
                        checked={checkedItems[index] && checkedItems[index][itemIndex]}
                        onChange={() => handleCheckItem(index, itemIndex)}
                      />
                      Mark as completed
                    </label>
                  </div>
                ))}
                <div className="kitchen-buttons">
                  <button onClick={() => updateOrderStatus(order.mainkey, 'Ready', order.PatronId)} className="kitchen-button ready">
                    Ready {updateCounts[order.mainkey]?.ready || 0}
                  </button>
                  <button onClick={() => updateOrderStatus(order.mainkey, 'Ready in 10 minutes', order.PatronId)} className="kitchen-button ready-in-10">
                    Ready in 10min! {updateCounts[order.mainkey]?.readyIn10 || 0}
                  </button>
                </div>
              </div>
            )}
            <button onClick={() => handleDeleteOrder(order.mainkey)} className="kitchen-button delete">Delete Order</button>
          </div>
        ))
      ) : (
        <p className="kitchen-paragraph">No orders found</p>
      )}
    </div>
  );
};

export default Kitchen;
