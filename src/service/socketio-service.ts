import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  counter_update: (data: { count: number }) => void;
}

interface ClientToServerEvents {
  increment_counter: (data?: object) => void;
  get_counter: (data?: object) => void;
  decrement_counter: (data?: object) => void;
}

export function createSocket(): Socket<
  ServerToClientEvents,
  ClientToServerEvents
> {
  const socket = io(import.meta.env.VITE_API_BASE_URL, {
    transports: ["websocket"],
  });

  socket.on("connect", () => console.log("Connected SID:", socket.id));
  socket.on("disconnect", () => console.log("Disconnected"));

  return socket;
}
