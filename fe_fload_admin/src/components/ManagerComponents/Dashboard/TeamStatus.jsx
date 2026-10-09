import { Tag } from "antd";

export default function TeamStatus({ data = [] }) {

  const renderStatus = (status) => {
    const map = {
      onduty: { text: "Đội cứu hộ", color: "blue" },
      available: { text: "Sẵn sàng", color: "green" },
      busy: { text: "Đang bận", color: "orange" },
      inactive: { text: "Ngừng hoạt động", color: "default" },
      delete: { text: "Đã xóa đội cứu hộ", color: "red" },
    };

    const key = status?.toLowerCase()?.trim();

    return map[key] || {
      text: status || "Không rõ",
      color: "default",
    };
  };

  return (
    <div
      style={{
        background: "linear-gradient(145deg, #13263c, #0d1f31)",
        padding: 16,
        borderRadius: 12,
        color: "#fff",
        boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          fontSize: 14,
          color: "#8aa0b6",
          marginBottom: 12,
        }}
      >
        Trạng thái đội
      </div>

      {data?.length === 0 && (
        <p style={{ color: "#aaa" }}>Không có dữ liệu</p>
      )}

      {data.map((t, i) => {
        const s = renderStatus(t.status);

        const count =
          t.count ?? t.total ?? t.quantity ?? 0;

        return (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              padding: "6px 10px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 8,
            }}
          >
            <Tag color={s.color} style={{ margin: 0 }}>
              {s.text}
            </Tag>

            {/* 🔥 FIX KHÔNG BỊ CHE */}
            <span
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}