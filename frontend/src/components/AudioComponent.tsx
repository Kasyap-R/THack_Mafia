import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useUserStore } from "../stores/UserStore";

const Audio = () => {
  const [isMuted, setIsMuted] = useState(true);
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  return (
    <div
      onClick={toggleMute}
      style={{ cursor: "pointer", color: isMuted ? "red" : "green" }}
    >
      <FontAwesomeIcon
        icon={isMuted ? faMicrophoneSlash : faMicrophone}
        size="2x"
      />
    </div>
  );
};

export default Audio;
