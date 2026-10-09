import { useEffect, useState } from "react";
import { Modal, Tag, Spin, Alert, Image } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import {
  getRescueProgress,
  getUrgencyLevels,
  completeRescueRequest
} from "../../../api/service/historyApi";
import { Button, Modal as AntModal } from "antd";
import AuthNotify from "../../../utils/Common/AuthNotify";
import "./RescueProgressModal.css";
import { Input } from "antd";
import { useNavigate } from "react-router-dom";
const IMAGE_BASE = "https://api-rescue.purintech.id.vn";

/* ================= REQUEST TYPE ================= */

const REQUEST_TYPES = [
  "cứu hộ khẩn cấp",
  "hỗ trợ cứu trợ",
  "cứu hộ ngập lụt",
  "cứu hộ lũ quét",
  "cứu hộ sạt lở",
  "hỗ trợ sơ tán",
  "hỗ trợ y tế khẩn cấp",
  "tiếp tế lương thực",
  "tìm kiếm cứu nạn",
  "cứu người mắc kẹt",
  "đưa đến nơi trú ẩn"
];

const MAIN_INCIDENT_OPTIONS = REQUEST_TYPES.map(t => ({
  value: t,
  label: t
}));

const getRequestTypeLabel = (value) => {
  const found = MAIN_INCIDENT_OPTIONS.find(
    (item) => item.value === value
  );
  return found ? found.label : value;
};




const getUrgencyColor = (id) => {
  const map = {
    1: "red",
    2: "orange",
    3: "green",
    4: "volcano",
    5: "blue",
    6: "cyan",
    7: "geekblue",
    8: "purple",
    9: "magenta",
    10: "gold",
    11: "lime"
  };
  return map[id] || "blue";
};
/* ================= STATUS ================= */

const STATUS_STEPS = [
  { key: "PENDING", label: "Chờ điều phối", icon: "⏳" },
  { key: "ASSIGNED", label: "Đã điều động", icon: "📋" },
  { key: "ACCEPTED", label: "Đội đã nhận", icon: "👍" },
  { key: "DEPARTED", label: "Đã xuất phát", icon: "🚑" },
  { key: "ARRIVED", label: "Đã đến hiện trường", icon: "📍" },
  { key: "COMPLETED", label: "Hoàn thành", icon: "✔" },
  { key:"REQUEST_REJECTED", label: "Từ chối", icon: "x" },
];

const RescueProgressModal = ({ requestId, open, onClose }) => {

  const [data, setData] = useState(null);
  const [urgencyLevels, setUrgencyLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  // const [isConfirmed, setIsConfirmed] = useState(false);
  
  /* ================= API ================= */

  useEffect(() => {

    if (!open || !requestId) return;

    const fetchData = async () => {

      try {
        setLoading(true);
        setError(null);

        const [progressRes, urgencyRes] = await Promise.all([
          getRescueProgress(requestId),
          getUrgencyLevels()
        ]);

        setData(progressRes);
        setUrgencyLevels(urgencyRes);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }

    };

    fetchData();

  }, [open, requestId]);

  const handleConfirmComplete = () => {
    
    let tempNote = "";
  
    AntModal.confirm({
      title: "Xác nhận hoàn thành cứu hộ",
      content: (
        <Input.TextArea
          placeholder="Nhập ghi chú (tùy chọn)..."
          autoSize={{ minRows: 3, maxRows: 6 }}
          onChange={(e) => {
            tempNote = e.target.value;
          }}
        />
      ),
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setConfirmLoading(true);
      
          await completeRescueRequest(
            requestId,
            tempNote.trim() || "Đã hoàn thành cứu trợ"
          );
      
          AuthNotify.success("Thành công", "Đã xác nhận hoàn thành cứu hộ");
      
          onClose(); // đóng modal

          setTimeout(() => {
            navigate("/");
          
            // 🔥 reload sau khi navigate
            setTimeout(() => {
              window.location.reload();
            }, 100);
          
          }, 200);
      
        } catch (err) {
          AuthNotify.error("Thất bại", err.message || "Có lỗi xảy ra");
        } finally {
          setConfirmLoading(false);
        }
      }
    });
  };
  const statusId = Number(data?.rescueRequest?.statusId);
  const progressCode = data?.currentProgressCode;
  
  // 🔥 chỉ hiện khi:
  // - đã tới bước COMPLETED
  // - và chưa confirm (statusId = 4)
  const shouldShowConfirmButton =
    progressCode === "COMPLETED" && statusId === 4;
  
  // 🔥 disable khi đã confirm
  const isButtonDisabled = statusId === 5;

  /* ================= STEP ================= */

  const currentIndex = STATUS_STEPS.findIndex(
    step => step.key === data?.currentProgressCode
  );

  /* ================= URGENCY ================= */

  const urgency = urgencyLevels.find(
    u => u.urgencyLevelId === data?.rescueRequest?.urgencyLevelId
  );
  
  const urgencyLabel =
  urgency?.levelName ||  

  "Không xác định";

  /* ================= IMAGE ================= */

  const images = data?.rescueRequest?.locationImageUrl
    ?.split(",")
    .filter(Boolean)
    .map(img =>
      img.startsWith("http") ? img : IMAGE_BASE + img
    );
