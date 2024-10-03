import { Link, useNavigate } from "react-router-dom";
import "../pages/stylesheet/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="navbar-body">
      <h2 className="nav-title">TASK MANAGEMENT</h2>
      <div className="nav-menu">
        {localStorage.getItem("token") ? (
          <>
            <Link className="navbar-link" to="/">
              Tasks
            </Link>
            <a className="navbar-link" onClick={handleLogout}>
              Logout
            </a>
          </>
        ) : (
          <>
            <Link className="navbar-link" to="/login">
              Login
            </Link>
            <Link className="navbar-link" to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
