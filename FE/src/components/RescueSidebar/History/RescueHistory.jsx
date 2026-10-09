import { useState } from "react";
import {
  Input,
  Button,
  Tag,
  Modal,
  Spin,
  Alert
} from "antd";

import {
  EditOutlined,
  EyeOutlined,
  LoadingOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import AuthNotify from "../../../utils/Common/AuthNotify";
import RescueProgressModal from "../ProgressModal/RescueProgressModal";
import {
  getRescueHistoryByPhone,
  deleteRescueRequest
} from "../../../api/service/historyApi";

import RescueDetailModal from "../RescueDetail/RescueDetailModal";
import EditRescueModal from "../EditResscue/EditRescueModal";

import "./RescueHistory.css";


/* ================= INCIDENT TYPE ================= */

const REQUEST_TYPES = [

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

const getIncidentLabel = (value) => {
  const found = MAIN_INCIDENT_OPTIONS.find(
    (item) => item.value === value
  );
  return found ? found.label : value;
};


/* ================= PHONE VALIDATE ================= */

const phoneRegex = /^(03|05|07|08|09)\d{8}$/;


/* ================= STATUS MAP FROM API ================= */

const getStatusInfo = (statusId) => {

  const statusMap = {

    1: { text: "Đang xử lý", color: "orange" },       
    2: { text: "Đã được tiếp nhận", color: "blue" },  
    3: { text: "Đang trên đường", color: "cyan" },    
    4: { text: "Đang cứu hộ", color: "purple" },      
    5: { text: "Đã hoàn thành", color: "green" },     
    6: { text: "Đã huỷ", color: "red" }               

  };

  return statusMap[statusId] || {
    text: "Không xác định",
    color: "default"
  };

};


/* ================= COMPONENT ================= */

const RescueHistory = () => {

  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [openProgress, setOpenProgress] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  const handleViewProcess = (item) => {
    setSelectedId(item.id);
    setOpenProgress(true);
  };

  /* ================= SEARCH ================= */

  const handleSearch = async () => {

    const cleanPhone = phone.trim();

    if (!cleanPhone) {

      AuthNotify.error(
        "Thiếu số điện thoại",
        "Vui lòng nhập số điện thoại"
      );

      return;

    }

    if (!phoneRegex.test(cleanPhone)) {

      AuthNotify.error(
        "Số điện thoại không hợp lệ",
        "Số điện thoại phải gồm 10 số"
      );

      return;

    }

    setLoading(true);
    setError(null);
    setSearched(true);
    setHistories([]);

    try {

      const data = await getRescueHistoryByPhone(cleanPhone);

      const formattedData = data
        .sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        )
        .map((item) => {

          const statusInfo = getStatusInfo(item.statusId);

          return {

            ...item,

            id: item.rescueRequestId,
            code: `#CH-${item.rescueRequestId}`,

            status: statusInfo.text,
            color: statusInfo.color,

            time: new Date(item.createdAt).toLocaleString(
              "vi-VN",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            ),

            phone: item.contactPhone,
            type: item.requestType,

          };

        });

        setHistories(formattedData);

        setViewing((prev) => {
          if (!prev) return prev;
        
          const updated = formattedData.find(
            (item) => item.id === prev.id
          );
        
          return updated || prev;
        });

    }
    catch (err) {

      AuthNotify.error(
        "Lỗi tải lịch sử",
        err.message || "Không thể tải lịch sử cứu hộ"
      );

    }
    finally {

      setLoading(false);

    }

  };


  /* ================= DELETE ================= */

  const handleDelete = async (id) => {

    Modal.confirm({

      title: "Xác nhận xóa",

      content: "Bạn có chắc chắn muốn xóa yêu cầu này?",

      okText: "Xóa",

      cancelText: "Hủy",

      okButtonProps: { danger: true },

      onOk: async () => {

        try {

          await deleteRescueRequest(id);

          setHistories((prev) =>
            prev.filter((item) => item.id !== id)
          );

          AuthNotify.success(
            "Đã xóa yêu cầu",
            "Yêu cầu cứu hộ đã được xóa thành công"
          );

        }
        catch (err) {

          AuthNotify.error(
            "Xóa thất bại",
            err.message || "Không thể xóa yêu cầu"
          );

        }

      },

    });

  };


  return (

    <div className="sidebar-top">

      <div className="history-title">
        ⏱️ <b>TRA CỨU LỊCH SỬ CỨU HỘ</b>
      </div>

      <div className="history-input">

        <Input
          placeholder="Nhập số điện thoại..."
          value={phone}
          maxLength={10}
          onChange={(e) => {

            const onlyNumber =
              e.target.value.replace(/\D/g, "");

            setPhone(onlyNumber);

          }}
          disabled={loading}
          onPressEnter={handleSearch}
        />

        <Button
          type="primary"
          onClick={handleSearch}
          loading={loading}
        >
          Tra cứu
        </Button>

      </div>


      {error && (

        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginTop: 12 }}
        />

      )}


      {searched && !loading && (

        <div className="history-list-title">
          LỊCH SỬ YÊU CẦU ({histories.length})
        </div>

      )}


      {loading ? (

        <div className="loading-box">

          <Spin
            indicator={
              <LoadingOutlined spin style={{ fontSize: 32 }} />
            }
          />

          <p>Đang tải lịch sử...</p>

        </div>

      ) : (

        histories.map((item) => (

          <HistoryCard
          key={item.id}
          data={item}
          onEdit={() => setEditing(item)}
          onDelete={() => handleDelete(item.id)}
          onView={() => setViewing(item)}
          onProcess={() => handleViewProcess(item)} // ✅ THÊM
        />

        ))

      )}


      {searched &&
        !loading &&
        histories.length === 0 &&
        !error && (

          <p className="empty-text">
            Không có lịch sử cứu hộ.
          </p>

        )}


      <EditRescueModal
        data={editing}
        onClose={() => setEditing(null)}
        onUpdated={handleSearch}
      />


      <RescueDetailModal
        data={viewing}
        onClose={() => setViewing(null)}
      />
<RescueProgressModal
  requestId={selectedId}
  open={openProgress}
  onClose={() => setOpenProgress(false)}
/>
    </div>

  );

};

