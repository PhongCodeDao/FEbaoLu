import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

import "./RescueTrendChart.css";

export default function RescueTrendChart({ data = [] }) {

  /* ================= HELPER ================= */

  const formatDate = (date) =>
    date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit"
    });

  const formatFullDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        })
      : "";

  /* ================= STEP 1: SORT DATA ================= */

  const sortedData = (data || [])
    .filter(item => item?.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const firstDate = sortedData[0]?.date;
  const lastDate = sortedData[sortedData.length - 1]?.date;

  /* ================= STEP 2: BUILD FULL DATE RANGE ================= */

  const buildFullRange = () => {
    if (!firstDate || !lastDate) return [];

    const start = new Date(firstDate);
    const end = new Date(lastDate);

    const map = {};

    // map data từ API
    sortedData.forEach(item => {
      map[item.date] = item.taskCount;
    });

    const result = [];

    let current = new Date(start);

    while (current <= end) {
      const iso = current.toISOString().slice(0, 10);

      result.push({
        date: iso,
        taskCount: map[iso] || 0, // 🔥 fill 0 nếu thiếu
        formattedDate: formatDate(current)
      });

      current.setDate(current.getDate() + 1);
    }

    return result;
  };

  const formatData = buildFullRange();

  /* ================= DATE RANGE ================= */

  const dateRange =
    firstDate && lastDate
      ? `${formatFullDate(firstDate)} - ${formatFullDate(lastDate)}`
      : "";

  /* ================= UI ================= */

  return (
    <div className="dashboard-card">

      {/* TITLE */}
      <div className="dashboard-title">
        Thống kê cứu hộ

        {dateRange && (
          <div style={{ fontSize: 12, color: "#8aa0b6", marginTop: 4 }}>
            {dateRange}
          </div>
        )}
      </div>

      {/* CHART */}
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={formatData}>

          <CartesianGrid strokeDasharray="3 3" stroke="#2a3c52" />

          <XAxis
            dataKey="formattedDate"
            stroke="#8aa0b6"
            tick={{ fontSize: 12 }}
            interval={0} // 🔥 hiển thị tất cả ngày
          />

          <YAxis
            stroke="#8aa0b6"
            allowDecimals={false}
            tick={{ fontSize: 12 }}
            label={{
              value: "Số nhiệm vụ",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              style: { fill: "#8aa0b6", fontSize: 12 }
            }}
          />

          <Tooltip
            formatter={(value) => [`${value}`, "Nhiệm vụ"]}
            labelFormatter={(label, payload) => {
              const raw = payload?.[0]?.payload?.date;
              return raw
                ? `Ngày: ${new Date(raw).toLocaleDateString("vi-VN")}`
                : label;
            }}
          />

          <Line
            type="monotone"
            dataKey="taskCount"
            stroke="#1890ff"
            strokeWidth={3}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}