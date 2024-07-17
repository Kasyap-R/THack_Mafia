import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useUserStore } from "../stores/UserStore";
import AudioComponent from "../components/AudioComponent";
import ChatBoxComponent from "../components/ChatBoxComponent";
import { Chat, useMeetingStore } from "../stores/MeetingStore";
import { API_ENDPOINTS } from "../config/api";
import { Meeting, meetingApi } from "../services/meetingService";
import MultiScreenChartDisplay from "../components/MultiScreenChartDisplay";
import ExportButtonComponent from "../components/ExportButtonComponent";
import "./MeetingPage.css";
import logo from "../images/mAItLogo.png";
import settings from "../images/settings.png";
import upload from "../images/upload.png";
import microphone from "../images/microphone.png";
import send from "../images/send.png";
import voice from "../images/voice.png";
import mAItIconWhite from "../images/mAItIconWhite.png";

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
  const [numPeople, setNumPeople] = useState(4);
  const fakeParticipants = ["John", "Neli", "Scott"];
  const badCode = "XYZ";

  return (
    <div className="meeting-container">
      <div className="top-bar">
        <img src={logo} alt="Logo" className="small-logo" />
      </div>
      <div className="left-bar">
        <button className="mAIt-white-button">
          <img src={mAItIconWhite} alt="mAIt" className="mAIt-icon" />
        </button>
        <button className="menu-button">&#9776;</button>
        <div className="bottom-buttons">
          <button className="settings-button">
            <img src={settings} alt="Settings" className="settings-icon" />
          </button>
        </div>
      </div>
      <div className="content-wrapper">
        <div className="whiteboard">
          {screenState.length > 0 && (
            <MultiScreenChartDisplay screenStates={screenState as any} />
          )}
        </div>
        <div className="chat-box-wrapper">
          <ChatBoxComponent chatHistory={chatHistory} />
        </div>
      </div>
      <div className="bottom-bar">
        <div className="circular-icons">
          {fakeParticipants.map((x, index) => (
            <div key={index} className="icon">
              {x}
            </div>
          ))}
        </div>
      </div>
      <div className="chat-box">
        <AudioComponent userId={user.id as number} />
        <button
          className="voice-button"
          onClick={() => setIsListening(!isListening)}
        >
          <img src={voice} alt="Voice" className="voice-icon" />
        </button>
        <input
          type="text"
          placeholder="Insert Prompt..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button className="send-button" onClick={handleSendMessage}>
          <img src={send} alt="Send" className="send-icon" />
        </button>
      </div>
      <button className="add-button">
        <ExportButtonComponent />
      </button>
    </div>
  );
};

export default MeetingPage;
