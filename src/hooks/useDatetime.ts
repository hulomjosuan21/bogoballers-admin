import { useEffect, useState } from "react";

export default function useDateTime() {
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    const formatterDate = new Intl.DateTimeFormat([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formatterTime = new Intl.DateTimeFormat([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const update = () => {
      const now = new Date();
      setDateTime(
        `${formatterDate.format(now)} • ${formatterTime.format(now)}`
      );
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, []);

  return dateTime;
}
