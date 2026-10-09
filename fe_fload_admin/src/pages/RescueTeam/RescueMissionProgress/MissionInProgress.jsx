import "./MissionInProgress.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Image } from "antd";
import {
  getRescueAssignmentById,
  getUrgencyLevels,
} from "../../../../api/axios/CoordinatorApi/RescueRequestApi";
import { getRescueRequestById } from "../../../../api/axios/CoordinatorApi/RescueRequestApi";
import { getAllRescueTeams } from "../../../../api/axios/ManagerApi/rescueTeamApi";
import { getAllVehicles } from "../../../../api/axios/ManagerApi/vehicleApi";
import {
  departRescueAssignment,
  arriveRescueAssignment,
  completeRescueAssignment,
} from "../../../../api/axios/RescueApi/RescueTask";
import AuthNotify from "../../../utils/Common/AuthNotify";
// const API_BASE = "https://api-rescue.purintech.id.vn";

const getUrgencyColor = (id) => {
  if (!id) return "default";

  const colors = [
    "red",
    "orange",
    "blue",
    "green",
    "purple",
    "cyan",
    "gold",
    "lime",
    "magenta",
    "volcano",
  ];

  return colors[(id - 1) % colors.length] || "default";
};
const STATUS_STEPS = [
  { key: "PENDING", label: "Chờ điều phối", icon: "⏳" },
  { key: "ASSIGNED", label: "Đã điều động", icon: "📋" },
  { key: "ACCEPTED", label: "Đội đã nhận", icon: "👍" },
  { key: "DEPARTED", label: "Đã xuất phát", icon: "🚑" },
  { key: "ARRIVED", label: "Đã đến hiện trường", icon: "📍" },
  { key: "COMPLETED", label: "Hoàn thành", icon: "✔" },
];

