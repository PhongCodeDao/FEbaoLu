import { Input, Select, Button, Upload, InputNumber } from "antd";
import AuthNotify from "../../utils/Common/AuthNotify";
import { PhoneOutlined, UploadOutlined, UserOutlined } from "@ant-design/icons";
import { LoadingOutlined } from "@ant-design/icons";
import "../../pages/EmergencyRequest/EmergencyRequest.css";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
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
  "đưa đến nơi trú ẩn",
];

const REQUEST_TYPE_OPTIONS = REQUEST_TYPES.map((t) => ({
  value: t,
  label: t,
}));

const EmergencyRequestForm = ({
  form,
  setForm,
  address,
  loadingGPS,
  handleGetGPS,
  handleSubmit,
  gpsSuccess,
  location,
  setLocation,
  errors,
  setErrors,
  setAddress,
  submitting,
}) => {
 
  return (
    <section className="emergency-form">
      <h2>GỬI YÊU CẦU CỨU HỘ</h2>

      <p className="sub">
        Hệ thống tiếp nhận thông tin trực tiếp cho đội cứu hộ hiện trường.
      </p>

      {/* ================= 1 NGƯỜI GỬI ================= */}

      <div className="form-section section-1">
        <h4>
          <UserOutlined /> 1. THÔNG TIN NGƯỜI GỬI YÊU CẦU
        </h4>

        <label>
          HỌ VÀ TÊN <span className="required">*</span>
        </label>

        <Input
          placeholder="Nhập họ và tên người gửi yêu cầu"
          status={errors.fullName ? "error" : undefined}
          value={form.fullName}
          onChange={(e) => {
            const value = e.target.value;

            setForm({
              ...form,
              fullName: value,
            });

            if (value.trim()) {
              setErrors((prev) => ({
                ...prev,
                fullName: false,
                messages: {
                  ...(prev.messages || {}),
                  fullName: "",
                },
              }));
            }
          }}
        />

        {errors.fullName && (
          <p className="error-message">{errors.messages?.fullName}</p>
        )}

        <label>
          SỐ ĐIỆN THOẠI <span className="required">*</span>
        </label>

        <Input
          prefix={<PhoneOutlined />}
          maxLength={10}
          placeholder="Nhập số điện thoại liên hệ"
          status={errors.contactPhone ? "error" : undefined}
          value={form.contactPhone}
          onChange={(e) => {
            const onlyNumber = e.target.value.replace(/\D/g, "");

            setForm({
              ...form,
              contactPhone: onlyNumber,
            });

            const phoneRegex = /^(03|05|07|08|09)\d{8}$/;

            if (phoneRegex.test(onlyNumber)) {
              setErrors((prev) => ({
                ...prev,
                contactPhone: false,
                messages: {
                  ...(prev.messages || {}),
                  contactPhone: "",
                },
              }));
            }
          }}
        />

        {errors.contactPhone && (
          <p className="error-message">{errors.messages?.contactPhone}</p>
        )}
      </div>

      {/* ================= 2 LOẠI YÊU CẦU ================= */}

      <div className="form-section section-2">
        <h4 className="section-title">
          ⚠️ 2. LOẠI SỰ CỐ & TÌNH TRẠNG HIỆN TRƯỜNG
        </h4>

        <label className="field-label">
          LOẠI YÊU CẦU <span className="required">*</span>
        </label>

        <Select
          className="full-width"
          placeholder="Chọn loại yêu cầu"
          status={errors.requestType ? "error" : undefined}
          value={form.requestType || undefined}
          onChange={(v) => {
            setForm({
              ...form,
              requestType: v,
            });

            setErrors((prev) => ({
              ...prev,
              requestType: false,
              messages: {
                ...(prev.messages || {}),
                requestType: "",
              },
            }));
          }}
        >
          {REQUEST_TYPE_OPTIONS.map((o) => (
            <Option key={o.value} value={o.value}>
              {o.label}
            </Option>
          ))}
        </Select>

        {errors.requestType && (
          <p className="error-message">{errors.messages?.requestType}</p>
        )}
      </div>

      {/* ================= 3 GPS ================= */}

      <div className="form-section section-3">
        <h4>📍 3. VỊ TRÍ CHÍNH XÁC</h4>

        <div className="location-grid">
          <div className="location-left">
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              ĐỊA CHỈ HIỆN TẠI <span className="required">*</span>
              <Tooltip
  title={`Nếu không lấy được địa chỉ hiện tại thì bạn có thể nhập tay vào ô trống bên dưới và ghi rõ địa chỉ chi tiết  `}
>
  <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
</Tooltip>
            </label>

            <Input
              placeholder="Nhập địa chỉ chi tiết hoặc lấy địa chỉ hiện tại"
              value={address}
              onChange={(e) => {
                const value = e.target.value;

                setAddress(value);
              }}
            />

            <Button
              type="primary"
              className="gps-locate-btn"
              loading={loadingGPS}
              onClick={handleGetGPS}
            >
              🎯 LẤY ĐỊA CHỈ HIỆN TẠI
            </Button>

            {!gpsSuccess && (
              <>
                <label style={{ marginTop: 20 }}>LATITUDE</label>

                <Input
                  placeholder="Ví dụ 10.8231"
                  value={location.lat}
                  onChange={(e) => {
                    const value = e.target.value;

                    setLocation((prev) => ({
                      ...prev,
                      lat: value,
                    }));
                  }}
                />

                <label style={{ marginTop: 10 }}>LONGITUDE</label>

                <Input
                  placeholder="Ví dụ 106.6297"
                  value={location.lng}
                  onChange={(e) => {
                    const value = e.target.value;

                    setLocation((prev) => ({
                      ...prev,
                      lng: value,
                    }));
                  }}
                />
              </>
            )}
          </div>

          <div className="location-map">
            <iframe
              title="google-map"
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              referrerPolicy="no-referrer-when-downgrade"
              src={`${import.meta.env.VITE_GOOGLE_MAP_EMBED}?q=${
                location.lat || 10.8231
              },${location.lng || 106.6297}&z=16&output=embed`}
              allowFullScreen
            />
          </div>
        </div>
      </div>

      {/* ================= 4 THÔNG TIN HIỆN TRƯỜNG ================= */}

      <div className="form-section section-4">
        <h4>🧰 4. NGUỒN LỰC & MÔ TẢ</h4>

        <div className="form-row">
          <div>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
  SỐ LƯỢNG NGƯỜI GẶP NẠN
  <span className="required">*</span>
  <Tooltip title="Nhập tổng số người đang gặp nạn để hệ thống ghi nhận diểm số. ">
    <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
  </Tooltip>
 
</label>

            <InputNumber
  style={{ width: "100%" }}
  placeholder="Nhập số người cần cứu hộ"
  min={0}
  status={errors.victimCount ? "error" : undefined}
  value={form.victimCount ?? undefined} // 👈 quan trọng
  onChange={(value) => {
    setForm({ ...form, victimCount: value });

    if (value === null || value === undefined) {
      setErrors((prev) => ({
        ...prev,
        victimCount: true,
        messages: {
          ...(prev.messages || {}),
          victimCount: "Vui lòng nhập số người gặp nạn",
        },
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        victimCount: false,
        messages: {
          ...(prev.messages || {}),
          victimCount: "",
        },
      }));
    }
  }}
/>
            {errors.victimCount && (
              <p className="error-message">{errors.messages?.victimCount}</p>
            )}
          </div>

          <div>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          DỤNG CỤ CỨU HỘ HIỆN CÓ
  <span className="required">*</span>

 
</label>

            <Input
              value={form.availableRescueTool}
              placeholder="ghi chú dụng cụ cứu hộ hiện có cho đội cứu hộ biết"
              status={errors.availableRescueTool ? "error" : undefined}
              onChange={(e) => {
                const value = e.target.value;

                setForm({ ...form, availableRescueTool: value });

                if (!value.trim()) {
                  setErrors((prev) => ({
                    ...prev,
                    availableRescueTool: true,
                    messages: {
                      ...(prev.messages || {}),
                      availableRescueTool: "Vui lòng nhập dụng cụ cứu hộ",
                    },
                  }));
                } else if (value.length > 200) {
                  setErrors((prev) => ({
                    ...prev,
                    availableRescueTool: true,
                    messages: {
                      ...(prev.messages || {}),
                      availableRescueTool: "Tối đa 200 ký tự",
                    },
                  }));
                } else {
                  setErrors((prev) => ({
                    ...prev,
                    availableRescueTool: false,
                    messages: {
                      ...(prev.messages || {}),
                      availableRescueTool: "",
                    },
                  }));
                }
              }}
            />

            {errors.availableRescueTool && (
              <p className="error-message">
                {errors.messages?.availableRescueTool}
              </p>
            )}
          </div>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
        NHU CẦU ĐẶC BIỆT
  <span className="required">*</span>
  <Tooltip
  title={`Nếu có những từ "người già", "trẻ em", "khuyết tật", sẽ được hệ thống ghi nhận số điểm `}
>
  <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
</Tooltip>
 
</label>

        <Input
          value={form.specialNeeds}
          placeholder="Nhập rõ chi tiết nhu cầu đặc biệt ví dụ có người già, trẻ em..."
          status={errors.specialNeeds ? "error" : undefined}
          onChange={(e) => {
            const value = e.target.value;

            setForm({ ...form, specialNeeds: value });

            if (!value.trim()) {
              setErrors((prev) => ({
                ...prev,
                specialNeeds: true,
                messages: {
                  ...(prev.messages || {}),
                  specialNeeds: "Vui lòng nhập nhu cầu đặc biệt",
                },
              }));
            } else if (value.length > 250) {
              setErrors((prev) => ({
                ...prev,
                specialNeeds: true,
                messages: {
                  ...(prev.messages || {}),
                  specialNeeds: "Nhu cầu đặc biệt tối đa 250 ký tự",
                },
              }));
            } else {
              setErrors((prev) => ({
                ...prev,
                specialNeeds: false,
                messages: {
                  ...(prev.messages || {}),
                  specialNeeds: "",
                },
              }));
            }
          }}
        />

        {errors.specialNeeds && (
          <p className="error-message">{errors.messages?.specialNeeds}</p>
        )}

<label style={{ display: "flex", alignItems: "center", gap: 6 }}>
MÔ TẢ CHI TIẾT
  <span className="required">*</span>
  <Tooltip
  title={`Nếu có những từ "máu", "hấp hối", "chìm", "lũ quét", "sạt lở",
"nguy kịch", "kẹt", "gãy xương", "bất tỉnh",
"đói", "khát", "cô lập", "nước dâng", "hết lương", "lạnh" sẽ được  hệ thống ghi nhận số điểm `}
>
  <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer" }} />
</Tooltip>
 
</label>

        <TextArea
          rows={4}
          placeholder="Mô tả chi tiết tình trạng hiện trường, ví dụ: nước ngập đến đâu, có người mắc kẹt ở đâu, có nguy cơ sạt lở không..."
          status={errors.detailDescription ? "error" : undefined}
          value={form.detailDescription}
          onChange={(e) => {
            const value = e.target.value;

            setForm({ ...form, detailDescription: value });

            if (value.trim()) {
              setErrors((prev) => ({
                ...prev,
                detailDescription: false,
                messages: {
                  ...(prev.messages || {}),
                  detailDescription: "",
                },
              }));
            }
          }}
        />

        {errors.detailDescription && (
          <p className="error-message">{errors.messages?.detailDescription}</p>
        )}

        <label>
          GHI CHÚ ĐỊA ĐIỂM CHI TIẾT CHO ĐỘI CỨU HỘ{" "}
          <span className="required">*</span>
        </label>

        <Input
          rows={4}
          placeholder="Ví dụ: gần cây đa, nhà văn hóa, có trẻ em đi cùng..."
          status={errors.rescueTeamNote ? "error" : undefined}
          value={form.rescueTeamNote}
          onChange={(e) => {
            const value = e.target.value;

            setForm({ ...form, rescueTeamNote: value });

            if (value.trim()) {
              setErrors((prev) => ({
                ...prev,
                rescueTeamNote: false,
                messages: {
                  ...(prev.messages || {}),
                  rescueTeamNote: "",
                },
              }));
            }
          }}
        />

        {errors.rescueTeamNote && (
          <p className="error-message">{errors.messages?.rescueTeamNote}</p>
        )}
      </div>

      {/* ================= 5 HÌNH ẢNH ================= */}

      <div className="form-section section-5">
        <h4>
          📷 5. HÌNH ẢNH HIỆN TRƯỜNG <span className="required">*</span>
        </h4>

        <Upload
          listType="picture"
          multiple
          beforeUpload={() => false}
          className="emergency-upload"
          fileList={form.images}
          onChange={({ fileList }) => {
            if (fileList.length > 4) {
              AuthNotify.warning(
                "Quá số lượng ảnh",
                "Chỉ được tải tối đa 4 ảnh"
              );

              setErrors((prev) => ({
                ...prev,
                images: true,
                messages: {
                  ...(prev.messages || {}),
                  images: "Chỉ được tải tối đa 4 ảnh",
                },
              }));

              return;
            }

            setForm((prev) => ({
              ...prev,
              images: fileList,
            }));

            setErrors((prev) => ({
              ...prev,
              images: false,
              messages: {
                ...(prev.messages || {}),
                images: "",
              },
            }));

            /* thông báo khi thêm ảnh */

            if (fileList.length > 0) {
              AuthNotify.success(
                "Ảnh đã được thêm",
                `Đã chọn ${fileList.length} ảnh`
              );
            }
          }}
        >
          <div className="upload-dropzone">
            <UploadOutlined className="upload-icon" />

            <p className="upload-title">TẢI ẢNH HIỆN TRƯỜNG</p>

            <span className="upload-sub">
              Nhấn để chụp hoặc tải ảnh (JPG, PNG)
            </span>
          </div>
        </Upload>

        {errors.images && (
          <p className="error-message">{errors.messages?.images}</p>
        )}
      </div>

      <Button
        block
        className="submit-btn"
        onClick={handleSubmit}
        loading={submitting}
        disabled={submitting}
        icon={submitting ? <LoadingOutlined spin /> : null}
      >
        {submitting ? "ĐANG GỬI YÊU CẦU..." : "GỬI YÊU CẦU CỨU HỘ →"}
      </Button>
    </section>
  );
};

export default EmergencyRequestForm;
