import { createSocket } from "@/service/socketio-service";
import { useEffect, useMemo, useState } from "react";

export default function State() {
  const [count, setCount] = useState(0);
  const socket = useMemo(() => createSocket(), []);

  useEffect(() => {
    socket.on("counter_update", (data) => setCount(data.count));

    socket.emit("get_counter", {});

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <div className="h-screen grid place-content-center">
      <h2 className="text-sm">
        Live Counter: <strong className="text-primary text-2xl">{count}</strong>
      </h2>
    </div>
  );
}
