import React from "react";
import { useUserStore } from "../stores/UserStore";
import AudioComponent from "../components/AudioComponent";

const Meeting = () => {
  const { user_id, username } = useUserStore();
  console.log(`User ID is : ${user_id}`);
  console.log(`Username is : ${username}`);
  return (
    <>
      <h1>Hello</h1>
      <AudioComponent />
    </>
  );
};

export default Meeting;
