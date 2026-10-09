import { useEffect, useMemo, useState } from "react";
import { Tag, Select, Spin } from "antd";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  FireOutlined,
  SearchOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { getPendingRescueRequests } from "../../../api/axios/CoordinatorApi/RescueRequestApi";
import AuthNotify from "../../utils/Common/AuthNotify";
import { getRequestStatuses } from "../../../api/axios/Auth/authApi";
import { extractImageUrls } from "../../utils/imageUtils";
import "./MissionList.css";

const { Option } = Select;

const normalizeAddress = (address) => {
  if (!address) return "";
  return address
    .replace(/^(Hẻm|Ngõ|Hẽm)\s*\d*\s*/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

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

/* ================= TIME FILTER ================= */
const isExpired = (createdAt) => {
  const diff = (Date.now() - createdAt) / 60000;
  return diff > 60;
};

const isNew = (createdAt) => {
  const diff = (Date.now() - createdAt) / 60000;
  return diff <= 60;
};

/* ================= CONVERT API ================= */
const convertApiToMission = (data = [], statuses = []) => {
  if (!Array.isArray(data)) return [];

  return data
    .filter((item) => item.statusId === 1)
    .map((item) => {
      const statusObj = statuses.find((s) => s.statusId === item.statusId);
      const getImages = (mission) => extractImageUrls(mission);

      return {
        id: item.rescueRequestId || item.id,
        rescueRequestId: item.rescueRequestId || item.id,
        name: item.fullName || "Người dân",
        phone: item.contactPhone || "Chưa có SĐT",
        address: item.address || "Chưa xác định",
        lat: item.locationLat,
        lng: item.locationLng,
        locationLat: item.locationLat,
        locationLng: item.locationLng,
        createdAt: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
        incident: item.requestType || "Cứu hộ khẩn cấp",
        status: "pending",
        statusText: statusObj?.description || "Chờ xác minh",
        urgencyScore: item.urgencyScore || 0,
        images: getImages(item),
        urgencyLevelId: item.urgencyLevelId,
        detailDescription: item.detailDescription,
        rescueTeamNote: item.rescueTeamNote,
        victimCount: item.victimCount,
        availableRescueTool: item.availableRescueTool,
        specialNeeds: item.specialNeeds,
      };
    });
};

/* ================= COMPONENT ================= */
export default function MissionList({ onSelectMission, selectedMissionId }) {
  const [missions, setMissions] = useState([]);
  const [tab, setTab] = useState("new");
  const [loading, setLoading] = useState(false);
  const [tabLoading, setTabLoading] = useState(null);
  const [requestStatuses, setRequestStatuses] = useState([]);
  const [, forceRender] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [activeId, setActiveId] = useState(selectedMissionId || null);

  const [filters, setFilters] = useState({
    requestType: "",
    timeRange: "",
    address: "",
  });

  /* ================= LOAD API ================= */
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getPendingRescueRequests();
      const list = Array.isArray(response) ? response : response?.data || [];
      const pendingList = list.filter((item) => item.statusId === 1);
      const converted = convertApiToMission(pendingList, requestStatuses);
      setMissions(converted);

      // Auto-select first mission if none selected
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
    if (requestStatuses.length > 0) {
      fetchData();
    }
  }, [requestStatuses]);

  useEffect(() => {
    if (selectedMissionId) {
      setActiveId(selectedMissionId);
    }
  }, [selectedMissionId]);

  /* ================= ADDRESS OPTIONS ================= */
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

  /* ================= CHANGE TAB ================= */
  const changeTab = (key) => {
    setTabLoading(key);
    setTimeout(() => {
      setTab(key);
      if (key !== "merge") {
        setFilters({
          requestType: "",
          timeRange: "",
          address: "",
        });
      }
      setTabLoading(null);
    }, 150);
  };

  /* ================= REALTIME CLOCK ================= */
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  /* ================= UPDATE TIME AGO ================= */
  useEffect(() => {
    const timer = setInterval(() => {
      forceRender((n) => n + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const INCIDENT_OPTIONS = useMemo(() => {
    const unique = [
      ...new Set(missions.map((m) => m.incident).filter(Boolean)),
    ];
    return [
      { label: "Tất cả loại sự cố", value: "" },
      ...unique.map((i) => ({ label: i, value: i })),
    ];
  }, [missions]);

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    let list = [...missions];

    if (tab === "new") {
      list = list.filter((m) => isNew(m.createdAt));
    }

    if (tab === "expired") {
      list = list.filter((m) => isExpired(m.createdAt));
    }

    if (tab === "merge") {
      if (filters.requestType)
        list = list.filter((m) => m.incident === filters.requestType);

      if (filters.address)
        list = list.filter((m) =>
          normalizeAddress(m.address)
            .toLowerCase()
            .includes(filters.address.toLowerCase())
        );

      if (filters.timeRange) {
        const minutes = Number(filters.timeRange);
        list = list.filter((m) => {
          const diff = (Date.now() - m.createdAt) / 60000;
          return diff <= minutes;
        });
      }
    }

    list.sort((a, b) => b.createdAt - a.createdAt);
    return list;
  }, [missions, tab, filters]);

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const data = await getRequestStatuses();
        const list = Array.isArray(data) ? data : data?.data || [];
        setRequestStatuses(list);
      } catch (error) {
        console.error("LOAD STATUS ERROR:", error);
      }
    };
    loadStatuses();
  }, []);

  const handleCardClick = (m) => {
    setActiveId(m.id);
    onSelectMission?.(m);
  };

  /* ================= UI ================= */
  return (
    <aside className="rc-queue">
      {/* HEADER */}
      <div className="rc-queue__header">
        <div className="rc-queue__title-group">
          <h3>Hàng đợi tiếp nhận</h3>
          <span className="rc-queue__badge">{filtered.length}</span>
        </div>
        <div className="rc-queue__live">
          <span className="rc-live-dot" />
          <span>{currentTime || "LIVE"}</span>
        </div>
      </div>

      {/* TABS */}
      <div className="rc-queue__tabs">
        <button
          disabled={tabLoading !== null}
          className={tab === "new" ? "active" : ""}
          onClick={() => changeTab("new")}
        >
          MỚI NHẤT
        </button>
        <button
          disabled={tabLoading !== null}
          className={tab === "expired" ? "active" : ""}
          onClick={() => changeTab("expired")}
        >
          QUÁ HẠN
        </button>
        <button
          disabled={tabLoading !== null}
          className={tab === "merge" ? "active" : ""}
          onClick={() => changeTab("merge")}
        >
          BỘ LỌC
        </button>
      </div>

      {/* FILTER */}
      {tab === "merge" && (
        <div className="rc-filter">
          <Select
            placeholder="Loại yêu cầu"
            showSearch
            allowClear
            value={filters.requestType || undefined}
            style={{ width: "100%" }}
            options={INCIDENT_OPTIONS}
            optionFilterProp="label"
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, requestType: value || "" }))
            }
          />

          <Select
            placeholder="Địa chỉ khu vực"
            allowClear
            showSearch
            style={{ width: "100%" }}
            options={ADDRESS_OPTIONS}
            value={filters.address || undefined}
            onChange={(v) =>
              setFilters((prev) => ({ ...prev, address: v || "" }))
            }
          />

          <Select
            placeholder="Khoảng thời gian"
            allowClear
            value={filters.timeRange || undefined}
            style={{ width: "100%" }}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, timeRange: value || "" }))
            }
          >
            <Option value="">Tất cả thời gian</Option>
            <Option value="15">Trong 15 phút qua</Option>
            <Option value="30">Trong 30 phút qua</Option>
            <Option value="60">Trong 1 giờ qua</Option>
            <Option value="120">Trong 2 giờ qua</Option>
          </Select>
        </div>
      )}

      {/* LIST */}
      <div className="rc-queue__list">
        {loading ? (
          <div className="rc-loading">
            <Spin size="default" />
            <p>Đang tải danh sách yêu cầu...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rc-empty">
            <InboxOutlined style={{ fontSize: 36, color: "#cbd5e1" }} />
            <span>Không có yêu cầu chờ xử lý</span>
          </div>
        ) : (
          filtered.map((m) => {
            const isSelected = activeId === m.id;
            return (
              <div
                className={`rc-queue__card ${isSelected ? "active" : ""}`}
                key={m.id}
                onClick={() => handleCardClick(m)}
              >
                <div className="rc-queue__top">
                  <span className="rc-queue__id">#{m.id}</span>
                  <div className="rc-queue__time">
                    <ClockCircleOutlined />
                    <span>{timeAgo(m.createdAt)}</span>
                    <Tag color="orange" style={{ margin: 0, fontSize: 10 }}>
                      Chờ duyệt
                    </Tag>
                  </div>
                </div>

                <div className="rc-queue__name-row">
                  <span className="rc-queue__name">{m.name}</span>
                  <span className="rc-queue__phone-pill">
                    <PhoneOutlined style={{ marginRight: 4 }} />
                    {m.phone}
                  </span>
                </div>

                <div className="rc-queue__addr-row">
                  <EnvironmentOutlined style={{ color: "#ef4444", marginTop: 2, flexShrink: 0 }} />
                  <span className="rc-queue__addr-text">{m.address}</span>
                </div>

                <div className="rc-queue__footer">
                  <div className="rc-queue__tags">
                    <Tag color="blue">{m.incident}</Tag>
                  </div>
                  {m.urgencyScore > 0 && (
                    <span className="rc-queue__score-badge">
                      <FireOutlined style={{ marginRight: 3 }} />
                      Điểm: {m.urgencyScore}
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