import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import EmergencyHeader from "../../Layout/EmergencyHeader/EmergencyHeader";
import EmergencyFooter from "../../Layout/EmergencyFooter/EmergencyFooter";

import AuthNotify from "../../utils/Common/AuthNotify";
import { createRescueRequest } from "../../api/service/emergencyApi";

import EmergencyRequestForm from "../../components/EmergencyRequestPage/EmergencyRequestForm";
import EmergencyInfoPanel from "../../components/EmergencyRequestPage/EmergencyInfoPanel";
import { getProvinces } from "../../api/service/geographicApi";
import { getWardsByProvince } from "../../api/service/geographicApi";
import "./EmergencyRequest.css";

const DEFAULT_AREA_ID = 1;

const EmergencyRequestPage = () => {

const navigate = useNavigate();

const [errors, setErrors] = useState({});
const [address, setAddress] = useState("");
const [loadingGPS, setLoadingGPS] = useState(false);
const [gpsSuccess, setGpsSuccess] = useState(false);
const [submitting, setSubmitting] = useState(false);
const [provinces, setProvinces] = useState([]);
const [wards, setWards] = useState([]);
const [location, setLocation] = useState({
  lat: "",
  lng: ""
});

const [startTime] = useState(new Date());
const [timeAgo, setTimeAgo] = useState("Vừa xong");

const [form, setForm] = useState({
  fullName: "",
  contactPhone: "",
  requestType: "",
  victimCount: 0,
  availableRescueTool: "",
  specialNeeds: "",
  detailDescription: "",
  rescueTeamNote: "",
  images: []
});

/* ================= VALIDATE ================= */
const validateRescueRequest = (data) => {

  const newErrors = {};
  const phoneRegex = /^(03|05|07|08|09)\d{8}$/;

  /* ===== FULL NAME ===== */

  if (!data.fullName?.trim()) {
    newErrors.fullName = true;
    newErrors.messages = {
      ...(newErrors.messages || {}),
      fullName: "Vui lòng nhập họ tên"
    };
  }

  /* ===== PHONE ===== */

  if (!data.contactPhone?.trim()) {
    newErrors.contactPhone = true;
    newErrors.messages = {
      ...(newErrors.messages || {}),
      contactPhone: "Vui lòng nhập số điện thoại"
    };
  }
  else if (!phoneRegex.test(data.contactPhone)) {
    newErrors.contactPhone = true;
    newErrors.messages = {
      ...(newErrors.messages || {}),
      contactPhone: "Số điện thoại không hợp lệ"
    };
  }

  /* ===== REQUEST TYPE ===== */

  if (!data.requestType) {
    newErrors.requestType = true;
    newErrors.messages = {
      ...(newErrors.messages || {}),
      requestType: "Vui lòng chọn loại yêu cầu"
    };
  }

  /* ===== VICTIM COUNT ===== */

  if (
    data.victimCount === null ||
    data.victimCount === undefined ||
    isNaN(data.victimCount) ||
    Number(data.victimCount) <= 0
  ) {
  
    newErrors.victimCount = true;
  
    newErrors.messages = {
      ...(newErrors.messages || {}),
      victimCount: "Số người gặp nạn phải lớn hơn 0"
    };
  
  }

  /* ===== TOOL ===== */

  if (!data.availableRescueTool?.trim()) {

    newErrors.availableRescueTool = true;

    newErrors.messages = {
      ...(newErrors.messages || {}),
      availableRescueTool: "Vui lòng nhập dụng cụ cứu hộ"
    };

  }
  else if (data.availableRescueTool.length > 200) {

    newErrors.availableRescueTool = true;

    newErrors.messages = {
      ...(newErrors.messages || {}),
      availableRescueTool: "Tối đa 200 ký tự"
    };

  }

  /* ===== SPECIAL NEEDS ===== */

  if (!data.specialNeeds?.trim()) {

    newErrors.specialNeeds = true;

    newErrors.messages = {
      ...(newErrors.messages || {}),
      specialNeeds: "Vui lòng nhập nhu cầu đặc biệt"
    };

  }
  else if (data.specialNeeds.length > 50) {

    newErrors.specialNeeds = true;

    newErrors.messages = {
      ...(newErrors.messages || {}),
      specialNeeds: "Nhu cầu đặc biệt tối đa 50 ký tự"
    };

  }

  /* ===== DESCRIPTION ===== */

  if (!data.detailDescription?.trim()) {

    newErrors.detailDescription = true;

    newErrors.messages = {
      ...(newErrors.messages || {}),
      detailDescription: "Vui lòng mô tả tình huống"
    };

  }

  /* ===== NOTE ===== */

  if (!data.rescueTeamNote?.trim()) {

    newErrors.rescueTeamNote = true;
  
    newErrors.messages = {
      ...(newErrors.messages || {}),
      rescueTeamNote: "Vui lòng nhập ghi chú cho đội cứu hộ"
    };
  
  }
  /* ===== IMAGE ===== */

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const allowedTypes = ["image/jpeg","image/png","image/webp"];

  if (!form.images || form.images.length === 0) {

    newErrors.images = true;

    newErrors.messages = {
      ...(newErrors.messages || {}),
      images: "Vui lòng tải ít nhất 1 ảnh hiện trường"
    };

  }

  if (form.images && form.images.length > 5) {

    newErrors.images = true;

    newErrors.messages = {
      ...(newErrors.messages || {}),
      images: "Chỉ được tải tối đa 5 ảnh"
    };

  }

  if (form.images && form.images.length > 0) {

    form.images.forEach(img => {

      const file = img.originFileObj;

      if (!allowedTypes.includes(file.type)) {

        newErrors.images = true;

        newErrors.messages = {
          ...(newErrors.messages || {}),
          images: "Chỉ chấp nhận JPG, PNG, WEBP"
        };

      }

      if (file.size > MAX_FILE_SIZE) {

        newErrors.images = true;

        newErrors.messages = {
          ...(newErrors.messages || {}),
          images: "Ảnh phải nhỏ hơn 5MB"
        };

      }

    });

  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};



/* ================= LOAD PROVINCES ================= */

useEffect(() => {

  const fetchProvinces = async () => {

    try {

      const res = await getProvinces();

      const data = res?.data || res || [];

      setProvinces(data);

    } catch (error) {

      console.log("Load provinces error:", error);

    }

  };

  fetchProvinces();

}, []);

/* ================= TIME ================= */

useEffect(() => {

const updateTime = () => {

  const now = new Date();
  const diffMinutes = Math.floor((now - startTime) / 60000);

  if (diffMinutes <= 0) setTimeAgo("Vừa xong");
  else if (diffMinutes === 1) setTimeAgo("1 phút trước");
  else setTimeAgo(`${diffMinutes} phút trước`);

};

updateTime();

const interval = setInterval(updateTime, 60000);

return () => clearInterval(interval);

}, [startTime]);

/* ================= GPS ================= */

const handleGetGPS = () => {

  if (!navigator.geolocation) {

    AuthNotify.error(
      "Thiết bị không hỗ trợ GPS",
      "Bạn có thể nhập tọa độ thủ công"
    );

    setGpsSuccess(false);
    return;
  }

  setLoadingGPS(true);

  navigator.geolocation.getCurrentPosition(

    async (pos) => {

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setLocation({ lat, lng });
      setGpsSuccess(true);

      try {

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
        );

        const data = await res.json();

        setAddress(data.display_name || "Không xác định");

      } catch {

        setAddress("Không lấy được địa chỉ");

      }

      setLoadingGPS(false);

    },

    () => {

      AuthNotify.error(
        "Không lấy được vị trí",
        "Bạn có thể nhập tọa độ thủ công"
      );

      setGpsSuccess(false);
      setLoadingGPS(false);

    },

    {
      enableHighAccuracy: true,
      timeout: 10000
    }

  );

};

const normalizeAddress = (addr) => {

  if (!addr) return "";

  return addr
    .replace("Thành phố ", "")
    .replace("Tỉnh ", "")
    .replace("TP. ", "")
    .replace("TP ", "")
    .replace("Việt Nam", "")
    .trim();

};

/* ================= DETECT AREA ================= */

const detectAreaId = (address) => {

  if (!address || provinces.length === 0) return null;

  const lowerAddress = address.toLowerCase();

  const found = provinces.find(p => {

    const provinceName = p.name.toLowerCase();

    return (
      lowerAddress.includes(provinceName) ||
      lowerAddress.includes(`tỉnh ${provinceName}`) ||
      lowerAddress.includes(`thành phố ${provinceName}`)
    );

  });

  return found?.id || null;

};

/* ================= SUBMIT ================= */

const handleSubmit = async () => {

  if (submitting) return;

  const normalizedAddress = normalizeAddress(address);

  const lat = location.lat ? Number(location.lat) : null;
  const lng = location.lng ? Number(location.lng) : null;

  const areaId = detectAreaId(normalizedAddress); // FIX

  if (!areaId) {

    AuthNotify.error(
      "Không xác định được khu vực",
      "Vui lòng bật GPS hoặc kiểm tra lại địa chỉ"
    );

    return;

  }

  const payload = {
    requestType: form.requestType,
    contactPhone: form.contactPhone,
    locationLat: lat,
    locationLng: lng,
    locationImageUrl: form.images?.[0]?.name || "",
    areaId: areaId,
    fullName: form.fullName,
    victimCount: Number(form.victimCount),
    availableRescueTool: form.availableRescueTool,
    specialNeeds: form.specialNeeds,
    detailDescription: form.detailDescription,
    rescueTeamNote: form.rescueTeamNote,
    address: normalizedAddress
  };

  console.log("Payload gửi API:", payload);

  if (!validateRescueRequest(payload)) return;

  try {

    setSubmitting(true);

    await createRescueRequest(payload);

    AuthNotify.success(
      "Gửi yêu cầu thành công",
      "Đội cứu hộ đã nhận thông tin"
    );

    setTimeout(() => navigate("/map"), 2000);

  } catch (error) {

    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.title ||
      error?.message ||
      "";

    const lowerMsg = msg.toLowerCase();

    if (
      lowerMsg.includes("phone") ||
      lowerMsg.includes("duplicate") ||
      lowerMsg.includes("exists")
    ) {

      setErrors(prev => ({
        ...prev,
        contactPhone: true,
        messages: {
          ...(prev.messages || {}),
          contactPhone: "Số điện thoại đã tồn tại. Vui lòng dùng số khác."
        }
      }));

      AuthNotify.error(
        "Số điện thoại đã tồn tại",
        "Vui lòng sử dụng số điện thoại khác"
      );

      return;
    }

    AuthNotify.error(
      "Gửi yêu cầu thất bại",
      msg || "Có lỗi xảy ra"
    );

  } finally {

    setSubmitting(false);

  }

};

/* ================= UI ================= */

return (
<>
<EmergencyHeader />

<main className="emergency-page">

<div className="emergency-container">

<EmergencyRequestForm
  form={form}
  setForm={setForm}
  address={address}
  loadingGPS={loadingGPS}
  handleGetGPS={handleGetGPS}
  handleSubmit={handleSubmit}
  location={location}
  setLocation={setLocation}
  gpsSuccess={gpsSuccess}
  errors={errors}
  setErrors={setErrors}
  submitting={submitting}
  setAddress={setAddress} 
/>

<EmergencyInfoPanel timeAgo={timeAgo} />

</div>

</main>

<EmergencyFooter />
</>
);

};

export default EmergencyRequestPage;