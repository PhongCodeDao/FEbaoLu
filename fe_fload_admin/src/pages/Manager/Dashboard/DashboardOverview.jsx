import { useEffect, useState, useMemo } from "react";
import { message, Row, Col, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  RotateCcw,
  Truck,
  Package,
  CheckCircle2,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  Activity,
  Layers,
} from "lucide-react";
import "./DashboardOverview.css";

import {
  getDashboardManagement,
} from "../../../../api/axios/ManagerApi/getDashboardManagement";
import {
  getCompletedRequestsCount,
  getDashboardSummaryDetail,
} from "../../../../api/axios/ManagerApi/getDashboardSummaryDetail";

import RescueTrendChart from "../../../components/ManagerComponents/Dashboard/RescueTrendChart";
import SummaryCards from "../../../components/ManagerComponents/Dashboard/SummaryCards";
import RecentActivities from "../../../components/ManagerComponents/Dashboard/RecentActivities";
import CampaignProgress from "../../../components/ManagerComponents/Dashboard/CampaignProgress";
import TeamStatus from "../../../components/ManagerComponents/Dashboard/TeamStatus";
import InventoryAlerts from "../../../components/ManagerComponents/Dashboard/InventoryAlerts";
import SummaryDetailPanel from "../../../components/ManagerComponents/Dashboard/SummaryDetailPanel";

export default function DashboardOverview() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const [activeSummaryKey, setActiveSummaryKey] = useState(null);
  const [summaryDetailData, setSummaryDetailData] = useState(null);
  const [summaryDetailLoading, setSummaryDetailLoading] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const normalize = (res) => res?.data || res || {};

  /* ================= LOAD DATA ================= */
  const fetchData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const [dashboardRes, completedRequests] = await Promise.all([
        getDashboardManagement("2026-02-28", "2026-04-04"),
        getCompletedRequestsCount(),
      ]);

      const dashboardData = normalize(dashboardRes);
      setData(dashboardData);
      setCompletedCount(completedRequests);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error(err);
      message.error("Lỗi tải dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= CLICK CARD ================= */
  const handleSummaryCardClick = async (summaryKey) => {
    try {
      setActiveSummaryKey(summaryKey);
      setSummaryDetailLoading(true);
      setSummaryDetailData(null);

      const res = await getDashboardSummaryDetail(summaryKey);
      const detailData = normalize(res);
      setSummaryDetailData(detailData);
    } catch (err) {
      console.error(err);
      message.error("Lỗi tải dữ liệu chi tiết");
    } finally {
      setSummaryDetailLoading(false);
    }
  };

  const handleCloseSummaryModal = () => {
    setActiveSummaryKey(null);
    setSummaryDetailData(null);
  };

  /* ================= LOADING ================= */
  if (loading && !data) {
    return (
      <div className="manager-dashboard-loading">
        <Spin size="large" />
        <p>Đang đồng bộ trung tâm điều hành kho & phương tiện...</p>
      </div>
    );
  }

  const summaryForCards = data?.summary ?? {};

  return (
    <div className="dashboard">
      {/* 1. EXECUTIVE HERO BANNER */}
      <section className="manager-hero">
        <div className="manager-hero__glow manager-hero__glow--1" />
        <div className="manager-hero__glow manager-hero__glow--2" />

        <div className="manager-hero__inner">
          <div className="manager-hero__info">
            <div className="manager-hero__badge-icon">
              <Layers size={34} />
              <span className="live-pulse-dot" title="Trung tâm điều hành 24/7" />
            </div>

            <div className="manager-hero__text">
              <div className="manager-status-row">
                <span className="manager-pill-badge">
                  <span className="pulse-point" /> TRỰC BAN ĐIỀU HÀNH TỔNG THỂ
                </span>
                <span className="manager-time-badge">
                  <Calendar size={12} /> Cập nhật: {lastRefreshed.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <h1 className="manager-hero__title">
                Trung Tâm Điều Hành Kho Bãi, Phương Tiện & Cứu Trợ
              </h1>

              <p className="manager-hero__subtitle">
                Giám sát số liệu tác chiến thời gian thực, điều phối phương tiện cơ động, kiểm soát xuất nhập tồn kho và tiến độ các chiến dịch cứu trợ khẩn cấp.
              </p>
            </div>
          </div>

          <div className="manager-hero__actions">
            <button
              className={`btn-manager-refresh ${refreshing ? "active" : ""}`}
              onClick={() => fetchData(true)}
              title="Đồng bộ dữ liệu thời gian thực"
            >
              <RotateCcw size={15} />
              <span>Đồng bộ</span>
            </button>
          </div>
        </div>

        {/* QUICK SHORTCUTS STRIP */}
        <div className="manager-shortcuts-strip">
          <button
            className="shortcut-chip"
            onClick={() => navigate("/manager/vehicles")}
          >
            <Truck size={14} className="text-cyan" />
            <span>Phương tiện cứu hộ</span>
            <ArrowRight size={12} className="arrow" />
          </button>

          <button
            className="shortcut-chip"
            onClick={() => navigate("/manager/inventory")}
          >
            <Package size={14} className="text-amber" />
            <span>Kho hàng nhu yếu phẩm</span>
            <ArrowRight size={12} className="arrow" />
          </button>

          <button
            className="shortcut-chip"
            onClick={() => navigate("/manager/approve")}
          >
            <CheckCircle2 size={14} className="text-green" />
            <span>Phê duyệt xuất nhập</span>
            <ArrowRight size={12} className="arrow" />
          </button>

          <button
            className="shortcut-chip"
            onClick={() => navigate("/manager/rescue-team")}
          >
            <Users size={14} className="text-purple" />
            <span>Đội ngũ cứu nạn</span>
            <ArrowRight size={12} className="arrow" />
          </button>
        </div>
      </section>

      {/* SUMMARY */}
      <SummaryCards
        summary={summaryForCards}
        activeKey={activeSummaryKey}
        onClickItem={handleSummaryCardClick}
        completedValue={completedCount}
      />

      {/* DETAIL PANEL */}
      <SummaryDetailPanel
        summaryKey={activeSummaryKey}
        loading={summaryDetailLoading}
        data={summaryDetailData}
        onClear={handleCloseSummaryModal}
      />

      {/* CHART */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <RescueTrendChart data={data?.rescueTrends} />
        </Col>
      </Row>

      {/* TEAM + INVENTORY */}
      <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <TeamStatus data={data?.teamStatusOverview} />
        </Col>

        <Col xs={24} lg={12}>
          <InventoryAlerts data={data?.inventoryAlerts} />
        </Col>
      </Row>

      {/* CAMPAIGN */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <CampaignProgress data={data?.campaignProgress} />
        </Col>
      </Row>

      {/* ACTIVITIES */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <RecentActivities data={data?.recentActivities} />
        </Col>
      </Row>
    </div>
  );
}