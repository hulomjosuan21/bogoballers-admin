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
    const socket = io(`${API_BASE_URL}/live`);
    socketRef.current = socket;

    let pingInterval: NodeJS.Timeout;

    socket.on("connect", () => {
      socket.emit("get_live_admins");
      pingInterval = setInterval(() => {
        const start = Date.now();
        socket.emit("ping", { timestamp: start });
      }, 5000);
    });

    socket.on("live_admins", (admins: LiveAdmin[]) => {
      setLiveAdmins(admins);
    });

    socket.on("pong", (data: { timestamp: number }) => {
      const rtt = Date.now() - data.timestamp;
      setLatency(rtt);
    });

    socket.on("disconnect", () => {
      setLatency(null);
      clearInterval(pingInterval);
    });

    return () => {
      socket.disconnect();
      clearInterval(pingInterval);
    };
  }, []);

  return { liveAdmins, latency };
};
