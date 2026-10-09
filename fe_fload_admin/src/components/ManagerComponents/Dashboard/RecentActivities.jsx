import { Table, Tag } from "antd";

export default function RecentActivities({ data = [] }) {
  const renderStatus = (status) => {
    const map = {
      in: { text: "Nhập kho", color: "green" },
      out: { text: "Xuất kho", color: "red" },
      pending: { text: "Chờ", color: "gold" },
    };

    const key = status?.toLowerCase();

    return map[key] || {
      text: status,
      color: "default",
    };
  };

  const columns = [
    {
      title: "Hoạt động",
      dataIndex: "title",
      render: (text) => (
        <span style={{ fontWeight: 500, color: "#fff" }}>
          {text}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 150,
      render: (status) => {
        const s = renderStatus(status);
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      width: 200,
      render: (d) => (
        <span style={{ color: "#8aa0b6", fontSize: 12 }}>
          {new Date(d).toLocaleString("vi-VN")}
        </span>
      ),
    },
  ];

  return (
    <div
      style={{
        background: "linear-gradient(145deg, #13263c, #0d1f31)",
        borderRadius: 12,
        padding: 16,
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
        Hoạt động gần đây
      </div>

      <Table
        rowKey={(r) =>
          r.id || r.activityId || `${r.title || "activity"}-${r.createdAt || Date.now()}`
        }
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 5 }}
        size="small"
        rowClassName={() => "dark-row"}
        style={{
          background: "transparent",
        }}
        components={{
          table: (props) => (
            <table
              {...props}
              style={{
                background: "transparent",
              }}
            />
          ),

          header: {
            wrapper: (props) => (
              <thead
                {...props}
                style={{
                  background: "transparent",
                }}
              />
            ),
            cell: (props) => (
              <th
                {...props}
                style={{
                  background: "transparent",
                  color: "#8aa0b6",
                  borderBottom: "1px solid #22384f",
                  fontWeight: 500,
                }}
              />
            ),
          },

          body: {
            wrapper: (props) => (
              <tbody
                {...props}
                style={{
                  background: "transparent",
                }}
              />
            ),
            row: (props) => (
              <tr
                {...props}
                style={{
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#162b44";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              />
            ),
            cell: (props) => (
              <td
                {...props}
                style={{
                  background: "transparent",
                  color: "#fff",
                  borderBottom: "1px solid #1b2e44",
                }}
              />
            ),
          },
        }}
      />
    </div>
  );
}