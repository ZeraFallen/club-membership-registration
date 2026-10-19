import axios, { isAxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  console.error('VITE_API_URL is not set. Copy client/.env.example to client/.env and restart Vite.');
}

// The one shared Axios instance. Components never write the server address.
const api = axios.create({
  baseURL,
  timeout: 10000,
});

// Turns any error into a message that is safe to show to the user.
export function getErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    if (err.response) {
      const message = (err.response.data as { message?: string } | undefined)?.message;
      return message ?? `The server returned an error (status ${err.response.status}).`;
    }
    return 'Cannot reach the server. Make sure the API is running.';
  }
  return 'Something went wrong. Please try again.';
}

export default api;
