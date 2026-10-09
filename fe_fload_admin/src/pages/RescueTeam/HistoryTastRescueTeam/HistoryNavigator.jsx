import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination, Spin, Select, Tooltip } from "antd";
import {
  Shield,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Search,
  RotateCcw,
  Package,
  Layers,
  Award,
  Truck,
  ArrowRight,
  Filter,
  Users,
  Calendar,
  Eye,
  FileText,
  Flame,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import axiosInstance from "../../../../api/axiosInstance";
import "./HistoryNavigator.css";

import {
  getAllAssignments,
  getAllDistributions,
  getAllRescueTeams,
  getAllVehicles,
  getAllAidCampaigns,
  getRescueTeamMembers,
} from "../../../../api/axios/RescueApi/RescueTask";

/* ================= STATUS CONFIGURATION ================= */
const RESCUE_HISTORY_STATUS = {
  COMPLETED: {
    label: "Hoàn thành nhiệm vụ",
    badge: "Đã hoàn tất",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.35)",
    icon: <CheckCircle2 size={15} />,
  },
  REJECTED: {
    label: "Đã từ chối nhiệm vụ",
    badge: "Từ chối",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.12)",
    border: "rgba(239, 68, 68, 0.35)",
    icon: <XCircle size={15} />,
  },
};

const DISTRIBUTION_HISTORY_STATUS = {
  completed: {
    label: "Đã phân phát thành công",
    badge: "Hoàn tất trao quà",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.35)",
    icon: <CheckCircle2 size={15} />,
  },
  rejected: {
    label: "Đã tạm hoãn / hủy bỏ",
    badge: "Hủy bỏ",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.12)",
    border: "rgba(239, 68, 68, 0.35)",
    icon: <XCircle size={15} />,
  },
};

