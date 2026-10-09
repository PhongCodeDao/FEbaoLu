import { useEffect, useState } from "react";
import { Image, Tag, Spin } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CarOutlined,
  EnvironmentOutlined,
  PictureOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  AlertOutlined,
  FileDoneOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";

import {
  getRescueProgress,
  getUrgencyLevels,
  getRescueTeamMembers,
} from "../../../../api/axios/CoordinatorApi/RescueRequestApi";
import verifyIcon from "../../../assets/verifire.svg";
import { extractImageUrls, FALLBACK_RESCUE_IMAGE } from "../../../utils/imageUtils";
import "./RescueReportDetail.css";

const getUrgencyColor = (id) => {
  const colors = [
    "red",
    "orange",
    "green",
    "blue",
    "purple",
    "cyan",
    "gold",
    "lime",
    "magenta",
    "volcano",
  ];
  return colors[(id - 1) % colors.length] || "default";
};

export default function RescueReportDetail({ mission }) {
  const [data, setData] = useState(null);
  const [urgencyLevels, setUrgencyLevels] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestId = mission?.id;

  /* ================= LOAD PROGRESS ================= */
  useEffect(() => {
    if (!requestId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [progressRes, urgencyRes] = await Promise.all([
          getRescueProgress(requestId),
          getUrgencyLevels(),
        ]);

        setData(progressRes);

        const urgencyList = Array.isArray(urgencyRes)
          ? urgencyRes
          : Array.isArray(urgencyRes?.data)
          ? urgencyRes.data
          : [];

        setUrgencyLevels(urgencyList);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [requestId]);

  /* ================= LOAD TEAM MEMBERS ================= */
  useEffect(() => {
    const teamId = data?.assignment?.rescueTeam?.rescueTeamId;
    if (!teamId) return;

    const fetchMembers = async () => {
      try {
        const res = await getRescueTeamMembers(teamId);
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.items)
          ? res.data.items
          : [];
        setTeamMembers(list);
      } catch (err) {
        console.error("LOAD TEAM MEMBERS ERROR:", err);
      }
    };

    fetchMembers();
  }, [data]);

  if (!mission) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>
        <FileDoneOutlined style={{ fontSize: 44, color: "#cbd5e1", marginBottom: 12 }} />
        <h3 style={{ fontSize: 18, color: "#0f172a" }}>Hồ Sơ Nghiệm Thu Cứu Hộ</h3>
        <p>Vui lòng chọn một hồ sơ từ danh sách bên trái để kiểm tra chi tiết kết quả tác chiến.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Đang trích xuất dữ liệu nghiệm thu...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "#ef4444" }}>
        <p>Lỗi tải báo cáo: {error || "Không có dữ liệu tiến độ"}</p>
      </div>
    );
  }

  const formatTime = (date) => {
    if (!date) return "--";
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    if (!date) return "--";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const calcDuration = (start, end) => {
    if (!start || !end) return "--";
    const diff = new Date(end) - new Date(start);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h} giờ ${m} phút`;
  };

  const request = data.rescueRequest || {};
  const assignment = data.assignment || {};

  const getDurationMinutes = (start, end) => {
    if (!start || !end) return null;
    return (new Date(end) - new Date(start)) / 60000;
  };

  const actualMinutes = getDurationMinutes(
    request?.createdAt,
    assignment?.completedAt
  );

  const urgency = urgencyLevels.find(
    (u) => u.urgencyLevelId === request?.urgencyLevelId
  );

  const isRejected = data.currentProgressCode === "REQUEST_REJECTED";
  const isOnTime =
    actualMinutes !== null &&
    urgency?.slaMinutes &&
    actualMinutes <= urgency.slaMinutes;

  const normalizedImages = extractImageUrls(request);

  const formatSLA = (minutes) => {
    if (!minutes) return "--";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} phút`;
    if (m === 0) return `${h} giờ`;
    return `${h}g ${m}p`;
  };

  return (
    <section className="rc-rpt-detail">
      {/* HEADER */}
      <header className="rc-rpt-detail__header">
        <div className="rc-rpt-detail__title-wrap">
          <h2>
            Báo Cáo Nghiệm Thu Cứu Hộ #{request?.rescueRequestId}
            <Tag
              color={
                data.currentProgressCode === "COMPLETED"
                  ? "green"
                  : isRejected
                  ? "red"
                  : "blue"
              }
              style={{ fontSize: 12, padding: "2px 10px", borderRadius: 6, fontWeight: 700 }}
            >
              {data.currentProgressLabel || (isRejected ? "Đã từ chối" : "Đã hoàn thành")}
            </Tag>
          </h2>
          <div className="rc-rpt-detail__meta">
            <span>Tiếp nhận: {new Date(request.createdAt).toLocaleString("vi-VN")}</span>
            <span>•</span>
            <span>Cấp độ: <strong>{urgency?.levelName || "Khẩn cấp"}</strong></span>
          </div>
        </div>

        <Tag color={getUrgencyColor(urgency?.urgencyLevelId)} style={{ padding: "4px 12px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
          {urgency?.levelName || "Khẩn cấp"}
        </Tag>
      </header>

      {/* KPI METRIC CARDS */}
      <div className="rc-rpt-stats">
        <div className="rc-stat-box">
          <span className="rc-stat-label">Thời gian bắt đầu</span>
          <span className="rc-stat-value">{formatTime(request.createdAt)}</span>
          <span className="rc-stat-sub">{formatDate(request.createdAt)}</span>
        </div>

        <div className="rc-stat-box success">
          <span className="rc-stat-label">Thời gian hoàn thành</span>
          <span className="rc-stat-value">{formatTime(assignment?.completedAt)}</span>
          <span className="rc-stat-sub">{formatDate(assignment?.completedAt)}</span>
        </div>

        <div className="rc-stat-box warning">
          <span className="rc-stat-label">Số người cứu nạn</span>
          <span className="rc-stat-value" style={{ color: "#d97706" }}>
            {isRejected ? "--" : `${request.victimCount || 0} người`}
          </span>
          <span className="rc-stat-sub">An toàn tại hiện trường</span>
        </div>

        <div className={`rc-stat-box ${isOnTime ? "success" : "danger"}`}>
          <span className="rc-stat-label">Tổng thời lượng & SLA</span>
          <span className="rc-stat-value" style={{ fontSize: 20 }}>
            {assignment?.completedAt
              ? calcDuration(request.createdAt, assignment.completedAt)
              : "--"}
          </span>
          <span className="rc-stat-sub" style={{ color: isOnTime ? "#10b981" : "#ef4444", fontWeight: 700 }}>
            {isOnTime ? "● ĐÚNG TIẾN ĐỘ" : "● TRỄ TIẾN ĐỘ"} (SLA: {formatSLA(urgency?.slaMinutes)})
          </span>
        </div>
      </div>

      {/* GRID CONTENT */}
      <div className="rc-rpt-grid">
        {/* LEFT COLUMN */}
        <div className="rc-rpt-col">
          {/* SENDER INFO */}
          <div className="rc-card">
            <div className="rc-card__header">
              <h4 className="rc-card__title">
                <UserOutlined className="rc-card__icon" />
                Thông Tin Người Gặp Nạn
              </h4>
            </div>

            <div className="rc-info-grid">
              <div className="rc-info-cell">
                <span className="rc-info-label">Họ và tên</span>
                <span className="rc-info-value">{request.fullName}</span>
              </div>
              <div className="rc-info-cell">
                <span className="rc-info-label">Số điện thoại</span>
                <span className="rc-info-value" style={{ color: "#0284c7" }}>
                  {request.contactPhone}
                </span>
              </div>
              <div className="rc-info-cell">
                <span className="rc-info-label">Loại sự cố</span>
                <span className="rc-info-value">{request.requestType}</span>
              </div>
            </div>

            <span className="rc-info-label" style={{ marginBottom: 4 }}>Vị trí địa bàn</span>
            <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, color: "#334155" }}>
              <EnvironmentOutlined style={{ color: "#ef4444", marginRight: 6 }} />
              {request.address}
            </div>
          </div>

          {/* INCIDENT DETAILS */}
          <div className="rc-card">
            <div className="rc-card__header">
              <h4 className="rc-card__title">
                <AlertOutlined className="rc-card__icon" />
                Mô Tả Hiện Trường & Nguồn Lực
              </h4>
              {request.urgencyScore > 0 && (
                <Tag color="orange" style={{ fontWeight: 700 }}>
                  Điểm AI: {request.urgencyScore}
                </Tag>
              )}
            </div>

            <div className="rc-info-grid">
              <div className="rc-info-cell">
                <span className="rc-info-label">Dụng cụ có sẵn</span>
                <span className="rc-info-value">{request.availableRescueTool || "Không có"}</span>
              </div>
              <div className="rc-info-cell">
                <span className="rc-info-label">Nhu cầu đặc biệt</span>
                <span className="rc-info-value">{request.specialNeeds || "Cơ bản"}</span>
              </div>
            </div>

            <span className="rc-info-label" style={{ marginTop: 8, marginBottom: 4 }}>Chi tiết từ người dân</span>
            <div style={{ background: "#f0f9ff", borderLeft: "4px solid #0284c7", padding: "12px 14px", borderRadius: "0 10px 10px 0", fontSize: 13, fontStyle: "italic", color: "#1e293b" }}>
              "{request.detailDescription || "Không có mô tả thêm."}"
            </div>
          </div>

          {/* SCENE IMAGES */}
          <div className="rc-card">
            <div className="rc-card__header">
              <h4 className="rc-card__title">
                <PictureOutlined className="rc-card__icon" />
                Hình Ảnh Nghiệm Thu Thực Tế
              </h4>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                {normalizedImages.length} ảnh
              </span>
            </div>

            {normalizedImages.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
                <Image.PreviewGroup>
                  {normalizedImages.map((img, i) => (
                    <div key={i} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0", aspectRatio: "4/3" }}>
                      <Image
                        src={img}
                        alt={`rescue-report-${i + 1}`}
                        fallback={FALLBACK_RESCUE_IMAGE}
                        preview={{ mask: "Xem lớn" }}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  ))}
                </Image.PreviewGroup>
              </div>
            ) : (
              <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13, background: "#f8fafc", borderRadius: 10 }}>
                Chưa có ảnh nghiệm thu
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="rc-rpt-col">
          {/* RESCUE FORCE & VEHICLE */}
          <div className="rc-card">
            <div className="rc-card__header">
              <h4 className="rc-card__title">
                <TeamOutlined className="rc-card__icon" />
                Lực Lượng Tham Gia Cứu Hộ
              </h4>
            </div>

            <div className="rc-info-grid">
              <div className="rc-info-cell">
                <span className="rc-info-label">Đội cứu hộ</span>
                <span className="rc-info-value">{assignment?.rescueTeam?.teamName || "Chưa rõ"}</span>
              </div>
              <div className="rc-info-cell">
                <span className="rc-info-label">Số liên lạc đội</span>
                <span className="rc-info-value" style={{ color: "#0284c7" }}>
                  {assignment?.rescueTeam?.contactPhone || "--"}
                </span>
              </div>
            </div>

            <div className="rc-info-grid">
              <div className="rc-info-cell">
                <span className="rc-info-label">Phương tiện điều động</span>
                <span className="rc-info-value">
                  <CarOutlined style={{ marginRight: 6, color: "#0284c7" }} />
                  {assignment?.vehicle?.vehicleName || "Phương tiện cứu hộ"}
                </span>
              </div>
              <div className="rc-info-cell">
                <span className="rc-info-label">Loại xe / xuồng</span>
                <span className="rc-info-value">{assignment?.vehicle?.vehicleType || "Chuyên dụng"}</span>
              </div>
            </div>
          </div>

          {/* TEAM MEMBERS TABLE */}
          <div className="rc-card">
            <div className="rc-card__header">
              <h4 className="rc-card__title">
                <TeamOutlined className="rc-card__icon" />
                Thành Viên Tác Chiến ({teamMembers.length})
              </h4>
            </div>

            {teamMembers.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>Không có danh sách thành viên</p>
            ) : (
              <table className="rc-members-table">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>STT</th>
                    <th>Họ và tên</th>
                    <th>Số điện thoại</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((m, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: 700, color: "#94a3b8" }}>{index + 1}</td>
                      <td style={{ fontWeight: 600, color: "#0f172a" }}>{m.fullName || m.name || "—"}</td>
                      <td style={{ color: "#0284c7", fontFamily: "ui-monospace, monospace" }}>
                        {m.phone || m.contactPhone || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* CITIZEN CONFIRMATION CERTIFICATE */}
          {!isRejected && (
            <div className="rc-certificate">
              <div className="rc-cert-header">
                <h4>Biên Bản Nghiệm Thu & Xác Nhận</h4>
              </div>

              <div className="rc-cert-box">
                <div className="rc-cert-avatar">
                  <CheckCircleFilled />
                </div>
                <h4 className="rc-cert-name">{request.fullName || "Đại diện người dân"}</h4>
                <p className="rc-cert-quote">
                  "{request.note || "Đã nhận đầy đủ hỗ trợ và an toàn tại địa điểm tập kết."}"
                </p>

                <div className="rc-cert-seal">
                  <img src={verifyIcon} width={24} alt="verified" />
                  <span>XÁC THỰC CỨU HỘ HOÀN TẤT</span>
                </div>

                <span className="rc-cert-time">
                  Ký điện tử: {assignment?.completedAt ? new Date(assignment.completedAt).toLocaleString("vi-VN") : "Hôm nay"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
