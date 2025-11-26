import React, { useMemo } from "react";

interface ScheduleData {
  date: string;
  count: number;
}

interface ScheduleGraphProps {
  data: ScheduleData[];
  endDate?: Date;
  days?: number;
  title?: string;
}

interface DayData {
  date: string;
  count: number;
  level: number;
  obj: Date;
}

interface MonthLabel {
  index: number;
  label: string;
}

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const shiftDate = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

const getSunday = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day;
  return new Date(date.setDate(diff));
};

const getScheduleColor = (level: number): string => {
  switch (level) {
    case 0:
      return "bg-gray-100 dark:bg-gray-800";
    case 1:
      return "bg-orange-200 dark:bg-blue-900";
    case 2:
      return "bg-orange-400 dark:bg-blue-700";
    case 3:
      return "bg-orange-600 dark:bg-blue-500";
    case 4:
      return "bg-orange-800 dark:bg-blue-400";
    default:
      return "bg-gray-100 dark:bg-gray-800";
  }
};

const ScheduleGraph: React.FC<ScheduleGraphProps> = ({
  data = [],
  endDate = new Date(),
  days = 365,
  title = "Match Schedules",
}) => {
  const eventsMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((item) => {
      if (item.date) {
        const dateKey = item.date.split("T")[0];
        map.set(dateKey, item.count);
      }
    });
    return map;
  }, [data]);

  const gridData = useMemo(() => {
    const weeks: DayData[][] = [];
    const targetStartDate = shiftDate(endDate, -days);
    let currentDay = getSunday(new Date(targetStartDate));

    const totalWeeks = Math.ceil(days / 7) + 1;

    for (let w = 0; w < totalWeeks; w++) {
      const week: DayData[] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = formatDate(currentDay);
        const count = eventsMap.get(dateStr) || 0;

        let level = 0;
        if (count >= 1) level = 1;
        if (count >= 3) level = 2;
        if (count >= 6) level = 3;
        if (count >= 10) level = 4;

        week.push({
          date: dateStr,
          count: count,
          level: level,
          obj: new Date(currentDay),
        });

        currentDay = shiftDate(currentDay, 1);
      }
      weeks.push(week);
    }
    return weeks;
  }, [endDate, days, eventsMap]);

  const monthLabels = useMemo(() => {
    const labels: MonthLabel[] = [];
    let lastMonth = -1;

    gridData.forEach((week, index) => {
      const firstDayOfWeek = week[0].obj;
      const month = firstDayOfWeek.getMonth();

      if (month !== lastMonth) {
        labels.push({
          index,
          label: firstDayOfWeek.toLocaleString("default", { month: "short" }),
        });
        lastMonth = month;
      }
    });
    return labels;
  }, [gridData]);

  return (
    <div className="p-4 bg-card rounded-xl border shadow-sm w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-sm text-secondary-foreground">
          Last {days} days
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex flex-col gap-1 min-w-max">
          <div className="flex text-xs mb-1 h-4 relative">
            {monthLabels.map((m, i) => (
              <div
                key={i}
                className="absolute"
                style={{ left: `${m.index * 14}px` }}
              >
                {m.label}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            <div className="flex flex-col gap-1 mr-2 text-xs leading-[10px] pt-[14px]">
              <span className="h-[10px]">Mon</span>
              <span className="h-[10px]"></span>
              <span className="h-[10px]">Wed</span>
              <span className="h-[10px]"></span>
              <span className="h-[10px]">Fri</span>
              <span className="h-[10px]"></span>
            </div>

            <div className="flex gap-[3px]">
              {gridData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {week.map((day) => (
                    <div key={day.date} className="group relative">
                      <div
                        className={`w-[10px] h-[10px] rounded-[2px] transition-colors duration-200 ${getScheduleColor(
                          day.level
                        )}`}
                      ></div>

                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                        <div className="bg-gray-900 text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                          <span className="font-semibold">
                            {day.count} {day.count > 1 ? "Matches" : "Match"}
                          </span>
                          <div className="text-gray-400 text-[10px]">
                            {new Date(day.date).toLocaleDateString(undefined, {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end mt-4 gap-2 text-xs">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-[10px] h-[10px] rounded-[2px] ${getScheduleColor(
                level
              )}`}
            ></div>
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ScheduleGraph;
