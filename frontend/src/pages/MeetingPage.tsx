import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useUserStore } from "../stores/UserStore";
import AudioComponent from "../components/AudioComponent";
import ChatBoxComponent from "../components/ChatBoxComponent";
import { Chat, useMeetingStore } from "../stores/MeetingStore";
import { API_ENDPOINTS } from "../config/api";
import { Meeting, meetingApi } from "../services/meetingService";

// Import your images here
import logo from "../images/mAItLogo.png";
import settings from "../images/settings.png";
import upload from "../images/upload.png";
import send from "../images/send.png";
import voice from "../images/voice.png";
import mAItIconWhite from "../images/mAItIconWhite.png";

const MeetingContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #dce2ee;
  font-family: "RingsideNarrow", sans-serif;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: white;
  border-bottom: 1px solid white;
`;

const SmallLogo = styled.img`
  width: 0px;
  margin-left: 80px;
`;

const AddButton = styled.button`
  background-color: transparent;
  color: #dce2ee;
  border: none;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  font-size: 75px;
  cursor: pointer;
  margin-right: 10px;
`;

const LeftBar = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #08238c;
  width: 90px;
  padding: 10px 0;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
`;

const MenuButton = styled.button`
  background-color: #08238c;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 10px;
`;

const BottomButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SettingsButton = styled.button`
  background-color: white;
  color: #08238c;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 16px;
  cursor: pointer;
  margin: 10px 0;
`;

const Icon = styled.img`
  width: 40px;
  height: 40px;
`;

const MAItWhiteButton = styled.button`
  background-color: transparent;
  border-color: transparent;
`;

const Whiteboard = styled.div`
  flex-grow: 1;
  margin-left: 90px;
  background-color: white;
  border: 1px solid white;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const MeetingInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const MeetingTitle = styled.h2`
  font-size: 24px;
  margin: 0;
  margin-right: 20px;
`;

const ParticipantCount = styled.span`
  font-size: 18px;
  color: #666;
`;

const BottomBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #82a4eb;
  padding: 30px 0;
  position: fixed;
  bottom: 0;
  width: 100%;
`;

const CircularIcons = styled.div`
  display: flex;
  gap: 30px;
`;

const CircularIcon = styled.div`
  background-color: white;
  border: 5px solid #08238c;
  border-radius: 50%;
  width: 80px;
  height: 80px;
`;

const StyledChatBox = styled.div`
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  width: 700px;
  margin-bottom: 100px;
`;

const ChatInput = styled.input`
  flex-grow: 1;
  width: 100%;
  padding: 10px;
  border-radius: 20px;
  border: 5px solid #08238c;
  font-size: 16px;
`;

const VoiceButton = styled.button`
  width: 55px;
  height: 55px;
  background-color: white;
  border: 4px solid black;
  border-radius: 50%;
  cursor: pointer;
  margin-right: 25px;
`;

const SendButton = styled.button`
  width: 70px;
  height: 70px;
  background-color: white;
  border: 4px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  margin-left: 20px;
`;

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
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        if (!currentMeeting) {
          const meeting = await meetingApi.createMeeting({
            meeting_name: "test",
            creator_id: user.name,
          });
          setCurrentMeeting(meeting);
          connectWebSocket(meeting.id);
        } else {
          connectWebSocket(currentMeeting.id);
        }
      } catch (error) {
        console.error("Error initializing meeting:", error);
      }
    };
    initializeMeeting();
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

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

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      handleNewUserChat({ user: user.name, message: chatInput });
      setChatInput("");
    }
  };

  return (
    <MeetingContainer>
      <TopBar>
        <SmallLogo src={logo} alt="Logo" />
        <AddButton>
          <img
            src={upload}
            alt="+"
            style={{ width: "100px", height: "100px" }}
          />
        </AddButton>
      </TopBar>
      <LeftBar>
        <MAItWhiteButton>
          <img
            src={mAItIconWhite}
            alt="mAIt"
            style={{ width: "60px", height: "60px" }}
          />
        </MAItWhiteButton>
        <MenuButton>&#9776;</MenuButton>
        <BottomButtons>
          <AudioComponent userId={user.id as number} />
          <SettingsButton>
            <Icon src={settings} alt="Settings" />
          </SettingsButton>
        </BottomButtons>
      </LeftBar>
      <Whiteboard>
        {currentMeeting ? (
          <>
            <MeetingInfo>
              <MeetingTitle>Meeting Name: {currentMeeting.name}</MeetingTitle>
              <ParticipantCount>
                Participants: {currentMeeting.participants.length}
              </ParticipantCount>
            </MeetingInfo>
            <ChatBoxComponent
              chatHistory={chatHistory}
              onNewChat={handleNewUserChat}
            />
          </>
        ) : (
          <p>Loading meeting...</p>
        )}
      </Whiteboard>
      <BottomBar>
        <CircularIcons>
          {currentMeeting?.participants.map((_, index) => (
            <CircularIcon key={index} />
          ))}
        </CircularIcons>
      </BottomBar>
      <StyledChatBox>
        <VoiceButton>
          <Icon src={voice} alt="Voice" />
        </VoiceButton>
        <ChatInput
          type="text"
          placeholder="Insert Prompt..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <SendButton onClick={handleSendMessage}>
          <Icon src={send} alt="Send" />
        </SendButton>
      </StyledChatBox>
    </MeetingContainer>
  );
};

export default MeetingPage;
