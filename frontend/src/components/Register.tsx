import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isValidPassword, setIsValidPassword] = useState(false);

  const navigate = useNavigate();
  const loginRoute = () => {
    const path = `/login`;
    navigate(path);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      if (isValidPassword) {
        await api.post("/register", { username, password });
        loginRoute();
      }
    } catch (error: any) {
      if(error.response.status == 400 && error.response.data.error == "Username already exists"){
        if(confirm("This user already exists. Try to do a login.")) {
          loginRoute();
        } else {
          return;
        }
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
      newPassword
    );

    setIsValidPassword(
      newPassword.length > 8 && hasUpperCase && hasNumber && hasSpecialChar
    );
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <h2>Register</h2>
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
        onChange={handlePasswordChange}
        required
      />
      <button type="submit" disabled={!isValidPassword}>
        Register
      </button>
    </form>
  );
}

export default Register;