export default function MissionInProgress() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [location, setLocation] = useState({
    lat: 10.8231,
    lng: 106.6297,
  });
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  /* ================= LOAD DATA ================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      const [requestRes, urgencyRes, teamRes, vehicleRes] = await Promise.all([
        getRescueAssignmentById(id),
        getUrgencyLevels(),
        getAllRescueTeams(),
        getAllVehicles(),
      ]);
      const assignment = await getRescueAssignmentById(id);

      if (!assignment) return;

      // 🔥 gọi đúng API theo id
      const req = await getRescueRequestById(assignment.rescueRequestId);
      // const requests = requestRes?.data || requestRes || [];
      const teams = teamRes?.data?.items || [];
      const vehicles = vehicleRes?.data || [];
      const urgencies = urgencyRes || [];

      /* ===== MAP ===== */
      const teamMap = {};
      teams.forEach((t) => (teamMap[t.rcid] = t.rcName));

      const vehicleMap = {};
      vehicles.forEach((v) => (vehicleMap[v.vehicleId] = v.vehicleName));

      const urgencyMap = {};
      urgencies.forEach((u) => {
        urgencyMap[u.urgencyLevelId] = u;
      });

      if (!assignment) return;
      const urgencyObj = urgencyMap[req?.urgencyLevelId];

      /* ===== SET DETAIL ===== */
      setDetail({
        missionId: assignment.assignmentId,
        rescueRequestId: assignment.rescueRequestId,

        team: teamMap[assignment.rescueTeamId] || "Không rõ",
        vehicle: vehicleMap[assignment.vehicleId] || "Không rõ",

        assignmentStatus: assignment.assignmentStatus,
        urgencyScore: req?.urgencyScore,
        fullname: req?.fullName || req?.fullname || "Không rõ",
        phone: req?.contactPhone || "Không có",
        address: req?.address || "Chưa có",

        requestType: req?.requestType || "Không rõ",
        victimCount: req?.victimCount || 0,
        availableRescueTool: req?.availableRescueTool || "Không có",
        specialNeeds: req?.specialNeeds || "Không có",
        detailDescription: req?.detailDescription || "Không có",
        rescueTeamNote: req?.rescueTeamNote || "Không có",

        urgency: urgencyObj?.levelName || "Không xác định",
        urgencyLevelId: req?.urgencyLevelId,

        startTime: assignment.assignedAt,
      });

      /* ===== LOCATION ===== */
      if (req?.locationLat && req?.locationLng) {
        setLocation({
          lat: req.locationLat,
          lng: req.locationLng,
        });
      }

      /* ===== IMAGES ===== */
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
      
      setImages(getImages(req));
    } catch (err) {
      console.error("Load detail error:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleAction = async () => {
    if (!detail) return;

    try {
      setActionLoading(true);

      const status = detail.assignmentStatus;

      if (status === "ACCEPTED") {
        await departRescueAssignment(id);

        AuthNotify.success(
          "Xuất phát thành công",
          "Đội cứu hộ đã bắt đầu di chuyển 🚑"
        );
      } else if (status === "DEPARTED") {
        await arriveRescueAssignment(id);

        AuthNotify.success("Đã đến hiện trường", "Đội cứu hộ đã tới nơi 📍");
      } else if (status === "ARRIVED") {
        await completeRescueAssignment(id);

        AuthNotify.success("Hoàn thành nhiệm vụ", "Cứu hộ đã hoàn tất ✅");
      } else {
        AuthNotify.warning("Không hợp lệ", "Trạng thái không thể xử lý");
      }

      // reload lại data
      await fetchData();
    } catch (err) {
      console.error("Action error:", err);

      AuthNotify.error("Thất bại", err?.message || "Có lỗi xảy ra");
    } finally {
      setActionLoading(false);
    }
  };
  const getActionText = () => {
    switch (detail?.assignmentStatus) {
      case "ACCEPTED":
        return "🚑 Xuất phát";
      case "DEPARTED":
        return "📍 Đã đến nơi";
      case "ARRIVED":
        return "✅ Hoàn thành";
      case "COMPLETED":
        return "✔ Đã hoàn thành";
      default:
        return "Không khả dụng";
    }
  };
  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  /* ===== TIMELINE ===== */

  const currentIndex = STATUS_STEPS.findIndex(
    (s) => s.key === detail?.assignmentStatus
  );

  /* ================= UI ================= */

  if (loading) return <div className="rc-loading">Đang tải...</div>;
  if (!detail)
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 600,
          color: "#555",
        }}
      >
        Vui lòng bấm vào nhiệm vụ chọn nhiệm vụ cứu hộ để xem quá trình cứu hộ
      </div>
    );

  return (
    <section className="rc-op-detail">
      {/* HEADER */}
      <header className="rc-op-detail__header">
        <div>
          <h2>
            Mã yêu cầu: #{detail.rescueRequestId}
            <span
              className="rc-badge"
              style={{
                background: getUrgencyColor(detail.urgencyLevelId),
                color: "#fff",
              }}
            >
              {detail.urgency}
            </span>
          </h2>

          <p>
            ⏱{" "}
            {detail.startTime
              ? new Date(detail.startTime).toLocaleString("vi-VN")
              : "Chưa có"}
          </p>
        </div>

        <button onClick={() => navigate(-1)} className="btn-outline">
          ← Quay lại
        </button>
      </header>

      {/* TIMELINE */}
      <section className="rc-op-card">
        <div className="rc-timeline">
          {STATUS_STEPS.map((step, index) => {
            const isDone = index < currentIndex;
            const isActive = index === currentIndex;

            return (
              <div key={step.key} className="rc-timeline__step">
                <div
                  className={`rc-timeline__item 
                  ${isActive ? "active" : ""}
                  ${isDone ? "done" : ""}`}
                >
                  <div className="rc-timeline__icon">{step.icon}</div>

                  <div className="rc-timeline__content">
                    <b>{step.label.toUpperCase()}</b>
                  </div>
                </div>

                {index < STATUS_STEPS.length - 1 && (
                  <div
                    className={`rc-timeline__line ${isDone ? "done" : ""}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* GRID */}
      <div className="rc-op-grid">
        {/* LEFT */}
        <div className="rc-op-col">
          {/* Người dân */}
          <section className="rc-op-card">
            <h4 className="card-title">1. THÔNG TIN NGƯỜI GỬI YÊU CẦU</h4>

            <div className="rc-user-grid">
              <div>
                <label>Họ tên</label>
                <p>{detail.fullname}</p>
              </div>

              <div>
                <label>Số điện thoại</label>
                <p className="phone">{detail.phone}</p>
              </div>
              <div>
                <label>Địa chỉ</label>
              </div>
            </div>

            <p>{detail.address}</p>
          </section>

          {/* Sự cố */}
          <section className="rc-op-card">
            <h4 className="card-title">2. NGUỒN LỰC & MÔ TẢ </h4>

            <div className="rc-incident-grid">
              <div className="rc-box">
                <span>Loại</span>
                <b>{detail.requestType}</b>
              </div>

              <div className="rc-box">
                <span>Số nạn nhân</span>
                <b>{detail.victimCount}</b>
              </div>

              <div className="rc-box">
                <span>Dụng cụ</span>
                <b>{detail.availableRescueTool}</b>
              </div>

              <div className="rc-box">
                <span>Nhu cầu</span>
                <b>{detail.specialNeeds}</b>
              </div>
            </div>
          </section>

          {/* MAP */}
          <section className="rc-op-card">
            <h4 className="card-title">3, ĐỊA CHỈ HIỆN TẠI</h4>
            <iframe
              title="map"
              src={`https://www.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
              loading="lazy"
            />
          </section>
        </div>

        {/* RIGHT */}
        <div className="rc-op-col">
          {/* Đội */}
          <section className="card">

<h4 className="card-title">
  4. ĐIỂM ĐÁNH GIÁ MỨC ĐỘ
</h4>



<label>ĐIỂM MỨC ĐỘ</label>

<p>{detail.urgencyScore}</p>

</section>

          <section className="rc-op-card">
            <h4 className="card-title">5. THÔNG ĐỘI CỨU HỘ & PHƯƠNG TIỆN</h4>
            <p>Tên đội: {detail.team}</p>
            <p>Tên phương tiện: {detail.vehicle}</p>
          </section>

          {/* Mô tả */}
          <section className="rc-op-card">
            <h4 className="card-title">6. THÔNG TIN CHI TIẾT</h4>
            <p>{detail.detailDescription}</p>
          </section>

          {/* Ghi chú */}
          <section className="rc-op-card">
            <h4 className="card-title">7. GHI CHÚ ĐỘI CỨU HỘ</h4>
            <p>{detail.rescueTeamNote}</p>
          </section>
          <section className="card">
  <h4 className="card-title">8. HÌNH ẢNH THỰC TẾ </h4>

  {images?.length > 0 ? (
    <Image.PreviewGroup>
      <div className="rc-image-grid">
        {images.map((img, i) => (
          <div key={i} className="rc-image-item">
            <Image
              src={img}
              alt="rescue"
              preview={false}
            />
          </div>
        ))}
      </div>
    </Image.PreviewGroup>
  ) : (
    <p>Không có ảnh</p>
  )}
</section>
        </div>
      </div>
      <footer className="rp-footer">
        <div className="rp-actions">
        

          <button
            className={`rp-done ${
              detail.assignmentStatus === "COMPLETED" ? "disabled" : ""
            }`}
            onClick={handleAction}
            disabled={actionLoading || detail.assignmentStatus === "COMPLETED"}
          >
            {actionLoading ? "⏳ Đang xử lý..." : getActionText()}
          </button>
        </div>
      </footer>
    </section>
  );
}
