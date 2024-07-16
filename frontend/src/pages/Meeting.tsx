import React, { useEffect, useState } from "react";
import { useUserStore } from "../stores/UserStore";
import Audio from "../components/AudioComponent";

interface User {
  user_id: string;
  username: string;
}

const Meeting = () => {
  const { user_id, username } = useUserStore();
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    // Simulating joining a meeting. In a real app, you'd get this list from your backend.
    const mockParticipants = ["user1", "user2", "user3"];
    setParticipants(mockParticipants);
  }, []);

  return (
    <div>
      <h1>Meeting Room</h1>
      <p>Welcome, {username}!</p>
      <Audio userId={user_id} />
      <h2>Participants:</h2>
      <ul>
        {participants.map((participant) => (
          <li key={participant}>{participant}</li>
        ))}
      </ul>
    </div>
  );
};

export default Meeting;
