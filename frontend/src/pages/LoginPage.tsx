import React, { useState } from "react";
import { Page, usePageStore } from "../stores/PageStore";
import { auth, UserCredentials } from "../services/authService";
import { useUserStore, User } from "../stores/UserStore";

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
        "Added user in database but did not recieve registered credentials"
      );
      return;
    }

    setPage(Page.HOME);
  }

  function areCredentialsWhitespace() {
    return password.trim().length === 0 || username.trim().length === 0;
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
