const HOST_URL = `${process.env.REACT_APP_HOST_URL}`;
const AUTH_URL = `${HOST_URL}:8000/auth`;
const AUDIO_URL = `${HOST_URL}:7500`;
const strippedHostUrl = HOST_URL.replace(/^https?:\/\//, '');
const STRIPPED_MEETING_URL = `${strippedHostUrl}:6500`;
const MEETING_URL =  `${HOST_URL}:6500/api/meeting`;

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
  // add more services and their endpoints as needed
};