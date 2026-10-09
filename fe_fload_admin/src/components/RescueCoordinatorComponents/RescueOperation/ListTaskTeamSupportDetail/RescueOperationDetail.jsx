import { useEffect, useState } from "react";
import { Image, Tag, Spin } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CarOutlined,
  EnvironmentOutlined,
  PictureOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  SendOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import {
  getRescueAssignmentById,
  getPendingRescueRequests,
  getUrgencyLevels,
} from "../../../../../api/axios/CoordinatorApi/RescueRequestApi";
import { getAllRescueTeams } from "../../../../../api/axios/ManagerApi/rescueTeamApi";
import { getAllVehicles } from "../../../../../api/axios/ManagerApi/vehicleApi";
import { getRequestStatuses } from "../../../../../api/axios/Auth/authApi";
import { extractImageUrls, FALLBACK_RESCUE_IMAGE } from "../../../../utils/imageUtils";
import "./rescue-operation-detail.css";

const STATUS_STEPS = [
  { key: "PENDING", label: "Chờ điều phối", icon: <ClockCircleOutlined /> },
  { key: "ASSIGNED", label: "Đã điều động", icon: <SendOutlined /> },
  { key: "ACCEPTED", label: "Đội đã nhận", icon: <CheckCircleOutlined /> },
  { key: "DEPARTED", label: "Đang xuất phát", icon: <RocketOutlined /> },
  { key: "ARRIVED", label: "Đã đến hiện trường", icon: <EnvironmentOutlined /> },
  { key: "COMPLETED", label: "Hoàn thành", icon: <SafetyCertificateOutlined /> },
];

