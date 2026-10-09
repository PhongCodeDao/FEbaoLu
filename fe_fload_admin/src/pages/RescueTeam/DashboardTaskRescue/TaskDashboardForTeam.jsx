import { useEffect, useState,  } from "react";
import {
  Card,
  Row,
  Col,
  Progress,
  Spin,
  Tabs,
  Pagination,
} from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { useNavigate } from "react-router-dom";
import "./TaskDashboardForTeam.css";

import {
  getAllAssignments,
  getAllRescueTeams,
  getRescueTeamMembers,
  getAllDistributions,
  getAllAidCampaigns,
} from "../../../../api/axios/RescueApi/RescueTask";

/* ================= STATUS ================= */
const mapStatusVN = (status) => {
  const map = {
    accepted: "Đã nhận",
    completed: "Hoàn thành",
    rejected: "Từ chối",
    pending: "Đang chờ",
    "in progress": "Đang phát", // ✅ thêm
  };
  return map[status] || status;
};

export default function TaskDashboardForTeam() {
  const [tab, setTab] = useState("assignment");
  const [loading, setLoading] = useState(false);

  const [assignmentData, setAssignmentData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);

  const [assignmentPage, setAssignmentPage] = useState(1);
  const [distributionPage, setDistributionPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [campaignMap, setCampaignMap] = useState({});
  const [distributionFilter, setDistributionFilter] = useState("all");
  const pageSize = 5;
  const navigate = useNavigate();
  const user =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user")) ||
    {};

  /* ================= FIND TEAM ================= */
  const findMyTeamId = async (teams, userId) => {
    for (const team of teams) {
      try {
        const res = await getRescueTeamMembers(team.rcid);
        const members = res?.data?.items || [];

        if (members.some((m) => m.userId === userId)) {
          return team.rcid;
        }
      } catch {}
    }
    return null;
  };

  /* ================= GET REQUEST ================= */
  const getRequestById = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/RescueRequests/${id}`
      );
      return await res.json();
    } catch {
      return null;
    }
  };

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    try {
      setLoading(true);

      // TEAM
      const teamRes = await getAllRescueTeams();
      const teams = teamRes?.data?.items || [];

      const myTeamId = await findMyTeamId(teams, user.userId);
      if (!myTeamId) return;

      // CAMPAIGN
      const campaigns = await getAllAidCampaigns();
      const cmap = {};
      campaigns.forEach((c) => (cmap[c.campaignID] = c));
      setCampaignMap(cmap);

      // ===== ASSIGNMENT =====
      const aRes = await getAllAssignments();
      const assignments = aRes?.data?.items || aRes || [];

      const myAssignments = assignments.filter(
        (a) => a.rescueTeamId === myTeamId
      );

      const aData = await Promise.all(
        myAssignments.map(async (a) => {
          const req = await getRequestById(a.rescueRequestId);

          let status = a.assignmentStatus?.toLowerCase();
          if (status === "assigned") status = "pending";

          return {
            id: a.assignmentId,
            name: req?.fullName || "Không rõ",
            phone: req?.contactPhone || "Không có",
            address: req?.address || "Chưa có",
            status,
            time: new Date(a.assignedAt).toLocaleString("vi-VN"),
          };
        })
      );

      setAssignmentData(aData);

      // ===== DISTRIBUTION =====
      const dRes = await getAllDistributions();

      const dData = dRes
      .filter((d) => d.rescueTeamId === myTeamId)
      .map((d) => ({
        distributionId: d.distributionId, // ✅ THÊM DÒNG NÀY
        campaignId: d.campaignId,
        campaignName:
          cmap[d.campaignId]?.campaignName ||
          "Không rõ chiến dịch",
        status: d.status?.toLowerCase(),
        time: new Date(d.distributedAt).toLocaleString("vi-VN"),
      }));

      setDistributionData(dData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= PAGINATION ================= */
  const paginate = (data, page) =>
    data.slice((page - 1) * pageSize, page * pageSize);

  /* ================= STATS ================= */
  const getStats = (data) => ({
    total: data.length,
    pending: data.filter((x) => x.status === "pending").length,
    in_progress: data.filter((x) => x.status === "in progress").length,
    accepted: data.filter((x) => x.status === "accepted").length,
    completed: data.filter((x) => x.status === "completed").length,
    rejected: data.filter((x) => x.status === "rejected").length,
  });

  /* ================= PIE ================= */
  const renderPie = (stats) => {
    const pieData = [
      { name: "Đang chờ", value: stats.pending },
      { name: "Đã nhận", value: stats.accepted },
      { name: "Hoàn thành", value: stats.completed },
      { name: "Từ chối", value: stats.rejected },
      { name: "Đang phát", value: stats.in_progress },
    ];
    const COLOR_MAP = {
      "Đang chờ": "#faad14",
      "Đang phát": "#722ed1",
      "Đã nhận": "#1890ff",
      "Hoàn thành": "#52c41a",
      "Từ chối": "#ff4d4f",
    };
    

    return (
      <Card title="Biểu đồ nhiệm vụ" style={{ marginTop: 16 }}>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={
                pieData.some(item => item.name === "Đang phát" && item.value > 0)
                  ? pieData
                  : pieData.filter(item => item.name !== "Đang phát")
              }
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              label={({ percent }) =>
                percent > 0 ? `${(percent * 100).toFixed(0)}%` : ""
              }
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLOR_MAP[entry.name]}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </Pie>
    
            <Tooltip
              formatter={(value, name) => [`${value} nhiệm vụ`, name]}
            />
    
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
    );
  };

  /* ================= UI ASSIGNMENT ================= */
  const renderAssignment = () => {
    const stats = getStats(assignmentData);
    const filteredData =
    statusFilter === "all"
      ? assignmentData
      : assignmentData.filter((x) => x.status === statusFilter);
  
  const data = paginate(filteredData, assignmentPage);

    return (
      <>
<Row gutter={12}>
  <Col flex={1}>
    <Card onClick={() => {
      setStatusFilter("all");
      setAssignmentPage(1);
    }}>
      Tổng: {stats.total}
    </Card>
  </Col>

  <Col flex={1}>
    <Card onClick={() => {
      setStatusFilter("pending");
      setAssignmentPage(1);
    }}>
      Đang chờ: {stats.pending}
    </Card>
  </Col>

  <Col flex={1}>
    <Card onClick={() => {
      setStatusFilter("accepted");
      setAssignmentPage(1);
    }}>
      Đã nhận: {stats.accepted}
    </Card>
  </Col>

  <Col flex={1}>
    <Card onClick={() => {
      setStatusFilter("completed");
      setAssignmentPage(1);
    }}>
      Hoàn thành: {stats.completed}
    </Card>
  </Col>

  <Col flex={1}>
    <Card onClick={() => {
      setStatusFilter("rejected");
      setAssignmentPage(1);
    }}>
      Từ chối: {stats.rejected}
    </Card>
  </Col>
</Row>

        {renderPie(stats)}

        <Card title=" Danh sách nhiệm vụ cứu hộ" style={{ marginTop: 16 }}>
        {data.length === 0 ? (
  <div style={{ textAlign: "center", padding: 20 }}>
    Không có dữ liệu
  </div>
) : (
  data.map((item, i) => (
<div
  key={i}
  className="task-dashboard__item"
  onClick={() => navigate(`/rescueTeam/history/${item.id}`)}
>
  <div>
    <b>Họ tên: {item.name}</b>
    <div>SĐT: {item.phone}</div>
    <div>Địa chỉ: {item.address}</div>
    <div>⏱ Phân công lúc: {item.time}</div>
  </div>

  <div
    className={`task-dashboard__status task-dashboard__status--${item.status}`}
  >
    {mapStatusVN(item.status)}
  </div>
</div>
  ))
)}

<Pagination
  current={assignmentPage}
  pageSize={pageSize}
  total={filteredData.length}   
  onChange={setAssignmentPage}
/>
        </Card>
      </>
    );
  };

  /* ================= UI DISTRIBUTION ================= */
  const renderDistribution = () => {
    const stats = getStats(distributionData);
    const filteredData =
    distributionFilter === "all"
      ? distributionData
      : distributionData.filter((x) => x.status === distributionFilter);
  
  const data = paginate(filteredData, distributionPage);

    return (
      <>
<Row gutter={12}>
  <Col span={4}>
    <Card onClick={() => {
      setDistributionFilter("all");
      setDistributionPage(1);
    }} style={{ cursor: "pointer" }}>
      Tổng: {stats.total}
    </Card>
  </Col>

  <Col span={4}>
    <Card onClick={() => {
      setDistributionFilter("pending");
      setDistributionPage(1);
    }} style={{ cursor: "pointer" }}>
      Đang chờ: {stats.pending}
    </Card>
  </Col>

  <Col span={4}>
    <Card onClick={() => {
      setDistributionFilter("in progress");
      setDistributionPage(1);
    }} style={{ cursor: "pointer" }}>
      Đã phát: {stats.in_progress}
    </Card>
  </Col>

  <Col span={4}>
    <Card onClick={() => {
      setDistributionFilter("accepted");
      setDistributionPage(1);
    }} style={{ cursor: "pointer" }}>
      Đã nhận: {stats.accepted}
    </Card>
  </Col>

  <Col span={4}>
    <Card onClick={() => {
      setDistributionFilter("completed");
      setDistributionPage(1);
    }} style={{ cursor: "pointer" }}>
      Hoàn thành: {stats.completed}
    </Card>
  </Col>

  <Col span={4}>
    <Card onClick={() => {
      setDistributionFilter("rejected");
      setDistributionPage(1);
    }} style={{ cursor: "pointer" }}>
      Từ chối: {stats.rejected}
    </Card>
  </Col>
</Row>

        {renderPie(stats)}

        <Card title=" Danh sách nhiệm vụ cứu trợ" style={{ marginTop: 16 }}>
        {data.length === 0 ? (
  <div style={{ textAlign: "center", padding: 20 }}>
    Không có dữ liệu
  </div>
) : (
  data.map((item, i) => {
    const status = item.status?.toLowerCase();
    const canViewProcess = ["accepted", "in progress", "completed"].includes(status);

    return (
      <div
        key={i}
        className="task-dashboard__item"
        style={{ cursor: canViewProcess ? "pointer" : "default" }}
        onClick={() => {
          if (canViewProcess) {
            navigate(`/rescueTeam/chi-tiet-tro/${item.distributionId}`);
          }
        }}
      >
 <div
  onClick={(e) => {
    e.stopPropagation();
    navigate(`/rescueTeam/cuu-tro/${item.campaignId}`);
  }}
  style={{ cursor: "pointer" }}
>
  <b>{item.campaignName}</b>
  <div>⏱ {item.time}</div>
</div>

        <div
          className={`task-dashboard__status task-dashboard__status--${item.status}`}
        >
          {mapStatusVN(item.status)}
        </div>
      </div>
    );
  })
)}

  {filteredData.length > 0 && (
    <Pagination
      current={distributionPage}
      pageSize={pageSize}
      total={filteredData.length} 
      onChange={setDistributionPage}
      style={{ marginTop: 16, textAlign: "center" }}
    />
  )}
</Card>
      </>
    );
  };

  /* ================= MAIN ================= */
  return (
    <div className="task-dashboard">
  
      {loading ? (
        <div className="task-dashboard__loading">
          <Spin size="large" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* TAB */}
          <div className="task-dashboard__tabs">
            <button
              className={`task-dashboard__tab ${
                tab === "assignment" ? "task-dashboard__tab--active" : ""
              }`}
              onClick={() => setTab("assignment")}
            >
              Nhiệm vụ cứu hộ
            </button>
  
            <button
              className={`task-dashboard__tab ${
                tab === "distribution" ? "task-dashboard__tab--active" : ""
              }`}
              onClick={() => setTab("distribution")}
            >
              Nhiệm vụ cứu trợ
            </button>
          </div>
  
          {/* CONTENT */}
          <div className="task-dashboard__content">
            {tab === "assignment" && renderAssignment()}
            {tab === "distribution" && renderDistribution()}
          </div>
        </>
      )}
  
    </div>
  );
}