const HOST_URL = `${process.env.REACT_APP_HOST_URL}`;
const AUTH_URL = `${HOST_URL}:8000/auth`;
const AUDIO_URL = `${HOST_URL}:7500`;
const MEETING_URL = `${HOST_URL}:6500/api/meeting`;
const AI_URL = `${HOST_URL}:5500/ai`
const strippedHostUrl = HOST_URL.replace(/^http?:\/\//, '');
const STRIPPED_MEETING_URL = `${strippedHostUrl}:5500`;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${AUTH_URL}/login`,
    REGISTER: `${AUTH_URL}/create_user`
  },
  AUDIO: {
    SOCKET: `${AUDIO_URL}/`
  },
  MEETING: {
    SOCKET: `ws://${STRIPPED_MEETING_URL}/ws`,
    CREATE: `${MEETING_URL}/create`,
    JOIN: `${MEETING_URL}/join`,
    MEETING_LIST:`${MEETING_URL}/`,
  },
  AI: {
    UPLOAD: `${AI_URL}/upload`
  }
  // add more services and their endpoints as needed
};