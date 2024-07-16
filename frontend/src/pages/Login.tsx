import React, { useState } from "react";
import { Page, usePageStore } from "../stores/PageStore";
import { auth, UserCredentials } from "../services/authService";
import { useUserStore } from "../stores/UserStore";

const Login = () => {
  const { setPage } = usePageStore();
  const { setRealUsername, setUserId } = useUserStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const data: UserCredentials = { username, password };
    let response = await auth.login(data);
    if (response.did_user_exist === false) {
      if (response.username && response.user_id) {
        setRealUsername(response.username);
        setUserId(response.user_id);
      } else {
        alert("Found user in database but could not find credentials");
        return;
      }
      setPage(Page.MEETING);
      return;
    }
    alert("User doesn't exist. Register instead.");
  }

  async function handleRegister() {
    const data: UserCredentials = { username, password };
    let response = await auth.register(data);
    if (response.did_user_exist === true) {
      alert("User already exists. Login instead.");
      return;
    }
    if (response.user_id && response.username) {
      setRealUsername(response.username);
      setUserId(response.user_id);
    } else {
      alert(
        "Added user in database but did not recieve registered credentials"
      );
      return;
    }

    setPage(Page.MEETING);
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
