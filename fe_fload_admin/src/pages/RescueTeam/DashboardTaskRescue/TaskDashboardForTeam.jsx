import { useEffect, useState, useMemo } from "react";
import {
  Row,
  Col,
  Progress,
  Spin,
  Pagination,
  Input,
  Select,
  Tag,
  Tooltip as AntTooltip,
} from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
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
  ChevronRight,
  Send,
  Navigation,
  ExternalLink,
  Users,
  Package,
  Layers,
  Award,
  TrendingUp,
  Flame,
  ArrowRight,
} from "lucide-react";
import axiosInstance from "../../../../api/axiosInstance";
import "./TaskDashboardForTeam.css";

import {
  getAllAssignments,
  getAllRescueTeams,
  getRescueTeamMembers,
  getAllDistributions,
  getAllAidCampaigns,
} from "../../../../api/axios/RescueApi/RescueTask";

/* ================= STATUS MAP & COLORS ================= */
const STATUS_CONFIG = {
  pending: {
    label: "Đang chờ tiếp nhận",
    badge: "Chờ xử lý",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.3)",
    icon: <Clock3 size={15} />,
  },
  accepted: {
    label: "Đã tiếp nhận",
    badge: "Đã nhận",
    color: "#0284c7",
    bg: "rgba(2, 132, 199, 0.12)",
    border: "rgba(2, 132, 199, 0.3)",
    icon: <CheckCircle2 size={15} />,
  },
  "in progress": {
    label: "Đang triển khai",
    badge: "Đang cứu hộ",
    color: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.12)",
    border: "rgba(139, 92, 246, 0.3)",
    icon: <Radio size={15} className="pulse-icon" />,
  },
  completed: {
    label: "Hoàn thành nhiệm vụ",
    badge: "Hoàn thành",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.3)",
    icon: <Award size={15} />,
  },
  rejected: {
    label: "Từ chối / Hủy",
    badge: "Đã từ chối",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.12)",
    border: "rgba(239, 68, 68, 0.3)",
    icon: <XCircle size={15} />,
  },
};

const mapStatusVN = (status) => {
  return STATUS_CONFIG[status]?.badge || status || "Không xác định";
};

