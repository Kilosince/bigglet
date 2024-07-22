import { Link } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../context/UserContext";
import '../styles/Nav.css'; // Ensure this import is correct

const Nav = ({ menuOpen }) => {
  const { authUser } = useContext(UserContext);

  return (
    <nav className={`nav ${menuOpen ? 'open' : ''}`}>
      {authUser === null ? 
      <>
        <Link className="nav-link roboto-bold signup" to="/signup">Sign up</Link>
        <Link className="nav-link roboto-bold signin" to="/signin">Sign in</Link>
      </>
      :
      <>
        <span className="nav-welcome"> Welcome {authUser.name} </span>
        <Link className="nav-link roboto-bold home" to="/authenticated">Home</Link>
        <Link className="nav-link roboto-bold createstore" to="/createstore">Store</Link>
        <Link className="nav-link roboto-bold updatestore" to="/updatestore">Manage</Link>
        <Link className="nav-link roboto-bold storelist" to="/storelist"> Store List</Link>
        <Link className="nav-link roboto-bold paymentprocess" to="/paymentprocess"> Cart</Link>
        <Link className="nav-link roboto-bold followers"style={{ display: 'none' }} to="/followers">Followers</Link>
        <Link className="nav-link roboto-bold user" style={{ display: 'none' }} to="/userlist">Users</Link>
        <Link className="nav-link roboto-bold settings" to="/settings">Settings</Link>
        <Link className="nav-link roboto-bold signout" to="/signout">Sign Out</Link>
      </>
      }
    </nav>
  );
}

export default Nav;
