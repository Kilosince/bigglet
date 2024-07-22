import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeContext from '../context/ThemeContext';
import Nav from './Nav';
import '../styles/Header.css'; // Ensure this import is correct

const Header = () => {
  const { accentColor } = useContext(ThemeContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="header" style={{ background: accentColor }}>
      <div className="header-content">
        <Link to="/">
          <h1 className="header--logo roboto-black-italic">The Flying Pot</h1>
        </Link>
        <button className="menu-button" onClick={toggleMenu}>
          ☰
        </button>
        <Nav menuOpen={menuOpen} />
      </div>
    </div>
  );
};

export default Header;
