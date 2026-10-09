import { useEffect, useMemo, useState } from "react";
import { Table, Tag, Input, Select, Button, Spin, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Calendar,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  ArrowRight,
  Layers,
  Sparkles,
  Award,
} from "lucide-react";
import { getAllAidCampaigns } from "../../../../api/axios/AdminApi/suplyingApi";
import AuthNotify from "../../../utils/Common/AuthNotify";
import "./CampaignPageManagerSuply.css";

export default function CampaignPageManagerSuply() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const navigate = useNavigate();

  // ================= FILTER =================
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [monthFilter, setMonthFilter] = useState(null);
  const [yearFilter, setYearFilter] = useState(null);

  /* ================= LOAD ================= */
  const fetchData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const res = await getAllAidCampaigns();
      const data = res?.items || res?.data || res || [];
      const campList = Array.isArray(data) ? data : [];
      setList(campList);
      setLastRefreshed(new Date());
    } catch {
      AuthNotify.error("Lỗi tải danh sách chiến dịch cứu trợ");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= STATUS RENDER ================= */
  const renderStatus = (status) => {
    const map = {
      accepted: { text: "Đã nhận", color: "blue", bg: "#eff6ff", border: "#93c5fd" },
      rejected: { text: "Từ chối", color: "red", bg: "#fef2f2", border: "#fca5a5" },
      "in progress": { text: "Đang thực hiện", color: "purple", bg: "#faf5ff", border: "#d8b4fe" },
      completed: { text: "Hoàn thành", color: "green", bg: "#f0fdf4", border: "#86efac" },
      pending: { text: "Đang chờ duyệt", color: "gold", bg: "#fffbeb", border: "#fde68a" },
      active: { text: "Đang hoạt động", color: "blue", bg: "#eff6ff", border: "#93c5fd" },
      "đã nhận": { text: "Đã nhận", color: "blue", bg: "#eff6ff", border: "#93c5fd" },
      "từ chối": { text: "Từ chối", color: "red", bg: "#fef2f2", border: "#fca5a5" },
      "đang thực hiện": { text: "Đang thực hiện", color: "purple", bg: "#faf5ff", border: "#d8b4fe" },
      "hoàn thành": { text: "Hoàn thành", color: "green", bg: "#f0fdf4", border: "#86efac" },
    };

    const key = status?.toLowerCase()?.trim();
    const s = map[key] || { text: status || "Không rõ", color: "default", bg: "#f1f5f9", border: "#cbd5e1" };

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 10px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 700,
          background: s.bg,
          border: `1px solid ${s.border}`,
          color: s.color === "green" ? "#16a34a" : s.color === "purple" ? "#7c3aed" : s.color === "gold" ? "#d97706" : s.color === "red" ? "#dc2626" : "#2563eb",
        }}
      >
        {s.text}
      </span>
    );
  };

  const getStatusText = (status) => {
    const map = {
      accepted: "Đã nhận",
      rejected: "Từ chối",
      "in progress": "Đang thực hiện",
      completed: "Hoàn thành",
      pending: "Đang chờ duyệt",
      active: "Đang hoạt động",
      "đã nhận": "Đã nhận",
      "từ chối": "Từ chối",
      "đang thực hiện": "Đang thực hiện",
      "hoàn thành": "Hoàn thành",
    };
    const key = status?.toLowerCase?.()?.trim?.();
    return map[key] || status || "Không rõ";
  };

  const monthOptions = useMemo(() => {
    const months = Array.from(new Set(list.map((x) => x.month).filter((m) => m != null)));
    return months
      .sort((a, b) => Number(a) - Number(b))
      .map((m) => ({
        value: m,
        label: `Tháng ${m}`,
      }));
  }, [list]);

  const yearOptions = useMemo(() => {
    const years = Array.from(new Set(list.map((x) => x.year).filter((y) => y != null)));
    return years
      .sort((a, b) => Number(b) - Number(a))
      .map((y) => ({
        value: y,
        label: `Năm ${y}`,
      }));
  }, [list]);

  const statusOptions = useMemo(() => {
    const statuses = Array.from(new Set(list.map((x) => x.status).filter((s) => s != null)));
    return statuses.map((s) => ({ value: s, label: getStatusText(s) }));
  }, [list]);

  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((r) => {
      const matchesQuery =
        !q ||
        String(r.campaignID ?? "").toLowerCase().includes(q) ||
        String(r.campaignName ?? "").toLowerCase().includes(q) ||
        String(r.adminName ?? "").toLowerCase().includes(q) ||
        String(r.month ?? "").toLowerCase().includes(q) ||
        String(r.year ?? "").toLowerCase().includes(q);

      const matchesStatus = statusFilter == null || r.status === statusFilter;
      const matchesMonth = monthFilter == null || r.month === monthFilter;
      const matchesYear = yearFilter == null || r.year === yearFilter;

      return matchesQuery && matchesStatus && matchesMonth && matchesYear;
    });
  }, [list, query, statusFilter, monthFilter, yearFilter]);

  // Summary statistics
  const stats = useMemo(() => {
    return {
      total: list.length,
      inProgress: list.filter((c) => (c.status || "").toLowerCase().includes("progress") || (c.status || "").toLowerCase().includes("thực hiện")).length,
      completed: list.filter((c) => (c.status || "").toLowerCase().includes("completed") || (c.status || "").toLowerCase().includes("hoàn thành")).length,
      pending: list.filter((c) => (c.status || "").toLowerCase().includes("pending") || (c.status || "").toLowerCase().includes("chờ")).length,
    };
  }, [list]);

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      title: "Mã Chiến Dịch",
      dataIndex: "campaignID",
      width: 130,
      render: (id) => (
        <span className="cp-id-tag">
          <Package size={13} />
          <strong>#{id}</strong>
        </span>
      ),
    },
    {
      title: "Tên Kế Hoạch / Chiến Dịch Cứu Trợ",
      dataIndex: "campaignName",
      render: (text, record) => (
        <div
          className="cp-title-cell"
          onClick={() => navigate(`/manager/ke-hoach-cuu-tro/${record.campaignID}`)}
        >
          <span className="cp-name">{text}</span>
          <span className="cp-sub">Bấm để xem danh mục nhu yếu phẩm chi tiết</span>
        </div>
      ),
    },
    {
      title: "Thời Gian Chiến Dịch",
      width: 160,
      render: (_, record) => (
        <span className="cp-time-cell">
          <Calendar size={13} />
          <span>Tháng {record.month}/{record.year}</span>
        </span>
      ),
    },
    {
      title: "Cán Bộ Khởi Tạo",
      dataIndex: "adminName",
      width: 170,
      render: (name) => (
        <span className="cp-admin-cell">
          <strong>{name || "Hệ Thống Quản Trị"}</strong>
        </span>
      ),
    },
    {
      title: "Ngày Lập",
      dataIndex: "createdAt",
      width: 160,
      render: (date) => (
        <span className="cp-date-cell">
          {new Date(date).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      width: 150,
      render: renderStatus,
    },
    {
      title: "Thao Tác",
      width: 130,
      render: (_, record) => (
        <button
          className="btn-view-plan"
          onClick={() => navigate(`/manager/ke-hoach-cuu-tro/${record.campaignID}`)}
          title="Xem kế hoạch phân bổ chi tiết"
        >
          <span>Xem chi tiết</span>
          <ArrowRight size={13} />
        </button>
      ),
    },
  ];

  return (
    <div className="campaignPage">
      {/* 1. HERO OPERATIONAL BANNER */}
      <section className="cpNav__hero">
        <div className="cpNav__hero-glow cpNav__hero-glow--1" />
        <div className="cpNav__hero-glow cpNav__hero-glow--2" />

        <div className="cpNav__hero-inner">
          <div className="cpNav__info">
            <div className="cp-badge-icon">
              <Package size={34} />
              <span className="live-pulse-dot" title="Kế hoạch cứu trợ 24/7" />
            </div>

            <div className="cp-text-group">
              <div className="cp-status-row">
                <span className="operational-badge">
                  <span className="pulse-point" /> ĐIỀU PHỐI NHU YẾU PHẨM
                </span>
                <span className="team-code-badge">
                  <Flame size={12} /> {stats.total} CHIẾN DỊCH ĐÃ KHỞI LẬP
                </span>
              </div>

              <h1 className="hero-main-title">
                Kế Hoạch & Chiến Dịch Cứu Trợ Nhu Yếu Phẩm
              </h1>

              <div className="hero-sub-meta">
                <span className="meta-pill">
                  Đang thực hiện: <strong>{stats.inProgress} chiến dịch</strong>
                </span>
                <span className="meta-separator">•</span>
                <span className="meta-pill">
                  Đã hoàn thành: <strong>{stats.completed} chiến dịch</strong>
                </span>
                <span className="meta-separator">•</span>
                <span className="meta-pill">
                  Đồng bộ lúc: <span>{lastRefreshed.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="cpNav__hero-actions">
            <button
              className={`btn-hero-refresh ${refreshing ? "btn-hero-refresh--active" : ""}`}
              onClick={() => fetchData(true)}
              title="Làm mới danh sách chiến dịch"
            >
              <RotateCcw size={15} />
              <span>Đồng bộ</span>
            </button>
          </div>
        </div>

        {/* SUMMARY STATS BAR */}
        <div className="cpNav__stat-strip">
          <div className="stat-strip-box">
            <span className="stat-strip-title">Tổng chiến dịch</span>
            <span className="stat-strip-value text-cyan">{stats.total} chiến dịch</span>
          </div>
          <div className="stat-strip-box">
            <span className="stat-strip-title">Đang triển khai phát quà</span>
            <span className="stat-strip-value text-purple">{stats.inProgress} chiến dịch</span>
          </div>
          <div className="stat-strip-box">
            <span className="stat-strip-title">Hoàn tất phân phối</span>
            <span className="stat-strip-value text-green">{stats.completed} chiến dịch</span>
          </div>
          <div className="stat-strip-box">
            <span className="stat-strip-title">Đang chờ phê duyệt</span>
            <span className="stat-strip-value text-amber">{stats.pending} chiến dịch</span>
          </div>
        </div>
      </section>

      {/* 2. TOOLBAR FILTERS */}
      <section className="cpNav__toolbar">
        <div className="toolbar-search-wrap">
          <Search size={18} className="search-icon-left" />
          <input
            type="text"
            className="modern-search-input"
            placeholder="Tìm theo mã chiến dịch, tên chiến dịch, người phụ trách..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="btn-clear-query" onClick={() => setQuery("")}>
              ×
            </button>
          )}
        </div>

        <div className="toolbar-filters-row">
          <Select
            allowClear
            placeholder="Trạng thái thực hiện"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 190 }}
            options={statusOptions}
            showSearch
            optionFilterProp="label"
          />

          <Select
            allowClear
            placeholder="Theo tháng"
            value={monthFilter}
            onChange={setMonthFilter}
            style={{ width: 140 }}
            options={monthOptions}
          />

          <Select
            allowClear
            placeholder="Theo năm"
            value={yearFilter}
            onChange={setYearFilter}
            style={{ width: 120 }}
            options={yearOptions}
          />

          {(query || statusFilter || monthFilter || yearFilter) && (
            <button
              className="btn-filter-reset"
              onClick={() => {
                setQuery("");
                setStatusFilter(null);
                setMonthFilter(null);
                setYearFilter(null);
              }}
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </section>

      {/* 3. TABLE */}
      <section className="cpNav__table-container">
        <Table
          rowKey="campaignID"
          columns={columns}
          dataSource={filteredList}
          loading={loading}
          pagination={{
            pageSize: 6,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} chiến dịch cứu trợ`,
          }}
          className="modern-cp-table"
        />
      </section>
    </div>
  );
}