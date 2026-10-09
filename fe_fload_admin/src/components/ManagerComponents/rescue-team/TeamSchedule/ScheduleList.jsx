"use client";

import { useEffect, useState } from "react";

import { Button, Spin, Pagination } from "antd";

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
          <span>ID</span>
          <span>TÊN ĐỘI</span>
          <span>KHU VỰC</span>
          <span>SỐ NHIỆM VỤ</span>
        </div>

        {paginated.map((team) => (
          <div key={team.rescueTeamId} className="team-table-row">
            <div>{team.rescueTeamId}</div>

            <div>{team.teamName}</div>

            <div>{provinceMap[team.areaId] || "Không xác định"}</div>

            <div>{activeTab === "available" ? "0" : team.activeTaskCount}</div>
          </div>
        ))}
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
