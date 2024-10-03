import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isValidLogin, setIsValidLogin] = useState(true);

  const navigate = useNavigate();
  const todosRoute = () => {
    const path = `/`;
    navigate(path);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const response = await api.post("/login", { username, password }).catch();
      setIsValidLogin(true);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      todosRoute();
    } catch (error: any) {
      if (error.response && error.response.status === 404 || error.response.status === 401) {
        setIsValidLogin(false);
      }
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Login</h2>
      {!isValidLogin && <p className="error-message">Invalid username or password</p>}
      <label htmlFor="username">Username:</label>
      <input
        type="email"
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <label htmlFor="password">Password:</label>
      <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Sign In</button>
    </form>
  );
}

export default Login;
