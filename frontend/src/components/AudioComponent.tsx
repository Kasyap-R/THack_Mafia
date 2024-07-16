import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import Peer, { MediaConnection } from "peerjs";
import { API_ENDPOINTS } from "../config/api";

interface AudioProps {
  userId: number;
}

const Audio = ({ userId }: AudioProps) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Initializing...");
  const peerRef = useRef<Peer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [peers, setPeers] = useState<{
    [key: string]: { call: MediaConnection; stream: MediaStream };
  }>({});

  useEffect(() => {
    setConnectionStatus("Creating peer...");
    const peer = new Peer(userId.toString(), {
      host: "localhost",
      port: 7500,
      path: "/audio",
      debug: 3, // Enable debug logging
    });

    peer.on("open", (id) => {
      console.log("My peer ID is: " + id);
      setIsConnected(true);
      setConnectionStatus("Connected to server");
    });

    peer.on("connection", (conn) => {
      console.log("New peer connection:", conn.peer);
    });

    peer.on("call", (call) => {
      console.log("Receiving call from:", call.peer);
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          streamRef.current = stream;
          call.answer(stream);
          call.on("stream", (remoteStream) => {
            console.log("Received stream from:", call.peer);
            setPeers((prevPeers) => ({
              ...prevPeers,
              [call.peer]: { call, stream: remoteStream },
            }));
          });
        })
        .catch((err) => console.error("Failed to get local stream", err));
    });

    peer.on("error", (error) => {
      console.error("PeerJS error:", error);
      setConnectionStatus(`Error: ${error.type}`);
    });

    peerRef.current = peer;

    return () => {
      peer.destroy();
    };
  }, [userId]);

  const startStreaming = () => {
    setConnectionStatus("Starting stream...");
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        streamRef.current = stream;
        setConnectionStatus("Stream started");
        // Here you would typically call other peers
        // For example: peerRef.current?.call(otherPeerId, stream);
      })
      .catch((err) => {
        console.error("Failed to get local stream", err);
        setConnectionStatus(`Stream error: ${err.message}`);
      });
  };

  const stopStreaming = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setConnectionStatus("Stream stopped");
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isMuted) {
      startStreaming();
    } else {
      stopStreaming();
    }
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
      <p>Status: {connectionStatus}</p>
      <p>Connected Peers: {Object.keys(peers).join(", ") || "None"}</p>
      {Object.entries(peers).map(([peerId, { stream }]) => (
        <audio
          key={peerId}
          autoPlay
          ref={(el) => {
            if (el) el.srcObject = stream;
          }}
        />
      ))}
    </div>
  );
};

export default Audio;
