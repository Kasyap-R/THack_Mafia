import React, { useEffect, useState } from "react";
import { useUserStore } from "../stores/UserStore";
import AudioComponent from "../components/AudioComponent";
import ChatBoxComponent from "../components/ChatBoxComponent";
import { Chat, useMeetingStore } from "../stores/MeetingStore";
import { API_ENDPOINTS } from "../config/api";
import { Meeting, meetingApi } from "../services/meetingService";
import CreateMeetingButton from "../components/CreateMeetingButton";

const MeetingPage = () => {
  const { user } = useUserStore();
  const { currentMeeting, setCurrentMeeting, chatHistory, updateChatHistory } =
    useMeetingStore((state) => ({
      chatHistory: state.chatHistory,
      updateChatHistory: state.updateChatHistory,
      currentMeeting: state.currentMeeting,
      setCurrentMeeting: state.setCurrentMeeting,
    }));
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        // If there's no current meeting, create a new one
        if (!currentMeeting) {
          const meeting = await meetingApi.createMeeting({
            meeting_name: "test",
            creator_id: user.name,
          });
          setCurrentMeeting(meeting);
          connectWebSocket(meeting.id);
        } else {
          // If there's already a current meeting, just connect to its WebSocket
          connectWebSocket(currentMeeting.id);
        }
      } catch (error) {
        console.error("Error initializing meeting:", error);
      }
    };

    initializeMeeting();

    // Cleanup function to close WebSocket when component unmounts
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const handleMeetingCreated = (meeting: Meeting) => {
    setCurrentMeeting(meeting);
    connectWebSocket(meeting.id);
  };

  const connectWebSocket = (meetingId: string) => {
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
          console.log(username);
          updateChatHistory({ user: username, message: user_msg });
        }
      }
    };
    setSocket(ws);
  };

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
      {currentMeeting ? (
        <>
          <h2>Meeting: {currentMeeting.name}</h2>
          <h3>Participants:</h3>
          <ul>
            {currentMeeting.participants.map((participant) => (
              <li key={participant}>{participant}</li>
            ))}
          </ul>
          <AudioComponent userId={user.id} />
          <ChatBoxComponent
            chatHistory={chatHistory}
            onNewChat={handleNewUserChat}
          />
        </>
      ) : (
        <p>Loading meeting...</p>
      )}
    </div>
  );
};

export default MeetingPage;
