import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { API_ENDPOINTS } from "../config/api";
import { io, Socket } from "socket.io-client";

interface AudioProps {
  userId: number;
}

const MuteButton = styled.button<{ isMuted: boolean }>`
  background-color: ${(props) => (props.isMuted ? "red" : "white")};
  color: #08238c;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 16px;
  cursor: pointer;
  margin: 10px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease;
`;

const Icon = styled.img`
  width: 40px;
  height: 40px;
`;

const AudioComponent = ({ userId }: AudioProps) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    socketRef.current = io(API_ENDPOINTS.AUDIO.SOCKET, {
      transports: ["websocket"],
      upgrade: false,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      initializeAudioStream();
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    socketRef.current.on("audioStream", handleIncomingAudio);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMuted && mediaRecorderRef.current) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isMuted]);

  const initializeAudioStream = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        console.log("Audio stream initialized");
        streamRef.current = stream;
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.addEventListener(
          "dataavailable",
          handleDataAvailable
        );
      })
      .catch((error) => {
        console.error("Error capturing audio.", error);
      });
  };

  const handleDataAvailable = (event: BlobEvent) => {
    if (
      event.data.size > 0 &&
      socketRef.current &&
      socketRef.current.connected
    ) {
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        const base64String = fileReader.result as string;
        console.log("Sending audio data");
        socketRef.current!.emit("audioStream", base64String);
      };
      fileReader.readAsDataURL(event.data);
    }
  };

  const startRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "inactive"
    ) {
      console.log("Starting continuous recording");

      const recordAndSend = () => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "inactive"
        ) {
          mediaRecorderRef.current.start();
          setTimeout(() => {
            if (
              mediaRecorderRef.current &&
              mediaRecorderRef.current.state === "recording"
            ) {
              mediaRecorderRef.current.stop();
            }
          }, 1000);
        }
      };

      recordAndSend();
      intervalRef.current = setInterval(recordAndSend, 1000);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      console.log("Stopping recording");
      mediaRecorderRef.current.stop();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleIncomingAudio = (audioData: string) => {
    console.log("Received audio data");
    if (document.hidden) return;
    const audio = new Audio(audioData);
    audio.play().catch((error) => console.error("Error playing audio:", error));
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <MuteButton onClick={toggleMute} isMuted={isMuted}>
      <Icon
        src={
          isMuted ? "/images/microphone-slash.png" : "/images/microphone.png"
        }
        alt="Mute"
      />
    </MuteButton>
  );
};

export default AudioComponent;