export default RescueHistory;


/* ================= CARD ================= */

function HistoryCard({ data, onEdit, onDelete, onView, onProcess }) {

  const isEditable = data.statusId === 1;   // status 1
  const isTracking = data.statusId === 2 ;
  const isProgress = data.statusId === 3 ||
  data.statusId === 4 ||
  data.statusId === 5 ||
  data.statusId === 6;

  return (

    <div
      className={`history-card ${data.color}`}
      onClick={onView}
      style={{ cursor: "pointer" }}
    >

      <div className="history-row">

        <span className="code">
          Mã: {data.code}
        </span>

        <Tag color={data.color}>
          {data.status}
        </Tag>

      </div>

      <div className="time">
        Họ và tên: {data.fullName}
      </div>

      <div className="time">
        Thời Gian : {data.time}
      </div>

      <div className="desc">
        Loại sự cố: {getIncidentLabel(data.type)}
      </div>

      <div className="phone">
        📞 {data.phone}
      </div>

      {/* ================= ACTION ================= */}

      <div className="history-action">

        {/* 🔥 STATUS 1: FULL ACTION */}
        {isEditable && (
          <>
            <Button
              size="small"
              type="text"
              icon={<EyeOutlined />}
              onClick={(e)=>{
                e.stopPropagation();
                onView();
              }}
              className="action-btn view-btn"
            >
              Xem chi tiết
            </Button>

            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={(e)=>{
                e.stopPropagation();
                onEdit();
              }}
              className="action-btn edit-btn"
            >
              Chỉnh sửa
            </Button>

            <Button
              size="small"
              type="text"
              icon={<DeleteOutlined />}
              onClick={(e)=>{
                e.stopPropagation();
                onDelete();
              }}
              className="action-btn delete-btn"
            >
              Xóa
            </Button>
          </>
        )}

        {/* 🔥 STATUS 2: CHỈ XEM QUÁ TRÌNH */}
        {isProgress && (
          <Button
            size="small"
            type="text"
            icon={<EyeOutlined />}
            onClick={(e)=>{
              e.stopPropagation();
              onProcess(); // ✅ ĐÚNG
            }}
            className="action-btn process-btn"
          >
            Xem quá trình
          </Button>
        )}

        {/* 🔥 STATUS KHÁC */}
        {isTracking && (
          <Button
            size="small"
            type="text"
            icon={<EyeOutlined />}
            onClick={(e)=>{
              e.stopPropagation();
              onView();
            }}
            className="action-btn view-btn"
          >
            Xem chi tiết
          </Button>
        )}

      </div>

    </div>

  );

}