export default function RescueOperationDetail({ assignmentId }) {
  const [detail, setDetail] = useState(null);
  const [location, setLocation] = useState({ lat: 10.8231, lng: 106.6297 });
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  /* ================= LOAD DATA ================= */
  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        assignment,
        requestRes,
        urgencyRes,
        teamRes,
        vehicleRes,
        statusRes,
      ] = await Promise.all([
        getRescueAssignmentById(assignmentId),
        getPendingRescueRequests(),
        getUrgencyLevels(),
        getAllRescueTeams(),
        getAllVehicles(),
        getRequestStatuses(),
      ]);

      const requests = requestRes?.data || requestRes || [];
      const teams = teamRes?.data?.items || [];
      const vehicles = vehicleRes?.data || [];
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

      const urgencyMap = {};
      urgencies.forEach((u) => {
        urgencyMap[u.urgencyLevelId] = u;
      });

      const statusMap = {};
      statuses.forEach((s) => {
        statusMap[s.statusId] = s.description;
      });

      const req = requests.find(
        (r) => r.rescueRequestId === assignment?.rescueRequestId
      );

      const urgencyObj = urgencyMap[req?.urgencyLevelId];

      const data = {
        missionId: assignment.assignmentId,
        rescueRequestId: assignment.rescueRequestId,
        rescueTeamId: assignment.rescueTeamId,
        vehicleId: assignment.vehicleId,
        team: teamMap[assignment.rescueTeamId] || `Đội cứu hộ #${assignment.rescueTeamId}`,
        vehicle: vehicleMap[assignment.vehicleId] || `Phương tiện #${assignment.vehicleId}`,
        assignmentStatus: assignment.assignmentStatus || "ASSIGNED",
        fullname: req?.fullname || req?.fullName || "Người dân gặp nạn",
        phone: req?.contactPhone || "Chưa có",
        address: req?.address || "Chưa xác định",
        urgency: urgencyObj?.levelName || "Khẩn cấp",
        urgencyLevelId: req?.urgencyLevelId || 1,
        status: statusMap[req?.requestStatusId] || "Đang xử lý",
        urgencyScore: req?.urgencyScore || 0,
        startTime: assignment.assignedAt,
        detailDescription: req?.detailDescription || "",
        victimCount: req?.victimCount || 0,
        availableRescueTool: req?.availableRescueTool || "",
        specialNeeds: req?.specialNeeds || "",
        rejectReason: assignment?.rejectReason || "",
      };

      setDetail(data);

      if (req?.locationLat && req?.locationLng) {
        setLocation({
          lat: req.locationLat,
          lng: req.locationLng,
        });
      }

      setImages(extractImageUrls(req));
    } catch (err) {
      console.error("Load detail error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      fetchData();
    }
  }, [assignmentId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, fontSize: 15, fontWeight: 500 }}>
          Đang kết nối trung tâm chỉ huy thực địa...
        </p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="rc-op-empty">
        <ExclamationCircleOutlined style={{ fontSize: 36, color: "#94a3b8", marginBottom: 12 }} />
        <h3>Không tìm thấy nhiệm vụ</h3>
        <p>Vui lòng chọn một nhiệm vụ từ danh sách bên trái để xem tiến độ chi tiết.</p>
      </div>
    );
  }

  const isRejected = detail.assignmentStatus === "REJECTED";
  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === detail.assignmentStatus);

  return (
    <section className="rc-op-detail">
      {/* HEADER */}
      <header className="rc-op-detail__header">
        <div className="rc-op-detail__title-wrap">
          <h2>
            Nhiệm Vụ Tác Chiến #{detail.missionId} (Yêu cầu #{detail.rescueRequestId})
            <span className="rc-badge-pill" style={{ background: "#e0f2fe", color: "#0284c7" }}>
              {detail.urgency}
            </span>
          </h2>
          <div className="rc-op-detail__meta">
            <span>
              <ClockCircleOutlined /> Lệnh phát lúc:{" "}
              {detail.startTime ? new Date(detail.startTime).toLocaleString("vi-VN") : "Hôm nay"}
            </span>
            <span>•</span>
            <span>Tình trạng: <strong>{detail.assignmentStatus}</strong></span>
          </div>
        </div>

        <div>
          <Tag color={isRejected ? "red" : "blue"} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
            {detail.team}
          </Tag>
        </div>
      </header>

      {/* TIMELINE STEPPER */}
      <div className="rc-timeline-card">
        {isRejected ? (
          <div style={{ textAlign: "center", padding: 16, color: "#dc2626" }}>
            <h4 style={{ margin: 0, fontWeight: 700 }}>✖ NHIỆM VỤ ĐÃ BỊ TỪ CHỐI</h4>
            {detail.rejectReason && <p style={{ marginTop: 6, color: "#64748b" }}>Lý do: {detail.rejectReason}</p>}
          </div>
        ) : (
          <div className="rc-timeline-stepper">
            {STATUS_STEPS.map((step, index) => {
              const isDone = index < currentIndex;
              const isActive = index === currentIndex;

              return (
                <div key={step.key} className="rc-step-wrapper">
                  <div className={`rc-step-node ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
                    <div className="rc-step-icon">
                      {isDone ? <CheckCircleOutlined /> : step.icon}
                    </div>
                    <span className="rc-step-label">{step.label}</span>
                  </div>
                  {index < STATUS_STEPS.length - 1 && (
                    <div className={`rc-step-connector ${isDone ? "done" : ""}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TWO COLUMN GRID */}
      <div className="rc-op-grid">
        {/* LEFT COLUMN */}
        <div className="rc-op-col">
          {/* CITIZEN INFO */}
          <div className="rc-card">
            <div className="rc-card__header">
              <h4 className="rc-card__title">
                <UserOutlined className="rc-card__icon" />
                Thông Tin Người Dân Cứu Hộ
              </h4>
            </div>

            <div className="rc-info-grid">
              <div className="rc-info-cell">
                <span className="rc-info-label">Họ và tên</span>
                <span className="rc-info-value">{detail.fullname}</span>
              </div>
              <div className="rc-info-cell">
                <span className="rc-info-label">Số điện thoại</span>
                <span className="rc-info-value phone">{detail.phone}</span>
              </div>
              <div className="rc-info-cell">
                <span className="rc-info-label">Số nạn nhân</span>
                <span className="rc-info-value" style={{ color: detail.victimCount > 0 ? "#dc2626" : "inherit" }}>
                  {detail.victimCount > 0 ? `${detail.victimCount} người` : "Chưa rõ"}
                </span>
              </div>
            </div>

            <span className="rc-info-label" style={{ marginBottom: 4 }}>Vị trí gặp nạn</span>
            <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, color: "#334155" }}>
              <EnvironmentOutlined style={{ color: "#ef4444", marginRight: 6 }} />
              {detail.address}
            </div>
          </div>

          {/* INCIDENT DETAILS */}
          <div className="rc-card">
            <div className="rc-card__header">
              <h4 className="rc-card__title">
                <AlertOutlined className="rc-card__icon" />
                Tình Trạng Hiện Trường & Nhu Cầu
              </h4>
              {detail.urgencyScore > 0 && (
                <Tag color="orange" style={{ fontWeight: 700 }}>
                  Điểm AI: {detail.urgencyScore}
                </Tag>
              )}
            </div>

            <div className="rc-info-grid">
              <div className="rc-info-cell">
                <span className="rc-info-label">Dụng cụ cứu hộ có sẵn</span>
                <span className="rc-info-value">{detail.availableRescueTool || "Không có"}</span>
              </div>
              <div className="rc-info-cell">
                <span className="rc-info-label">Nhu cầu khẩn cấp</span>
                <span className="rc-info-value">{detail.specialNeeds || "Cứu hộ cơ bản"}</span>
              </div>
            </div>

            <span className="rc-info-label" style={{ marginTop: 8, marginBottom: 4 }}>Chi tiết từ hiện trường</span>
            <div style={{ background: "#f0f9ff", borderLeft: "4px solid #0284c7", padding: "12px 14px", borderRadius: "0 10px 10px 0", fontSize: 13, fontStyle: "italic", color: "#1e293b" }}>
              "{detail.detailDescription || "Không có mô tả chi tiết."}"
            </div>
          </div>

          {/* GPS REALTIME MAP */}
          <div className="rc-card">
            <div className="rc-card__header">
              <h4 className="rc-card__title">
                <EnvironmentOutlined className="rc-card__icon" />
                Bản Đồ GPS Vị Trí Cứu Hộ
              </h4>
              <Tag color="green">Vệ Tinh</Tag>
            </div>

            <div className="rc-map-mini">
              <iframe
                title="map-operation"
                src={`https://www.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="rc-op-col">
          {/* ASSIGNED FORCE */}
          <div className="rc-card">
            <div className="rc-card__header">
              <h4 className="rc-card__title">
                <TeamOutlined className="rc-card__icon" />
                Lực Lượng & Phương Tiện Tác Chiến
              </h4>
            </div>

            <div className="rc-team-highlight">
              <div className="rc-team-icon-wrap">
                <TeamOutlined />
              </div>
              <div className="rc-team-meta">
                <h4>{detail.team}</h4>
                <p>Mã đội tác chiến: #{detail.rescueTeamId}</p>
              </div>
            </div>

            <div className="rc-info-grid">
              <div className="rc-info-cell">
                <span className="rc-info-label">Phương tiện điều động</span>
                <span className="rc-info-value">
                  <CarOutlined style={{ marginRight: 6, color: "#0284c7" }} />
                  {detail.vehicle}
                </span>
              </div>
              <div className="rc-info-cell">
                <span className="rc-info-label">Trạng thái tác chiến</span>
                <span className="rc-info-value" style={{ color: "#10b981" }}>
                  ● Đang kết nối trực tiếp
                </span>
              </div>
            </div>
          </div>

          {/* SCENE IMAGES */}
          <div className="rc-card">
            <div className="rc-card__header">
              <h4 className="rc-card__title">
                <PictureOutlined className="rc-card__icon" />
                Hình Ảnh Hiện Trường
              </h4>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                {images.length} ảnh
              </span>
            </div>

            {images.length > 0 ? (
              <div className="rc-images-grid">
                <Image.PreviewGroup>
                  {images.map((img, i) => (
                    <div className="rc-image-thumb" key={i}>
                      <Image
                        src={img}
                        fallback={FALLBACK_RESCUE_IMAGE}
                        alt={`operation-${i}`}
                        preview={{ mask: "Xem lớn" }}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </Image.PreviewGroup>
              </div>
            ) : (
              <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13, background: "#f8fafc", borderRadius: 10 }}>
                Chưa có ảnh tải lên từ hiện trường
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
