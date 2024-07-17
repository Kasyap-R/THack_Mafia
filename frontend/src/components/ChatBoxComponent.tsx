import React from "react";
import styled from "styled-components";
import { Chat } from "../stores/MeetingStore";

interface ChatProps {
  chatHistory: Chat[];
}

const ChatContainer = styled.div`
  width: 300px;
  height: calc(100vh - 180px); // Adjust as needed
  position: fixed;
  right: 20px;
  top: 90px; // Adjust based on your top bar height
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow-y: auto;
`;

const ChatMessage = styled.div`
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  margin: 10px;
  background-color: #fff;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const ChatBoxComponent: React.FC<ChatProps> = ({ chatHistory }) => {
  return (
    <ChatContainer>
      {chatHistory.map((chat: Chat, index: number) => (
        <ChatMessage key={index}>
          <strong>{chat.user}:</strong> {chat.message}
        </ChatMessage>
      ))}
    </ChatContainer>
  );
};

export default ChatBoxComponent;
