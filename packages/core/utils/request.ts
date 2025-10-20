// packages/core/utils/request.ts
import axios from 'axios';

const request = axios.create({
  // baseURL: import.meta.env.VITE_API_URL,
  baseURL: import.meta.env.VITE_GLOB_API_URL_PREFIX,
  timeout: 5000,
});

export default request;