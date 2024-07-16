const HOST_URL = `http://${process.env.REACT_APP_HOST_URL}`;
const AUTH_URL = `${HOST_URL}:8000/auth`;
const AUDIO_URL = `${HOST_URL}:7500`;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${AUTH_URL}/login`,
    REGISTER: `${AUTH_URL}/create_user`
  },
  AUDIO: {
    SOCKET: `${AUDIO_URL}/`
  }
  // add more services and their endpoints as needed
};