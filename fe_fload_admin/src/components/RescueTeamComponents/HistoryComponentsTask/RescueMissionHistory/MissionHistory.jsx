import "./MissionHistory.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Pagination, Spin, Select } from "antd";

import {
  getAllAssignments,
  getRescueTeamMembers,
  getAllRescueTeams,
  getAllVehicles
} from "../../../../../api/axios/RescueApi/RescueTask";

/* ================= STATUS ================= */

const STATUS_MAP = {
  COMPLETED: {
    label: "✅ Hoàn thành nhiệm vụ",
    class: "completed"
  },
  REJECTED: {
    label: "❌ Từ chối nhiệm vụ",
    class: "rejected"
  }
};

export default function MissionHistory() {

  const navigate = useNavigate();

  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterName, setFilterName] = useState(null);
  const [filterPhone, setFilterPhone] = useState(null);
  const [filterAddress, setFilterAddress] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const pageSize = 3;

  const user =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user")) ||
    {};

  /* ================= AVATAR ================= */

  const getInitials = (name = "") => {
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0]?.toUpperCase();

    return (
      words[0][0] + words[words.length - 1][0]
    ).toUpperCase();
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

  /* ================= FIND TEAM ================= */

  const findMyTeamId = async (teams, userId) => {
    for (const team of teams) {
      try {
        const res = await getRescueTeamMembers(team.rcid);
        const data = res?.data;

        const isMember = data?.items?.some(
          m => m.userId === userId
        );

        if (isMember) return team.rcid;

      } catch {}
    }
    return null;
  };

  /* ================= LOAD DATA ================= */

  const fetchAssignments = async () => {
    try {
      setLoading(true);

      if (!user?.userId) return;

      const [assignmentsRes, teamRes, vehicleRes] = await Promise.all([
        getAllAssignments(),
        getAllRescueTeams(),
        getAllVehicles()
      ]);

      const assignments = assignmentsRes || [];
      const teams = teamRes?.data?.items || [];
      const vehicles = vehicleRes?.data || [];

      const vehicleMap = {};
      vehicles.forEach(v => {
        vehicleMap[v.vehicleId] = v.vehicleName;
      });

      const teamMap = {};
      teams.forEach(t => {
        teamMap[t.rcid] = t.rcName;
      });

      const myTeamId = await findMyTeamId(teams, user.userId);

      if (!myTeamId) {
        setMissions([]);
        return;
      }

      /* 🔥 FIX: LẤY CẢ COMPLETED + REJECTED */
      const myAssignments = assignments
        .filter(a => a.rescueTeamId === myTeamId)
        .filter(a =>
          a.assignmentStatus === "COMPLETED" ||
          a.assignmentStatus === "REJECTED"
        )
        .sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));

      const mapped = await Promise.all(
        myAssignments.map(async (a) => {
          const req = await getRequestById(a.rescueRequestId);

          return {
            id: a.assignmentId,
            name: req?.fullName || "Không rõ",
            phone: req?.contactPhone || "Không có",
            address: req?.address || "Chưa có",
            vehicle: vehicleMap[a.vehicleId] || a.vehicleId,
            team: teamMap[a.rescueTeamId] || `Team ${a.rescueTeamId}`,
            status: a.assignmentStatus,
            time: a.assignedAt
              ? new Date(a.assignedAt).toLocaleString("vi-VN")
              : "Chưa có"
          };
        })
      );

      setMissions(mapped);

    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterName, filterPhone, filterAddress, filterStatus]);

  const nameOptions = [...new Set(missions.map(m => m.name))]
  .filter(Boolean)
  .map(v => ({ label: v, value: v }));

const phoneOptions = [...new Set(missions.map(m => m.phone))]
  .filter(Boolean)
  .map(v => ({ label: v, value: v }));

const addressOptions = [...new Set(missions.map(m => m.address))]
  .filter(Boolean)
  .map(v => ({ label: v, value: v }));

const statusOptions = [
  { label: "Tất cả trạng thái", value: "ALL" },
  ...[...new Set(missions.map(m => m.status))]
    .filter(Boolean)
    .map(s => ({
      label: STATUS_MAP[s]?.label || s,
      value: s
    }))
];


const filteredMissions = missions.filter(m => {

  const matchName =
    !filterName || m.name === filterName;

  const matchPhone =
    !filterPhone || m.phone === filterPhone;

  const matchAddress =
    !filterAddress || m.address === filterAddress;

  const matchStatus =
    !filterStatus ||
    filterStatus === "ALL" ||
    m.status === filterStatus;

  return matchName && matchPhone && matchAddress && matchStatus;
});

const paginatedMissions = filteredMissions.slice(
  (currentPage - 1) * pageSize,
  currentPage * pageSize
);

  /* ================= UI ================= */

  return (
    <section className="rm-container">

      <div className="rm-header-fixed">
        <h3>Lịch sử nhiệm vụ</h3>
        <span style={{ color: "white", fontSize: 20 }}>
        {filteredMissions.length}
        </span>
      </div>
      <div style={{ padding: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>

<Select
  allowClear
  showSearch
  placeholder=" Tên"
  options={nameOptions}
  value={filterName}
  onChange={setFilterName}
  style={{ minWidth: 150 }}
/>

<Select
  allowClear
  showSearch
  placeholder=" SĐT"
  options={phoneOptions}
  value={filterPhone}
  onChange={setFilterPhone}
  style={{ minWidth: 150 }}
/>

<Select
  allowClear
  showSearch
  placeholder=" Địa chỉ"
  options={addressOptions}
  value={filterAddress}
  onChange={setFilterAddress}
  style={{ minWidth: 200 }}
/>

<Select
  allowClear
  placeholder=" Trạng thái"
  options={statusOptions}
  value={filterStatus}
  onChange={setFilterStatus}
  style={{ minWidth: 180 }}
/>

</div>
      <div className="rm-list-scroll">

        {loading && (
          <div className="rm-loading">
            <Spin size="large" />
            <p>Đang tải...</p>
          </div>
        )}

        {!loading && missions.length === 0 && (
          <p className="rm-empty">Không có nhiệm vụ</p>
        )}

        {paginatedMissions.map(m => {

          const statusInfo = STATUS_MAP[m.status];

          return (
            <div key={m.id} className="rm-card">

              <div className="rm-top">
                <div className="rm-avatar">
                  {getInitials(m.name)}
                </div>
                <div>
                  <h4>Họ tên: {m.name}</h4>
                  <span className="rm-phone">SĐT: {m.phone}</span>
                </div>
              </div>

              <div className="rm-address">
                Địa chỉ: {m.address}
              </div>

              <div className="rm-info">
                <div className="rm-tag team">
                  Tên đội cứu hộ: {m.team}
                </div>
                <div className="rm-tag vehicle">
                  Tên phương tiện: {m.vehicle}
                </div>
              </div>

              <div className="rm-meta">
                <span className={`status-badge ${statusInfo?.class}`}>
                  {statusInfo?.label}
                </span>
                <span className="time">
                  ⏱ {m.time}
                </span>
              </div>

              <div className="rm-actions">
                <button
                  className="btn-accept view-mode"
                  onClick={() =>
                    navigate(`/rescueTeam/history/${m.id}`)
                  }
                >
                  Xem lịch sử
                </button>
              </div>

            </div>
          );
        })}

      </div>

      {filteredMissions.length > pageSize && (
  <div style={{ marginTop: 16, textAlign: "center" }}>
    <Pagination
      current={currentPage}
      pageSize={pageSize}
      total={filteredMissions.length}
      onChange={setCurrentPage}
      showSizeChanger={false}
    />
  </div>
)}
    </section>
  );
}