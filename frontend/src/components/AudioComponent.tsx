import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import { API_ENDPOINTS } from "../config/api";
import { io, Socket } from "socket.io-client";

interface AudioProps {
  userId: number;
}

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
    <div>
      <div
        onClick={toggleMute}
        style={{ cursor: "pointer", color: isMuted ? "red" : "green" }}
      >
        <FontAwesomeIcon
          icon={isMuted ? faMicrophoneSlash : faMicrophone}
          size="2x"
        />
      </div>
    </div>
  );
};

export default AudioComponent;
