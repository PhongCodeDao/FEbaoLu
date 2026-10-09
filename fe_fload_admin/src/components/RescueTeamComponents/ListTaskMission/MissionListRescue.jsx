import "./MissionListRescue.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Pagination, Spin, Select } from "antd";

import {
  getAllAssignments,
  acceptRescueAssignment,
  getRescueTeamMembers,
  getAllRescueTeams,
  getAllVehicles
} from "../../../../api/axios/RescueApi/RescueTask";
import AuthNotify from "../../../utils/Common/AuthNotify";

/* ================= STATUS ================= */

const STATUS_MAP = {
  ASSIGNED: { label: "🟡 Chờ nhận nhiệm vụ" },
  ACCEPTED: { label: "✔ Đã nhận nhiệm vụ" },
  DEPARTED: { label: "🚑 Đã xuất phát" },
  ARRIVED: { label: "📍 Đã đến hiện trường" }
};

export default function MissionListRescue() {

  const navigate = useNavigate();

  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [filterName, setFilterName] = useState(null);
const [filterPhone, setFilterPhone] = useState(null);
const [filterAddress, setFilterAddress] = useState(null);
  const pageSize = 5;

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

  /* ================= LOAD ================= */

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
  
      /* 🔥 FILTER KHÔNG LẤY COMPLETED */
      const myAssignments = assignments
        .filter(a => a.rescueTeamId === myTeamId)
        .filter(a => a.assignmentStatus !== "COMPLETED")
        .filter(a => a.assignmentStatus !== "REJECTED")
        // .filter(a => a.assignmentStatus !== "PENDING")
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

  /* RESET PAGE */
  useEffect(() => {
    setCurrentPage(1);
  }, [filterName, filterPhone, filterAddress]);

  const nameOptions = [...new Set(missions.map(m => m.name))]
  .filter(Boolean)
  .map(v => ({ label: v, value: v }));

const phoneOptions = [...new Set(missions.map(m => m.phone))]
  .filter(Boolean)
  .map(v => ({ label: v, value: v }));

const addressOptions = [...new Set(missions.map(m => m.address))]
  .filter(Boolean)
  .map(v => ({ label: v, value: v }));


  const filteredMissions = missions.filter((m) => {
    const matchName = !filterName || m.name === filterName;
    const matchPhone = !filterPhone || m.phone === filterPhone;
    const matchAddress = !filterAddress || m.address === filterAddress;
  
    return matchName && matchPhone && matchAddress;
  });
  /* ================= PAGINATION ================= */

  const paginatedMissions = filteredMissions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  /* ================= ACCEPT ================= */

  const handleAccept = async (id) => {

    try {

      await acceptRescueAssignment(id);

      AuthNotify.success(
        "Nhận nhiệm vụ thành công",
        "Đang chuyển sang màn hình cứu hộ..."
      );

      setTimeout(() => {
        navigate(`/rescueTeam/dangcuho/${id}`);
      }, 800);

    } catch (err) {

      AuthNotify.error(
        "Nhận nhiệm vụ thất bại",
        err?.message || ""
      );

    }
  };

  /* ================= UI ================= */

  return (

    <section className="rm-container">

      <div className="rm-header-fixed">
        <h3>Nhiệm vụ của tôi</h3>
        <span style={{color:"white", fontSize: 20}}>
  {filteredMissions.length} nhiệm vụ
</span>
      </div>
      <div className="rm-filter">

<Select
  allowClear
  showSearch
  placeholder=" Chọn tên người gửi"
  options={nameOptions}
  value={filterName}
  onChange={setFilterName}
  style={{ width: "100%" }}
/>

<Select
  allowClear
  showSearch
  placeholder=" Chọn SĐT người gửi"
  options={phoneOptions}
  value={filterPhone}
  onChange={setFilterPhone}
  style={{ width: "100%" }}
/>

<Select
  allowClear
  showSearch
  placeholder=" Chọn địa chỉ"
  options={addressOptions}
  value={filterAddress}
  onChange={setFilterAddress}
  style={{ width: "100%" }}
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

        {paginatedMissions.map(m => (

          <div key={m.id} className="rm-card">

            <div className="rm-top">
              <div className="rm-avatar">
                {getInitials(m.name)}
              </div>
              <div>
              {/* <h4>Mã nhiệm vụ: #{m.id}</h4> */}
                <h4>Họ tên: {m.name}</h4>
                <span className="rm-phone">SĐT: {m.phone}</span>
              </div>
            </div>

            <div className="rm-address">
              Địa chỉ: {m.address}
            </div>

            <div className="rm-info">
              <div className="rm-tag team">Tên đội cứu hộ: {m.team}</div>
              <div className="rm-tag vehicle">Tên phương tiện: {m.vehicle}</div>
            </div>

            <div className="rm-meta">
              <span className={`status-badge ${m.status?.toLowerCase()}`}>
                {STATUS_MAP[m.status]?.label}
              </span>
              <span className="time">⏱Phân công lúc:{m.time}</span>
            </div>

            <div className="rm-actions">

              {m.status === "ASSIGNED" ? (
                <button onClick={() => handleAccept(m.id)}>
                  🚀 Nhận nhiệm vụ
                </button>
              ) : (
                <button
                  className="view-mode"
                  onClick={() =>
                    navigate(`/rescueTeam/dangcuho/${m.id}`)
                  }
                >
                  🔍 Xem quá trình
                </button>
              )}

              <button
                onClick={() =>
                  navigate(`/rescueTeam/mission/${m.id}`)
                }
              >
                Chi tiết
              </button>

            </div>

          </div>

        ))}

      </div>

      {/* PAGINATION */}
      {filteredMissions.length > pageSize && (
  <Pagination
    current={currentPage}
    pageSize={pageSize}
    total={filteredMissions.length}
    onChange={setCurrentPage}
    showSizeChanger={false}
  />
)}

    </section>
  );
}