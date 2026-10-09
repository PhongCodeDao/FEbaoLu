import React, { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";

export default function ClockWidget() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const daysOfWeek = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];

  const dayName = daysOfWeek[now.getDay()];
  const dateFormatted = `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${now.getFullYear()}`;

  const timeFormatted = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

  return (
    <div className="clock-widget" title={`${dayName}, ${dateFormatted}`}>
      <div className="clock-widget__icon-box">
        <Clock size={16} className="clock-icon-anim" />
      </div>

      <div className="clock-widget__content">
        <div className="clock-widget__time-row">
          <span className="clock-widget__time">{timeFormatted}</span>
          <span className="clock-widget__live-pill">
            <span className="clock-widget__live-dot" />
            LIVE
          </span>
        </div>

        <div className="clock-widget__date-row">
          <Calendar size={10} className="clock-widget__cal-icon" />
          <span>{dayName}, {dateFormatted}</span>
        </div>
      </div>
    </div>
  );
}
