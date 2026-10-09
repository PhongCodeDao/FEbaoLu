"use client";

import { useEffect, useState } from "react";

import { Button, Spin, Pagination, Tag } from "antd";
import { CheckCircleOutlined, SyncOutlined, EnvironmentOutlined } from "@ant-design/icons";

import {
  getAvailableRescueTeams,
  getBusyRescueTeams,
} from "../../../../../api/axios/ManagerApi/rescueTeamApi";

import { getProvinces } from "../../../../../api/axios/Auth/authApi";

import "./TeamScheduleSection.css";

export default function ScheduleList() {
  const [activeTab, setActiveTab] = useState("available");

  const [availableTeams, setAvailableTeams] = useState([]);
  const [busyTeams, setBusyTeams] = useState([]);

  const [provinceMap, setProvinceMap] = useState({});

  const [loading, setLoading] = useState(true);

  /* pagination */

  const [page, setPage] = useState(1);
  const pageSize = 6;

  const teams = activeTab === "available" ? availableTeams : busyTeams;

  const startIndex = (page - 1) * pageSize;

  const paginated = teams.slice(startIndex, startIndex + pageSize);

  /* tổng số đội */

  const totalTeams = availableTeams.length + busyTeams.length;

  /* ================= LOAD DATA ================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      const [availableRes, busyRes, provinceRes] = await Promise.all([
        getAvailableRescueTeams(),
        getBusyRescueTeams(),
        getProvinces(),
      ]);

      const provinces = provinceRes?.data || provinceRes || [];

      const map = {};

      provinces.forEach((p) => {
        map[p.id] = p.name;
      });

      setProvinceMap(map);

      setAvailableTeams(availableRes?.data || []);
      setBusyTeams(busyRes?.data || []);
    } catch (error) {
      console.log("Load data error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="card loading">
        <Spin tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="card">
      {/* HEADER */}

      <div className="schedule-header">
        <h3>Quản lý nhiệm vụ đội cứu hộ ({totalTeams})</h3>

        <div className="nav-buttons">
          <Button
            type={activeTab === "available" ? "primary" : "default"}
            onClick={() => {
              setActiveTab("available");
              setPage(1);
            }}
          >
            Đội sẵn sàng ({availableTeams.length})
          </Button>

          <Button
            type={activeTab === "busy" ? "primary" : "default"}
            onClick={() => {
              setActiveTab("busy");
              setPage(1);
            }}
          >
            Đội đang nhiệm vụ ({busyTeams.length})
          </Button>
        </div>
      </div>

      {/* TABLE */}

      <div className="team-table">
        <div className="team-table-head">
          <span>MÃ ĐỘI</span>
          <span>TÊN ĐỘI CỨU HỘ</span>
          <span>KHU VỰC TRỰC</span>
          <span style={{ textAlign: "right" }}>TRẠNG THÁI NHIỆM VỤ</span>
        </div>

        {paginated.length === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center", color: "#64748b" }}>
            Không có đội cứu hộ nào trong danh mục này.
          </div>
        ) : (
          paginated.map((team) => (
            <div key={team.rescueTeamId} className="team-table-row">
              <div className="team-id-badge">#{team.rescueTeamId}</div>

              <div className="team-name-cell">
                <span className="team-indicator-dot"></span>
                <strong>{team.teamName}</strong>
              </div>

              <div className="team-area-cell">
                <EnvironmentOutlined style={{ color: "#0284c7", marginRight: 6 }} />
                <span>{provinceMap[team.areaId] || "Toàn khu vực"}</span>
              </div>

              <div style={{ textAlign: "right" }}>
                {activeTab === "available" ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    Sẵn sàng (0 nhiệm vụ)
                  </Tag>
                ) : (
                  <Tag color="warning" icon={<SyncOutlined spin />}>
                    Đang thực hiện ({team.activeTaskCount} nhiệm vụ)
                  </Tag>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}

      <div className="table-pagination">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={teams.length}
          onChange={(p) => setPage(p)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
}
