const HOST_URL = process.env.REACT_APP_HOST_URL;
const AUTH_URL = `http://${HOST_URL}:8000/auth`;
const AUDIO_URL = `${HOST_URL}:7500/audio`;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${AUTH_URL}/login`,
    REGISTER: `${AUTH_URL}/create_user`
  },
  AUDIO: {
    WEBSOCKET: `ws://${AUDIO_URL}/ws`
  }
  // add more services and their endpoints as needed
};