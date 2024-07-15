const HOST_URL = process.env.REACT_APP_HOST_URL;
const AUTH_URL = `${HOST_URL}:8000/auth`;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${AUTH_URL}/login`,
    REGISTER: `${AUTH_URL}/create_user`
  },
  // add more services and their endpoints as needed
};