export default function HistoryNavigator() {
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

  // History data
  const [missions, setMissions] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [campaignMap, setCampaignMap] = useState({});

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

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

  /* ================= LOAD ALL HISTORY DATA ================= */
  const fetchHistoryData = async (isManual = false) => {
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

      // 3. Completed / Rejected Assignments (Lịch sử Cứu Hộ)
      try {
        const aRes = await getAllAssignments();
        const rawAssignments = aRes?.data?.items || aRes?.items || aRes?.data || aRes || [];
        const assignments = Array.isArray(rawAssignments) ? rawAssignments : [];

        // Lọc nhiệm vụ đã kết thúc (COMPLETED hoặc REJECTED)
        const myAssignments = targetTeamId
          ? assignments.filter(
              (a) => (a.rescueTeamId || a.rcid) === targetTeamId
            )
          : assignments;

        const historyAssignments = myAssignments.filter((a) => {
          const st = (a.assignmentStatus || a.status || "").toUpperCase();
          return st === "COMPLETED" || st === "REJECTED";
        });

        const mappedAssignments = await Promise.all(
          historyAssignments.map(async (a) => {
            const reqId = a.rescueRequestId || a.requestId;
            const req = reqId ? await getRequestById(reqId) : null;
            const rawStatus = (a.assignmentStatus || a.status || "COMPLETED").toUpperCase();

            return {
              id: a.assignmentId || a.id || reqId,
              assignmentId: a.assignmentId || a.id,
              requestId: reqId,
              name: req?.fullName || req?.name || "Người dân được hỗ trợ",
              phone: req?.contactPhone || req?.phone || "Chưa có SĐT",
              address: req?.address || "Khu vực ngập lụt hiện trường",
              urgency: req?.urgencyLevelName || req?.urgency || "Khẩn cấp",
              vehicle: vMap[a.vehicleId] || "Phương tiện cơ động",
              teamName: curTeam?.rcName || `Đội cứu hộ #${a.rescueTeamId}`,
              status: rawStatus,
              time: a.assignedAt
                ? new Date(a.assignedAt).toLocaleString("vi-VN")
                : "Trước đây",
              raw: a,
              requestRaw: req,
            };
          })
        );

        mappedAssignments.sort((a, b) => b.id - a.id);
        setMissions(mappedAssignments);
      } catch (err) {
        console.warn("Load assignments history failed:", err);
        setMissions([]);
      }

      // 4. Completed / Rejected Distributions (Lịch sử Cứu Trợ)
      try {
        const dRes = await getAllDistributions();
        const rawDistributions = dRes?.data?.items || dRes?.items || dRes?.data || dRes || [];
        const distributionsList = Array.isArray(rawDistributions) ? rawDistributions : [];

        const myDistributions = targetTeamId
          ? distributionsList.filter(
              (d) => (d.rescueTeamId || d.rcid) === targetTeamId
            )
          : distributionsList;

        const historyDistributions = myDistributions.filter((d) => {
          const st = (d.status || "").toLowerCase();
          return st === "completed" || st === "rejected";
        });

        const mappedDistributions = historyDistributions.map((d) => {
          const campId = d.campaignId || d.campaignID;
          const status = (d.status || "completed").toLowerCase();
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
              : "Trước đây",
            raw: d,
          };
        });

        mappedDistributions.sort((a, b) => b.distributionId - a.distributionId);
        setDistributions(mappedDistributions);
      } catch (err) {
        console.warn("Load distributions history failed:", err);
        setDistributions([]);
      }

      setLastRefreshed(new Date());
    } catch (err) {
      console.error("HistoryNavigator fetchHistoryData Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, [selectedTeamId]);

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
          (item.id && String(item.id).includes(q)) ||
          (item.distributionId && String(item.distributionId).includes(q))
        );
      });
    }

    return result;
  }, [currentList, statusFilter, searchQuery]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Statistics for summary strip
  const stats = useMemo(() => {
    const completedMissions = missions.filter((m) => m.status === "COMPLETED").length;
    const rejectedMissions = missions.filter((m) => m.status === "REJECTED").length;
    const completedDist = distributions.filter((d) => d.status === "completed").length;
    const totalMissions = missions.length;
    const rate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 100;

    return {
      completedMissions,
      rejectedMissions,
      completedDist,
      totalMissions,
      successRate: rate,
    };
  }, [missions, distributions]);

  return (
    <div className="historyNavigator">
      {/* 1. HERO OPERATIONAL BANNER */}
      <section className="histNav__hero">
        <div className="histNav__hero-glow histNav__hero-glow--1" />
        <div className="histNav__hero-glow histNav__hero-glow--2" />

        <div className="histNav__hero-inner">
          <div className="histNav__team-info">
            <div className="team-badge-icon">
              <Award size={34} />
              <span className="live-pulse-dot live-pulse-dot--gold" title="Hồ sơ lịch sử tác chiến" />
            </div>

            <div className="team-text-group">
              <div className="team-status-row">
                <span className="operational-badge">
                  <span className="pulse-point" /> HỒ SƠ TÁC CHIẾN LỊCH SỬ
                </span>
                <span className="team-code-badge">
                  <Flame size={12} /> {teamInfo?.rcName || "ĐỘI CỨU HỘ KHẨN CẤP"}
                </span>
              </div>

              <h1 className="hero-main-title">
                Nhật Ký & Báo Cáo Chiến Dịch Đã Hoàn Thành
              </h1>

              <div className="hero-sub-meta">
                <span className="meta-pill">
                  <Phone size={13} /> Trực ban:{" "}
                  <strong>{teamInfo?.rcPhone || teamInfo?.contactPhone || user.phone || "114"}</strong>
                </span>
                <span className="meta-separator">•</span>
                <span className="meta-pill">
                  <MapPin size={13} /> Địa bàn:{" "}
                  <strong>{teamInfo?.areaId ? `Vùng lũ #${teamInfo.areaId}` : "Toàn địa bàn"}</strong>
                </span>
                <span className="meta-separator">•</span>
                <span className="meta-pill">
                  <Clock size={13} /> Đồng bộ lúc:{" "}
                  <span>{lastRefreshed.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="histNav__hero-actions">
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
              onClick={() => fetchHistoryData(true)}
              title="Làm mới lịch sử tác chiến"
            >
              <RotateCcw size={15} />
              <span>Đồng bộ</span>
            </button>
          </div>
        </div>

        {/* SUMMARY STATS BAR */}
        <div className="histNav__stat-strip">
          <div className="stat-strip-box">
            <span className="stat-strip-title">Ca cứu nạn hoàn thành</span>
            <span className="stat-strip-value text-green">{stats.completedMissions} ca</span>
          </div>
          <div className="stat-strip-box">
            <span className="stat-strip-title">Đợt cứu trợ đã trao quà</span>
            <span className="stat-strip-value text-purple">{stats.completedDist} đợt</span>
          </div>
          <div className="stat-strip-box">
            <span className="stat-strip-title">Tỉ lệ hoàn tất tác chiến</span>
            <span className="stat-strip-value text-cyan">{stats.successRate}%</span>
          </div>
          <div className="stat-strip-box">
            <span className="stat-strip-title">Phương tiện đã phục vụ</span>
            <span className="stat-strip-value text-amber">{Object.keys(vehicleMap).length || 1} xe / thuyền</span>
          </div>
        </div>
      </section>

      {/* 2. DUAL ACTION TABS (Lịch Sử Cứu Hộ vs Lịch Sử Cứu Trợ) */}
      <section className="histNav__tabs-section">
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
              <span className="tab-pill-title">Lịch Sử Cứu Hộ Nạn Nhân</span>
              <span className="tab-pill-subtitle">Các ca cứu hộ đã hoàn tất hoặc xử lý xong</span>
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
              <span className="tab-pill-title">Lịch Sử Phân Phát Cứu Trợ</span>
              <span className="tab-pill-subtitle">Các đợt trao quà, nhu yếu phẩm hoàn thành</span>
            </div>
            <span className="tab-pill-badge">{distributions.length}</span>
          </button>
        </div>
      </section>

      {/* 3. TOOLBAR: SEARCH & STATUS FILTER CHIPS */}
      <section className="histNav__toolbar">
        <div className="toolbar-search-wrap">
          <Search size={18} className="search-icon-left" />
          <input
            type="text"
            className="modern-search-input"
            placeholder={
              activeTab === "mission"
                ? "Tìm theo họ tên nạn nhân, số điện thoại, địa bàn, phương tiện, mã ca..."
                : "Tìm theo tên chiến dịch cứu trợ, địa điểm trao quà, mã đợt..."
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
            <Filter size={14} /> Lọc kết quả:
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
                className={`filter-chip filter-chip--completed ${statusFilter === "COMPLETED" ? "filter-chip--active" : ""}`}
                onClick={() => {
                  setStatusFilter("COMPLETED");
                  setCurrentPage(1);
                }}
              >
                Hoàn thành ({stats.completedMissions})
              </button>
              <button
                className={`filter-chip filter-chip--rejected ${statusFilter === "REJECTED" ? "filter-chip--active" : ""}`}
                onClick={() => {
                  setStatusFilter("REJECTED");
                  setCurrentPage(1);
                }}
              >
                Đã từ chối ({stats.rejectedMissions})
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
                className={`filter-chip filter-chip--completed ${statusFilter === "completed" ? "filter-chip--active" : ""}`}
                onClick={() => {
                  setStatusFilter("completed");
                  setCurrentPage(1);
                }}
              >
                Đã phát xong ({stats.completedDist})
              </button>
              <button
                className={`filter-chip filter-chip--rejected ${statusFilter === "rejected" ? "filter-chip--active" : ""}`}
                onClick={() => {
                  setStatusFilter("rejected");
                  setCurrentPage(1);
                }}
              >
                Đã hủy / Hoãn ({distributions.filter((d) => d.status === "rejected").length})
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
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </section>

      {/* 4. HISTORY CARDS LIST */}
      <section className="histNav__list-wrapper">
        <div className="list-meta-header">
          <div className="list-title-box">
            <h2>
              {activeTab === "mission"
                ? "Danh Sách Ca Cứu Hộ Đã Kết Thúc"
                : "Danh Sách Các Đợt Cứu Trợ Đã Hoàn Tất"}
            </h2>
            <span className="badge-count-records">
              {filteredItems.length} hồ sơ
            </span>
          </div>

          <div className="list-header-shortcuts">
            <button
              className="shortcut-link-btn"
              onClick={() => navigate("/rescueTeam")}
            >
              <ArrowLeft size={14} /> Về bảng nhận lệnh
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
          <div className="histNav__loading">
            <Spin size="large" />
            <p>Đang tải dữ liệu hồ sơ lịch sử...</p>
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="histNav__empty">
            <div className="empty-shield-icon">
              <Award size={44} />
            </div>
            <h3>Chưa có dữ liệu lịch sử phù hợp</h3>
            <p>
              {searchQuery || statusFilter !== "ALL"
                ? "Không tìm thấy hồ sơ phù hợp với bộ lọc hiện tại. Hãy thử tìm kiếm với từ khóa khác."
                : "Đội cứu hộ chưa ghi nhận ca hoàn thành nào trong danh mục này. Khi hoàn tất các nhiệm vụ, toàn bộ hồ sơ chiến dịch sẽ lưu trữ tại đây."}
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
                onClick={() => fetchHistoryData(true)}
              >
                <RotateCcw size={14} /> Làm mới lịch sử
              </button>
            </div>
          </div>
        ) : (
          <div className="history-cards-grid">
            {activeTab === "mission"
              ? paginatedItems.map((m) => {
                  const statusConf =
                    RESCUE_HISTORY_STATUS[m.status] || RESCUE_HISTORY_STATUS.COMPLETED;
                  const isSuccess = m.status === "COMPLETED";

                  return (
                    <div
                      key={m.id}
                      className={`history-card ${isSuccess ? "history-card--success" : "history-card--rejected"}`}
                      onClick={() => navigate(`/rescueTeam/history/${m.id}`)}
                    >
                      {/* Top Header */}
                      <div className="history-card__header">
                        <div className="history-card__id">
                          <span className="id-tag">
                            <Shield size={12} /> HỒ SƠ #{m.id}
                          </span>
                        </div>

                        <div
                          className="history-card__status-pill"
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
                      <div className="history-card__person-block">
                        <div className={`person-avatar-circle ${!isSuccess ? "person-avatar-circle--rejected" : ""}`}>
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="person-details">
                          <h3 className="person-fullname">{m.name}</h3>
                          <a
                            href={`tel:${m.phone}`}
                            className="person-phone-link"
                            onClick={(e) => e.stopPropagation()}
                            title="Bấm để liên hệ lại"
                          >
                            <Phone size={13} />
                            <span>{m.phone}</span>
                          </a>
                        </div>
                        <div className="urgency-pill">
                          <Flame size={12} /> {m.urgency}
                        </div>
                      </div>

                      {/* Address */}
                      <div className="history-card__location">
                        <MapPin size={16} className="loc-pin" />
                        <span className="loc-text">{m.address}</span>
                      </div>

                      {/* Team & Vehicle Tags */}
                      <div className="history-card__resources">
                        <div className="resource-tag resource-tag--vehicle">
                          <Truck size={13} />
                          <span>{m.vehicle}</span>
                        </div>
                        <div className="resource-tag resource-tag--time">
                          <Clock size={13} />
                          <span>Thời gian: {m.time}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="history-card__actions">
                        <button
                          className="btn-action-primary btn-action-detail"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/rescueTeam/history/${m.id}`);
                          }}
                        >
                          <FileText size={15} />
                          <span>Hồ sơ chi tiết</span>
                        </button>

                        <button
                          className="btn-action-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/rescueTeam/mission/${m.id}`);
                          }}
                          title="Xem yêu cầu cứu nạn gốc"
                        >
                          <Eye size={15} />
                          <span>Yêu cầu gốc</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              : paginatedItems.map((d) => {
                  const statusConf =
                    DISTRIBUTION_HISTORY_STATUS[d.status] ||
                    DISTRIBUTION_HISTORY_STATUS.completed;
                  const isSuccess = d.status === "completed";

                  return (
                    <div
                      key={d.distributionId}
                      className="history-card history-card--relief"
                      onClick={() => navigate(`/rescueTeam/chi-tiet-tro/${d.distributionId}`)}
                    >
                      {/* Top Header */}
                      <div className="history-card__header">
                        <div className="history-card__id">
                          <span className="id-tag id-tag--relief">
                            <Package size={12} /> ĐỢT CỨU TRỢ #{d.distributionId}
                          </span>
                        </div>

                        <div
                          className="history-card__status-pill"
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
                      <div className="history-card__person-block">
                        <div className="person-avatar-circle person-avatar-circle--relief">
                          <Package size={22} />
                        </div>
                        <div className="person-details">
                          <h3 className="person-fullname">{d.campaignName}</h3>
                          <span className="campaign-tag-info">Nhu yếu phẩm khẩn cấp</span>
                        </div>
                      </div>

                      {/* Distribution Address */}
                      <div className="history-card__location">
                        <MapPin size={16} className="loc-pin loc-pin--relief" />
                        <span className="loc-text">{d.address}</span>
                      </div>

                      {/* Time */}
                      <div className="history-card__resources">
                        <div className="resource-tag resource-tag--relief">
                          <Calendar size={13} />
                          <span>Ngày phân phát: {d.time}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="history-card__actions">
                        <button
                          className="btn-action-primary btn-action-relief"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/rescueTeam/chi-tiet-tro/${d.distributionId}`);
                          }}
                        >
                          <FileText size={15} />
                          <span>Chi tiết đợt phát</span>
                        </button>

                        <button
                          className="btn-action-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (d.campaignId) {
                              navigate(`/rescueTeam/cuu-tro/${d.campaignId}`);
                            }
                          }}
                        >
                          <Eye size={15} />
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
          <div className="histNav__pagination">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredItems.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showTotal={(total, range) =>
                `Hiển thị ${range[0]} - ${range[1]} trên tổng số ${total} hồ sơ lịch sử`
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}