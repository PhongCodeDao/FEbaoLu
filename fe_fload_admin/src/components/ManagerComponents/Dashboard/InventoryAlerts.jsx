import { Progress } from "antd";

export default function InventoryAlerts({ data = [] }) {
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
      {/* TITLE */}
      <div
        style={{
          fontSize: 14,
          color: "#8aa0b6",
          marginBottom: 12,
        }}
      >
        Cảnh báo kho
      </div>

      {/* SCROLL BOX */}
      <div
        style={{
          maxHeight: 300,
          overflowY: "auto",
          paddingRight: 6,
        }}
      >
        {/* EMPTY */}
        {data.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#8aa0b6",
              padding: "40px 0",
            }}
          >
            Không có dữ liệu
          </div>
        ) : (
          data.map((i, idx) => {
            // 🔥 tránh lỗi chia 0
            const percent =
              i.threshold > 0
                ? Math.min((i.quantity / i.threshold) * 100, 100)
                : 0;

            return (
              <div
                key={idx}
                style={{
                  marginBottom: 14,
                  padding: 10,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 8,
                }}
              >
                {/* NAME + WAREHOUSE */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>
                    {i.reliefItemName}
                  </span>

                  <span
                    style={{
                      color: "#8aa0b6",
                      fontSize: 12,
                    }}
                  >
                    {i.warehouseName}
                  </span>
                </div>

                {/* QUANTITY */}
                <div
                  style={{
                    fontSize: 12,
                    marginBottom: 6,
                    color: "#aaa",
                  }}
                >
                  {i.quantity} / {i.threshold}
                </div>

                {/* PROGRESS */}
                <Progress
                  percent={percent}
                  showInfo={false}
                  strokeColor={
                    percent >= 100 ? "#ff4d4f" : "#1890ff"
                  }
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}