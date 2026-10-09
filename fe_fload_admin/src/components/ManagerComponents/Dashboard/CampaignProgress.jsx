import { Tag, Progress } from "antd";

export default function CampaignProgress({ data = [] }) {

  const renderStatus = (status) => {
    const map = {
      pending: { text: "Đang chờ", color: "gold" },
      ready: { text: "Sẵn sàng", color: "green" },
      active: { text: "Đang thực hiện", color: "blue" },
      completed: { text: "Hoàn thành", color: "green" },

      // 🔥 fix backend lỗi
      "sắn sàng": { text: "Sẵn sàng", color: "green" },
    };

    const key = status?.toLowerCase()?.trim();

    return map[key] || {
      text: status,
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
        Tiến độ chiến dịch
      </div>

      {data.length === 0 && (
        <p style={{ color: "#aaa" }}>Không có dữ liệu</p>
      )}

      {data.map((item) => {
        const s = renderStatus(item.status);

        const percent =
          item.totalBeneficiaries > 0
            ? Math.round(
                (item.distributedBeneficiaries /
                  item.totalBeneficiaries) *
                  100
              )
            : 0;

        return (
          <div
            key={item.campaignId}
            style={{
              marginBottom: 14,
              padding: 10,
              background: "rgba(255,255,255,0.03)",
              borderRadius: 8,
            }}
          >
            {/* 🔥 HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span style={{ fontWeight: 600 }}>
                {item.campaignName}
              </span>

              <Tag color={s.color} style={{ margin: 0 }}>
                {s.text}
              </Tag>
            </div>

            {/* 🔥 SỐ NGƯỜI */}
            <div
              style={{
                fontSize: 12,
                marginBottom: 6,
                color: "#aaa",
              }}
            >
              {item.distributedBeneficiaries} / {item.totalBeneficiaries} người
            </div>

            {/* 🔥 PROGRESS */}
            <Progress
              percent={percent}
              showInfo={false}
              strokeColor={
                percent === 100
                  ? "#52c41a"
                  : percent > 0
                  ? "#1890ff"
                  : "#555"
              }
            />
          </div>
        );
      })}
    </div>
  );
}