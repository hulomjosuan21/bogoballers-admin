import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface LiveAdmin {
  league_administrator_id: string;
  league_match_id: string;
  home_team_name: string | null;
  away_team_name: string | null;
  league_administrator: string | null;
}

export const useLiveAdmins = () => {
  const [liveAdmins, setLiveAdmins] = useState<LiveAdmin[]>([]);
  const [latency, setLatency] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(`${API_BASE_URL}/live`, {
      autoConnect: false,
      transports: ["websocket"], // Optional: Forces websocket to avoid polling delays
    });

    socketRef.current = socket;
    let pingInterval: NodeJS.Timeout;

    // 2. Setup all listeners FIRST
    socket.on("connect", () => {
      console.log("Socket connected, requesting admins...");
      socket.emit("get_live_admins");

      // Clear existing interval just in case
      if (pingInterval) clearInterval(pingInterval);

      pingInterval = setInterval(() => {
        const start = Date.now();
        socket.emit("ping", { timestamp: start });
      }, 5000);
    });

    socket.on("live_admins", (admins: LiveAdmin[]) => {
      console.log("Received admins:", admins);
      setLiveAdmins(admins);
    });

    socket.on("pong", (data: { timestamp: number }) => {
      const rtt = Date.now() - data.timestamp;
      setLatency(rtt);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setLatency(null);
      clearInterval(pingInterval);
    });

    socket.connect();

    // Cleanup
    return () => {
      clearInterval(pingInterval);
      socket.disconnect();
    };
  }, []);

  return { liveAdmins, latency };
};
