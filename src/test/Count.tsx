import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { createSocket } from "@/service/socketio-service";
import { toast } from "sonner";
export default function Count() {
  const [count, setCount] = useState(0);
  const socket = useMemo(() => createSocket(), []);

  useEffect(() => {
    socket.on("counter_update", (data) => setCount(data.count));

    socket.emit("get_counter", {});

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const increment = () => {
    socket.emit("increment_counter", {});
  };

  const decrement = () => {
    if (count <= 0) {
      toast.error("Counter cannot go below 0");
      return;
    }
    socket.emit("decrement_counter", {});
  };

  return (
    <div className="h-screen grid place-content-center space-y-4">
      <h2 className="text-xl font-bold">Counter: {count}</h2>
      <div className="flex items-center gap-2">
        <Button onClick={increment} size="sm">
          Increment
        </Button>
        <Button onClick={decrement} variant="secondary" size="sm">
          Decrement
        </Button>
      </div>
    </div>
  );
}
