import React, { useState, useEffect } from "react";
import { Chat, useMeetingStore } from "../stores/MeetingStore";

const ChatBoxComponent: React.FC = () => {
  const chatHistory = useMeetingStore((state) => state.chatHistory);
  const updateChatHistory = useMeetingStore((state) => state.updateChatHistory);
  const [inputText, setInputText] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);

  useEffect(() => {
    // Add initial chat messages if chatHistory is empty
    if (chatHistory.length === 0) {
      const initialChats: Chat[] = [
        { user: "Alice", message: "Hello everyone!" },
        { user: "Bob", message: "Hi Alice!" },
        { user: "Alice", message: "How are you, Bob?" },
        { user: "Bob", message: "I am good, thanks!" },
      ];
      initialChats.forEach((chat) => updateChatHistory(chat));
    }
  }, [chatHistory.length, updateChatHistory]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onresult = (e: any) => {
      const transcript = inputText + " " + e.results[0][0].transcript;
      setInputText(transcript);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      updateChatHistory({ user: "User", message: inputText.trim() });
      setInputText("");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        {chatHistory.map((chat: Chat, index: number) => (
          <div key={index} style={styles.chatMessage}>
            <strong>{chat.user}:</strong> {chat.message}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={styles.inputContainer}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={styles.input}
          placeholder="Type or speak your message..."
        />
        <button
          type="button"
          onClick={() => setIsListening(!isListening)}
          style={{
            ...styles.micButton,
            backgroundColor: isListening ? "#ff4444" : "transparent",
          }}
        >
          🎤
        </button>
        <button type="submit" style={styles.sendButton}>
          Send
        </button>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "300px",
    margin: "0 auto",
  },
  chatBox: {
    border: "1px solid #ccc",
    padding: "10px",
    height: "400px",
    overflowY: "scroll",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f9f9f9",
  },
  chatMessage: {
    border: "1px solid #ddd",
    borderRadius: "5px",
    padding: "5px",
    margin: "5px 0",
    backgroundColor: "#fff",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
  },
  inputContainer: {
    display: "flex",
    marginTop: "10px",
  },
  input: {
    flex: 1,
    padding: "5px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "3px",
  },
  micButton: {
    padding: "5px 10px",
    marginLeft: "5px",
    backgroundColor: "transparent",
    border: "1px solid #ccc",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "16px",
  },
  sendButton: {
    padding: "5px 10px",
    marginLeft: "5px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default ChatBoxComponent;
