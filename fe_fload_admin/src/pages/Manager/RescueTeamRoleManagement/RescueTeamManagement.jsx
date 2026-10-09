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
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchTeams = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

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
      setLastRefreshed(new Date());
    } catch (error) {
      message.error("Không thể tải danh sách đội cứu hộ");
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      {/* EXECUTIVE COMMAND HERO BANNER */}
      <div className="rescue-hero-banner">
        <div className="rescue-hero-backdrop"></div>
        <div className="rescue-hero-content">
          <div className="rescue-hero-top">
            <div className="rescue-hero-status-pill">
              <span className="rescue-pulse-dot"></span>
              <span className="rescue-status-text">RADAR ĐIỀU HÀNH 24/7</span>
              <span className="rescue-status-divider">•</span>
              <span className="rescue-time-text">
                Cập nhật lúc {lastRefreshed.toLocaleTimeString("vi-VN")}
              </span>
            </div>

            <Button
              className="rescue-sync-btn"
              icon={<ThunderboltOutlined spin={refreshing} />}
              onClick={() => fetchTeams(true)}
              loading={refreshing}
            >
              Làm mới dữ liệu
            </Button>
          </div>

          <div className="rescue-hero-main">
            <div className="rescue-hero-title-group">
              <div className="rescue-hero-icon-wrap">
                <TeamOutlined />
              </div>
              <div>
                <h1 className="rescue-hero-title">
                  Trung Tâm Điều Phối Đội Cứu Hộ
                </h1>
                <p className="rescue-hero-subtitle">
                  Giám sát thời gian thực năng lực ứng phó, sắp xếp nhân sự và phân bổ đội hình tác chiến vùng lũ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 KPI METRIC CARDS */}
      <div className="rescue-stat-grid">
        <div
          className={`rescue-stat-card card-total ${filterStatus === "all" ? "active" : ""}`}
          onClick={() => setFilterStatus("all")}
        >
          <div className="rescue-stat-header">
            <span className="rescue-stat-label">Tổng số đội</span>
            <div className="rescue-stat-icon-box icon-blue">
              <TeamOutlined />
            </div>
          </div>
          <div className="rescue-stat-number">{getTeamCount("all")}</div>
          <div className="rescue-stat-footer">
            <span className="rescue-stat-hint">Toàn bộ lực lượng</span>
            {filterStatus === "all" && <span className="rescue-active-tag">Đang chọn</span>}
          </div>
        </div>

        <div
          className={`rescue-stat-card card-active ${filterStatus === "active" ? "active" : ""}`}
          onClick={() => setFilterStatus("active")}
        >
          <div className="rescue-stat-header">
            <span className="rescue-stat-label">Sẵn sàng tác chiến</span>
            <div className="rescue-stat-icon-box icon-green">
              <ThunderboltOutlined />
            </div>
          </div>
          <div className="rescue-stat-number">{getTeamCount("active")}</div>
          <div className="rescue-stat-footer">
            <span className="rescue-stat-hint">Có thể điều động ngay</span>
            {filterStatus === "active" && <span className="rescue-active-tag">Đang chọn</span>}
          </div>
        </div>

        <div
          className={`rescue-stat-card card-rest ${filterStatus === "rest" ? "active" : ""}`}
          onClick={() => setFilterStatus("rest")}
        >
          <div className="rescue-stat-header">
            <span className="rescue-stat-label">Đang nghỉ / Dự phòng</span>
            <div className="rescue-stat-icon-box icon-amber">
              <CoffeeOutlined />
            </div>
          </div>
          <div className="rescue-stat-number">{getTeamCount("rest")}</div>
          <div className="rescue-stat-footer">
            <span className="rescue-stat-hint">Chờ phân công / Nghỉ ngơi</span>
            {filterStatus === "rest" && <span className="rescue-active-tag">Đang chọn</span>}
          </div>
        </div>

        <div className="rescue-stat-card card-members">
          <div className="rescue-stat-header">
            <span className="rescue-stat-label">Tổng quân số chiến sĩ</span>
            <div className="rescue-stat-icon-box icon-purple">
              <UserOutlined />
            </div>
          </div>
          <div className="rescue-stat-number">{totalMembers}</div>
          <div className="rescue-stat-footer">
            <span className="rescue-stat-hint">Nhân lực đã đăng ký</span>
          </div>
        </div>
      </div>

      {/* FILTER BAR & TEAMS LIST */}
      <TeamManagementList
        teamsData={mappedTeams}
        filterStatus={filterStatus}
        onTeamChanged={() => fetchTeams(true)}
        searchQuery={searchQuery}
        areaFilterId={areaFilterId}
        onSearchChange={setSearchQuery}
        onAreaChange={setAreaFilterId}
        onResetFilters={() => {
          setSearchQuery("");
          setAreaFilterId(null);
          setFilterStatus("all");
        }}
      />

      {/* SCHEDULE & MISSIONS SECTION */}
      <ScheduleList />
    </div>
  );
}
