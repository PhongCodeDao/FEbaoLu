import { Button, Input, Image, Modal, Tag, Tooltip } from "antd";
import { useState, useEffect } from "react";
import {
  PhoneOutlined,
  UserOutlined,
  AlertOutlined,
  EnvironmentOutlined,
  PictureOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CompassOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import {
  getUrgencyLevels,
  verifyAndDispatchRescueRequest,
  rejectRescueRequest,
} from "../../../../api/axios/CoordinatorApi/RescueRequestApi";

import AuthNotify from "../../../utils/Common/AuthNotify";
import { FALLBACK_RESCUE_IMAGE, extractImageUrls } from "../../../utils/imageUtils";

import "./MissionDetail.css";

export default function MissionDetail({ mission }) {
  const [urgencyLevels, setUrgencyLevels] = useState([]);
  const [priority, setPriority] = useState(null);
  const [note, setNote] = useState("");
  const [recommendedPriority, setRecommendedPriority] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const navigate = useNavigate();

  const openRejectPopup = () => {
    setRejectReason("");
    setRejectOpen(true);
  };

  useEffect(() => {
    setPriority(null);
    setRecommendedPriority(null);
    setNote("");
  }, [mission]);

  /* ================= LOAD URGENCY LEVEL ================= */
  useEffect(() => {
    const fetchUrgencyLevels = async () => {
      try {
        const data = await getUrgencyLevels();
        const list = Array.isArray(data) ? data : data?.data || [];
        setUrgencyLevels(list);
      } catch (error) {
        console.error("Fetch urgency levels error:", error);
      }
    };
    fetchUrgencyLevels();
  }, []);

  const formatSLA = (minutes) => {
    if (!minutes) return "--";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} phút`;
    if (m === 0) return `${h} giờ`;
    return `${h}g ${m}p`;
  };

  /* ================= CONFIRM VERIFY ================= */
  const handleConfirm = async () => {
    if (!priority) {
      AuthNotify.warning("Chưa chọn mức độ", "Vui lòng chọn mức độ ưu tiên trước khi xác nhận");
      return;
    }

    try {
      setConfirmLoading(true);
      const selectedIndex = parseInt(priority.replace("P", ""), 10) - 1;
      const selectedLevel = urgencyLevels[selectedIndex] || urgencyLevels[0];

      const payload = {
        rescueRequestId: mission.id || mission.rescueRequestId,
        urgencyLevelId: selectedLevel?.urgencyLevelId || 1,
        verificationNote: note,
      };

      await verifyAndDispatchRescueRequest(payload);
      AuthNotify.success(
        "Xác minh thành công",
        "Yêu cầu đã được xác thực và chuyển vào danh sách chờ điều phối"
      );
      navigate("/coordinator/dang", {
        state: { updatedRequestId: payload.rescueRequestId },
      });
    } catch (error) {
      console.error(error);
      AuthNotify.error(
        "Xác minh thất bại",
        error?.response?.data?.message || "Vui lòng thử lại"
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  /* ================= REJECT CONFIRM ================= */
  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      AuthNotify.warning("Thiếu lý do", "Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      setRejectLoading(true);
      await rejectRescueRequest(
        mission.id || mission.rescueRequestId,
        rejectReason
      );
      AuthNotify.success("Từ chối yêu cầu thành công");
      setRejectOpen(false);
      navigate("/coordinator");
    } catch (error) {
      console.error(error);
      AuthNotify.error("Từ chối yêu cầu thất bại");
    } finally {
      setRejectLoading(false);
    }
  };

  /* ================= EMPTY STATE ================= */
  if (!mission) {
    return (
      <div className="rc-empty-detail">
        <div className="rc-empty-radar">
          <CompassOutlined />
        </div>
        <h3>Trung Tâm Thẩm Định Cứu Hộ</h3>
        <p>
          Vui lòng chọn một yêu cầu từ danh sách hàng đợi bên trái để kiểm tra hiện trường,
          xác minh thông tin người dân và phân cấp ưu tiên điều phối.
        </p>
      </div>
    );
  }

  const images = extractImageUrls(mission);
  const requestId = mission.id || mission.rescueRequestId;
  const victimCount = Number(mission.victimCount || 0);

  return (
    <section className="rc-md">
      {/* HEADER BAR */}
      <header className="rc-md__header">
        <div className="rc-md__header-info">
          <div className="rc-md__title-row">
            <h2 className="rc-md__title">Yêu Cầu Cứu Hộ #{requestId}</h2>
            <span className="rc-md__status-chip">
              <ClockCircleOutlined />
              CHỜ THẨM ĐỊNH
            </span>
          </div>
          <div className="rc-md__meta">
            <span>
              Tiếp nhận lúc: {new Date(mission.createdAt).toLocaleString("vi-VN")}
            </span>
            <span>•</span>
            <span>Loại sự cố: <strong>{mission.incident || "Cứu hộ khẩn cấp"}</strong></span>
          </div>
        </div>

        <Button
          icon={<PhoneOutlined />}
          className="rc-md__call-btn"
          href={`tel:${mission.phone || mission.contactPhone}`}
        >
          GỌI ĐIỆN XÁC MINH
        </Button>
      </header>

      {/* GRID CONTENT */}
      <div className="rc-md__grid">
        {/* LEFT COLUMN */}
        <div className="rc-md__col">
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
                <span className="rc-info-value">{mission.name || mission.fullName}</span>
              </div>
              <div className="rc-info-cell">
                <span className="rc-info-label">Số điện thoại</span>
                <span className="rc-info-value phone">{mission.phone || mission.contactPhone}</span>
              </div>
              <div className="rc-info-cell">
                <span className="rc-info-label">Số nạn nhân</span>
                <span className={`rc-info-value ${victimCount > 0 ? "highlight-danger" : ""}`}>
                  {victimCount > 0 ? `${victimCount} người` : "Chưa rõ"}
                </span>
              </div>
            </div>

            <span className="rc-info-label" style={{ marginBottom: 6 }}>Vị trí / Địa chỉ chi tiết</span>
            <div className="rc-address-box">
              <EnvironmentOutlined style={{ color: "#ef4444", fontSize: 16, marginTop: 2, flexShrink: 0 }} />
              <span>{mission.address}</span>
            </div>
          </div>

          {/* INCIDENT DETAILS & URGENCY SCORE */}
          <div className="rc-card">
            <div className="rc-card__header">
              <h4 className="rc-card__title">
                <AlertOutlined className="rc-card__icon" />
                Tình Trạng Thực Địa & Nhu Cầu
              </h4>
            </div>

            {mission.urgencyScore > 0 && (
              <div className="rc-score-banner">
                <div className="rc-score-text">
                  <span className="rc-score-title">Điểm đánh giá AI khẩn cấp</span>
                  <span className="rc-score-desc">Tổng hợp từ từ khóa, số nạn nhân và mức độ ngập lụt</span>
                </div>
                <span className="rc-score-number">{mission.urgencyScore}</span>
              </div>
            )}

            <div className="rc-info-grid">
              <div className="rc-info-cell">
                <span className="rc-info-label">Dụng cụ cứu hộ sẵn có</span>
                <span className="rc-info-value">{mission.availableRescueTool || "Không có"}</span>
              </div>
              <div className="rc-info-cell">
                <span className="rc-info-label">Nhu cầu đặc biệt</span>
                <span className="rc-info-value">{mission.specialNeeds || "Không"}</span>
              </div>
            </div>

            <span className="rc-info-label" style={{ marginTop: 8, marginBottom: 4 }}>Mô tả từ người dân</span>
            <div className="rc-quote-box">
              "{mission.detailDescription || "Người dân không để lại mô tả chi tiết."}"
            </div>

            {mission.rescueTeamNote && (
              <>
                <span className="rc-info-label" style={{ marginTop: 12, marginBottom: 4 }}>Ghi chú đội cứu hộ</span>
                <div className="rc-quote-box" style={{ borderColor: "#10b981", background: "#f0fdf4" }}>
                  {mission.rescueTeamNote}
                </div>
              </>
            )}
          </div>

          {/* REALTIME MAP */}
          <div className="rc-card">
            <div className="rc-card__header">
              <h4 className="rc-card__title">
                <EnvironmentOutlined className="rc-card__icon" />
                Vị Trí Bản Đồ GPS
              </h4>
              <Tag color="green">Vệ Tinh Trực Tuyến</Tag>
            </div>

            <div className="rc-map-wrapper">
              <iframe
                title="map"
                src={`https://www.google.com/maps?q=${mission.locationLat || 10.8231},${mission.locationLng || 106.6297}&z=15&output=embed`}
              />
              <a
                href={`https://www.google.com/maps?q=${mission.locationLat},${mission.locationLng}`}
                target="_blank"
                rel="noreferrer"
                className="rc-map-link"
              >
                Mở Google Maps ↗
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="rc-md__col">
          {/* SCENE IMAGES */}
          <div className="rc-card">
            <div className="rc-card__header">
              <h4 className="rc-card__title">
                <PictureOutlined className="rc-card__icon" />
                Hình Ảnh Hiện Trường
              </h4>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                {images.length} ảnh đính kèm
              </span>
            </div>

            {images.length > 0 ? (
              <div className="rc-image-grid">
                <Image.PreviewGroup>
                  {images.map((img, i) => (
                    <div className="rc-image-thumb" key={i}>
                      <Image
                        src={img}
                        fallback={FALLBACK_RESCUE_IMAGE}
                        alt={`rescue-scene-${i}`}
                        preview={{ mask: "Xem ảnh lớn" }}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </Image.PreviewGroup>
              </div>
            ) : (
              <div className="rc-image-empty">
                Chưa có hình ảnh nào được tải lên từ hiện trường
              </div>
            )}
          </div>

          {/* PRIORITY SELECTION */}
          <div className="rc-card">
            <div className="rc-card__header">
              <h4 className="rc-card__title">
                <SafetyCertificateOutlined className="rc-card__icon" />
                Phân Cấp Khẩn Cấp & SLA
              </h4>
            </div>

            <div className="rc-priority-list">
              {urgencyLevels.map((level, index) => {
                const priorityCode = `P${index + 1}`;
                const isActive = priority === priorityCode;

                return (
                  <div
                    key={level.urgencyLevelId}
                    className={`rc-priority-card ${isActive ? "is-active" : ""}`}
                    onClick={() => setPriority(priorityCode)}
                  >
                    <div className="rc-priority-radio" />
                    <div className="rc-priority-info">
                      <div className="rc-priority-name-row">
                        <span className="rc-priority-name">
                          {priorityCode} - {level.levelName}
                        </span>
                        <span className="rc-priority-sla">
                          SLA: {formatSLA(level.slaMinutes)}
                        </span>
                      </div>
                      <p className="rc-priority-desc">{level.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* VERIFICATION NOTES & ACTIONS */}
          <div className="rc-card">
            <div className="rc-card__header">
              <h4 className="rc-card__title">
                <FileTextOutlined className="rc-card__icon" />
                Ghi Chú Thẩm Định & Chỉ Đạo
              </h4>
            </div>

            <Input.TextArea
              rows={3}
              placeholder="Nhập ghi chú thẩm định hoặc dặn dò khi phân công đội cứu hộ..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ borderRadius: 10, borderColor: "#cbd5e1", marginBottom: 16 }}
            />

            <div className="rc-action-bar">
              <Button
                className="rc-btn-dispatch"
                disabled={!priority}
                loading={confirmLoading}
                onClick={handleConfirm}
              >
                ▶ XÁC NHẬN & CHUYỂN ĐIỀU PHỐI
              </Button>

              <Button
                className="rc-btn-reject"
                onClick={openRejectPopup}
              >
                🚫 Báo Giả Mạo / Trùng Lặp
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* REJECT MODAL */}
      <Modal
        title="🚫 Từ chối / Đánh dấu yêu cầu không hợp lệ"
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        onOk={handleRejectConfirm}
        okText="Xác nhận từ chối"
        okButtonProps={{ danger: true }}
        cancelText="Quay lại"
        confirmLoading={rejectLoading}
      >
        <p style={{ color: "#475569", marginBottom: 12 }}>
          Nhập lý do từ chối (yêu cầu giả mạo, trùng lặp, hoặc không đủ thông tin xác minh):
        </p>
        <Input.TextArea
          rows={4}
          placeholder="Ví dụ: Đã gọi xác minh 3 lần nhưng không liên lạc được..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          style={{ borderRadius: 8 }}
        />
      </Modal>
    </section>
  );
}