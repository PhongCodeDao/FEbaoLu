import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Pagination,
  Spin,
  Select,
  Modal,
  Input,
  Tag,
  Tooltip,
} from "antd";
import {
  Shield,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock3,
  XCircle,
  Radio,
  Search,
  RotateCcw,
  Sparkles,
  Send,
  Navigation,
  ExternalLink,
  Users,
  Package,
  Layers,
  Award,
  Flame,
  Truck,
  ArrowRight,
  Filter,
  Check,
  Compass,
  AlertTriangle,
  FileText,
  Calendar,
  Eye,
} from "lucide-react";
import axiosInstance from "../../../../api/axiosInstance";
import AuthNotify from "../../../utils/Common/AuthNotify";
import "./TaskNavigator.css";

import {
  getAllAssignments,
  acceptRescueAssignment,
  getRescueTeamMembers,
  getAllRescueTeams,
  getAllVehicles,
  getAllDistributions,
  updateDistributionStatus,
  getAllAidCampaigns,
} from "../../../../api/axios/RescueApi/RescueTask";

/* ================= STATUS CONFIGURATION ================= */
const RESCUE_STATUS_CONFIG = {
  ASSIGNED: {
    label: "Chờ nhận lệnh",
    badge: "Mới phân công",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.35)",
    icon: <Clock3 size={14} />,
  },
  PENDING: {
    label: "Chờ nhận lệnh",
    badge: "Mới phân công",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.35)",
    icon: <Clock3 size={14} />,
  },
  ACCEPTED: {
    label: "Đã nhận lệnh",
    badge: "Đã tiếp nhận",
    color: "#0284c7",
    bg: "rgba(2, 132, 199, 0.12)",
    border: "rgba(2, 132, 199, 0.35)",
    icon: <CheckCircle2 size={14} />,
  },
  DEPARTED: {
    label: "Đã xuất phát",
    badge: "Đang trên đường",
    color: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.12)",
    border: "rgba(139, 92, 246, 0.35)",
    icon: <Truck size={14} className="pulse-icon" />,
  },
  ARRIVED: {
    label: "Đã đến hiện trường",
    badge: "Đang tác chiến",
    color: "#ec4899",
    bg: "rgba(236, 72, 153, 0.12)",
    border: "rgba(236, 72, 153, 0.35)",
    icon: <Radio size={14} className="pulse-icon" />,
  },
  COMPLETED: {
    label: "Đã hoàn thành",
    badge: "Hoàn tất",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.35)",
    icon: <Award size={14} />,
  },
  REJECTED: {
    label: "Đã từ chối",
    badge: "Từ chối",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.12)",
    border: "rgba(239, 68, 68, 0.35)",
    icon: <XCircle size={14} />,
  },
};

const DISTRIBUTION_STATUS_CONFIG = {
  pending: {
    label: "Đang chờ phát",
    badge: "Chờ triển khai",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.35)",
    icon: <Clock3 size={14} />,
  },
  "in progress": {
    label: "Đang phân phát",
    badge: "Đang phát",
    color: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.12)",
    border: "rgba(139, 92, 246, 0.35)",
    icon: <Radio size={14} className="pulse-icon" />,
  },
  accepted: {
    label: "Đã nhận đợt",
    badge: "Đã tiếp nhận",
    color: "#0284c7",
    bg: "rgba(2, 132, 199, 0.12)",
    border: "rgba(2, 132, 199, 0.35)",
    icon: <CheckCircle2 size={14} />,
  },
  completed: {
    label: "Hoàn thành phân phát",
    badge: "Đã phát xong",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.35)",
    icon: <Award size={14} />,
  },
  rejected: {
    label: "Đã hủy / Từ chối",
    badge: "Hủy bỏ",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.12)",
    border: "rgba(239, 68, 68, 0.35)",
    icon: <XCircle size={14} />,
  },
};

