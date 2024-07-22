import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserContext from "../context/UserContext";
import DarkMode from "./themes/DarkMode";
import AccentColor from "./themes/AccentColor";
import FontSize from "./themes/FontSize";
import '../styles/Settings.css'; // Ensure this import is correct

function Settings() {
  const { authUser, actions } = useContext(UserContext);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDeleteUser = async () => {
    if (confirmEmail !== authUser.email) {
      alert("Email does not match. Please type your email correctly to confirm.");
      return;
    }

    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/users/${encodeURIComponent(authUser._id)}`);
        if (response.status === 200) {
          alert('Account deleted successfully.');
          // Clear user context and remove cookie
          actions.signOut(); // Call signOut function
          navigate('/signup'); // Redirect to /sign route
        } else {
          console.error('Error deleting account: status', response.status);
        }
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h1>Preferences</h1>
        <DarkMode />
        <AccentColor />
        <FontSize />
        {!isDeleting && (
          <button 
            onClick={() => setIsDeleting(true)} 
            className="delete-account-button"
          >
            Delete Account
          </button>
        )}
        {isDeleting && (
          <div className="delete-confirmation">
            <input 
              type="email" 
              placeholder="Type your email to confirm" 
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)} 
              className="delete-confirmation-input"
            />
            <button 
              onClick={handleDeleteUser} 
              className="confirm-delete-button"
            >
              Confirm Account Deletion
            </button>
            <button 
              onClick={() => setIsDeleting(false)} 
              className="cancel-delete-button"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
