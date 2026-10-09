import "./MissionDetailRescue.css";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Image } from "antd";
import {
  getRescueAssignmentById,
  getPendingRescueRequests,
  getUrgencyLevels,
} from "../../../../../api/axios/CoordinatorApi/RescueRequestApi";
import AuthNotify from "../../../../utils/Common/AuthNotify";
import {
  acceptRescueAssignment,
  rejectRescueAssignment,
} from "../../../../../api/axios/RescueApi/RescueTask";

import { getAllRescueTeams } from "../../../../../api/axios/ManagerApi/rescueTeamApi";
import { getAllVehicles } from "../../../../../api/axios/ManagerApi/vehicleApi";
import { getRequestStatuses } from "../../../../../api/axios/Auth/authApi";

const LOCK_STATUSES = ["ACCEPTED", "DEPARTED", "ARRIVED", "COMPLETED"];

const STATUS_STEPS = [
  { key: "PENDING", label: "Chờ điều phối", icon: "⏳" },
  { key: "ASSIGNED", label: "Đã điều động", icon: "📋" },
  { key: "ACCEPTED", label: "Đội đã nhận", icon: "👍" },
  { key: "DEPARTED", label: "Đã xuất phát", icon: "🚑" },
  { key: "ARRIVED", label: "Đã đến hiện trường", icon: "📍" },
  { key: "COMPLETED", label: "Hoàn thành", icon: "✔" },
  { key: "REJECTED", label: "Từ chối", icon: "❌" },
];
export default function MissionDetailRescue() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null);
  const [loadingAccept, setLoadingAccept] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const getStatusInfo = (status) => {
    return STATUS_STEPS.find((s) => s.key === status) || {};
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const [
          assignment,
          requestRes,
          urgencyRes,
          teamRes,
          vehicleRes,
          statusRes,
        ] = await Promise.all([
          getRescueAssignmentById(id),
          getPendingRescueRequests(),
          getUrgencyLevels(),
          getAllRescueTeams(),
          getAllVehicles(),
          getRequestStatuses(),
        ]);

        const requests = requestRes?.data || requestRes || [];
        const urgencies = urgencyRes || [];
        const teams = teamRes?.data?.items || [];
        const vehicles = vehicleRes?.data || [];
        const statuses = statusRes?.data || statusRes || [];

        const teamMap = {};
        teams.forEach((t) => (teamMap[t.rcid] = t.rcName));

        const vehicleMap = {};
        vehicles.forEach((v) => (vehicleMap[v.vehicleId] = v.vehicleName));

        const urgencyMap = {};
        urgencies.forEach((u) => {
          urgencyMap[u.urgencyLevelId] = u;
        });

        const statusMap = {};
        statuses.forEach((s) => (statusMap[s.statusId] = s.description));

        const req = requests.find(
          (r) => r.rescueRequestId === assignment.rescueRequestId
        );

        const urgencyObj = urgencyMap[req?.urgencyLevelId];

        const urgencyText = urgencyObj?.levelName || "Không xác định";
        const API_BASE = "https://api-rescue.purintech.id.vn";

const getImages = (req) => {
  const imgs = [];

  if (Array.isArray(req?.imageUrls)) {
    imgs.push(...req.imageUrls);
  }

  if (Array.isArray(req?.images)) {
    imgs.push(...req.images);
  }

  if (req?.locationImageUrl) {
    if (typeof req.locationImageUrl === "string") {
      imgs.push(...req.locationImageUrl.split(","));
    } else if (Array.isArray(req.locationImageUrl)) {
      imgs.push(...req.locationImageUrl);
    }
  }

  return [...new Set(
    imgs
      .map(i => i?.trim())
      .filter(Boolean)
      .map(i =>
        i.startsWith("http")
          ? i
          : `${API_BASE}${i.startsWith("/") ? "" : "/"}${i}`
      )
  )];
};

        setDetail({
          assignmentId: assignment.assignmentId,

          requestId: assignment.rescueRequestId,

          name: req?.fullName || req?.fullname || "Không rõ",

          phone: req?.contactPhone || "Không có",

          address: req?.address || "Chưa cập nhật",

          detailDescription: req?.detailDescription || "Không có mô tả",

          victimCount: req?.victimCount || 0,

          availableRescueTool: req?.availableRescueTool || "Không có",

          specialNeeds: req?.specialNeeds || "Không có",

          rescueTeamNote: req?.rescueTeamNote || "Không có",

          urgency: urgencyText,
          urgencyScore: req?.urgencyScore,
          status: assignment.assignmentStatus,

          team:
            teamMap[assignment.rescueTeamId] ||
            `Đội ${assignment.rescueTeamId}`,

          vehicle: vehicleMap[assignment.vehicleId] || "Không có xe",

          assignedAt: assignment.assignedAt,

          lat: req?.locationLat || 10.7731,
          lng: req?.locationLng || 106.7031,

          images: getImages(req),
        });
      } catch (err) {
        console.error("Load mission detail error:", err);
      }
    };

    fetchDetail();
  }, [id]);

  /* ================= ACCEPT ================= */

  const handleAccept = async () => {
    try {
      setLoadingAccept(true);

      console.log("CALL API ACCEPT ID:", id);

      const res = await acceptRescueAssignment(id);

      console.log("ACCEPT SUCCESS:", res);

      AuthNotify.success(
        "Nhận nhiệm vụ thành công",
        "Đang chuyển sang màn hình cứu hộ..."
      );

      setTimeout(() => {
        navigate(`/rescueTeam/dangcuho/${id}`);
      }, 500);
    } catch (err) {
      console.error("ACCEPT ERROR FULL:", err);
      console.error("RESPONSE:", err?.response);

      AuthNotify.error(
        "Nhận nhiệm vụ thất bại",
        err?.response?.data?.message || err.message
      );
    } finally {
      setLoadingAccept(false);
    }
  };

  /* ================= REJECT ================= */

  const handleReject = async () => {
    try {
      if (!rejectReason.trim()) {
        AuthNotify.warning("Vui lòng nhập lý do từ chối");
        return;
      }

      setLoadingReject(true);

      await rejectRescueAssignment(detail.assignmentId, {
        rejectReason: rejectReason, // ✅ đúng key backend cần
      });

      AuthNotify.warning("Đã từ chối nhiệm vụ");

      // 👉 đóng modal
      setShowRejectModal(false);
      setRejectReason("");

      // 👉 quay lại
      navigate(-1);
    } catch (err) {
      AuthNotify.error("Từ chối thất bại", err?.message || "Có lỗi xảy ra");
    } finally {
      setLoadingReject(false);
    }
  };

  if (!detail) {
    return <div className="md-loading">Đang tải dữ liệu nhiệm vụ...</div>;
  }
  const statusInfo = getStatusInfo(detail.status);
  const isLocked = LOCK_STATUSES.includes(detail?.status);
  return (
    <section className="md-root">
      {/* ================= HEADER ================= */}

      <header className="md-header">
        <div className="md-header-left">
          <div className="md-title">
            Nhiệm vụ cứu hộ
            <span className="md-badge">Mã yêu cầu: #{detail.requestId}</span>
            <span className="md-status">
              {statusInfo.icon} {statusInfo.label}
            </span>
          </div>

          <div className="md-time">
            ⏱ Phân công lúc:
            {detail.assignedAt
              ? new Date(detail.assignedAt).toLocaleString("vi-VN")
              : "Chưa phân công"}
          </div>

          <p className="md-address">Địa chỉ: {detail.address}</p>
        </div>

        <div className="md-header-right">
          <button
            className="md-call"
            onClick={() => (window.location.href = `tel:${detail.phone}`)}
          >
            📞 Gọi người yêu cầu
          </button>
        </div>
      </header>

      {/* ================= BODY ================= */}

      <div className="md-body">
        {/* LEFT */}

        <aside className="md-left">
          <div className="md-card">
            <h4 className="card-title">1. Người gửi yêu cầu</h4>

            <div className="md-row">
              <div className="md-info">
                <label>Họ tên</label>
                <b>{detail.name}</b>
              </div>

              <div className="md-info">
                <label>Số điện thoại</label>
                <b>{detail.phone}</b>
              </div>
            </div>
          </div>

          <div className="md-card md-danger">
            <h4 className="card-title">2. Mức độ nguy hiểm</h4>

            <p>{detail.urgency}</p>
          </div>

          <div className="md-card">
            <h4 className="card-title">3. Đội cứu hộ</h4>

            <p>Tên đội: {detail.team}</p>
            <p>Tên phương tiện: {detail.vehicle}</p>
          </div>

        
          <section className="card">

<h4 className="card-title">
  4. ĐIỂM ĐÁNH GIÁ MỨC ĐỘ
</h4>



<label>ĐIỂM MỨC ĐỘ</label>

<p>{detail.urgencyScore}</p>

</section>

          <section className="md-media">
            <h4 className="card-title">5. Hình ảnh hiện trường</h4>

            <div className="md-media-list">
            {detail.images?.length > 0 ? (
  <Image.PreviewGroup>
    {detail.images.map((img, i) => (
      <Image
        key={i}
        src={img}
        alt="rescue"
        className="md-thumb-img"
      />
    ))}
  </Image.PreviewGroup>
) : (
  <div className="md-thumb-empty">Không có hình ảnh</div>
)}
            </div>
          </section>
        </aside>

        {/* RIGHT */}

        <main className="md-right">
        <div className="md-card">
            <h4 className="card-title">6. Mô tả sự cố chi tiết</h4>

            <p className="md-description">{detail.detailDescription}</p>
          </div>
          <div className="md-card">
            <h4 className="card-title">7. Nguồn lực & mô tả</h4>

            <div className="md-rescue-info">
              <div className="md-info">
                <label>Số nạn nhân</label>
                <b>{detail.victimCount}</b>
              </div>

              <div className="md-info">
                <label>Dụng cụ có sẵn</label>
                <b>{detail.availableRescueTool}</b>
              </div>

              <div className="md-info">
                <label>Nhu cầu đặc biệt</label>
                <b>{detail.specialNeeds}</b>
              </div>

              <div className="md-info">
                <label>Ghi chú đội cứu hộ</label>
                <b>{detail.rescueTeamNote}</b>
              </div>
            </div>
          </div>

          <div className="md-map">
            <div className="md-map-label">{detail.address}</div>

            <iframe
              title="rescue-map"
              src={`https://www.google.com/maps?q=${detail.lat},${detail.lng}&z=15&output=embed`}
              loading="lazy"
            />
          </div>
        </main>
      </div>

      {/* ================= FOOTER ================= */}

      <footer className="md-footer">
        <button className="md-back" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>

        <div className="md-footer-actions">
          <button
            className={`md-reject ${isLocked ? "disabled" : ""}`}
            onClick={() => {
              if (!isLocked) {
                setShowRejectModal(true);
              }
            }}
            disabled={isLocked}
          >
            ❌ Từ chối
          </button>

          <button
            className={`md-accept ${isLocked ? "disabled" : ""}`}
            onClick={() => {
              if (!isLocked) {
                handleAccept();
              }
            }}
            disabled={loadingAccept || isLocked}
          >
            {loadingAccept
              ? "⏳ Đang nhận..."
              : isLocked
              ? "✔ Đã nhận nhiệm vụ"
              : "🚀 Chấp nhận nhiệm vụ"}
          </button>
        </div>
        {showRejectModal && (
          <div className="rm-modal-overlay">
            <div className="rm-modal">
              <h3>❌ Từ chối nhiệm vụ</h3>

              <textarea
                placeholder="Nhập lý do từ chối..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />

              <div className="rm-modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowRejectModal(false)}
                >
                  Hủy
                </button>

                <button
                  className="btn-confirm"
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || loadingReject}
                >
                  {loadingReject ? "Đang gửi..." : "Xác nhận từ chối"}
                </button>
              </div>
            </div>
          </div>
        )}
      </footer>
    </section>
  );
}
