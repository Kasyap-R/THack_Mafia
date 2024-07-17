import React, { useEffect, useState, useCallback } from "react";
import { useUserStore } from "../stores/UserStore";
import AudioComponent from "../components/AudioComponent";
import ChatBoxComponent from "../components/ChatBoxComponent";
import { Chat, useMeetingStore } from "../stores/MeetingStore";
import { API_ENDPOINTS } from "../config/api";

const Meeting = () => {
  const { user } = useUserStore();
  const [participants, setParticipants] = useState<string[]>([]);
  const { chatHistory, updateChatHistory } = useMeetingStore((state) => ({
    chatHistory: state.chatHistory,
    updateChatHistory: state.updateChatHistory,
  }));
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const createMeeting = useCallback(async () => {
    const response = await fetch("http://localhost:6500/api/meeting/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meeting_name: "Test Meeting",
        creator_id: "hh",
      }),
    });
    const data = await response.json();
    console.log("Connected to Meeting");
    return data.id;
  }, [user.id]);

  const connectWebSocket = useCallback(
    (meetingId: string) => {
      const ws = new WebSocket(
        `${API_ENDPOINTS.MEETING.SOCKET}/${meetingId}/${user.name}`
      );

      ws.onopen = () => {
        console.log("WebSocket connected");
        ws.send(
          JSON.stringify({
            type: "text_query",
            query: "Hello everyone!",
          })
        );
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "state_update" && data.content) {
          const { username, user_msg } = data.content;
          if (username && user_msg) {
            updateChatHistory({ user: username, message: user_msg });
          }
        }
      };

      setSocket(ws);
    },
    [user.name, updateChatHistory]
  );

  useEffect(() => {
    createMeeting().then((meetingId) => {
      if (meetingId) connectWebSocket(meetingId);
    });
  }, [createMeeting, connectWebSocket]);

  const handleNewUserChat = (chat: Chat) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "text_query",
          query: chat.message,
        })
      );
    }
  };

  return (
    <div>
      <h1>Meeting Room</h1>
      <p>Welcome, {user.name}!</p>
      <AudioComponent userId={user.id} />
      <h2>Participants:</h2>
      <ul>
        {participants.map((participant) => (
          <li key={participant}>{participant}</li>
        ))}
      </ul>
      <ChatBoxComponent
        chatHistory={chatHistory}
        onNewChat={handleNewUserChat}
      />
    </div>
  );
};

export default Meeting;
