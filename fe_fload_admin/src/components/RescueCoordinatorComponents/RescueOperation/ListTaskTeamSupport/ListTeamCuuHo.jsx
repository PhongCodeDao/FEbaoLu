import { useEffect, useState, useMemo } from "react";
import { Select, Spin, Tag } from "antd";
import {
  SyncOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CarOutlined,
  InboxOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

import {
  getAllAssignments,
  getPendingRescueRequests,
  getUrgencyLevels,
} from "../../../../../api/axios/CoordinatorApi/RescueRequestApi";

import { getAllRescueTeams } from "../../../../../api/axios/ManagerApi/rescueTeamApi";
import { getAllVehicles } from "../../../../../api/axios/ManagerApi/vehicleApi";
import { getRequestStatuses } from "../../../../../api/axios/Auth/authApi";

import "./list-team-cuuho.css";

const getPriorityClass = (id) => {
  if (id === 1) return "priority-high";
  if (id === 2) return "priority-medium";
  return "priority-low";
};

const assignmentStatusMap = {
  PENDING: "Chờ điều phối",
  ASSIGNED: "Đã điều động",
  ACCEPTED: "Đội đã nhận",
  DEPARTED: "Đang xuất phát",
  ARRIVED: "Đã tới hiện trường",
  COMPLETED: "Hoàn thành",
  REJECTED: "Bị từ chối",
  CANCELLED: "Đã hủy",
};

const assignmentStatusClass = {
  PENDING: "status-pending",
  ASSIGNED: "status-assigned",
  ACCEPTED: "status-accepted",
  DEPARTED: "status-departed",
  ARRIVED: "status-arrived",
  COMPLETED: "status-completed",
  REJECTED: "status-rejected",
  CANCELLED: "status-rejected",
};

const normalizeAddress = (address) => {
  if (!address) return "";
  return address
    .replace(/^(Hẻm|Ngõ|Hẽm)\s*\d*\s*/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

export default function ListTeamCuuHo({ onSelectMission, selectedAssignmentId }) {
  const [missions, setMissions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("all");
  const [activeId, setActiveId] = useState(selectedAssignmentId || null);

  const [filters, setFilters] = useState({
    address: "",
    urgency: "",
  });

  /* ================= LOAD API ================= */
  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        assignmentRes,
        teamRes,
        vehicleRes,
        requestRes,
        urgencyRes,
        statusRes,
      ] = await Promise.all([
        getAllAssignments(),
        getAllRescueTeams(),
        getAllVehicles(),
        getPendingRescueRequests(),
        getUrgencyLevels(),
        getRequestStatuses(),
      ]);

      const assignments = assignmentRes?.data || assignmentRes || [];
      const teams = teamRes?.data?.items || [];
      const vehicles = vehicleRes?.data || [];
      const requests = requestRes?.data || requestRes || [];
      const urgencies = urgencyRes || [];
      const statuses = statusRes?.data || statusRes || [];

      const teamMap = {};
      teams.forEach((t) => {
        teamMap[t.rescueTeamId || t.rcid] = t.teamName || t.rcName;
      });

      const vehicleMap = {};
      vehicles.forEach((v) => {
        vehicleMap[v.vehicleId] = v.vehicleName;
      });

      const requestMap = {};
      requests.forEach((r) => {
        requestMap[r.rescueRequestId] = r;
      });

      const urgencyMap = {};
      urgencies.forEach((u) => {
        urgencyMap[u.urgencyLevelId] = u;
      });

      const statusMap = {};
      statuses.forEach((s) => {
        statusMap[s.statusId] = s.description;
      });

      const mapped = assignments.map((a) => {
        const req = requestMap[a.rescueRequestId];
        const urgencyObj = urgencyMap[req?.urgencyLevelId];
        const requestStatus = statusMap[req?.statusId];

        return {
          id: a.rescueRequestId,
          assignmentId: a.assignmentId,
          team: teamMap[a.rescueTeamId] || `Đội #${a.rescueTeamId}`,
          vehicle: vehicleMap[a.vehicleId] || `Xe #${a.vehicleId}`,
          fullname: req?.fullname || req?.fullName || "Người dân",
          phone: req?.contactPhone || "Chưa có SĐT",
          address: req?.address || "Chưa xác định",
          incident: req?.requestType || "Cứu nạn",
          assignmentStatus: a.assignmentStatus || "ASSIGNED",
          urgency: urgencyObj?.levelName || "Bình thường",
          urgencyLevelId: req?.urgencyLevelId || 3,
          status: requestStatus || "Đang xử lý",
          time: a.assignedAt
            ? new Date(a.assignedAt).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
        };
      });

      setMissions(mapped);

      // Auto-select first if none selected
      if (mapped.length > 0 && !activeId) {
        setActiveId(mapped[0].assignmentId);
        onSelectMission?.(mapped[0].assignmentId);
      }
    } catch (err) {
      console.error("Load mission error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedAssignmentId) {
      setActiveId(selectedAssignmentId);
    }
  }, [selectedAssignmentId]);

  /* ================= FILTER OPTIONS ================= */
  const ADDRESS_OPTIONS = useMemo(() => {
    const unique = [
      ...new Set(
        missions.map((m) => normalizeAddress(m.address)).filter(Boolean)
      ),
    ];
    return [
      { label: "Tất cả địa bàn", value: "" },
      ...unique.map((addr) => ({ label: addr, value: addr })),
    ];
  }, [missions]);

  const URGENCY_OPTIONS = useMemo(() => {
    const unique = [
      ...new Set(missions.map((m) => m.urgencyLevelId).filter(Boolean)),
    ];
    return [
      { label: "Tất cả mức độ", value: "" },
      ...unique.map((id) => {
        const item = missions.find((m) => m.urgencyLevelId === id);
        return {
          label: item?.urgency || `Mức độ ${id}`,
          value: id,
        };
      }),
    ];
  }, [missions]);

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    let list = [...missions];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.team?.toLowerCase().includes(q) ||
          m.fullname?.toLowerCase().includes(q) ||
          String(m.id).includes(q)
      );
    }

    if (tab === "active") {
      list = list.filter(
        (m) => !["COMPLETED", "REJECTED", "CANCELLED"].includes(m.assignmentStatus)
      );
    } else if (tab === "done") {
      list = list.filter((m) => m.assignmentStatus === "COMPLETED");
    }

    if (filters.address) {
      list = list.filter((m) =>
        normalizeAddress(m.address)
          .toLowerCase()
          .includes(filters.address.toLowerCase())
      );
    }

    if (filters.urgency) {
      list = list.filter((m) => m.urgencyLevelId === filters.urgency);
    }

    return list;
  }, [missions, filters, search, tab]);

  const handleCardClick = (assignmentId) => {
    setActiveId(assignmentId);
    onSelectMission?.(assignmentId);
  };

  return (
    <section className="rc-team-list">
      {/* HEADER */}
      <div className="rc-team-list__header">
        <div className="rc-team-list__title">
          <h3>
            Đang cứu hộ
            <span className="rc-team-list__count-badge">{filtered.length}</span>
          </h3>

          <button
            className="rc-refresh-btn"
            onClick={fetchData}
            disabled={loading}
          >
            <SyncOutlined spin={loading} />
            Làm mới
          </button>
        </div>

        <input
          className="rc-team-list__search"
          placeholder="Tìm theo tên đội, người dân, mã #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABS */}
      <div className="rc-queue__tabs">
        <button
          className={tab === "all" ? "active" : ""}
          onClick={() => setTab("all")}
        >
          TẤT CẢ
        </button>
        <button
          className={tab === "active" ? "active" : ""}
          onClick={() => setTab("active")}
        >
          ĐANG THỰC HIỆN
        </button>
        <button
          className={tab === "done" ? "active" : ""}
          onClick={() => setTab("done")}
        >
          HOÀN THÀNH
        </button>
      </div>

      {/* LIST */}
      <div className="rc-team-list__items">
        {loading ? (
          <div style={{ textAlign: "center", padding: 30, color: "#64748b" }}>
            <Spin size="default" />
            <p style={{ marginTop: 10 }}>Đang cập nhật danh sách tác chiến...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rc-empty">
            <InboxOutlined style={{ fontSize: 36, color: "#cbd5e1" }} />
            <span>Không có nhiệm vụ nào</span>
          </div>
        ) : (
          filtered.map((item) => {
            const isSelected = activeId === item.assignmentId;
            return (
              <div
                key={item.assignmentId}
                className={`rc-team-item ${isSelected ? "is-active" : ""}`}
                onClick={() => handleCardClick(item.assignmentId)}
              >
                <div className="rc-team-item__top">
                  <span className="rc-team-item__id">#{item.id}</span>
                  <span className={`status-badge ${assignmentStatusClass[item.assignmentStatus] || "status-assigned"}`}>
                    {assignmentStatusMap[item.assignmentStatus] || item.assignmentStatus}
                  </span>
                </div>

                <div className="rc-team-item__name">{item.fullname}</div>

                <div className="rc-team-item__team-pill">
                  <TeamOutlined />
                  {item.team}
                </div>

                <div className="rc-team-item__location">
                  <EnvironmentOutlined style={{ color: "#ef4444", marginTop: 2, flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.address}
                  </span>
                </div>

                <div className="rc-team-item__footer">
                  <span className={getPriorityClass(item.urgencyLevelId)}>
                    {item.urgency}
                  </span>
                  <span style={{ color: "#94a3b8" }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {item.time || "Vừa điều động"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}