export default function TaskDashboardForTeam() {
  const [tab, setTab] = useState("assignment"); // 'assignment' | 'distribution'
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [allTeams, setAllTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);

  const [assignmentData, setAssignmentData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);

  const [assignmentPage, setAssignmentPage] = useState(1);
  const [distributionPage, setDistributionPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [distributionFilter, setDistributionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [campaignMap, setCampaignMap] = useState({});

  const pageSize = 6;
  const navigate = useNavigate();

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

  /* ================= FIND MATCHING TEAM ================= */
  const resolveTeamId = async (teams, userId, userPhone) => {
    if (!teams || teams.length === 0) return null;

    // 1. Check if team phone matches user phone
    if (userPhone) {
      const teamByPhone = teams.find(
        (t) => (t.rcPhone || t.contactPhone) === userPhone
      );
      if (teamByPhone) return teamByPhone.rcid || teamByPhone.rescueTeamId;
    }

    // 2. Check team member membership
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

    // 3. Fallback to first team so dashboard never stays empty
    return teams[0]?.rcid || teams[0]?.rescueTeamId || null;
  };

  /* ================= MAIN DATA FETCHER ================= */
  const loadData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      // 1. Fetch Rescue Teams
      const teamRes = await getAllRescueTeams();
      const teams = teamRes?.data?.items || teamRes?.items || teamRes?.data || [];
      const teamList = Array.isArray(teams) ? teams : [];
      setAllTeams(teamList);

      let targetTeamId = selectedTeamId;
      if (!targetTeamId) {
        targetTeamId = await resolveTeamId(teamList, user.userId, user.phone);
        setSelectedTeamId(targetTeamId);
      }

      const currentTeam = teamList.find(
        (t) => (t.rcid || t.rescueTeamId) === targetTeamId
      );
      setTeamInfo(currentTeam || null);

      // 2. Fetch Aid Campaigns
      let cmap = {};
      try {
        const campaigns = await getAllAidCampaigns();
        const campList = campaigns?.data?.items || campaigns?.items || campaigns || [];
        if (Array.isArray(campList)) {
          campList.forEach((c) => {
            const cid = c.campaignID || c.campaignId || c.id;
            if (cid) cmap[cid] = c;
          });
        }
      } catch (err) {
        console.warn("Could not load campaigns:", err);
      }
      setCampaignMap(cmap);

      // 3. Fetch Assignments (Nhiệm vụ cứu hộ)
      try {
        const aRes = await getAllAssignments();
        const rawAssignments = aRes?.data?.items || aRes?.items || aRes?.data || aRes || [];
        const assignments = Array.isArray(rawAssignments) ? rawAssignments : [];

        const myAssignments = targetTeamId
          ? assignments.filter(
              (a) => (a.rescueTeamId || a.rcid) === targetTeamId
            )
          : assignments;

        const aData = await Promise.all(
          myAssignments.map(async (a) => {
            const reqId = a.rescueRequestId || a.requestId;
            const req = reqId ? await getRequestById(reqId) : null;

            let status = (a.assignmentStatus || a.status || "pending").toLowerCase();
            if (status === "assigned") status = "pending";

            return {
              id: a.assignmentId || a.id || reqId,
              assignmentId: a.assignmentId || a.id,
              requestId: reqId,
              name: req?.fullName || req?.name || "Người dân cần cứu hộ",
              phone: req?.contactPhone || req?.phone || "Chưa cập nhật",
              address: req?.address || "Khu vực ngập lụt thực địa",
              urgency: req?.urgencyLevelName || req?.urgency || "Khẩn cấp",
              status,
              time: a.assignedAt
                ? new Date(a.assignedAt).toLocaleString("vi-VN")
                : "Vừa phân công",
              raw: a,
              requestRaw: req,
            };
          })
        );
        // Sắp xếp mới nhất lên đầu
        aData.sort((a, b) => b.id - a.id);
        setAssignmentData(aData);
      } catch (err) {
        console.warn("Could not load assignments:", err);
        setAssignmentData([]);
      }

      // 4. Fetch Distributions (Nhiệm vụ cứu trợ)
      try {
        const dRes = await getAllDistributions();
        const rawDistributions = dRes?.data?.items || dRes?.items || dRes?.data || dRes || [];
        const distributions = Array.isArray(rawDistributions) ? rawDistributions : [];

        const myDistributions = targetTeamId
          ? distributions.filter(
              (d) => (d.rescueTeamId || d.rcid) === targetTeamId
            )
          : distributions;

        const dData = myDistributions.map((d) => {
          const campId = d.campaignId || d.campaignID;
          return {
            distributionId: d.distributionId || d.id,
            campaignId: campId,
            campaignName:
              cmap[campId]?.campaignName ||
              d.campaignName ||
              "Chiến dịch cứu trợ khẩn cấp",
            status: (d.status || "pending").toLowerCase(),
            location: d.distributionLocation || d.address || "Khu vực phân phối",
            time: d.distributedAt
              ? new Date(d.distributedAt).toLocaleString("vi-VN")
              : "Hôm nay",
            raw: d,
          };
        });
        dData.sort((a, b) => b.distributionId - a.distributionId);
        setDistributionData(dData);
      } catch (err) {
        console.warn("Could not load distributions:", err);
        setDistributionData([]);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard loadData Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTeamId]);

  /* ================= CALCULATE STATS ================= */
  const computeStats = (items) => {
    const total = items.length;
    const pending = items.filter((x) => x.status === "pending").length;
    const accepted = items.filter((x) => x.status === "accepted").length;
    const inProgress = items.filter((x) => x.status === "in progress").length;
    const completed = items.filter((x) => x.status === "completed").length;
    const rejected = items.filter((x) => x.status === "rejected").length;
    const active = pending + accepted + inProgress;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      pending,
      accepted,
      inProgress,
      completed,
      rejected,
      active,
      successRate,
    };
  };

  const assignmentStats = useMemo(() => computeStats(assignmentData), [assignmentData]);
  const distributionStats = useMemo(() => computeStats(distributionData), [distributionData]);

  const currentStats = tab === "assignment" ? assignmentStats : distributionStats;
  const currentData = tab === "assignment" ? assignmentData : distributionData;
  const currentFilter = tab === "assignment" ? statusFilter : distributionFilter;
  const setCurrentFilter = tab === "assignment" ? setStatusFilter : setDistributionFilter;
  const currentPage = tab === "assignment" ? assignmentPage : distributionPage;
  const setCurrentPage = tab === "assignment" ? setAssignmentPage : setDistributionPage;

  /* ================= FILTERED DATA ================= */
  const filteredItems = useMemo(() => {
    let list = currentData;

    // Filter by status
    if (currentFilter !== "all") {
      list = list.filter((item) => item.status === currentFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        return (
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.phone && item.phone.includes(q)) ||
          (item.address && item.address.toLowerCase().includes(q)) ||
          (item.campaignName && item.campaignName.toLowerCase().includes(q)) ||
          (item.id && String(item.id).includes(q))
        );
      });
    }

    return list;
  }, [currentData, currentFilter, searchQuery]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  /* ================= CHART DATA ================= */
  const chartData = useMemo(() => {
    const raw = [
      { name: "Đang chờ", value: currentStats.pending, color: "#f59e0b" },
      { name: "Đã nhận", value: currentStats.accepted, color: "#0284c7" },
      { name: "Đang xử lý", value: currentStats.inProgress, color: "#8b5cf6" },
      { name: "Hoàn thành", value: currentStats.completed, color: "#10b981" },
      { name: "Từ chối", value: currentStats.rejected, color: "#ef4444" },
    ];
    return raw.filter((i) => i.value > 0);
  }, [currentStats]);

  /* ================= RENDER ================= */
  return (
    <div className="taskDashboard">
      {/* 1. HERO BANNER HEADER */}
      <section className="taskDashboard__hero">
        <div className="taskDashboard__hero-bg">
          <div className="hero-shape hero-shape--1" />
          <div className="hero-shape hero-shape--2" />
        </div>

        <div className="taskDashboard__hero-content">
          <div className="taskDashboard__team-profile">
            <div className="team-avatar-wrapper">
              <div className="team-avatar">
                <Shield size={36} />
              </div>
              <span className="team-status-pulse" title="Đang trực chiến 24/7" />
            </div>

            <div className="team-meta">
              <div className="team-meta__tags">
                <span className="team-badge team-badge--active">
                  <span className="dot-pulse" /> SẴN SÀNG TÁC CHIẾN
                </span>
                <span className="team-badge team-badge--role">
                  <Flame size={12} /> ĐỘI CỨU HỘ THỰC ĐỊA
                </span>
              </div>

              <h1 className="team-name">
                {teamInfo?.rcName || teamInfo?.teamName || "Đội Cứu Hộ Phản Ứng Nhanh"}
              </h1>

              <div className="team-details">
                <span className="detail-item">
                  <Phone size={14} /> Hotline:{" "}
                  <strong>{teamInfo?.rcPhone || teamInfo?.contactPhone || user.phone || "114"}</strong>
                </span>
                <span className="detail-divider">•</span>
                <span className="detail-item">
                  <MapPin size={14} /> Địa bàn:{" "}
                  <strong>{teamInfo?.areaId ? `Khu vực #${teamInfo.areaId}` : "Tâm lũ Miền Trung"}</strong>
                </span>
                <span className="detail-divider">•</span>
                <span className="detail-item">
                  <Clock size={14} /> Cập nhật:{" "}
                  <span>{lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="taskDashboard__hero-actions">
            {allTeams.length > 1 && (
              <div className="team-selector-box">
                <label className="selector-label">
                  <Users size={14} /> Chọn đội:
                </label>
                <Select
                  value={selectedTeamId}
                  onChange={(val) => {
                    setSelectedTeamId(val);
                    setAssignmentPage(1);
                    setDistributionPage(1);
                  }}
                  className="team-select-control"
                  options={allTeams.map((t) => ({
                    label: t.rcName || t.teamName || `Đội #${t.rcid || t.rescueTeamId}`,
                    value: t.rcid || t.rescueTeamId,
                  }))}
                />
              </div>
            )}

            <button
              className={`refresh-btn ${refreshing ? "refresh-btn--spinning" : ""}`}
              onClick={() => loadData(true)}
              title="Làm mới dữ liệu"
            >
              <RotateCcw size={16} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* QUICK STATS STRIP */}
        <div className="taskDashboard__quick-strip">
          <div className="quick-item">
            <span className="quick-label">Tổng nhiệm vụ</span>
            <span className="quick-val">{currentStats.total}</span>
          </div>
          <div className="quick-item">
            <span className="quick-label">Đang thực chiến</span>
            <span className="quick-val text-cyan">{currentStats.active}</span>
          </div>
          <div className="quick-item">
            <span className="quick-label">Hoàn thành</span>
            <span className="quick-val text-green">{currentStats.completed}</span>
          </div>
          <div className="quick-item">
            <span className="quick-label">Tỷ lệ thành công</span>
            <div className="rate-pill">
              <TrendingUp size={14} />
              <span>{currentStats.successRate}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TAB SWITCHER (Nhiệm vụ Cứu Hộ vs Cứu Trợ) */}
      <section className="taskDashboard__navigation">
        <div className="category-tabs">
          <button
            className={`category-tab ${tab === "assignment" ? "category-tab--active" : ""}`}
            onClick={() => {
              setTab("assignment");
              setAssignmentPage(1);
            }}
          >
            <div className="tab-icon-wrap tab-icon-wrap--rescue">
              <Shield size={18} />
            </div>
            <div className="tab-text">
              <span className="tab-title">Nhiệm Vụ Cứu Hộ Khẩn Cấp</span>
              <span className="tab-sub">Cứu hộ nạn nhân, chuyển viện, di dời</span>
            </div>
            <span className="tab-count-badge">{assignmentStats.total}</span>
          </button>

          <button
            className={`category-tab ${tab === "distribution" ? "category-tab--active" : ""}`}
            onClick={() => {
              setTab("distribution");
              setDistributionPage(1);
            }}
          >
            <div className="tab-icon-wrap tab-icon-wrap--relief">
              <Package size={18} />
            </div>
            <div className="tab-text">
              <span className="tab-title">Nhiệm Vụ Cứu Trợ Nhu Yếu Phẩm</span>
              <span className="tab-sub">Phát lương thực, nước sạch, áo phao</span>
            </div>
            <span className="tab-count-badge">{distributionStats.total}</span>
          </button>
        </div>
      </section>

      {/* 3. KPI METRIC CARDS GRID */}
      <section className="taskDashboard__kpi-grid">
        <div
          className={`kpi-card kpi-card--all ${currentFilter === "all" ? "kpi-card--active" : ""}`}
          onClick={() => {
            setCurrentFilter("all");
            setCurrentPage(1);
          }}
        >
          <div className="kpi-card__top">
            <span className="kpi-card__icon kpi-card__icon--all">
              <Layers size={20} />
            </span>
            <span className="kpi-card__badge">Tất cả</span>
          </div>
          <div className="kpi-card__num">{currentStats.total}</div>
          <div className="kpi-card__label">Tổng nhiệm vụ được giao</div>
          <div className="kpi-card__bar">
            <span style={{ width: "100%" }} />
          </div>
        </div>

        <div
          className={`kpi-card kpi-card--pending ${currentFilter === "pending" ? "kpi-card--active" : ""}`}
          onClick={() => {
            setCurrentFilter("pending");
            setCurrentPage(1);
          }}
        >
          <div className="kpi-card__top">
            <span className="kpi-card__icon kpi-card__icon--pending">
              <Clock3 size={20} />
            </span>
            <span className="kpi-card__badge">Chờ nhận</span>
          </div>
          <div className="kpi-card__num">{currentStats.pending}</div>
          <div className="kpi-card__label">Đang chờ đội tiếp nhận</div>
          <div className="kpi-card__bar">
            <span
              style={{
                width: `${currentStats.total > 0 ? (currentStats.pending / currentStats.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div
          className={`kpi-card kpi-card--accepted ${currentFilter === "accepted" ? "kpi-card--active" : ""}`}
          onClick={() => {
            setCurrentFilter("accepted");
            setCurrentPage(1);
          }}
        >
          <div className="kpi-card__top">
            <span className="kpi-card__icon kpi-card__icon--accepted">
              <CheckCircle2 size={20} />
            </span>
            <span className="kpi-card__badge">Đã nhận</span>
          </div>
          <div className="kpi-card__num">{currentStats.accepted}</div>
          <div className="kpi-card__label">Đã nhận & chuẩn bị</div>
          <div className="kpi-card__bar">
            <span
              style={{
                width: `${currentStats.total > 0 ? (currentStats.accepted / currentStats.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div
          className={`kpi-card kpi-card--inprogress ${currentFilter === "in progress" ? "kpi-card--active" : ""}`}
          onClick={() => {
            setCurrentFilter("in progress");
            setCurrentPage(1);
          }}
        >
          <div className="kpi-card__top">
            <span className="kpi-card__icon kpi-card__icon--inprogress">
              <Radio size={20} className="pulse-icon" />
            </span>
            <span className="kpi-card__badge">Đang đi</span>
          </div>
          <div className="kpi-card__num">{currentStats.inProgress}</div>
          <div className="kpi-card__label">Đang triển khai thực địa</div>
          <div className="kpi-card__bar">
            <span
              style={{
                width: `${currentStats.total > 0 ? (currentStats.inProgress / currentStats.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div
          className={`kpi-card kpi-card--completed ${currentFilter === "completed" ? "kpi-card--active" : ""}`}
          onClick={() => {
            setCurrentFilter("completed");
            setCurrentPage(1);
          }}
        >
          <div className="kpi-card__top">
            <span className="kpi-card__icon kpi-card__icon--completed">
              <Award size={20} />
            </span>
            <span className="kpi-card__badge">Thành công</span>
          </div>
          <div className="kpi-card__num">{currentStats.completed}</div>
          <div className="kpi-card__label">Đã hoàn thành cứu nạn</div>
          <div className="kpi-card__bar">
            <span
              style={{
                width: `${currentStats.total > 0 ? (currentStats.completed / currentStats.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div
          className={`kpi-card kpi-card--rejected ${currentFilter === "rejected" ? "kpi-card--active" : ""}`}
          onClick={() => {
            setCurrentFilter("rejected");
            setCurrentPage(1);
          }}
        >
          <div className="kpi-card__top">
            <span className="kpi-card__icon kpi-card__icon--rejected">
              <XCircle size={20} />
            </span>
            <span className="kpi-card__badge">Từ chối</span>
          </div>
          <div className="kpi-card__num">{currentStats.rejected}</div>
          <div className="kpi-card__label">Không thể thực hiện / Hủy</div>
          <div className="kpi-card__bar">
            <span
              style={{
                width: `${currentStats.total > 0 ? (currentStats.rejected / currentStats.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* 4. ANALYTICS ROW (Chart & Performance Cards) */}
      <section className="taskDashboard__analytics">
        <Row gutter={[20, 20]}>
          {/* Donut Chart */}
          <Col xs={24} lg={12}>
            <div className="analytics-card chart-card">
              <div className="analytics-card__header">
                <div>
                  <h3 className="analytics-card__title">
                    <Sparkles size={18} className="text-amber" /> Phân Tích Trạng Thái Nhiệm Vụ
                  </h3>
                  <p className="analytics-card__subtitle">
                    Tỷ lệ phân bổ các giai đoạn cứu hộ & cứu trợ
                  </p>
                </div>
                <Tag color="blue" className="analytics-badge">
                  {tab === "assignment" ? "Cứu hộ khẩn cấp" : "Cứu trợ lương thực"}
                </Tag>
              </div>

              <div className="chart-body">
                {chartData.length === 0 ? (
                  <div className="chart-empty">
                    <Layers size={36} />
                    <p>Chưa có dữ liệu thống kê nhiệm vụ</p>
                  </div>
                ) : (
                  <div className="donut-wrapper">
                    <div style={{ width: "100%", height: 260 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={72}
                            outerRadius={100}
                            paddingAngle={4}
                            stroke="none"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const d = payload[0];
                                return (
                                  <div className="custom-chart-tooltip">
                                    <span
                                      className="tooltip-dot"
                                      style={{ background: d.payload.color }}
                                    />
                                    <strong>{d.name}:</strong>
                                    <span>{d.value} nhiệm vụ</span>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="donut-center-info">
                      <span className="donut-val">{currentStats.total}</span>
                      <span className="donut-lbl">Nhiệm vụ</span>
                    </div>
                  </div>
                )}

                {/* Custom Legend */}
                <div className="chart-legend-grid">
                  <div className="legend-item">
                    <span className="dot dot--pending" />
                    <span className="legend-name">Đang chờ</span>
                    <span className="legend-val">{currentStats.pending}</span>
                  </div>
                  <div className="legend-item">
                    <span className="dot dot--accepted" />
                    <span className="legend-name">Đã nhận</span>
                    <span className="legend-val">{currentStats.accepted}</span>
                  </div>
                  <div className="legend-item">
                    <span className="dot dot--inprogress" />
                    <span className="legend-name">Đang làm</span>
                    <span className="legend-val">{currentStats.inProgress}</span>
                  </div>
                  <div className="legend-item">
                    <span className="dot dot--completed" />
                    <span className="legend-name">Hoàn thành</span>
                    <span className="legend-val">{currentStats.completed}</span>
                  </div>
                  <div className="legend-item">
                    <span className="dot dot--rejected" />
                    <span className="legend-name">Từ chối</span>
                    <span className="legend-val">{currentStats.rejected}</span>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* Performance Overview */}
          <Col xs={24} lg={12}>
            <div className="analytics-card performance-card">
              <div className="analytics-card__header">
                <div>
                  <h3 className="analytics-card__title">
                    <Award size={18} className="text-emerald" /> Hiệu Suất Tác Chiến Đội
                  </h3>
                  <p className="analytics-card__subtitle">
                    Đánh giá mức độ hoàn thành và độ sẵn sàng tác chiến
                  </p>
                </div>
                <div className="rate-badge">
                  <span>{currentStats.successRate}% Thành công</span>
                </div>
              </div>

              <div className="performance-body">
                <div className="progress-group">
                  <div className="progress-label-row">
                    <span>Tiến độ hoàn thành nhiệm vụ</span>
                    <strong>{currentStats.successRate}%</strong>
                  </div>
                  <Progress
                    percent={currentStats.successRate}
                    strokeColor={{
                      "0%": "#10b981",
                      "100%": "#0284c7",
                    }}
                    trailColor="#e2e8f0"
                    showInfo={false}
                    strokeWidth={10}
                    className="custom-progress-bar"
                  />
                </div>

                <div className="performance-metrics-grid">
                  <div className="metric-box">
                    <span className="metric-icon metric-icon--rescue">
                      <Shield size={18} />
                    </span>
                    <div className="metric-content">
                      <span className="metric-title">Nhiệm vụ Cứu Hộ</span>
                      <strong className="metric-number">{assignmentStats.total}</strong>
                      <span className="metric-sub">
                        {assignmentStats.completed} ca đã cứu nạn
                      </span>
                    </div>
                  </div>

                  <div className="metric-box">
                    <span className="metric-icon metric-icon--relief">
                      <Package size={18} />
                    </span>
                    <div className="metric-content">
                      <span className="metric-title">Nhiệm vụ Cứu Trợ</span>
                      <strong className="metric-number">{distributionStats.total}</strong>
                      <span className="metric-sub">
                        {distributionStats.completed} đợt đã phát
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Navigation Shortcuts */}
                <div className="performance-shortcuts">
                  <button
                    className="shortcut-btn shortcut-btn--primary"
                    onClick={() => navigate("/rescueTeam")}
                  >
                    <span>Xem danh sách phân công trực tiếp</span>
                    <ArrowRight size={16} />
                  </button>

                  <button
                    className="shortcut-btn shortcut-btn--secondary"
                    onClick={() => navigate("/rescueTeam/history")}
                  >
                    <span>Lịch sử hoàn thành</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </section>

      {/* 5. SEARCH & FILTER TOOLBAR */}
      <section className="taskDashboard__toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder={
              tab === "assignment"
                ? "Tìm theo họ tên nạn nhân, số điện thoại, địa chỉ cứu hộ..."
                : "Tìm theo tên chiến dịch, địa điểm cứu trợ..."
            }
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
            >
              ×
            </button>
          )}
        </div>

        <div className="filter-controls">
          <Select
            value={currentFilter}
            onChange={(val) => {
              setCurrentFilter(val);
              setCurrentPage(1);
            }}
            className="filter-select"
            options={[
              { label: "Tất cả trạng thái", value: "all" },
              { label: "Đang chờ tiếp nhận", value: "pending" },
              { label: "Đã nhận nhiệm vụ", value: "accepted" },
              { label: "Đang triển khai", value: "in progress" },
              { label: "Đã hoàn thành", value: "completed" },
              { label: "Đã từ chối", value: "rejected" },
            ]}
          />

          {(currentFilter !== "all" || searchQuery) && (
            <button
              className="reset-filters-btn"
              onClick={() => {
                setCurrentFilter("all");
                setSearchQuery("");
                setCurrentPage(1);
              }}
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </section>

      {/* 6. TASK LIST SECTION */}
      <section className="taskDashboard__list-section">
        <div className="section-header">
          <div className="section-header__title">
            <h2>
              {tab === "assignment"
                ? "Danh Sách Nhiệm Vụ Cứu Hộ Tiền Tuyến"
                : "Danh Sách Điểm Cứu Trợ Lương Thực & Nhu Yếu Phẩm"}
            </h2>
            <span className="result-count">
              (Hiển thị {filteredItems.length} kết quả)
            </span>
          </div>

          <div className="section-header__tag">
            <span className="live-indicator" />
            <span>Dữ liệu thực tế</span>
          </div>
        </div>

        {loading ? (
          <div className="taskDashboard__loading">
            <Spin size="large" />
            <p>Đang tải dữ liệu nhiệm vụ đội cứu hộ...</p>
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="taskDashboard__empty">
            <div className="empty-icon-wrap">
              <Layers size={48} />
            </div>
            <h3>Không tìm thấy nhiệm vụ nào</h3>
            <p>
              {searchQuery || currentFilter !== "all"
                ? "Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm."
                : "Hiện tại đội của bạn chưa có nhiệm vụ nào được phân công trong danh mục này."}
            </p>
            {(searchQuery || currentFilter !== "all") && (
              <button
                className="btn-outline-reload"
                onClick={() => {
                  setCurrentFilter("all");
                  setSearchQuery("");
                }}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="task-cards-grid">
            {tab === "assignment"
              ? paginatedItems.map((item) => {
                  const statusConf = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                  return (
                    <div
                      key={item.id}
                      className="task-card"
                      onClick={() => navigate(`/rescueTeam/history/${item.id}`)}
                    >
                      <div className="task-card__top">
                        <div className="task-card__id-badge">
                          <Shield size={13} />
                          <span>NHIỆM VỤ #{item.id}</span>
                        </div>

                        <div
                          className="status-pill"
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

                      <div className="task-card__person">
                        <div className="person-avatar">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="person-info">
                          <h4 className="person-name">{item.name}</h4>
                          <a
                            href={`tel:${item.phone}`}
                            className="person-phone"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone size={13} />
                            <span>{item.phone}</span>
                          </a>
                        </div>
                      </div>

                      <div className="task-card__address">
                        <MapPin size={15} className="pin-icon" />
                        <span className="address-text">{item.address}</span>
                      </div>

                      <div className="task-card__meta-bar">
                        <span className="meta-time">
                          <Clock size={13} /> {item.time}
                        </span>
                        <span className="meta-urgency">
                          <Flame size={13} className="text-amber" /> {item.urgency}
                        </span>
                      </div>

                      <div className="task-card__actions">
                        <button
                          className="action-btn action-btn--primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/rescueTeam/history/${item.id}`);
                          }}
                        >
                          <span>Xem chi tiết hồ sơ</span>
                          <ExternalLink size={14} />
                        </button>

                        <button
                          className="action-btn action-btn--secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/rescueTeam/dangcuho/${item.id}`);
                          }}
                          title="Tác nghiệp cứu nạn"
                        >
                          <Navigation size={14} />
                          <span>Tác nghiệp</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              : paginatedItems.map((item) => {
                  const statusConf = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                  const canViewProcess = ["accepted", "in progress", "completed"].includes(item.status);
                  return (
                    <div
                      key={item.distributionId}
                      className="task-card task-card--relief"
                      onClick={() => {
                        if (canViewProcess) {
                          navigate(`/rescueTeam/chi-tiet-tro/${item.distributionId}`);
                        }
                      }}
                    >
                      <div className="task-card__top">
                        <div className="task-card__id-badge task-card__id-badge--relief">
                          <Package size={13} />
                          <span>ĐỢT PHÁT #{item.distributionId}</span>
                        </div>

                        <div
                          className="status-pill"
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

                      <div className="task-card__campaign">
                        <div className="campaign-icon">
                          <Package size={22} />
                        </div>
                        <div className="campaign-info">
                          <h4 className="campaign-name">{item.campaignName}</h4>
                          <span className="campaign-tag">Nhu yếu phẩm cứu trợ</span>
                        </div>
                      </div>

                      <div className="task-card__address">
                        <MapPin size={15} className="pin-icon" />
                        <span className="address-text">{item.location}</span>
                      </div>

                      <div className="task-card__meta-bar">
                        <span className="meta-time">
                          <Clock size={13} /> {item.time}
                        </span>
                        <span className="meta-urgency">
                          <CheckCircle2 size={13} className="text-emerald" /> Lương thực & Nước uống
                        </span>
                      </div>

                      <div className="task-card__actions">
                        <button
                          className="action-btn action-btn--primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.campaignId) {
                              navigate(`/rescueTeam/cuu-tro/${item.campaignId}`);
                            }
                          }}
                        >
                          <span>Xem chiến dịch</span>
                          <ExternalLink size={14} />
                        </button>

                        {canViewProcess && (
                          <button
                            className="action-btn action-btn--secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/rescueTeam/chi-tiet-tro/${item.distributionId}`);
                            }}
                          >
                            <Send size={14} />
                            <span>Phát hàng</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
          </div>
        )}

        {/* PAGINATION */}
        {filteredItems.length > pageSize && (
          <div className="taskDashboard__pagination">
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
    </div>
  );
}