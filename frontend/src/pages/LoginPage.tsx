import React, { useState } from "react";
import { Page, usePageStore } from "../stores/PageStore";
import { auth, UserCredentials } from "../services/authService";
import { useUserStore, User } from "../stores/UserStore";
import logo from "../images/mAItLogoGlow.png"; // Make sure to import the logo

const styles = {
  body: {
    margin: 0,
    fontFamily: '"RingsideNarrow", sans-serif',
  },
  loginContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#08238C",
  },
  loginBox: {
    fontFamily: '"RingsideNarrow", sans-serif',
    textAlign: "center" as const,
    backgroundColor: "#DCE2EE",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    width: "500px",
  },
  logo: {
    width: "300px",
    marginBottom: "20px",
  },
  inputField: {
    display: "block",
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #041354",
    borderRadius: "5px",
    fontSize: "16px",
    fontFamily: '"RingsideNarrow", sans-serif',
    fontWeight: "lighter",
    boxSizing: "border-box" as const,
  },
  button: {
    fontFamily: '"RingsideNarrow", sans-serif',
    width: "51%",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    marginBottom: "10px",
    boxSizing: "border-box" as const,
  },
  loginButton: {
    backgroundColor: "#82A4EB",
    color: "#041354",
  },
  createAccountButton: {
    backgroundColor: "#041354",
    color: "#82A4EB",
  },
};

const Login = () => {
  const { setPage } = usePageStore();
  const { setUser } = useUserStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    if (areCredentialsWhitespace()) {
      return;
    }
    const data: UserCredentials = { username, password };
    let response = await auth.login(data);
    if (response.did_user_exist === false) {
      if (response.username && response.user_id) {
        setUser({ name: response.username, id: response.user_id });
      } else {
        alert("Found user in database but could not find credentials");
        return;
      }
      setPage(Page.HOME);
      return;
    }
    alert("User doesn't exist. Register instead.");
  }

  async function handleRegister() {
    if (areCredentialsWhitespace()) {
      return;
    }
    const data: UserCredentials = { username, password };
    let response = await auth.register(data);
    if (response.did_user_exist === true) {
      alert("User already exists. Login instead.");
      return;
    }
    if (response.user_id && response.username) {
      setUser({ name: response.username, id: response.user_id });
    } else {
      alert(
        "Added user in database but did not receive registered credentials"
      );
      return;
    }
    setPage(Page.HOME);
  }

  function areCredentialsWhitespace() {
    return password.trim().length === 0 || username.trim().length === 0;
  }

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginBox}>
        <img src={logo} alt="Logo" style={styles.logo} />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.inputField}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.inputField}
        />
        <button
          onClick={handleLogin}
          style={{ ...styles.button, ...styles.loginButton }}
        >
          Login
        </button>
        <button
          onClick={handleRegister}
          style={{ ...styles.button, ...styles.createAccountButton }}
        >
          Create Account
        </button>
      </div>
    </div>
  );
};

export default Login;
