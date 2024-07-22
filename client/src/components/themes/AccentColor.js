import { TwitterPicker } from 'react-color';
import { useContext } from "react";
import ThemeContext from "../../context/ThemeContext";
import '../../styles/AccentColor.css'; // Ensure this import is correct

const AccentColor = () => {
  const { accentColor, actions } = useContext(ThemeContext);

  return (
    <div className="accent-color-container">
      <div className="accent-color-content">
        <h3>Accent Color</h3>
        <TwitterPicker
          triangle="hide"
          width="100%"
          styles={{ 'default': { input: { color: null, boxSizing: null } } }}
          colors={['#F78DA7', '#FF5E5E',  "#FF0000", '#FF6900', '#FCB900', '#7BDCB5', '#00D084', '#90E0EF', '#0693E3', '#ABB8C3', '#63537d']}
          color={accentColor}
          onChange={(color) => actions.updateAccentColor(color.hex)}
        />
      </div>
    </div>
  )
}

export default AccentColor;
