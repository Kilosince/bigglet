import useTheme from './useTheme';

export const useDefaultStyles = () => {
  const { accentColor } = useTheme();

  return {
    border: `2px solid ${accentColor}`,
    borderRadius: '10px',
    padding: '1em',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    boxSizing: 'border-box',
  };
};

export const paragraphStyles = {
  margin: '10px 0',
  lineHeight: '1.5',
  textAlign: 'center', // Center align text for better presentation on small screens
};

export const buttonStyles = {
  border: 'none',
  padding: '12px 18px',
  borderRadius: '25px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '5px',
  fontSize: '1em',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  transition: 'background-color 0.3s ease, transform 0.3s ease',
  width: '100%', // Make buttons take full width on smaller screens
  maxWidth: '200px', // Ensure buttons don't stretch too much on larger screens
};

export const buttonReadyStyles = {
  ...buttonStyles,
  backgroundColor: '#28a745',
  color: 'white',
  marginRight: '10px',
};

export const buttonReadyIn10Styles = {
  ...buttonStyles,
  backgroundColor: '#ffc107',
  color: 'black',
};

export const buttonDeleteStyles = {
  ...buttonStyles,
  backgroundColor: '#dc3545',
  color: 'white',
  position: 'relative', // Changed from absolute to relative for better responsiveness
  marginTop: '10px', // Added margin for spacing
};

export const itemNameStyles = {
  fontSize: '1.5em',
  fontWeight: 'bold',
  marginBottom: '10px',
};

export const marginStyles = {
  small: {
    margin: '5px',
  },
  medium: {
    margin: '10px',
  },
  large: {
    margin: '15px',
  },
};

export const responsiveContainer = {
  padding: '10px',
  boxSizing: 'border-box',
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
};

export const divStyles = {
  margin: '10px 0',
  padding: '20px 0',
};

export const useStoreDetailsStyles = () => {
  const { accentColor } = useTheme();

  return {
    container: {
      margin: '20px auto',
      padding: '20px',
      maxWidth: '800px',
      borderRadius: '8px',
      border: `1px solid ${accentColor}`,
      backgroundColor: '#f9f9f9',
    },
    itemContainer: {
      border: `1px solid #ddd`,
      borderRadius: '5px',
      padding: '15px',
      marginBottom: '15px',
    },
    itemTitle: {
      fontWeight: 'bold',
      fontSize: '1.2em',
      marginBottom: '10px',
    },
    itemDescription: {
      marginBottom: '10px',
    },
    itemDetails: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '10px',
    },
    itemControls: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    payButton: {
      ...buttonStyles,
      backgroundColor: 'blue',
      color: 'white',
      display: 'inline-block',
      marginTop: '20px',
      textAlign: 'center',
    },
  };
};

