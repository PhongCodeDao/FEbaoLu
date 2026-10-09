import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination, Spin, Select, Tooltip, Tag, message } from "antd";
import {
  Users,
  Shield,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  Radio,
  Search,
  RotateCcw,
  Sparkles,
  Flame,
  Award,
  Truck,
  ArrowRight,
  Filter,
  Check,
  LayoutGrid,
  List,
  Copy,
  ArrowLeft,
  Mail,
  UserCheck,
  Send,
  AlertCircle,
  Activity,
} from "lucide-react";
import axiosInstance from "../../../../api/axiosInstance";
import AuthNotify from "../../../utils/Common/AuthNotify";
import "./TeamMembersMisionList.css";

import { getAllUser } from "../../../../api/axios/AdminApi/userApi";
import {
  getRescueTeamMembers,
  getAllRescueTeams,
  getAllVehicles,
} from "../../../../api/axios/RescueApi/RescueTask";

export default function TeamMembersMisionList() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Teams & Current Team
  const [allTeams, setAllTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  // Members list & Users map
  const [members, setMembers] = useState([]);
  const [userMap, setUserMap] = useState({});

  // View mode & Filters
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
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
        const mems = res?.data?.items || res?.items || res?.data || [];
        if (
          Array.isArray(mems) &&
          mems.some((m) => m.userId === userId || m.phone === userPhone)
        ) {
          return tid;
        }
      } catch {}
    }

    return teams[0]?.rcid || teams[0]?.rescueTeamId || null;
  };

  /* ================= LOAD DATA ================= */
  const fetchData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const [teamRes, userRes, vehicleRes] = await Promise.all([
        getAllRescueTeams(),
        getAllUser(),
        getAllVehicles(),
      ]);

      const teams = teamRes?.data?.items || teamRes?.items || teamRes?.data || [];
      const teamList = Array.isArray(teams) ? teams : [];
      setAllTeams(teamList);

      const users = userRes || [];
      const uMap = {};
      users.forEach((u) => {
        uMap[u.userId] = u;
      });
      setUserMap(uMap);

      const vList = vehicleRes?.data || vehicleRes?.items || vehicleRes || [];
      setVehicles(Array.isArray(vList) ? vList : []);

      let targetTeamId = selectedTeamId;
      if (!targetTeamId) {
        targetTeamId = await resolveTeamId(teamList, user.userId, user.phone);
        setSelectedTeamId(targetTeamId);
      }

      const curTeam = teamList.find(
        (t) => (t.rcid || t.rescueTeamId) === targetTeamId
      );
      setTeamInfo(curTeam || null);

      if (targetTeamId) {
        const memberRes = await getRescueTeamMembers(targetTeamId);
        const rawMembers =
          memberRes?.data?.items ||
          memberRes?.items ||
          memberRes?.data ||
          [];
        const memberList = Array.isArray(rawMembers) ? rawMembers : [];

        const mapped = memberList.map((m, idx) => {
          const userInfo = uMap[m.userId] || {};
          const isLeader =
            idx === 0 ||
            m.roleInTeam?.toLowerCase().includes("trưởng") ||
            m.roleInTeam?.toLowerCase().includes("chỉ huy") ||
            (curTeam && (curTeam.rcPhone === m.phone || curTeam.rcPhone === userInfo.phone));

          return {
            id: m.userId,
            name: m.fullName || userInfo.fullName || `Chiến sĩ #${m.userId}`,
            phone: m.phone || userInfo.phone || "Chưa cập nhật",
            roleInTeam: m.roleInTeam || (isLeader ? "Đội trưởng chỉ huy" : "Chiến sĩ cứu hộ"),
            systemRole: userInfo.roleName || "Rescuer",
            areaId: userInfo.areaId || curTeam?.areaId || 1,
            isLeader,
            status: "on_duty",
            joinedAt: userInfo.createdAt
              ? new Date(userInfo.createdAt).toLocaleDateString("vi-VN")
              : "Đã sẵn sàng",
            raw: m,
            userInfo,
          };
        });

        // Đội trưởng lên trước
        mapped.sort((a, b) => (b.isLeader ? 1 : 0) - (a.isLeader ? 1 : 0));
        setMembers(mapped);
      } else {
        setMembers([]);
      }

      setLastRefreshed(new Date());
    } catch (err) {
      console.error("TeamMembersMisionList fetchData Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTeamId]);

  /* ================= FILTER & SEARCH ================= */
  const filteredMembers = useMemo(() => {
    let result = members;

    if (roleFilter !== "ALL") {
      if (roleFilter === "LEADER") {
        result = result.filter((m) => m.isLeader);
      } else if (roleFilter === "MEMBER") {
        result = result.filter((m) => !m.isLeader);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.phone.includes(q) ||
          m.roleInTeam.toLowerCase().includes(q) ||
          String(m.id).includes(q)
      );
    }

    return result;
  }, [members, roleFilter, searchQuery]);

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    AuthNotify.success("Đã sao chép", `${label}: ${text}`);
  };

  return (
    <div className="teamMembersPage">
      {/* 1. HERO OPERATIONAL BANNER */}
      <section className="tmNav__hero">
        <div className="tmNav__hero-glow tmNav__hero-glow--1" />
        <div className="tmNav__hero-glow tmNav__hero-glow--2" />

        <div className="tmNav__hero-inner">
          <div className="tmNav__team-info">
            <div className="team-badge-icon">
              <Users size={34} />
              <span className="live-pulse-dot" title="Quân số trực chiến 24/7" />
            </div>

            <div className="team-text-group">
              <div className="team-status-row">
                <span className="operational-badge">
                  <span className="pulse-point" /> ĐỘI HÌNH TÁC CHIẾN THỰC ĐỊA
                </span>
                <span className="team-code-badge">
                  <Shield size={12} /> {teamInfo?.rcName || "ĐỘI CỨU HỘ KHẨN CẤP"}
                </span>
              </div>

              <h1 className="hero-main-title">
                Quân Số & Nhân Sự Đội Cứu Hộ Tiền Tuyến
              </h1>

              <div className="hero-sub-meta">
                <span className="meta-pill">
                  <Phone size={13} /> Hotline chỉ huy:{" "}
                  <strong>{teamInfo?.rcPhone || teamInfo?.contactPhone || user.phone || "114"}</strong>
                </span>
                <span className="meta-separator">•</span>
                <span className="meta-pill">
                  <MapPin size={13} /> Địa bàn thường trực:{" "}
                  <strong>{teamInfo?.areaId ? `Vùng lũ #${teamInfo.areaId}` : "Toàn địa bàn"}</strong>
                </span>
                <span className="meta-separator">•</span>
                <span className="meta-pill">
                  <Activity size={13} /> Trực chiến:{" "}
                  <strong className="text-green">100% Sẵn Sàng</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="tmNav__hero-actions">
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
              title="Đồng bộ lại danh sách quân số"
            >
              <RotateCcw size={15} />
              <span>Đồng bộ</span>
            </button>
          </div>
        </div>

        {/* SUMMARY STATS BAR */}
        <div className="tmNav__stat-strip">
          <div className="stat-strip-box">
            <span className="stat-strip-title">Tổng quân số sẵn sàng</span>
            <span className="stat-strip-value text-cyan">{members.length} chiến sĩ</span>
          </div>
          <div className="stat-strip-box">
            <span className="stat-strip-title">Chỉ huy & Đội trưởng</span>
            <span className="stat-strip-value text-amber">
              {members.filter((m) => m.isLeader).length || 1} cán bộ
            </span>
          </div>
          <div className="stat-strip-box">
            <span className="stat-strip-title">Chiến sĩ cơ động</span>
            <span className="stat-strip-value text-green">
              {members.filter((m) => !m.isLeader).length} chiến sĩ
            </span>
          </div>
          <div className="stat-strip-box">
            <span className="stat-strip-title">Phương tiện tác chiến</span>
            <span className="stat-strip-value text-purple">{vehicles.length || 1} phương tiện</span>
          </div>
        </div>
      </section>

      {/* 2. TOOLBAR: SEARCH, FILTER CHIPS & VIEW SWITCHER */}
      <section className="tmNav__toolbar">
        <div className="toolbar-top-row">
          <div className="toolbar-search-wrap">
            <Search size={18} className="search-icon-left" />
            <input
              type="text"
              className="modern-search-input"
              placeholder="Tìm theo tên chiến sĩ, số điện thoại, vai trò, mã quân số..."
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

          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === "cards" ? "active" : ""}`}
              onClick={() => setViewMode("cards")}
              title="Xem dạng thẻ chiến sĩ"
            >
              <LayoutGrid size={16} />
              <span>Thẻ</span>
            </button>
            <button
              className={`view-mode-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Xem dạng bảng danh sách"
            >
              <List size={16} />
              <span>Bảng</span>
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="toolbar-filter-chips">
          <span className="chips-label">
            <Filter size={14} /> Phân loại quân số:
          </span>

          <button
            className={`filter-chip ${roleFilter === "ALL" ? "filter-chip--active" : ""}`}
            onClick={() => {
              setRoleFilter("ALL");
              setCurrentPage(1);
            }}
          >
            Toàn đội ({members.length})
          </button>
          <button
            className={`filter-chip filter-chip--leader ${roleFilter === "LEADER" ? "filter-chip--active" : ""}`}
            onClick={() => {
              setRoleFilter("LEADER");
              setCurrentPage(1);
            }}
          >
            Chỉ huy / Đội trưởng ({members.filter((m) => m.isLeader).length || 1})
          </button>
          <button
            className={`filter-chip filter-chip--member ${roleFilter === "MEMBER" ? "filter-chip--active" : ""}`}
            onClick={() => {
              setRoleFilter("MEMBER");
              setCurrentPage(1);
            }}
          >
            Chiến sĩ cơ động ({members.filter((m) => !m.isLeader).length})
          </button>

          {(roleFilter !== "ALL" || searchQuery) && (
            <button
              className="filter-chip-reset"
              onClick={() => {
                setRoleFilter("ALL");
                setSearchQuery("");
                setCurrentPage(1);
              }}
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </section>

      {/* 3. ROSTER MAIN CONTENT */}
      <section className="tmNav__list-wrapper">
        <div className="list-meta-header">
          <div className="list-title-box">
            <h2>Danh Sách Quân Số Trực Ban & Ứng Cứu</h2>
            <span className="badge-count-records">
              {filteredMembers.length} chiến sĩ
            </span>
          </div>

          <div className="list-header-shortcuts">
            <button
              className="shortcut-link-btn"
              onClick={() => navigate("/rescueTeam")}
            >
              <ArrowLeft size={14} /> Về trung tâm nhận lệnh
            </button>
            <button
              className="shortcut-link-btn"
              onClick={() => navigate("/rescueTeam/history")}
            >
              <Award size={14} /> Lịch sử chiến công
            </button>
          </div>
        </div>

        {loading ? (
          <div className="tmNav__loading">
            <Spin size="large" />
            <p>Đang đồng bộ danh sách cán bộ, chiến sĩ cứu hộ...</p>
          </div>
        ) : paginatedMembers.length === 0 ? (
          <div className="tmNav__empty">
            <div className="empty-shield-icon">
              <Users size={44} />
            </div>
            <h3>Không tìm thấy thành viên phù hợp</h3>
            <p>
              {searchQuery || roleFilter !== "ALL"
                ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem toàn bộ danh sách."
                : "Chưa có chiến sĩ nào được đăng ký vào đội hình cứu hộ này."}
            </p>
            <div className="empty-actions">
              {(searchQuery || roleFilter !== "ALL") && (
                <button
                  className="btn-empty-clear"
                  onClick={() => {
                    setRoleFilter("ALL");
                    setSearchQuery("");
                  }}
                >
                  Xóa bộ lọc
                </button>
              )}
              <button
                className="btn-empty-refresh"
                onClick={() => fetchData(true)}
              >
                <RotateCcw size={14} /> Tải lại danh sách
              </button>
            </div>
          </div>
        ) : viewMode === "cards" ? (
          /* ================= VIEW 1: CARDS GRID ================= */
          <div className="member-cards-grid">
            {paginatedMembers.map((m) => {
              return (
                <div
                  key={m.id}
                  className={`member-card ${m.isLeader ? "member-card--leader" : ""}`}
                >
                  {/* Top Card Header */}
                  <div className="member-card__header">
                    <div className="member-badge-role">
                      {m.isLeader ? (
                        <span className="badge-leader">
                          <Flame size={13} /> {m.roleInTeam}
                        </span>
                      ) : (
                        <span className="badge-member">
                          <Shield size={13} /> {m.roleInTeam}
                        </span>
                      )}
                    </div>

                    <div className="member-status-chip">
                      <span className="pulse-point pulse-point--green" />
                      <span>Đang trực chiến</span>
                    </div>
                  </div>

                  {/* Profile info */}
                  <div className="member-card__profile">
                    <div className={`member-avatar-wrap ${m.isLeader ? "member-avatar-wrap--leader" : ""}`}>
                      <div className="member-avatar-circle">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="avatar-online-dot" />
                    </div>

                    <div className="member-text-info">
                      <h3 className="member-fullname">{m.name}</h3>
                      <span className="member-system-role">
                        Mã định danh: <strong>#{m.id}</strong> • {m.systemRole}
                      </span>
                    </div>
                  </div>

                  {/* Contact & Meta rows */}
                  <div className="member-card__details">
                    <div className="detail-row">
                      <Phone size={14} className="detail-icon" />
                      <a href={`tel:${m.phone}`} className="phone-clickable">
                        {m.phone}
                      </a>
                      <button
                        className="btn-copy-sm"
                        onClick={() => copyToClipboard(m.phone, "Số điện thoại")}
                        title="Sao chép số điện thoại"
                      >
                        <Copy size={12} />
                      </button>
                    </div>

                    <div className="detail-row">
                      <MapPin size={14} className="detail-icon" />
                      <span>Địa bàn: Vùng phụ trách #{m.areaId}</span>
                    </div>

                    <div className="detail-row">
                      <Clock size={14} className="detail-icon" />
                      <span>Trạng thái: Sẵn sàng xuất kích 24/7</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="member-card__actions">
                    <a
                      href={`tel:${m.phone}`}
                      className="btn-member-action btn-member-action--call"
                    >
                      <Phone size={14} />
                      <span>Gọi trực tiếp</span>
                    </a>
                    <button
                      className="btn-member-action btn-member-action--secondary"
                      onClick={() => {
                        copyToClipboard(m.phone, "Số điện thoại");
                      }}
                    >
                      <Copy size={14} />
                      <span>Sao chép SĐT</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ================= VIEW 2: TABLE VIEW ================= */
          <div className="member-table-wrapper">
            <table className="modern-member-table">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>STT</th>
                  <th>Chiến sĩ</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò trong đội</th>
                  <th>Trạng thái tác chiến</th>
                  <th>Địa bàn phụ trách</th>
                  <th style={{ width: 140 }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMembers.map((m, index) => {
                  return (
                    <tr
                      key={m.id}
                      className={m.isLeader ? "row-leader" : ""}
                    >
                      <td className="text-center font-bold">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>

                      <td>
                        <div className="table-user-cell">
                          <div className={`table-avatar ${m.isLeader ? "table-avatar--leader" : ""}`}>
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="table-user-meta">
                            <span className="table-name">{m.name}</span>
                            <span className="table-sub">ID: #{m.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="table-phone-cell">
                          <a href={`tel:${m.phone}`} className="phone-clickable">
                            {m.phone}
                          </a>
                          <button
                            className="btn-copy-sm"
                            onClick={() => copyToClipboard(m.phone, "Số điện thoại")}
                            title="Sao chép"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>

                      <td>
                        {m.isLeader ? (
                          <span className="badge-leader">
                            <Flame size={12} /> {m.roleInTeam}
                          </span>
                        ) : (
                          <span className="badge-member">
                            <Shield size={12} /> {m.roleInTeam}
                          </span>
                        )}
                      </td>

                      <td>
                        <span className="table-status-pill">
                          <span className="pulse-point pulse-point--green" />
                          <span>Đang trực chiến</span>
                        </span>
                      </td>

                      <td>
                        <span className="table-area">Vùng lũ #{m.areaId}</span>
                      </td>

                      <td>
                        <div className="table-action-btns">
                          <a
                            href={`tel:${m.phone}`}
                            className="btn-table-call"
                            title="Gọi điện"
                          >
                            <Phone size={14} />
                          </a>
                          <button
                            className="btn-table-copy"
                            onClick={() => copyToClipboard(m.phone, "Số điện thoại")}
                            title="Sao chép SĐT"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {filteredMembers.length > pageSize && (
          <div className="tmNav__pagination">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredMembers.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showTotal={(total, range) =>
                `Hiển thị ${range[0]} - ${range[1]} trên tổng số ${total} chiến sĩ`
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}