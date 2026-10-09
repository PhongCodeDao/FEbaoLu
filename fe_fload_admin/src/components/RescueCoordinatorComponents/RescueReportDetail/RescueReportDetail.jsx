import { useEffect, useState } from "react";
import { Image, Tag } from "antd";

import {
  getRescueProgress,
  getUrgencyLevels,
  getRescueTeamMembers,
} from "../../../../api/axios/CoordinatorApi/RescueRequestApi";
import verifyIcon from "../../../assets/verifire.svg";
import "./RescueReportDetail.css";

const IMAGE_BASE = "https://api-rescue.purintech.id.vn";

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
const thStyle = {
  padding: "8px",
  border: "1px solid #eee",
  textAlign: "left",
  fontWeight: 600,
  fontSize: 14,
  background: "#fafafa",
};

const tdStyle = {
  padding: "8px",
  border: "1px solid #eee",
  fontSize: 14,
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

        console.log("PROGRESS:", progressRes);

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

        console.log("TEAM API:", res);

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

  /* ================= GUARD ================= */

  if (!mission) {
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
        Chọn nhiệm vụ bên trái
      </div>
    );
  }

  if (loading) {
    return <div className="rc-empty-center">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="rc-empty-center">Lỗi: {error}</div>;
  }

  if (!data) {
    return null;
  }

  const formatTime = (date) => {
    if (!date) return "--";
    const d = new Date(date);
    return d.toLocaleTimeString("vi-VN", {
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
    const s = Math.floor((diff % 60000) / 1000);

    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:${String(s).padStart(2, "0")}`;
  };

  /* ================= DATA ================= */

  const request = data.rescueRequest;
  const assignment = data.assignment;

  /* ================= SLA ================= */

  const getDurationMinutes = (start, end) => {
    if (!start || !end) return null;
    return (new Date(end) - new Date(start)) / 60000;
  };

  const actualMinutes = getDurationMinutes(
    request?.createdAt,
    assignment?.completedAt
  );

  /* ✅ urgency PHẢI nằm trước isOnTime */
  const urgency = urgencyLevels.find(
    (u) => u.urgencyLevelId === request?.urgencyLevelId
  );

  /* ✅ trạng thái */
  const isRejected = data.currentProgressCode === "REQUEST_REJECTED";

  /* ✅ SLA check */
  const isOnTime =
    actualMinutes !== null &&
    urgency?.slaMinutes &&
    actualMinutes <= urgency.slaMinutes;
  /* ================= IMAGE ================= */

  const images = [];

  if (Array.isArray(request?.imageUrls)) {
    images.push(...request.imageUrls);
  }
  
  if (Array.isArray(request?.images)) {
    images.push(...request.images);
  }
  
  if (request?.locationImageUrl) {
    if (typeof request.locationImageUrl === "string") {
      images.push(...request.locationImageUrl.split(","));
    } else if (Array.isArray(request.locationImageUrl)) {
      images.push(...request.locationImageUrl);
    }
  }
  
  // normalize + clean + dedupe
  const normalizedImages = [...new Set(
    images
      .map(i => i?.trim())
      .filter(Boolean)
      .map(i =>
        i.startsWith("http")
          ? i
          : `${IMAGE_BASE}${i.startsWith("/") ? "" : "/"}${i}`
      )
  )];
  const formatSLA = (minutes) => {
    if (!minutes) return "--";

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    if (h === 0) return `${m} phút`;
    if (m === 0) return `${h} giờ`;

    return `${h} giờ ${m} phút`;
  };
  /* ================= UI ================= */

  return (
    <section className="rc-md">
      {/* HEADER */}
      <header className="rc-md__header">
        <div>
          <h2>Mã yêu cầu: #{request?.rescueRequestId}</h2>

          <p>{new Date(request.createdAt).toLocaleString()}</p>

          <Tag
            color={
              data.currentProgressCode === "COMPLETED"
                ? "green"
                : data.currentProgressCode === "REQUEST_REJECTED"
                ? "red"
                : "blue"
            }
          >
            {data.currentProgressLabel}
          </Tag>
        </div>
        <Tag color={getUrgencyColor(urgency?.urgencyLevelId)}>
          {urgency?.levelName || "Không xác định"}
        </Tag>
      </header>
      <div className="rc-summary">
        {/* START */}
        <div className="rc-box">
          <p className="label">THỜI GIAN BẮT ĐẦU</p>
          <h3>{formatTime(request.createdAt)}</h3>
          <span>{formatDate(request.createdAt)}</span>
        </div>

        {/* END */}
        <div className="rc-box">
          <p className="label">THỜI GIAN KẾT THÚC</p>
          <h3>{formatTime(assignment?.completedAt)}</h3>
          <span>{formatDate(assignment?.completedAt)}</span>
        </div>

        {/* PEOPLE */}
        <div className="rc-box">
          <p className="label">SỐ NGƯỜI ĐƯỢC CỨU</p>

          <h3 style={{ color: "#0ea5a4" }}>
            {isRejected ? "--" : request.victimCount}
          </h3>

          <span>{isRejected ? "" : "nạn nhân"}</span>
        </div>

        {/* DURATION */}
        <div className="rc-box">
          <p className="label">TỔNG THỜI LƯỢNG</p>

          <h3>
            {assignment?.completedAt
              ? calcDuration(request.createdAt, assignment.completedAt)
              : "--"}
          </h3>

          {/* 👉 CHỈ HIỆN KHI ĐÃ HOÀN THÀNH */}
          {assignment?.completedAt && (
            <>
              <span
                style={{
                  color: isOnTime ? "green" : "red",
                }}
              >
                {isOnTime ? "ĐÚNG TIẾN ĐỘ" : "TRỄ TIẾN ĐỘ"}
              </span>

              <span style={{ fontSize: 12, color: "#999" }}>
                SLA: {formatSLA(urgency?.slaMinutes)}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="divider" />

      <div className="detail-grid rc-md__content">
        {/* LEFT */}
        <div className="left-col">
          <section className="card">
            <h4 className="card-title">1. THÔNG TIN NGƯỜI GỬI</h4>
            <p>
              <b>Họ tên:</b> {request.fullName}
            </p>
            <p>
              <b>SĐT:</b> {request.contactPhone}
            </p>

            <p>
              <b>Địa chỉ:</b> {request.address}
            </p>
          </section>
          <section className="card">

<h4 className="card-title">
  2. ĐIỂM ĐÁNH GIÁ MỨC ĐỘ
</h4>



<label>ĐIỂM MỨC ĐỘ</label>

<p>{request.urgencyScore}</p>

</section>
          <section className="card">
            <h4 className="card-title">3. LOẠI YÊU CẦU</h4>
            <p>
              <b>Loại yêu cầu:</b> {request.requestType}
            </p>
          </section>
          <section className="card">
            <h4 className="card-title">4. MÔ TẢ CHI TIẾT</h4>
            <p>{request.detailDescription}</p>
          </section>

          <section className="card">
            <h4 className="card-title">5. NGUỒN LỰC</h4>

            <div className="resource-grid">
              <div className="resource-item">
                <label>SỐ NGƯỜI GẶP NẠN</label>
                <p>{request.victimCount}</p>
              </div>

              <div className="resource-item">
                <label>DỤNG CỤ CỨU HỘ</label>
                <p>{request.availableRescueTool}</p>
              </div>
            </div>

            <label>NHU CẦU ĐẶC BIỆT</label>

            <p>{request.specialNeeds}</p>

            <label>GHI CHÚ CHO ĐỘI CỨU HỘ</label>

            <p>{request.rescueTeamNote || "Không có"}</p>
          </section>

          {/* IMAGE */}
          <section className="card">
            <h4 className="card-title">6. HÌNH ẢNH THỰC TẾ</h4>

            {normalizedImages.length > 0 ? (
  <Image.PreviewGroup>
    <div className="rc-image-grid">
      {normalizedImages.map((img, i) => (
        <div key={i} className="rc-image-item">
          <Image
            src={img}
            alt="rescue"
            // preview={false}
          />
        </div>
      ))}
    </div>
  </Image.PreviewGroup>
) : (
  <p>Không có hình ảnh</p>
)}
          </section>
       
        </div>

        {/* RIGHT */}
        <div className="right-col">
        <section className="rc-op-card">
            <h4 className="card-title">
              7. VỊ TRÍ HIỆN TẠI
              <span className="rc-online">● TRỰC TUYẾN</span>
            </h4>

            <div className="rc-map-mini">
              <iframe
                title="map"
                width="100%"
                height="250"
                src={`https://www.google.com/maps?q=${request.locationLat},${request.locationLng}&z=13&output=embed`}
              />
            </div>
          </section>
          {/* TEAM */}
          <section className="card">
            <h4 className="card-title">8. ĐỘI CỨU HỘ</h4>
            <p>
              <b>Tên:</b> {assignment?.rescueTeam?.teamName}
            </p>
            <p>
              <b>SĐT:</b> {assignment?.rescueTeam?.contactPhone}
            </p>
            <p>
              <b>Khu vực:</b> {assignment?.rescueTeam?.areaName}
            </p>
          </section>

          {/* MEMBERS */}
          <section className="card">
            <h4 className="card-title">9. THÀNH VIÊN CỨU HỘ</h4>

            {!Array.isArray(teamMembers) || teamMembers.length === 0 ? (
              <p>Không có thành viên</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: 10,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#fafafa" }}>
                      <th style={thStyle}>STT</th>
                      <th style={thStyle}>Tên</th>
                      <th style={thStyle}>SĐT</th>
                    </tr>
                  </thead>

                  <tbody>
                    {teamMembers.map((m, index) => (
                      <tr key={index}>
                        <td style={tdStyle}>{index + 1}</td>
                        <td style={tdStyle}>{m.fullName || m.name || "—"}</td>
                        <td style={tdStyle}>
                          {m.phone || m.contactPhone || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* VEHICLE */}
          <section className="card">
            <h4 className="card-title">10. PHƯƠNG TIỆN</h4>
            <p>
              <b>Tên:</b> {assignment?.vehicle?.vehicleName}
            </p>
            <p>
              <b>Loại:</b> {assignment?.vehicle?.vehicleType}
            </p>
            <p>
              <b>Vị trí:</b> {assignment?.vehicle?.vehicleLocation}
            </p>
          </section>

          {/* STATUS */}
          <section className="card">
            <h4 className="card-title">11. HỆ THỐNG GHI NHẬN</h4>

            <p>
              <b>Xác minh:</b> {data.isVerified ? "✔️" : "❌"}
            </p>
            <p>
              <b>Đã phân công:</b> {data.isAssigned ? "✔️" : "❌"}
            </p>
            <p>
              <b>Trạng thái:</b> {assignment?.assignmentStatusLabel}
            </p>

            {assignment?.rejectReason && (
              <p style={{ color: "red" }}>
                <b>Lý do từ chối:</b> {assignment.rejectReason}
              </p>
            )}

            {assignment?.completedAt && (
              <p>
                <b>Hoàn thành:</b>{" "}
                {new Date(assignment.completedAt).toLocaleString()}
              </p>
            )}
          </section>
          {data.currentProgressCode !== "REQUEST_REJECTED" && (
            <section
              style={{
                background: "#e6f4f1",
                borderRadius: 20,
                padding: 24,
                border: "1px solid #cde7e3",
                textAlign: "center",
              }}
            >
              {/* HEADER */}
              <div style={{ marginBottom: 20 }}>
                <h3
                  style={{
                    margin: 0,
                    marginTop: 6,
                    fontWeight: 700,
                    color: "#2aa39a",
                    letterSpacing: 1,
                  }}
                >
                  XÁC NHẬN TỪ
                  <br />
                  NGƯỜI DÂN
                </h3>
              </div>

              {/* CARD */}
              <div
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  padding: 20,
                  maxWidth: 280,
                  margin: "0 auto",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                }}
              >
                {/* AVATAR */}
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "#cde7e3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px",
                  }}
                >
                  <span style={{ fontSize: 26 }}>👤</span>
                </div>

                {/* NAME */}
                <h3 style={{ marginBottom: 6 }}>
                  Họ và tên: {request.fullName || "--"}
                </h3>

                {/* NOTE */}
                <p
                  style={{
                    fontStyle: "italic",
                    color: "#6b7280",
                    lineHeight: 1.5,
                    marginBottom: 16,
                  }}
                >
                  Ghi chú: “{request.note || "Đã nhận đủ hỗ trợ và an toàn"}”
                </p>

                {/* ICON CONFIRM */}
                <div
                  style={{
                    margin: "10px 0",
                    padding: "10px 0",
                    borderTop: "1px dashed #ddd",
                    borderBottom: "1px dashed #ddd",
                    display: "flex",
                    flexDirection: "column", // 👈 QUAN TRỌNG
                    alignItems: "center", // 👈 căn giữa
                    justifyContent: "center",
                  }}
                >
                  <img src={verifyIcon} width={32} />

                  <p style={{ marginTop: 6, fontSize: 14, color: "#2aa39a" }}>
                    Đã xác nhận
                  </p>
                </div>

                {/* TIME */}
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 13,
                    color: "#2aa39a",
                  }}
                >
                  Xác nhận lúc{" "}
                  {assignment?.completedAt
                    ? new Date(assignment.completedAt).toLocaleTimeString(
                        "vi-VN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "--"}
                  <br />
                  {assignment?.completedAt
                    ? new Date(assignment.completedAt).toLocaleDateString(
                        "vi-VN"
                      )
                    : "--"}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}