/* ================= CHECK REJECT ================= */
const isRejected =
  data?.currentProgressCode === "REQUEST_REJECTED" ||
  data?.assignment?.assignmentStatus === "REJECTED";
  
  return (

    <Modal
    open={open}
    onCancel={onClose}
    width={1000}
    centered
    destroyOnClose
    className="progress-modal"

    /* 🔥 FOOTER FIX */
    footer={[
      ...(shouldShowConfirmButton
        ? [
            <Button
              key="complete"
              type="primary"
              danger
              loading={confirmLoading}
              onClick={handleConfirmComplete}
              disabled={isButtonDisabled}
  style={{
    opacity: isButtonDisabled ? 0.6 : 1,
    cursor: isButtonDisabled ? "not-allowed" : "pointer"
  }}
            >
             {isButtonDisabled ? "✓ Đã xác nhận hoàn thành" : "✔ Xác nhận đã cứu hộ"}
            </Button>
          ]
        : []),
    
      <Button key="close" onClick={onClose}>
        Đóng
      </Button>
    ]}
  >

      <section className="rc-md">

        {/* ================= HEADER ================= */}
        <header className="rc-md__header">

          <div>

            <h2>
              Mã yêu cầu: #{data?.rescueRequest?.rescueRequestId}
            </h2>

            <p>
              {data?.rescueRequest?.createdAt &&
                new Date(data.rescueRequest.createdAt).toLocaleString()}
            </p>

          </div>

          <div>
          

          <div
  style={{
    display: "inline-block",
    borderRadius: "20px",
    overflow: "hidden"
  }}
>
  <Tag
    color={getUrgencyColor(urgency?.urgencyLevelId)}
    style={{ fontSize: "20px", padding: "4px 12px" }}
  >
    {urgencyLabel}
  </Tag>
</div>
          </div>

        </header>

        <div className="divider" />

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="loading-box">
            <Spin indicator={<LoadingOutlined spin />} />
            <p>Đang tải tiến trình...</p>
          </div>
        )}

        {/* ================= ERROR ================= */}
        {error && (
          <Alert type="error" description={error} showIcon />
        )}

        {/* ================= CONTENT ================= */}
        {!loading && !error && data && (
          <>

            {/* ================= TIMELINE ================= */}
            <div className="rescue-progress-timeline">

{isRejected ? (

  /* 🔥 CHỈ HIỆN 1 STEP TỪ CHỐI */
  <div className="rp-step">

    <div className="rp-item active rejected">

      <div className="rp-icon">❌</div>

      <div className="rp-text" style={{ color: "red"}} >
        TỪ CHỐI YÊU CẦU CỨU HỘ
      </div>

    </div>

    

  </div>

) : (

  /* 🔥 NORMAL TIMELINE */
  STATUS_STEPS
    .filter(step => step.key !== "REQUEST_REJECTED") 
    .map((step, index) => {

      const isActive = index === currentIndex;
      const isDone = index < currentIndex;

      return (

        <div key={step.key} className="rp-step">

          <div
            className={`rp-item 
            ${isActive ? "active" : ""} 
            ${isDone ? "done" : ""}`}
          >

            <div className="rp-icon">
              {step.icon}
            </div>

            <div className="rp-text">
              {step.label}
            </div>

          </div>

          {index < STATUS_STEPS.length - 2 && (
            <div className={`rp-line ${isDone ? "done" : ""}`} />
          )}

        </div>

      );

    })

)}

</div>

            <div className="detail-grid">

              {/* LEFT */}
              <div className="left-col">

                <section className="card">
                <h4 className="card-title">1. THÔNG TIN NGƯỜI GỬI</h4>
                  <p><b>Họ tên:</b> {data.rescueRequest?.fullName}</p>
                  <p><b>SĐT:</b> {data.rescueRequest?.contactPhone}</p>
                  <p><b>Địa chỉ:</b> {data.rescueRequest?.address}</p>
                </section>
                <section className="card">
                <h4 className="card-title">2. LOẠI YÊU CẦU</h4>
                  <p>{getRequestTypeLabel(data.rescueRequest?.requestType)}</p>
                </section>

                <section className="card">
                <h4 className="card-title">3. MÔ TẢ CHI TIẾT</h4>
                  <p>{data.rescueRequest?.detailDescription}</p>
                </section>
                <section className="card">
                <h4 className="card-title">4. HÌNH ẢNH THỰC TẾ </h4>

                  {images?.length > 0 ? (
                    <Image.PreviewGroup>
                      {images.map((img, i) => (
                        <Image
                          key={i}
                          src={img}
                          width="100%"
                          referrerPolicy="no-referrer"
                        />
                      ))}
                    </Image.PreviewGroup>
                  ) : (
                    <p>Không có ảnh</p>
                  )}

                </section>
                {data.rescueRequest?.locationLat && (
                  <section className="map-card">
                    <iframe
                      title="map"
                      src={`https://www.google.com/maps?q=${data.rescueRequest.locationLat},${data.rescueRequest.locationLng}&z=15&output=embed`}
                    />
                  </section>
                )}

              </div>

              {/* RIGHT */}
              <div className="right-col">

               
                

                <section className="card">
                <h4 className="card-title">5. THÔNG TIN & Mô Tả</h4>
                  <p><b>Số người:</b> {data.rescueRequest?.victimCount}</p>
                  <p><b>Dụng cụ:</b> {data.rescueRequest?.availableRescueTool || "Không có"}</p>
                  <p><b>Nhu cầu:</b> {data.rescueRequest?.specialNeeds}</p>
                  <p><b>Ghi chú:</b> {data.rescueRequest?.rescueTeamNote || "Không có"}</p>
                </section>

                <section className="card">
                <h4 className="card-title">6. ĐỘI CỨU HỘ</h4>
                  <p><b>Tên:</b> {data.assignment?.rescueTeam?.teamName}</p>
                  <p><b>SĐT:</b> {data.assignment?.rescueTeam?.contactPhone}</p>
                  <p><b>Khu vực:</b> {data.assignment?.rescueTeam?.areaName}</p>
                </section>

                <section className="card">
                <h4 className="card-title">7. PHƯƠNG TIỆN</h4>
                  <p><b>Tên:</b> {data.assignment?.vehicle?.vehicleName}</p>
                  <p><b>Loại:</b> {data.assignment?.vehicle?.vehicleType}</p>
               
                  <p><b>Vị trí:</b> {data.assignment?.vehicle?.vehicleLocation}</p>
                </section>

                <section className="card">
                <h4 className="card-title">8. HỆ THỐNG GHI NHẬN </h4>
                  <p><b>Xác minh:</b> {data.isVerified ? "✔️" : "❌"}</p>
                  <p><b>Đã phân công:</b> {data.isAssigned ? "✔️" : "❌"}</p>
                  <p><b>Trạng thái:</b> {data.assignment?.assignmentStatusLabel}</p>
                  {data?.assignment?.rejectReason?.trim() && (
  <p>
    <b>Lý do từ chối: {data.assignment.rejectReason}</b>
  </p>
)}

                </section>
             
              </div>

            </div>

          </>
        )}

      </section>

    </Modal>
  );

};

export default RescueProgressModal;