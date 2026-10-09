"use client";

import { useState, useEffect } from "react";
import { Button, Spin, message, Input, Select, Space } from "antd";
import {
  FilterOutlined,
  DownloadOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  CoffeeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import TeamManagementList from "../../../components/ManagerComponents/rescue-team/TeamTable/TeamManagementList";
import ScheduleList from "../../../components/ManagerComponents/rescue-team/TeamSchedule/ScheduleList";
import { getAllRescueTeams } from "../../../../api/axios/ManagerApi/rescueTeamApi"; // ← import hàm api
import "./RescueTeamManagement.css";

export default function RescueTeamManagement() {
  const [teams, setTeams] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [areaFilterId, setAreaFilterId] = useState(null);
  const fetchTeams = async () => {
    try {
      setLoading(true);

      const response = await getAllRescueTeams();
      const data = response.data;

      if (Array.isArray(data)) {
        setTeams(data);
      } else if (Array.isArray(data?.data)) {
        setTeams(data.data);
      } else if (Array.isArray(data?.items)) {
        setTeams(data.items);
      } else {
        setTeams([]);
      }
    } catch (error) {
      message.error("Không thể tải danh sách đội");
    } finally {
      setLoading(false);
    }
  };
  const normalizeStatus = (status) => {
    if (!status) return "unknown";

    const s = status.toLowerCase().trim();

    if (s === "on duty" || s === "active") return "active";

    if (s === "off duty" || s === "rest") return "rest";

    return "unknown";
  };
  useEffect(() => {
    fetchTeams();
  }, []);
  const getFilteredTeams = () => {
    const q = searchQuery.trim().toLowerCase();

    return teams.filter((team) => {
      const byStatus =
        filterStatus === "all" ||
        normalizeStatus(team.rcStatus) === filterStatus;

      const byArea =
        !areaFilterId ||
        Number(team.areaId) === Number(areaFilterId);

      const byQuery =
        !q ||
        String(team.rcName ?? "")
          .toLowerCase()
          .includes(q) ||
        String(team.rcPhone ?? "")
          .toLowerCase()
          .includes(q);

      return byStatus && byArea && byQuery;
    });
  };

  const getTeamCount = (status) => {
    if (status === "all") return teams.length;

    return teams.filter((team) => normalizeStatus(team.rcStatus) === status)
      .length;
  };

  const totalMembers = teams.reduce(
    (sum, team) => sum + (team.members || 0),
    0
  );

  const filteredTeams = getFilteredTeams();

  // Mapping dữ liệu API sang format component con mong đợi
  const mappedTeams = filteredTeams.map((team) => ({
    id: team.rcid,
    name: team.rcName || "Chưa đặt tên",
    members: team.members || 0,
    status: normalizeStatus(team.rcStatus),
    mission: team.mission || "—",
    phone: team.rcPhone || "—",
    teamMembers: [],
    areaId: Number(team.areaId),
  }));

  if (loading) {
    return (
      <div
        className="rescue-page"
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" tip="Đang tải danh sách đội cứu hộ..." />
      </div>
    );
  }

  return (
    <div className="rescue-page">
      <div className="page-header">
        <div>
          <h2>Quản lý Đội cứu hộ</h2>
          <p>
            Giám sát và sắp xếp nhân sự cho các đội cứu hộ dưới quyền (UC-M08,
            UC-M18)
          </p>
        </div>

        {/* <div className="header-actions">
          <Button icon={<FilterOutlined />}>Lọc nâng cao</Button>
          <Button icon={<DownloadOutlined />}>Xuất báo cáo</Button>
        </div> */}
      </div>

      <div className="stat-grid">
        <div
          onClick={() => setFilterStatus("all")}
          style={{ cursor: "pointer" }}
        >
          {/* <StatCard
            title="TỔNG SỐ ĐỘI"
            value={getTeamCount("all")}
            icon={<TeamOutlined />}
            active={filterStatus === "all"}
          /> */}
        </div>
        <div
          onClick={() => setFilterStatus("active")}
          style={{ cursor: "pointer" }}
        >
          {/* <StatCard
            title="Sẵng Sàng"
            value={getTeamCount("active")}
            icon={<ThunderboltOutlined />}
            green
            active={filterStatus === "active"}
          /> */}
        </div>
        <div
          onClick={() => setFilterStatus("rest")}
          style={{ cursor: "pointer" }}
        >
          {/* <StatCard
            title="ĐANG NGHỈ"
            value={getTeamCount("rest")}
            icon={<CoffeeOutlined />}
            gray
            active={filterStatus === "rest"}
          /> */}
        </div>
        {/* <StatCard
          title="NHÂN SỰ SẴN SÀNG"
          value={totalMembers}
          icon={<UserOutlined />}
        /> */}
      </div>

      {/* FILTER BAR */}
      <TeamManagementList
        teamsData={mappedTeams}
        filterStatus={filterStatus}
        onTeamChanged={fetchTeams}
        searchQuery={searchQuery}
        areaFilterId={areaFilterId}
        onSearchChange={setSearchQuery}
        onAreaChange={setAreaFilterId}
        onResetFilters={() => {
          setSearchQuery("");
          setAreaFilterId(null);
        }}
      />
      <ScheduleList />
    </div>
  );
}

function StatCard({ title, value, icon, green, gray, active }) {
  return (
    <div
      className={`stat-card ${green ? "green" : ""} ${gray ? "gray" : ""} ${
        active ? "active" : ""
      }`}
    >
      <div className="stat-icon">{icon}</div>
      <span>{title}</span>
      <h2>{value}</h2>
    </div>
  );
}
