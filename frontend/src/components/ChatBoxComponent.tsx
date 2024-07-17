import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import { Chat } from "../stores/MeetingStore";

interface ChatProps {
  chatHistory: Chat[];
}

const ChatContainer = styled.div`
  width: 500px;
  height: 800px;
  position: fixed;
  right: 20px;
  top: 90px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
  cursor: grab;
  display: flex;
  flex-direction: column;
`;

const ChatHeader = styled.div`
  background-color: #007bff;
  color: white;
  padding: 10px;
  font-weight: bold;
  text-align: center;
  cursor: move;
`;

const ChatMessageContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
`;

const ChatMessage = styled.div`
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #fff;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const ChatBoxComponent: React.FC<ChatProps> = ({ chatHistory }) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      chatContainer.style.cursor = "grabbing";
      const startX = e.clientX - chatContainer.offsetLeft;
      const startY = e.clientY - chatContainer.offsetTop;

      const handleMouseMove = (e: MouseEvent) => {
        chatContainer.style.left = `${e.clientX - startX}px`;
        chatContainer.style.top = `${e.clientY - startY}px`;
      };

      const handleMouseUp = () => {
        chatContainer.style.cursor = "grab";
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    chatContainer.addEventListener("mousedown", handleMouseDown);

    return () => {
      chatContainer.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return (
    <ChatContainer ref={chatContainerRef}>
      <ChatHeader>Chat History</ChatHeader>
      <ChatMessageContainer>
        {chatHistory.map((chat: Chat, index: number) => (
          <ChatMessage key={index}>
            <strong>{chat.user}:</strong> {chat.message}
          </ChatMessage>
        ))}
      </ChatMessageContainer>
    </ChatContainer>
  );
};

export default ChatBoxComponent;
