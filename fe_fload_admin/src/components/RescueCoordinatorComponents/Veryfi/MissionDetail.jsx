import { Button, Input, Image, Modal } from "antd";
import { useState, useEffect } from "react";
import { PhoneOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import {
  getUrgencyLevels,
  verifyAndDispatchRescueRequest,
  rejectRescueRequest
} from "../../../../api/axios/CoordinatorApi/RescueRequestApi";

import AuthNotify from "../../../utils/Common/AuthNotify";

import "./MissionDetail.css";

const IMAGE_BASE = "https://api-rescue.purintech.id.vn";



export default function MissionDetail({ mission }) {

  const [urgencyLevels, setUrgencyLevels] = useState([]);
  const [priority, setPriority] = useState(null);
  const [note, setNote] = useState("");
  const [recommendedPriority, setRecommendedPriority] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
const [rejectReason, setRejectReason] = useState("");
const [rejectLoading, setRejectLoading] = useState(false);
  const navigate = useNavigate();
  const openRejectPopup = () => {
    setRejectReason("");
    setRejectOpen(true);
  };

  useEffect(() => {
    setPriority(null);
    setRecommendedPriority(null);
  }, [mission]);

  
  /* ================= LOAD URGENCY LEVEL ================= */

  useEffect(() => {

    const fetchUrgencyLevels = async () => {

      try {

        const data = await getUrgencyLevels();
        setUrgencyLevels(data);

      } catch (error) {

        console.error(error);

      }

    };

    fetchUrgencyLevels();

  }, []);
  

  /* ================= AUTO SET PRIORITY FROM DB ================= */
  useEffect(() => {

    if (!mission || !mission.urgencyLevelId || urgencyLevels.length === 0) return;
  
    const level = urgencyLevels.find(
      (l) => l.urgencyLevelId === mission.urgencyLevelId
    );
  
    if (!level) return;
  
    const index = urgencyLevels.indexOf(level);
    const code = `P${index + 1}`;
  
    setPriority(code);
    setRecommendedPriority(code);
  
  }, [mission, urgencyLevels]);

  /* ================= FORMAT SLA ================= */

  const formatSla = (minutes) => {

    if (!minutes) return "Không xác định";

    if (minutes < 60)
      return `${minutes} phút`;

    if (minutes < 1440)
      return `${Math.floor(minutes / 60)} giờ`;

    return `${Math.floor(minutes / 1440)} ngày`;

  };

  /* ================= HANDLE CONFIRM ================= */

  const handleConfirm = async () => {

    if (!priority) return;

    const index = parseInt(priority.replace("P", "")) - 1;
    const level = urgencyLevels[index];

    if (!level) return;

    try {

      const requestId = mission.id || mission.rescueRequestId;

      if (!requestId) {
        AuthNotify.error("Thiếu ID request");
        console.error("MISSION:", mission);
        return;
      }
      
      await verifyAndDispatchRescueRequest(requestId, {
        urgencyLevelId: level.urgencyLevelId,
        note: note || "Xác minh yêu cầu cứu hộ"
      });

      AuthNotify.success("Xác nhận và điều phối thành công");

      navigate("/coordinator/dang", {
        state: { mission, priority }
      });

    }
    catch (err) {

      console.error("Dispatch error:", err);

      AuthNotify.error("Xác nhận điều phối thất bại");

    }

  };



  const handleRejectConfirm = async () => {

    if (!rejectReason.trim()) {
  
      AuthNotify.warning(
        "Thiếu lý do",
        "Vui lòng nhập lý do từ chối"
      );
  
      return;
    }
  
    try {
  
      setRejectLoading(true);
  
      const requestId = mission?.id || mission?.rescueRequestId;

      if (!requestId) {
        AuthNotify.error("Thiếu ID request");
        console.error("MISSION:", mission);
        return;
      }
      
      await rejectRescueRequest(
        requestId,
        rejectReason
      );
  
      AuthNotify.success("Đã từ chối yêu cầu");
  
      setRejectOpen(false);
  
      /* NAVIGATE + RELOAD */
  
      navigate("/coordinator"); 
  
      setTimeout(() => {
        window.location.reload();
      }, 300);
  
    }
    catch (err) {
  
      console.error(err);
  
      AuthNotify.error(
        "Từ chối yêu cầu thất bại"
      );
  
    }
    finally {
  
      setRejectLoading(false);
  
    }
  
  };

  /* ================= CHECK MISSION ================= */

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
          color: "#555"
        }}
      >
        Chọn yêu cầu bên trái để xem chi tiết
      </div>
    );

  }

  const formatSLA = (minutes) => {
    if (!minutes) return "--";
  
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
  
    if (h === 0) return `${m} phút`;
    if (m === 0) return `${h} giờ`;
  
    return `${h} giờ ${m} phút`;
  };
  /* ================= IMAGE FIX ================= */
  const getImages = (mission) => {
    const images = [];
  
    if (Array.isArray(mission?.images)) {
      images.push(...mission.images);
    }
  
    if (Array.isArray(mission?.imageUrls)) {
      images.push(...mission.imageUrls);
    }
  
    if (mission?.locationImageUrl) {
      if (typeof mission.locationImageUrl === "string") {
        images.push(...mission.locationImageUrl.split(","));
      } else if (Array.isArray(mission.locationImageUrl)) {
        images.push(...mission.locationImageUrl);
      }
    }
  
    return [...new Set(
      images
        .map(i => i?.trim())
        .filter(Boolean)
        .map(i =>
          i.startsWith("http")
            ? i
            : `${IMAGE_BASE}${i.startsWith("/") ? "" : "/"}${i}`
        )
    )];
  };
  
  const images = getImages(mission);



  console.log("MISSION:", mission);
  console.log("IMAGES:", images);
  return (

    <section className="rc-md">

      {/* HEADER */}

      <header className="rc-md__header">

        <div className="rc-md__header-info">

          <h2 className="request-title">

          Mã yêu cầu: #{mission.id || mission.rescueRequestId}

            <span
              className="status status-pending"
              style={{
                backgroundColor: "#f59e0b",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: "14px"
              }}>
              ĐANG XỬ LÝ
            </span>

          </h2>

          <p className="request-meta">
            Tiếp nhận lúc {new Date(mission.createdAt).toLocaleString()}
          </p>

        </div>

        <Button
          icon={<PhoneOutlined />}
          className="call-btn rc-md__action-call"
          href={`tel:${mission.phone}`}
        >
          GỌI XÁC MINH
        </Button>

      </header>

      <div className="divider" />

      <div className="detail-grid rc-md__content">

        {/* LEFT */}

        <div className="left-col">

          {/* USER INFO */}

          <section className="card">

            <h4 className="card-title">1. THÔNG TIN NGƯỜI DÂN</h4>

            <div className="info-row">

              <div className="info-item">
                <label>HỌ VÀ TÊN</label>
                <strong>{mission.name || mission.fullName}</strong>
              </div>

              <div className="info-item">
                <label>SỐ ĐIỆN THOẠI</label>
                <strong className="phone">{mission.phone || mission.contactPhone}</strong>
              </div>

            </div>

            <label>ĐỊA CHỈ HIỆN TẠI</label>

            <p className="address-text">
              {mission.address}
            </p>

          </section>



          {/* RESOURCES */}

          <section className="card">

            <h4 className="card-title">
              2. NGUỒN LỰC & MÔ TẢ
            </h4>

            <div className="resource-grid">

              <div className="resource-item">
                <label>SỐ NGƯỜI GẶP NẠN</label>
                <p>{mission.victimCount}</p>
              </div>

              <div className="resource-item">
                <label>DỤNG CỤ CỨU HỘ</label>
                <p>{mission.availableRescueTool}</p>
              </div>

            </div>

            <label>NHU CẦU ĐẶC BIỆT</label>

            <p>{mission.specialNeeds}</p>

          </section>
          <section className="card">

<h4 className="card-title">
  3. ĐIỂM ĐÁNH GIÁ MỨC ĐỘ
</h4>



<label>ĐIỂM MỨC ĐỘ</label>

<p>{mission.urgencyScore}</p>

</section>

          {/* DESCRIPTION */}

          <section className="card">

            <h4 className="card-title">
              4. TÌNH TRẠNG KHẨN CẤP
            </h4>

            <label>GHI CHÚ</label>

            <p className="quote">
              {mission.detailDescription}
            </p>

            <label>GHI CHÚ ĐỘI CỨU HỘ</label>

            <p>{mission.rescueTeamNote}</p>

          </section>


          {/* MAP */}

    <section className="rc-op-card">

<h4 className="card-title">
5. VỊ TRÍ HIỆN TẠI
<span className="rc-online">● TRỰC TUYẾN</span>
</h4>

<div className="rc-map-mini">

<iframe
              title="map"
              src={`https://www.google.com/maps?q=${mission.locationLat},${mission.locationLng}&z=13&output=embed`}
            />

</div>

</section>

        </div>

        {/* RIGHT */}

        <div className="right-col">

          {/* IMAGE */}

          <section className="card">

<h4 className="card-title">
  6. HÌNH ẢNH HIỆN TRƯỜNG
</h4>

<div className="image-grid">

  {images.length > 0 ? (

<Image.PreviewGroup>
{images.map((img, i) => {

  const imageUrl =
  img.startsWith("http")
  ? img
  : `${IMAGE_BASE}${img.startsWith("/") ? "" : "/"}${img}`

  return (
    <Image
      key={i}
      src={imageUrl}
      alt={`rescue-${i}`}
      width={160}
      style={{
        borderRadius: 10,
        objectFit: "cover",
        border: "1px solid #eee"
      }}
      referrerPolicy="no-referrer"
    />
  );
})}
</Image.PreviewGroup>

  ) : (

    <div className="md-thumb-empty">
        Không có hình ảnh
      </div>

  )}

</div>

</section>

          {/* PRIORITY */}

          <section className="card rc-priority-card">

<h4 className="card-title">
  7. PHÂN LOẠI ƯU TIÊN
</h4>

{/* LÝ DO ĐỀ XUẤT */}

{recommendedPriority && (
  <p className="priority-reason">
    Lý do đề xuất: Hệ thống phân tích dựa trên nguồn lực và mô tả,
    tình trạng khẩn cấp của người dân cung cấp
  </p>
)}

{urgencyLevels.map((level, index) => {

  const priorityCode = `P${index + 1}`;

  return (

    <div
      key={level.urgencyLevelId}
      className={`rc-priority-item rc-p${index + 1}
      ${priority === priorityCode ? "is-active" : ""}`}
      onClick={() => setPriority(priorityCode)}
    >

      <span className="rc-radio" />

      <div className="rc-priority-content">

      <div className="priority-title">
  <span className="priority-name">
   Mức đô: {[level.levelName] || level.levelName}
  </span>

  {recommendedPriority === priorityCode && (
    <span className="recommend-badge">
      Đề xuất
    </span>
  )}
</div>

        <p>Trạng thái: {level.description}</p>

       
        <span style={{ fontSize: 12, color: "#999" }}>
  SLA: {formatSLA(level.slaMinutes)}
</span>
      </div>

    </div>

  );

})}

</section>

          {/* NOTE */}

          <section className="card">

            <h4 className="card-title">
              8. GHI CHÚ XÁC MINH
            </h4>

            <Input.TextArea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

          </section>
         
          {/* ACTION */}

          <Button
            className="confirm-btn"
            disabled={!priority}
            onClick={handleConfirm}
          >
            ▶ XÁC NHẬN & CHUYỂN ĐIỀU PHỐI
          </Button>

          <Button
danger
className="rc-md__action-flag"
onClick={openRejectPopup}
>
Đánh dấu yêu cầu giả mạo / Trùng lặp
</Button>

        </div>

      </div>
      <Modal
title="🚫 Từ chối yêu cầu cứu hộ"
open={rejectOpen}
onCancel={() => setRejectOpen(false)}
onOk={handleRejectConfirm}
okText="Xác nhận từ chối"
cancelText="Hủy"
confirmLoading={rejectLoading}
>

<p>Nhập lý do từ chối yêu cầu:</p>

<Input.TextArea
rows={4}
placeholder="Ví dụ: Yêu cầu giả mạo / trùng lặp"
value={rejectReason}
onChange={(e) => setRejectReason(e.target.value)}
/>

</Modal>
    </section>

  );

}