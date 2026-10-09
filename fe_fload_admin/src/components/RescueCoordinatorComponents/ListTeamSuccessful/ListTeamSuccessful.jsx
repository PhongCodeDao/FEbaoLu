import { useEffect, useMemo, useState } from "react";
import { Tag, Spin } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  EnvironmentOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  UserOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import {
  getPendingRescueRequests,
  getUrgencyLevels,
} from "../../../../api/axios/CoordinatorApi/RescueRequestApi";
import AuthNotify from "../../../utils/Common/AuthNotify";
import { getRequestStatuses } from "../../../../api/axios/Auth/authApi";
import { extractImageUrls } from "../../../utils/imageUtils";
import "./ListTeamSuccessful.css";

/* ================= TIME AGO ================= */
function timeAgo(ts) {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes}p trước`;
  if (hours < 24) return `${hours}h trước`;
  if (days < 7) return `${days}d trước`;

  return new Date(ts).toLocaleDateString("vi-VN");
}

const normalizeAddress = (address) => {
  if (!address) return "";
  return address
    .replace(/^(Hẻm|Ngõ|Hẽm)\s*\d*\s*/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

const convertApiToMission = (data = [], statuses = [], urgencyLevels = []) => {
  if (!Array.isArray(data)) return [];
  const VALID_STATUS = [5, 6];
  return data
    .filter((item) => VALID_STATUS.includes(item.statusId))
    .map((item) => {
      const statusObj = statuses.find((s) => s.statusId === item.statusId);
      const urgencyObj = urgencyLevels.find(
        (u) => u.urgencyLevelId === item.urgencyLevelId
      );
      const normalizedImages = extractImageUrls(item);

      return {
        id: item.rescueRequestId,
        name: item.fullName || "Người dân",
        phone: item.contactPhone || "Chưa có",
        address: item.address || "Chưa xác định",
        urgencyScore: item.urgencyScore || 0,
        lat: item.locationLat,
        lng: item.locationLng,
        locationLat: item.locationLat,
        locationLng: item.locationLng,
        createdAt: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
        incident: item.requestType || "Cứu hộ khẩn cấp",
        status: item.statusId === 6 ? "rejected" : "completed",
        statusText: item.statusId === 6 ? "Đã từ chối" : statusObj?.description || "Đã hoàn thành",
        statusId: item.statusId,
        images: normalizedImages,
        urgencyLevelName: urgencyObj?.levelName,
        urgencyLevelId: item.urgencyLevelId,
        detailDescription: item.detailDescription,
        rescueTeamNote: item.rescueTeamNote,
        victimCount: item.victimCount || 0,
        availableRescueTool: item.availableRescueTool,
        specialNeeds: item.specialNeeds,
      };
    });
};

export default function ListTeamSuccessful({ onSelectMission, selectedMissionId }) {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestStatuses, setRequestStatuses] = useState([]);
  const [urgencyLevels, setUrgencyLevels] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [activeId, setActiveId] = useState(selectedMissionId || null);

  /* ================= LOAD API ================= */
  const fetchData = async () => {
    try {
      setLoading(true);
      const [response, urgencyRes, statusRes] = await Promise.all([
        getPendingRescueRequests(),
        getUrgencyLevels(),
        getRequestStatuses(),
      ]);

      const list = Array.isArray(response) ? response : response?.data || [];
      const urgencies = Array.isArray(urgencyRes) ? urgencyRes : urgencyRes?.data || [];
      const statuses = Array.isArray(statusRes) ? statusRes : statusRes?.data || [];

      setUrgencyLevels(urgencies);
      setRequestStatuses(statuses);

      const converted = convertApiToMission(list, statuses, urgencies);
      setMissions(converted);

      if (converted.length > 0 && !activeId) {
        setActiveId(converted[0].id);
        onSelectMission?.(converted[0]);
      }
    } catch (error) {
      AuthNotify.error(
        "Không tải được dữ liệu",
        error?.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedMissionId) {
      setActiveId(selectedMissionId);
    }
  }, [selectedMissionId]);

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    let list = [...missions];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.address?.toLowerCase().includes(q) ||
          String(m.id).includes(q)
      );
    }

    if (tab === "completed") {
      list = list.filter((m) => m.statusId === 5);
    } else if (tab === "rejected") {
      list = list.filter((m) => m.statusId === 6);
    }

    list.sort((a, b) => b.createdAt - a.createdAt);
    return list;
  }, [missions, search, tab]);

  const handleCardClick = (m) => {
    setActiveId(m.id);
    onSelectMission?.(m);
  };

  return (
    <aside className="rc-succ-queue">
      {/* HEADER */}
      <div className="rc-succ-queue__header">
        <div className="rc-succ-queue__title-wrap">
          <h3>
            Hồ sơ hoàn thành
            <span className="rc-succ-queue__badge">{filtered.length}</span>
          </h3>
        </div>

        <input
          className="rc-succ-queue__search"
          placeholder="Tìm theo tên, địa chỉ, mã #..."
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
          className={tab === "completed" ? "active" : ""}
          onClick={() => setTab("completed")}
        >
          HOÀN THÀNH
        </button>
        <button
          className={tab === "rejected" ? "active" : ""}
          onClick={() => setTab("rejected")}
        >
          TỪ CHỐI
        </button>
      </div>

      {/* LIST */}
      <div className="rc-succ-queue__list">
        {loading ? (
          <div style={{ textAlign: "center", padding: 30, color: "#64748b" }}>
            <Spin size="default" />
            <p style={{ marginTop: 10 }}>Đang tải danh sách hồ sơ...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
            <InboxOutlined style={{ fontSize: 36, marginBottom: 8 }} />
            <p>Không có hồ sơ nào</p>
          </div>
        ) : (
          filtered.map((m) => {
            const isSelected = activeId === m.id;
            const isDone = m.statusId === 5;

            return (
              <div
                key={m.id}
                className={`rc-succ-card ${isSelected ? "is-active" : ""}`}
                onClick={() => handleCardClick(m)}
              >
                <div className="rc-succ-card__top">
                  <span className="rc-succ-card__id">#{m.id}</span>
                  <span className="rc-succ-card__time">
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {timeAgo(m.createdAt)}
                  </span>
                </div>

                <div className="rc-succ-card__name">{m.name}</div>

                <div className="rc-succ-card__phone-pill">
                  <PhoneOutlined style={{ marginRight: 4 }} />
                  {m.phone}
                </div>

                <div className="rc-succ-card__addr">
                  <EnvironmentOutlined style={{ color: "#ef4444", marginTop: 2, flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.address}
                  </span>
                </div>

                <div className="rc-succ-card__footer">
                  <Tag color="blue" style={{ borderRadius: 6, margin: 0, fontSize: 11 }}>
                    {m.incident}
                  </Tag>

                  {isDone ? (
                    <span className="rc-status-pill-success">
                      <CheckCircleFilled /> Hoàn thành
                    </span>
                  ) : (
                    <span className="rc-status-pill-rejected">
                      <CloseCircleFilled /> Đã từ chối
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}