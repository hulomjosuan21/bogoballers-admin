import { io, Socket } from "socket.io-client";

const SERVER_URL: string =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
export const socket: Socket = io(SERVER_URL, {
  autoConnect: false,
});
