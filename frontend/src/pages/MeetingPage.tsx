import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useUserStore } from "../stores/UserStore";
import AudioComponent from "../components/AudioComponent";
import ChatBoxComponent from "../components/ChatBoxComponent";
import { Chat, useMeetingStore } from "../stores/MeetingStore";
import { API_ENDPOINTS } from "../config/api";
import { Meeting, meetingApi } from "../services/meetingService";
import MultiScreenChartDisplay from "../components/MultiScreenChartDisplay";

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

const ContentWrapper = styled.div`
  display: flex;
  height: calc(100vh - 70px); // Adjust based on your TopBar height
`;

const Whiteboard = styled.div`
  flex-grow: 1;
  background-color: white;
  border: 1px solid white;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
`;

const ChatBoxWrapper = styled.div`
  width: 300px; // Adjust width as needed
  height: 100%;
  border-left: 1px solid #ccc;
`;

const BottomBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #82a4eb;
  padding: 15px 20px;
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
  width: 40px;
  height: 40px;
`;

const CentralizedChatInput = styled.div`
  display: flex;
  align-items: center;
  width: 50%;
  max-width: 700px;
`;

const ChatInput = styled.input`
  flex-grow: 1;
  padding: 10px;
  border-radius: 20px;
  border: 3px solid #08238c;
  font-size: 16px;
`;

const VoiceButton = styled.button<{ isListening: boolean }>`
  width: 40px;
  height: 40px;
  background-color: ${(props) => (props.isListening ? "#ff4444" : "white")};
  border: 2px solid black;
  border-radius: 50%;
  cursor: pointer;
  margin-right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const MeetingPage = () => {
  const { user } = useUserStore();
  const {
    updateScreenState,
    currentMeeting,
    setCurrentMeeting,
    chatHistory,
    updateChatHistory,
    screenState,
  } = useMeetingStore((state) => ({
    chatHistory: state.chatHistory,
    updateChatHistory: state.updateChatHistory,
    currentMeeting: state.currentMeeting,
    setCurrentMeeting: state.setCurrentMeeting,
    updateScreenState: state.updateScreenState,
    screenState: state.screenState,
  }));
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [isListening, setIsListening] = useState(false);

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

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.onresult = (e: any) => {
      const transcript = chatInput + " " + e.results[0][0].transcript;
      setChatInput(transcript);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }
    return () => recognition.abort();
  }, [isListening]);

  const connectWebSocket = (meetingId: string) => {
    const ws = new WebSocket(
      `${API_ENDPOINTS.MEETING.SOCKET}/${meetingId}/${user.name}`
    );
    ws.onopen = () => {
      console.log("WebSocket connected");
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      if (data.type === "state_update" && data.content) {
        const { screen_image, username, user_msg, llm_answer } = data.content;
        if (username && user_msg) {
          console.log(username);
          updateChatHistory({ user: username, message: user_msg });
        }
        if (llm_answer) {
          updateChatHistory({ user: "mAit", message: llm_answer });
        }
        if (screen_image) {
          updateScreenState(screen_image);
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
        <SmallLogo alt="Logo" />
        <AddButton>{/* Add button content here if needed */}</AddButton>
      </TopBar>
      <ContentWrapper>
        <Whiteboard>
          {screenState.length > 0 && (
            <MultiScreenChartDisplay screenStates={screenState as any} />
          )}
        </Whiteboard>
        <ChatBoxWrapper>
          <ChatBoxComponent chatHistory={chatHistory} />
        </ChatBoxWrapper>
      </ContentWrapper>
      <BottomBar>
        <AudioComponent userId={user.id as number} />
        <CentralizedChatInput>
          <VoiceButton
            isListening={isListening}
            onClick={() => setIsListening(!isListening)}
          >
            🎤
          </VoiceButton>
          <ChatInput
            type="text"
            placeholder="Insert Prompt..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
        </CentralizedChatInput>
        <CircularIcons>
          {currentMeeting?.participants.map((_, index) => (
            <CircularIcon key={index} />
          ))}
        </CircularIcons>
      </BottomBar>
    </MeetingContainer>
  );
};

export default MeetingPage;
