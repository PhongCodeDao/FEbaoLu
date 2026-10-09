import { useEffect, useState } from "react";
import {
  Modal,
  Input,
  Select,
  InputNumber,
  Button,
  Upload,
  Image
} from "antd";

import {
  UserOutlined,
  UploadOutlined
} from "@ant-design/icons";
import { uploadImages } from "../../../api/firebase/uploadanh";
import { updateRescueRequest } from "../../../api/service/historyApi";
import AuthNotify from "../../../utils/Common/AuthNotify";

import "./EditRescueModal.css";
const API_BASE = "https://api-rescue.purintech.id.vn";

const { TextArea } = Input;
const { Option } = Select;

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

const REQUEST_TYPE_OPTIONS = REQUEST_TYPES.map(t => ({
  value: t,
  label: t
}));

function EditRescueModal({ data, onClose, onUpdated }) {

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    fullName: "",
    requestType: "",
    victimCount: 0,
    availableRescueTool: "",
    specialNeeds: "",
    detailDescription: "",
    rescueTeamNote: "",
    address: "",
    locationLat: 0,
    locationLng: 0,
    locationImageUrl: [],
    previewImages: [],
    imageFile: null
  });

  /* ================= LOAD DATA ================= */

  useEffect(() => {

    if (data) {

      setForm({
        fullName: data.fullName || "",
        requestType: data.requestType || "",
        victimCount: data.victimCount || 0,
        availableRescueTool: data.availableRescueTool || "",
        specialNeeds: data.specialNeeds || "",
        detailDescription: data.detailDescription || "",
        rescueTeamNote: data.rescueTeamNote || "",
        address: data.address || "",
        locationLat: data.locationLat || 0,
        locationLng: data.locationLng || 0,
        locationImageUrl: data.locationImageUrl
        ? data.locationImageUrl.split(",").map(i =>
            i.startsWith("http")
              ? i
              : `${API_BASE}${i.startsWith("/") ? "" : "/"}${i}`
          )
        : [],
        previewImages: []
      });

      setErrors({});

    }

  }, [data]);

  if (!data) return null;

  /* ================= CLEAR ERROR ================= */

  const clearError = (field) => {

    setErrors(prev => {

      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;

    });

  };

  /* ================= VALIDATE ================= */

  const validateForm = () => {

    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    }

    if (!form.requestType) {
      newErrors.requestType = "Vui lòng chọn loại yêu cầu";
    }

    if (form.victimCount === null || form.victimCount <= 0) {
      newErrors.victimCount = "Số người gặp nạn phải lớn hơn 0";
    }

    if (!form.availableRescueTool?.trim()) {
      newErrors.availableRescueTool = "Vui lòng nhập dụng cụ cứu hộ";
    }
    else if (form.availableRescueTool.length > 200) {
      newErrors.availableRescueTool = "Tối đa 200 ký tự";
    }

    if (!form.specialNeeds?.trim()) {
      newErrors.specialNeeds = "Vui lòng nhập nhu cầu đặc biệt";
    }

    if (!form.detailDescription?.trim()) {
      newErrors.detailDescription = "Vui lòng nhập mô tả chi tiết";
    }

    if (!form.rescueTeamNote?.trim()) {
      newErrors.rescueTeamNote = "Vui lòng nhập ghi chú cho đội cứu hộ";
    }

    if (!form.address?.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }

    if (!form.locationImageUrl || form.locationImageUrl.length === 0) {
      newErrors.locationImageUrl = "Vui lòng tải ảnh hiện trường";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {

      AuthNotify.warning(
        "Thông tin chưa hợp lệ",
        "Vui lòng kiểm tra lại các trường bắt buộc"
      );

      return false;

    }

    return true;

  };




  /* ================= IMAGE UPLOAD ================= */

  const handleImageUpload = async (file) => {

    const realFile = file.originFileObj || file;
  
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];
  
    if (!allowedTypes.includes(realFile.type)) {
  
      AuthNotify.error(
        "Sai định dạng",
        "Chỉ chấp nhận JPG PNG WEBP"
      );
  
      return Upload.LIST_IGNORE;
    }
  
    if (realFile.size / 1024 / 1024 > 5) {
  
      AuthNotify.error(
        "Ảnh quá lớn",
        "Ảnh phải nhỏ hơn 5MB"
      );
  
      return Upload.LIST_IGNORE;
    }
  
    try {
  
      /* PREVIEW ngay lập tức */
      const previewUrl = URL.createObjectURL(realFile);
  
      setForm(prev => ({
        ...prev,
        previewImages: [
          ...(prev.previewImages || []),
          previewUrl
        ]
      }));
  
      setLoading(true);
  
      /* upload server */
      const res = await uploadImages([realFile], "citizen");
  
      const imagePath = res?.urls?.[0];
  
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
  
      const imageUrl = imagePath.startsWith("http")
      ? imagePath
      : `${API_BASE}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  
        setForm(prev => ({
          ...prev,
          locationImageUrl: [
            ...(prev.locationImageUrl || []),
            imageUrl
          ]
        }));
  
      AuthNotify.success(
        "Tải ảnh thành công",
        "Ảnh hiện trường đã được tải lên"
      );
  
      clearError("locationImageUrl");
  
    }
    catch (err) {
  
      console.error("UPLOAD ERROR:", err);
  
      AuthNotify.error(
        "Upload thất bại",
        err?.response?.data?.message || "Không thể tải ảnh"
      );
  
    }
    finally {
  
      setLoading(false);
  
    }
  
    return false;
  };
  console.log("PAYLOAD:", {
    locationImageUrl: form.locationImageUrl.join(","),
    attachments: form.locationImageUrl.map(url => ({
      attachmentId: 0,
      fileUrl: url
    }))
  });
  /* ================= UPDATE ================= */

  const handleUpdate = async () => {

    if (!validateForm()) return;

    try {

      setLoading(true);

      await updateRescueRequest(data.id, {
        requestType: form.requestType,
        locationLat: Number(form.locationLat),
        locationLng: Number(form.locationLng),
      
        locationImageUrl: form.locationImageUrl.join(","), // ✅ chỉ giữ cái này
      
        fullName: form.fullName,
        victimCount: Number(form.victimCount) || 0,
        availableRescueTool: form.availableRescueTool,
        specialNeeds: form.specialNeeds,
        detailDescription: form.detailDescription,
        rescueTeamNote: form.rescueTeamNote,
        address: form.address
      });

      AuthNotify.success(
        "Cập nhật thành công",
        "Yêu cầu cứu hộ đã được cập nhật"
      );

      onUpdated?.();
      onClose();
      // setViewing(null);

    }
    catch (err) {

      AuthNotify.error(
        "Cập nhật thất bại",
        err?.response?.data?.message ||
        err.message ||
        "Không thể cập nhật yêu cầu"
      );

    }
    finally {

      setLoading(false);

    }

  };

  console.log("PAYLOAD:", {
    locationImageUrl: form.locationImageUrl.join(",")
  });
  
  return (

    <Modal
      open
      onCancel={onClose}
      footer={null}
      width={800}
      className="edit-emergency-modal"
      centered
      destroyOnHidden
    >

      <section className="emergency-form edit-form">

        <h2>CHỈNH SỬA YÊU CẦU CỨU HỘ</h2>

        <div className="form-section">

          <h4>
            <UserOutlined /> THÔNG TIN NGƯỜI GỬI
          </h4>

          <label>HỌ VÀ TÊN *</label>

          <Input
            status={errors.fullName ? "error" : ""}
            value={form.fullName}
            onChange={(e)=>{

              const value = e.target.value;

              setForm({...form, fullName:value});

              if(value.trim()){
                clearError("fullName");
              }

            }}
          />

          {errors.fullName && (
            <p className="error-message">{errors.fullName}</p>
          )}

        </div>

        <div className="form-section">

          <h4>LOẠI YÊU CẦU</h4>

          <Select
            className="full-width"
            status={errors.requestType ? "error" : ""}
            value={form.requestType || undefined}
            onChange={(v)=>{

              setForm({...form, requestType:v});

              if(v){
                clearError("requestType");
              }

            }}
          >

            {REQUEST_TYPE_OPTIONS.map(o=>(
              <Option key={o.value} value={o.value}>
                {o.label}
              </Option>
            ))}

          </Select>

          {errors.requestType && (
            <p className="error-message">{errors.requestType}</p>
          )}

        </div>

        <div className="form-section">

          <h4>CHI TIẾT</h4>

          <label>SỐ NGƯỜI GẶP NẠN *</label>

          <InputNumber
            style={{width:"100%"}}
            min={1}
            status={errors.victimCount ? "error" : ""}
            value={form.victimCount}
            onChange={(v)=>{

              setForm({...form, victimCount:v});

              if(v > 0){
                clearError("victimCount");
              }

            }}
          />

          {errors.victimCount && (
            <p className="error-message">{errors.victimCount}</p>
          )}

          <label>DỤNG CỤ CỨU HỘ *</label>

          <Input
            status={errors.availableRescueTool ? "error" : ""}
            value={form.availableRescueTool}
            onChange={(e)=>{

              const value=e.target.value;

              setForm({...form, availableRescueTool:value});

              if(value.trim()){
                clearError("availableRescueTool");
              }

            }}
          />

          {errors.availableRescueTool && (
            <p className="error-message">{errors.availableRescueTool}</p>
          )}

          <label>NHU CẦU ĐẶC BIỆT *</label>

          <Input
            status={errors.specialNeeds ? "error" : ""}
            value={form.specialNeeds}
            onChange={(e)=>{

              const value=e.target.value;

              setForm({...form, specialNeeds:value});

              if(value.trim()){
                clearError("specialNeeds");
              }

            }}
          />

          {errors.specialNeeds && (
            <p className="error-message">{errors.specialNeeds}</p>
          )}

          <label>MÔ TẢ CHI TIẾT *</label>

          <TextArea
            rows={4}
            status={errors.detailDescription ? "error" : ""}
            value={form.detailDescription}
            onChange={(e)=>{

              const value=e.target.value;

              setForm({...form, detailDescription:value});

              if(value.trim()){
                clearError("detailDescription");
              }

            }}
          />

          {errors.detailDescription && (
            <p className="error-message">{errors.detailDescription}</p>
          )}

          <label>GHI CHÚ CHO ĐỘI CỨU HỘ *</label>

          <Input
            status={errors.rescueTeamNote ? "error" : ""}
            value={form.rescueTeamNote}
            onChange={(e)=>{

              const value=e.target.value;

              setForm({...form, rescueTeamNote:value});

              if(value.trim()){
                clearError("rescueTeamNote");
              }

            }}
          />

          {errors.rescueTeamNote && (
            <p className="error-message">{errors.rescueTeamNote}</p>
          )}

          <label>ĐỊA CHỈ *</label>

          <Input
            status={errors.address ? "error" : ""}
            value={form.address}
            onChange={(e)=>{

              const value=e.target.value;

              setForm({...form, address:value});

              if(value.trim()){
                clearError("address");
              }

            }}
          />

          {errors.address && (
            <p className="error-message">{errors.address}</p>
          )}

          {/* IMAGE */}
          <div className="form-section section-5">
          <label>ẢNH HIỆN TRƯỜNG *</label>

          <Upload
  className="emergency-upload"
  listType="picture"

  beforeUpload={handleImageUpload}
  showUploadList={false}
  accept="image/*"
>

<div className="upload-dropzone">
    
    <UploadOutlined className="upload-icon"/>
    
    <p className="upload-title">
    TẢI ẢNH HIỆN TRƯỜNG
    </p>
    
    <span className="upload-sub">
    Nhấn để chụp hoặc tải ảnh (JPG, PNG)
    </span>
    
    </div>

          </Upload>

          {errors.locationImageUrl && (
            <p className="error-message">{errors.locationImageUrl}</p>
          )}

{(form.previewImages.length > 0 || form.locationImageUrl.length > 0) && (

<Image.PreviewGroup>
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "12px",
      marginTop: "10px"
    }}
  >
    {(form.previewImages.length > 0
      ? form.previewImages
      : form.locationImageUrl
    ).slice(0, 4).map((img, i) => (
      <div
        key={i}
        style={{
          position: "relative", // 🔥 quan trọng
          width: "100%",
          aspectRatio: "4/3",
          overflow: "hidden",
          borderRadius: "12px"
        }}
      >

        {/* ❌ BUTTON XOÁ */}
        <div
          onClick={(e) => {
            e.stopPropagation(); // ❌ không mở preview

            setForm(prev => ({
              ...prev,
              previewImages: prev.previewImages.filter((_, idx) => idx !== i),
              locationImageUrl: prev.locationImageUrl.filter((_, idx) => idx !== i)
            }));
          }}
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10
          }}
        >
          ×
        </div>

        {/* IMAGE */}
        <Image
          src={img}
          alt="preview"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "12px"
          }}
        />

      </div>
    ))}
  </div>
</Image.PreviewGroup>

)}
 </div>

        </div>

        <Button
          block
          className="submit-btn"
          loading={loading}
          onClick={handleUpdate}
        >
          LƯU THAY ĐỔI →
        </Button>

      </section>

    </Modal>

  );

}

export default EditRescueModal;