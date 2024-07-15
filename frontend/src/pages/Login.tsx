import React, { useState } from "react";
import { Page, usePageStore } from "../stores/PageStore";
import { auth, UserCredentials } from "../services/authService";

const Login = () => {
  const { setPage } = usePageStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    console.log("HELLO");
    const data: UserCredentials = { username, password };
    let response = await auth.login(data);
    if (response.user_exists) {
      setPage(Page.HOME);
      return;
    }
    alert("User doesn't exist. Register instead.");
  }

  async function handleRegister() {
    const data: UserCredentials = { username, password };
    let response = await auth.register(data);
    if (response.user_exists) {
      alert("User already exists. Login instead.");
    }
    setPage(Page.HOME);
  }
  return (
    <div style={{ padding: "20px" }}>
      <h2>Create your account</h2>
      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={handleLogin}>Sign up</button>
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default Login;