export default function TaskNavigator() {
  const navigate = useNavigate();

  // Active Tab: 'mission' (Cứu Hộ) | 'distribution' (Cứu Trợ)
  const [activeTab, setActiveTab] = useState("mission");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Teams & Vehicles
  const [allTeams, setAllTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);
  const [vehicleMap, setVehicleMap] = useState({});

  // Missions & Distributions data
  const [missions, setMissions] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [campaignMap, setCampaignMap] = useState({});

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Accepting state
  const [acceptingId, setAcceptingId] = useState(null);

  // Distribution status update modal
  const [distModalVisible, setDistModalVisible] = useState(false);
  const [selectedDistId, setSelectedDistId] = useState(null);
  const [distActionType, setDistActionType] = useState(""); // completed | rejected
  const [distNote, setDistNote] = useState("");
  const [submittingDist, setSubmittingDist] = useState(false);

  const user = useMemo(() => {
    try {
      return (
        JSON.parse(sessionStorage.getItem("user") || "null") ||
        JSON.parse(localStorage.getItem("user") || "null") ||
        {}
      );
    } catch {
      return {};
    }
  }, []);

  /* ================= FETCH SINGLE REQUEST HELPER ================= */
  const getRequestById = async (id) => {
    try {
      const res = await axiosInstance.get(`/api/RescueRequests/${id}`);
      return res?.data?.data || res?.data || res;
    } catch {
      return null;
    }
  };

  /* ================= RESOLVE CURRENT TEAM ================= */
  const resolveTeamId = async (teams, userId, userPhone) => {
    if (!teams || teams.length === 0) return null;

    if (userPhone) {
      const teamByPhone = teams.find(
        (t) => (t.rcPhone || t.contactPhone) === userPhone
      );
      if (teamByPhone) return teamByPhone.rcid || teamByPhone.rescueTeamId;
    }

    for (const team of teams) {
      const tid = team.rcid || team.rescueTeamId;
      try {
        const res = await getRescueTeamMembers(tid);
        const members = res?.data?.items || res?.items || res?.data || [];
        if (
          Array.isArray(members) &&
          members.some((m) => m.userId === userId || m.phone === userPhone)
        ) {
          return tid;
        }
      } catch {}
    }

    return teams[0]?.rcid || teams[0]?.rescueTeamId || null;
  };

  /* ================= LOAD ALL DATA ================= */
  const fetchData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      // 1. Teams & Vehicles
      const [teamRes, vehicleRes] = await Promise.all([
        getAllRescueTeams(),
        getAllVehicles(),
      ]);

      const teams = teamRes?.data?.items || teamRes?.items || teamRes?.data || [];
      const teamList = Array.isArray(teams) ? teams : [];
      setAllTeams(teamList);

      const vMap = {};
      const vehicles = vehicleRes?.data || vehicleRes?.items || vehicleRes || [];
      if (Array.isArray(vehicles)) {
        vehicles.forEach((v) => {
          vMap[v.vehicleId || v.id] = v.vehicleName || v.name;
        });
      }
      setVehicleMap(vMap);

      let targetTeamId = selectedTeamId;
      if (!targetTeamId) {
        targetTeamId = await resolveTeamId(teamList, user.userId, user.phone);
        setSelectedTeamId(targetTeamId);
      }

      const curTeam = teamList.find(
        (t) => (t.rcid || t.rescueTeamId) === targetTeamId
      );
      setTeamInfo(curTeam || null);

      // 2. Campaigns
      const cmap = {};
      try {
        const campaigns = await getAllAidCampaigns();
        const campList = campaigns?.data?.items || campaigns?.items || campaigns || [];
        if (Array.isArray(campList)) {
          campList.forEach((c) => {
            const cid = c.campaignID || c.campaignId || c.id;
            if (cid) cmap[cid] = c;
          });
        }
      } catch {}
      setCampaignMap(cmap);

      // 3. Assignments (Nhiệm vụ Cứu Hộ)
      try {
        const aRes = await getAllAssignments();
        const rawAssignments = aRes?.data?.items || aRes?.items || aRes?.data || aRes || [];
        const assignments = Array.isArray(rawAssignments) ? rawAssignments : [];

        // Lọc nhiệm vụ đang hoạt động của đội
        const myAssignments = targetTeamId
          ? assignments.filter(
              (a) => (a.rescueTeamId || a.rcid) === targetTeamId
            )
          : assignments;

        // Bỏ các ca đã completed / rejected khỏi danh sách tác chiến trực tiếp
        const activeAssignments = myAssignments.filter((a) => {
          const st = (a.assignmentStatus || a.status || "").toUpperCase();
          return st !== "COMPLETED" && st !== "REJECTED";
        });

        const mappedAssignments = await Promise.all(
          activeAssignments.map(async (a) => {
            const reqId = a.rescueRequestId || a.requestId;
            const req = reqId ? await getRequestById(reqId) : null;
            const rawStatus = (a.assignmentStatus || a.status || "ASSIGNED").toUpperCase();

            return {
              id: a.assignmentId || a.id || reqId,
              assignmentId: a.assignmentId || a.id,
              requestId: reqId,
              name: req?.fullName || req?.name || "Người dân cần cứu nạn",
              phone: req?.contactPhone || req?.phone || "Chưa có SĐT",
              address: req?.address || "Khu vực ngập lụt hiện trường",
              urgency: req?.urgencyLevelName || req?.urgency || "Khẩn cấp",
              vehicle: vMap[a.vehicleId] || "Phương tiện cơ động",
              teamName: curTeam?.rcName || `Đội cứu hộ #${a.rescueTeamId}`,
              status: rawStatus,
              time: a.assignedAt
                ? new Date(a.assignedAt).toLocaleString("vi-VN")
                : "Vừa nhận lệnh",
              raw: a,
              requestRaw: req,
            };
          })
        );

        mappedAssignments.sort((a, b) => b.id - a.id);
        setMissions(mappedAssignments);
      } catch (err) {
        console.warn("Load assignments failed:", err);
        setMissions([]);
      }

      // 4. Distributions (Nhiệm vụ Cứu Trợ)
      try {
        const dRes = await getAllDistributions();
        const rawDistributions = dRes?.data?.items || dRes?.items || dRes?.data || dRes || [];
        const distributionsList = Array.isArray(rawDistributions) ? rawDistributions : [];

        const myDistributions = targetTeamId
          ? distributionsList.filter(
              (d) => (d.rescueTeamId || d.rcid) === targetTeamId
            )
          : distributionsList;

        const mappedDistributions = myDistributions.map((d) => {
          const campId = d.campaignId || d.campaignID;
          const status = (d.status || "pending").toLowerCase();
          return {
            distributionId: d.distributionId || d.id,
            campaignId: campId,
            campaignName:
              cmap[campId]?.campaignName ||
              d.campaignName ||
              "Chiến dịch cứu trợ khẩn cấp",
            status,
            address: d.distributionLocation || d.address || "Khu vực dân cư chịu ảnh hưởng",
            time: d.distributedAt
              ? new Date(d.distributedAt).toLocaleString("vi-VN")
              : "Hôm nay",
            raw: d,
          };
        });

        mappedDistributions.sort((a, b) => b.distributionId - a.distributionId);
        setDistributions(mappedDistributions);
      } catch (err) {
        console.warn("Load distributions failed:", err);
        setDistributions([]);
      }

      setLastRefreshed(new Date());
    } catch (err) {
      console.error("TaskNavigator fetchData Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTeamId]);

  /* ================= ACCEPT RESCUE MISSION ================= */
  const handleAcceptMission = async (id) => {
    try {
      setAcceptingId(id);
      await acceptRescueAssignment(id);

      AuthNotify.success(
        "Nhận nhiệm vụ thành công!",
        "Đội của bạn đã tiếp nhận ca cứu nạn. Đang chuyển vào trang tác chiến..."
      );

      // Cập nhật state nội bộ
      setMissions((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "ACCEPTED" } : m))
      );

      setTimeout(() => {
        navigate(`/rescueTeam/dangcuho/${id}`);
      }, 700);
    } catch (err) {
      AuthNotify.error(
        "Không thể nhận nhiệm vụ",
        err?.message || "Vui lòng thử lại sau"
      );
    } finally {
      setAcceptingId(null);
    }
  };

  /* ================= UPDATE DISTRIBUTION MODAL ================= */
  const openDistModal = (id, type) => {
    setSelectedDistId(id);
    setDistActionType(type);
    setDistNote("");
    setDistModalVisible(true);
  };

  const handleUpdateDistributionStatus = async () => {
    if (!selectedDistId) return;
    try {
      setSubmittingDist(true);
      await updateDistributionStatus(selectedDistId, {
        status: distActionType,
        note: distNote || (distActionType === "completed" ? "Đã phát quà thành công" : "Tạm hoãn"),
      });

      AuthNotify.success(
        distActionType === "completed"
          ? "Hoàn thành đợt cứu trợ"
          : "Đã cập nhật trạng thái cứu trợ",
        "Dữ liệu đã được đồng bộ lên hệ thống"
      );

      setDistModalVisible(false);
      fetchData(true);
    } catch (err) {
      AuthNotify.error("Cập nhật thất bại", err?.message || "");
    } finally {
      setSubmittingDist(false);
    }
  };

  /* ================= FILTERED & PAGINATED ITEMS ================= */
  const currentList = activeTab === "mission" ? missions : distributions;

  const filteredItems = useMemo(() => {
    let result = currentList;

    // Filter by status
    if (statusFilter !== "ALL") {
      result = result.filter((item) => {
        const itemStatus = (item.status || "").toUpperCase();
        return itemStatus === statusFilter.toUpperCase();
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        return (
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.phone && item.phone.includes(q)) ||
          (item.address && item.address.toLowerCase().includes(q)) ||
          (item.campaignName && item.campaignName.toLowerCase().includes(q)) ||
          (item.vehicle && item.vehicle.toLowerCase().includes(q)) ||
          (item.id && String(item.id).includes(q))
        );
      });
    }

    return result;
  }, [currentList, statusFilter, searchQuery]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Statistics for top summary
  const missionCounts = useMemo(() => {
    return {
      total: missions.length,
      assigned: missions.filter((m) => m.status === "ASSIGNED" || m.status === "PENDING").length,
      accepted: missions.filter((m) => m.status === "ACCEPTED").length,
      enroute: missions.filter((m) => m.status === "DEPARTED" || m.status === "ARRIVED").length,
    };
  }, [missions]);

  const distributionCounts = useMemo(() => {
    return {
      total: distributions.length,
      pending: distributions.filter((d) => d.status === "pending").length,
      inProgress: distributions.filter((d) => d.status === "in progress" || d.status === "accepted").length,
      completed: distributions.filter((d) => d.status === "completed").length,
    };
  }, [distributions]);

  return (
    <div className="taskNavigator">
      {/* 1. HERO OPERATIONAL BANNER */}
      <section className="taskNav__hero">
        <div className="taskNav__hero-glow taskNav__hero-glow--1" />
        <div className="taskNav__hero-glow taskNav__hero-glow--2" />

        <div className="taskNav__hero-inner">
          <div className="taskNav__team-info">
            <div className="team-badge-icon">
              <Shield size={32} />
              <span className="live-pulse-dot" title="Hệ thống trực chiến 24/7" />
            </div>

            <div className="team-text-group">
              <div className="team-status-row">
                <span className="operational-badge">
                  <span className="pulse-point" /> TRỰC CHIẾN TIỀN TUYẾN 24/7
                </span>
                <span className="team-code-badge">
                  <Flame size={12} /> {teamInfo?.rcName || "ĐỘI CỨU HỘ KHẨN CẤP"}
                </span>
              </div>

              <h1 className="hero-main-title">
                Trung Tâm Tiếp Nhận Lệnh & Tác Chiến Cứu Nạn
              </h1>

              <div className="hero-sub-meta">
                <span className="meta-pill">
                  <Phone size={13} /> Hotline trực ban:{" "}
                  <strong>{teamInfo?.rcPhone || teamInfo?.contactPhone || user.phone || "114"}</strong>
                </span>
                <span className="meta-separator">•</span>
                <span className="meta-pill">
                  <MapPin size={13} /> Địa bàn:{" "}
                  <strong>{teamInfo?.areaId ? `Vùng lũ #${teamInfo.areaId}` : "Toàn địa bàn"}</strong>
                </span>
                <span className="meta-separator">•</span>
                <span className="meta-pill">
                  <Clock size={13} /> Cập nhật lúc:{" "}
                  <span>{lastRefreshed.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="taskNav__hero-actions">
            {allTeams.length > 1 && (
              <div className="team-select-pill">
                <Users size={14} className="icon-team" />
                <Select
                  value={selectedTeamId}
                  onChange={(val) => {
                    setSelectedTeamId(val);
                    setCurrentPage(1);
                  }}
                  className="team-select-dropdown"
                  options={allTeams.map((t) => ({
                    label: t.rcName || t.teamName || `Đội #${t.rcid || t.rescueTeamId}`,
                    value: t.rcid || t.rescueTeamId,
                  }))}
                />
              </div>
            )}

            <button
              className={`btn-hero-refresh ${refreshing ? "btn-hero-refresh--active" : ""}`}
              onClick={() => fetchData(true)}
              title="Làm mới dữ liệu tác chiến"
            >
              <RotateCcw size={15} />
              <span>Đồng bộ</span>
            </button>
          </div>
        </div>

        {/* SUMMARY STATS BAR */}
        <div className="taskNav__stat-strip">
          <div className="stat-strip-box">
            <span className="stat-strip-title">Nhiệm vụ cứu hộ đang chờ</span>
            <span className="stat-strip-value text-amber">{missionCounts.assigned}</span>
          </div>
          <div className="stat-strip-box">
            <span className="stat-strip-title">Đang triển khai tác chiến</span>
            <span className="stat-strip-value text-cyan">{missionCounts.accepted + missionCounts.enroute}</span>
          </div>
          <div className="stat-strip-box">
            <span className="stat-strip-title">Đợt cứu trợ lương thực</span>
            <span className="stat-strip-value text-green">{distributionCounts.total}</span>
          </div>
          <div className="stat-strip-box">
            <span className="stat-strip-title">Phương tiện sẵn sàng</span>
            <span className="stat-strip-value text-purple">{Object.keys(vehicleMap).length || 1} xe / thuyền</span>
          </div>
        </div>
      </section>

      {/* 2. DUAL ACTION TABS (Cứu Hộ vs Cứu Trợ) */}
      <section className="taskNav__tabs-section">
        <div className="tab-pill-container">
          <button
            className={`tab-pill-btn ${activeTab === "mission" ? "tab-pill-btn--active" : ""}`}
            onClick={() => {
              setActiveTab("mission");
              setStatusFilter("ALL");
              setCurrentPage(1);
            }}
          >
            <div className="tab-pill-icon tab-pill-icon--rescue">
              <Shield size={20} />
            </div>
            <div className="tab-pill-info">
              <span className="tab-pill-title">Nhiệm Vụ Cứu Hộ Khẩn Cấp</span>
              <span className="tab-pill-subtitle">Ứng cứu nạn nhân, di dời vùng lũ</span>
            </div>
            <span className="tab-pill-badge">{missions.length}</span>
          </button>

          <button
            className={`tab-pill-btn ${activeTab === "distribution" ? "tab-pill-btn--active" : ""}`}
            onClick={() => {
              setActiveTab("distribution");
              setStatusFilter("ALL");
              setCurrentPage(1);
            }}
          >
            <div className="tab-pill-icon tab-pill-icon--relief">
              <Package size={20} />
            </div>
            <div className="tab-pill-info">
              <span className="tab-pill-title">Nhiệm Vụ Cứu Trợ Nhu Yếu Phẩm</span>
              <span className="tab-pill-subtitle">Phân phát lương thực, nước sạch & thuốc</span>
            </div>
            <span className="tab-pill-badge">{distributions.length}</span>
          </button>
        </div>
      </section>

      {/* 3. TOOLBAR: SEARCH & STATUS FILTER PILLS */}
      <section className="taskNav__toolbar">
        <div className="toolbar-search-wrap">
          <Search size={18} className="search-icon-left" />
          <input
            type="text"
            className="modern-search-input"
            placeholder={
              activeTab === "mission"
                ? "Tìm theo họ tên nạn nhân, SĐT, vị trí ngập lũ, phương tiện..."
                : "Tìm theo tên chiến dịch cứu trợ, địa điểm phân phát..."
            }
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchQuery && (
            <button
              className="btn-clear-query"
              onClick={() => setSearchQuery("")}
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="toolbar-filter-chips">
          <span className="chips-label">
            <Filter size={14} /> Lọc nhanh:
          </span>

          {activeTab === "mission" ? (
            <>
              <button
                className={`filter-chip ${statusFilter === "ALL" ? "filter-chip--active" : ""}`}
                onClick={() => {
                  setStatusFilter("ALL");
                  setCurrentPage(1);
                }}
              >
                Tất cả ({missions.length})
              </button>
              <button
                className={`filter-chip filter-chip--pending ${statusFilter === "ASSIGNED" ? "filter-chip--active" : ""}`}
                onClick={() => {
                  setStatusFilter("ASSIGNED");
                  setCurrentPage(1);
                }}
              >
                Chờ nhận ({missionCounts.assigned})
              </button>
              <button
                className={`filter-chip filter-chip--accepted ${statusFilter === "ACCEPTED" ? "filter-chip--active" : ""}`}
                onClick={() => {
                  setStatusFilter("ACCEPTED");
                  setCurrentPage(1);
                }}
              >
                Đã tiếp nhận ({missionCounts.accepted})
              </button>
              <button
                className={`filter-chip filter-chip--departed ${statusFilter === "DEPARTED" ? "filter-chip--active" : ""}`}
                onClick={() => {
                  setStatusFilter("DEPARTED");
                  setCurrentPage(1);
                }}
              >
                Đang xuất phát ({missions.filter((m) => m.status === "DEPARTED").length})
              </button>
              <button
                className={`filter-chip filter-chip--arrived ${statusFilter === "ARRIVED" ? "filter-chip--active" : ""}`}
                onClick={() => {
                  setStatusFilter("ARRIVED");
                  setCurrentPage(1);
                }}
              >
                Đang tại hiện trường ({missions.filter((m) => m.status === "ARRIVED").length})
              </button>
            </>
          ) : (
            <>
              <button
                className={`filter-chip ${statusFilter === "ALL" ? "filter-chip--active" : ""}`}
                onClick={() => {
                  setStatusFilter("ALL");
                  setCurrentPage(1);
                }}
              >
                Tất cả ({distributions.length})
              </button>
              <button
                className={`filter-chip filter-chip--pending ${statusFilter === "pending" ? "filter-chip--active" : ""}`}
                onClick={() => {
                  setStatusFilter("pending");
                  setCurrentPage(1);
                }}
              >
                Đang chờ ({distributionCounts.pending})
              </button>
              <button
                className={`filter-chip filter-chip--accepted ${statusFilter === "in progress" ? "filter-chip--active" : ""}`}
                onClick={() => {
                  setStatusFilter("in progress");
                  setCurrentPage(1);
                }}
              >
                Đang phát ({distributionCounts.inProgress})
              </button>
              <button
                className={`filter-chip filter-chip--arrived ${statusFilter === "completed" ? "filter-chip--active" : ""}`}
                onClick={() => {
                  setStatusFilter("completed");
                  setCurrentPage(1);
                }}
              >
                Đã phát xong ({distributionCounts.completed})
              </button>
            </>
          )}

          {(statusFilter !== "ALL" || searchQuery) && (
            <button
              className="filter-chip-reset"
              onClick={() => {
                setStatusFilter("ALL");
                setSearchQuery("");
                setCurrentPage(1);
              }}
            >
              Đặt lại
            </button>
          )}
        </div>
      </section>

      {/* 4. MISSION CARDS MAIN LIST */}
      <section className="taskNav__list-wrapper">
        <div className="list-meta-header">
          <div className="list-title-box">
            <h2>
              {activeTab === "mission"
                ? "Danh Sách Nhiệm Vụ Cứu Hộ Tiền Tuyến"
                : "Danh Sách Các Đợt Phân Phát Lương Thực Cứu Trợ"}
            </h2>
            <span className="badge-count-records">
              {filteredItems.length} nhiệm vụ
            </span>
          </div>

          <div className="list-header-shortcuts">
            <button
              className="shortcut-link-btn"
              onClick={() => navigate("/rescueTeam/history")}
            >
              <Clock size={14} /> Xem lịch sử hoàn thành
            </button>
            <button
              className="shortcut-link-btn"
              onClick={() => navigate("/rescueTeam/dashboard-task")}
            >
              <Layers size={14} /> Thống kê phân tích
            </button>
          </div>
        </div>

        {loading ? (
          <div className="taskNav__loading">
            <Spin size="large" />
            <p>Đang đồng bộ dữ liệu tác chiến thực địa...</p>
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="taskNav__empty">
            <div className="empty-shield-icon">
              <Shield size={44} />
            </div>
            <h3>Hiện tại chưa có nhiệm vụ nào cần xử lý</h3>
            <p>
              {searchQuery || statusFilter !== "ALL"
                ? "Không tìm thấy kết quả phù hợp với bộ lọc hiện tại. Thử chọn lại hoặc xóa bộ lọc."
                : "Đội cứu hộ đang trong trạng thái sẵn sàng. Khi có người dân gửi yêu cầu hoặc điều phối viên phân công, nhiệm vụ sẽ hiển thị ngay tại đây."}
            </p>
            <div className="empty-actions">
              {(searchQuery || statusFilter !== "ALL") && (
                <button
                  className="btn-empty-clear"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setSearchQuery("");
                  }}
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              )}
              <button
                className="btn-empty-refresh"
                onClick={() => fetchData(true)}
              >
                <RotateCcw size={14} /> Làm mới danh sách
              </button>
            </div>
          </div>
        ) : (
          <div className="mission-cards-grid">
            {activeTab === "mission"
              ? paginatedItems.map((m) => {
                  const statusConf =
                    RESCUE_STATUS_CONFIG[m.status] || RESCUE_STATUS_CONFIG.ASSIGNED;
                  const isAssigned = m.status === "ASSIGNED" || m.status === "PENDING";
                  const isAcceptingThis = acceptingId === m.id;

                  return (
                    <div
                      key={m.id}
                      className="mission-card"
                      onClick={() => navigate(`/rescueTeam/mission/${m.id}`)}
                    >
                      {/* Top Header */}
                      <div className="mission-card__header">
                        <div className="mission-card__id">
                          <span className="id-tag">
                            <Shield size={12} /> NHIỆM VỤ #{m.id}
                          </span>
                        </div>

                        <div
                          className="mission-card__status-pill"
                          style={{
                            color: statusConf.color,
                            background: statusConf.bg,
                            borderColor: statusConf.border,
                          }}
                        >
                          {statusConf.icon}
                          <span>{statusConf.badge}</span>
                        </div>
                      </div>

                      {/* Caller / Victim Info */}
                      <div className="mission-card__person-block">
                        <div className="person-avatar-circle">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="person-details">
                          <h3 className="person-fullname">{m.name}</h3>
                          <a
                            href={`tel:${m.phone}`}
                            className="person-phone-link"
                            onClick={(e) => e.stopPropagation()}
                            title="Bấm để gọi cấp cứu"
                          >
                            <Phone size={13} />
                            <span>{m.phone}</span>
                          </a>
                        </div>
                        <div className="urgency-pill">
                          <Flame size={12} /> {m.urgency}
                        </div>
                      </div>

                      {/* Address with Google Map prompt */}
                      <div className="mission-card__location">
                        <MapPin size={16} className="loc-pin" />
                        <span className="loc-text">{m.address}</span>
                      </div>

                      {/* Team & Vehicle Tags */}
                      <div className="mission-card__resources">
                        <div className="resource-tag resource-tag--vehicle">
                          <Truck size={13} />
                          <span>{m.vehicle}</span>
                        </div>
                        <div className="resource-tag resource-tag--time">
                          <Clock size={13} />
                          <span>{m.time}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mission-card__actions">
                        {isAssigned ? (
                          <button
                            className="btn-action-primary btn-action-accept"
                            disabled={isAcceptingThis}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptMission(m.id);
                            }}
                          >
                            {isAcceptingThis ? (
                              <Spin size="small" />
                            ) : (
                              <>
                                <Check size={16} />
                                <span>Nhận nhiệm vụ</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            className="btn-action-primary btn-action-enroute"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/rescueTeam/dangcuho/${m.id}`);
                            }}
                          >
                            <Compass size={16} className="pulse-icon" />
                            <span>Tác chiến tại hiện trường</span>
                          </button>
                        )}

                        <button
                          className="btn-action-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/rescueTeam/mission/${m.id}`);
                          }}
                          title="Xem toàn bộ hồ sơ chi tiết"
                        >
                          <Eye size={15} />
                          <span>Hồ sơ</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              : paginatedItems.map((d) => {
                  const statusConf =
                    DISTRIBUTION_STATUS_CONFIG[d.status] ||
                    DISTRIBUTION_STATUS_CONFIG.pending;
                  const canViewProcess = ["accepted", "in progress", "completed"].includes(d.status);

                  return (
                    <div
                      key={d.distributionId}
                      className="mission-card mission-card--relief"
                      onClick={() => {
                        if (canViewProcess) {
                          navigate(`/rescueTeam/chi-tiet-tro/${d.distributionId}`);
                        }
                      }}
                    >
                      {/* Top Header */}
                      <div className="mission-card__header">
                        <div className="mission-card__id">
                          <span className="id-tag id-tag--relief">
                            <Package size={12} /> ĐỢT CỨU TRỢ #{d.distributionId}
                          </span>
                        </div>

                        <div
                          className="mission-card__status-pill"
                          style={{
                            color: statusConf.color,
                            background: statusConf.bg,
                            borderColor: statusConf.border,
                          }}
                        >
                          {statusConf.icon}
                          <span>{statusConf.badge}</span>
                        </div>
                      </div>

                      {/* Campaign Box */}
                      <div className="mission-card__person-block">
                        <div className="person-avatar-circle person-avatar-circle--relief">
                          <Package size={22} />
                        </div>
                        <div className="person-details">
                          <h3 className="person-fullname">{d.campaignName}</h3>
                          <span className="campaign-tag-info">Nhu yếu phẩm khẩn cấp</span>
                        </div>
                      </div>

                      {/* Distribution Address */}
                      <div className="mission-card__location">
                        <MapPin size={16} className="loc-pin loc-pin--relief" />
                        <span className="loc-text">{d.address}</span>
                      </div>

                      {/* Time */}
                      <div className="mission-card__resources">
                        <div className="resource-tag resource-tag--relief">
                          <Calendar size={13} />
                          <span>Thời gian: {d.time}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mission-card__actions">
                        {canViewProcess ? (
                          <button
                            className="btn-action-primary btn-action-relief"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/rescueTeam/chi-tiet-tro/${d.distributionId}`);
                            }}
                          >
                            <Send size={15} />
                            <span>Tiến hành phát hàng</span>
                          </button>
                        ) : (
                          <button
                            className="btn-action-primary btn-action-relief"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDistModal(d.distributionId, "in progress");
                            }}
                          >
                            <Check size={15} />
                            <span>Bắt đầu đợt phát</span>
                          </button>
                        )}

                        <button
                          className="btn-action-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (d.campaignId) {
                              navigate(`/rescueTeam/cuu-tro/${d.campaignId}`);
                            }
                          }}
                        >
                          <FileText size={15} />
                          <span>Chiến dịch</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
          </div>
        )}

        {/* PAGINATION */}
        {filteredItems.length > pageSize && (
          <div className="taskNav__pagination">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredItems.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showTotal={(total, range) =>
                `Hiển thị ${range[0]} - ${range[1]} trên tổng số ${total} nhiệm vụ`
              }
            />
          </div>
        )}
      </section>

      {/* 5. MODAL: UPDATE DISTRIBUTION STATUS */}
      <Modal
        title={
          <div className="modal-dist-header">
            <Package size={20} className="text-amber" />
            <span>Cập nhật trạng thái đợt cứu trợ</span>
          </div>
        }
        open={distModalVisible}
        onCancel={() => setDistModalVisible(false)}
        onOk={handleUpdateDistributionStatus}
        confirmLoading={submittingDist}
        okText="Lưu trạng thái"
        cancelText="Hủy"
        centered
        className="modern-dist-modal"
      >
        <div className="modal-dist-content">
          <p className="dist-modal-desc">
            Chọn trạng thái mới cho đợt cứu trợ #{selectedDistId}:
          </p>
          <div className="dist-status-options">
            <button
              className={`status-btn-opt ${distActionType === "in progress" ? "active" : ""}`}
              onClick={() => setDistActionType("in progress")}
            >
              <Radio size={16} /> Đang phát hàng
            </button>
            <button
              className={`status-btn-opt ${distActionType === "completed" ? "active" : ""}`}
              onClick={() => setDistActionType("completed")}
            >
              <Award size={16} /> Hoàn tất phân phát
            </button>
            <button
              className={`status-btn-opt ${distActionType === "rejected" ? "active" : ""}`}
              onClick={() => setDistActionType("rejected")}
            >
              <XCircle size={16} /> Hủy đợt này
            </button>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Ghi chú thực địa:
            </label>
            <Input.TextArea
              rows={3}
              placeholder="Ghi chú số lượng đã phát, hộ dân nhận hoặc khó khăn thực tế..."
              value={distNote}
              onChange={(e) => setDistNote(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}