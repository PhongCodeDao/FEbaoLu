import { Modal, Form, Input, InputNumber, Button, message, Select } from "antd";
import { useEffect, useMemo, useState } from "react";
import { createWarehouse } from "../../../../../api/axios/ManagerApi/inventoryApi";
import axiosInstance from "../../../../../api/axiosInstance";

const CreateWarehouseModal = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);

  const provinceOptions = useMemo(
    () =>
      (Array.isArray(provinces) ? provinces : []).map((p) => ({
        label: p?.name ?? "",
        value: p?.id,
      })),
    [provinces]
  );

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const loadProvinces = async () => {
      try {
        setProvincesLoading(true);
        const res = await axiosInstance.get("/api/geographic-areas/provinces");
        const data = res?.data;
        if (cancelled) return;
        setProvinces(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        message.error("Không thể tải danh sách tỉnh/thành phố");
        setProvinces([]);
      } finally {
        if (!cancelled) setProvincesLoading(false);
      }
    };

    loadProvinces();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const res = await createWarehouse({
        warehouseName: values.warehouseName,
        locationDescription: values.locationDescription,
        areaId: values.areaId || 0,
        availableBudget: values.availableBudget || 0,
      });

      message.success("Tạo kho hàng thành công!");

      form.resetFields();
      onClose();

      if (onSuccess) {
        onSuccess(res);
      }

    } catch (err) {
      console.error(err);
      message.error(err.message || "Tạo kho hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Tạo kho hàng mới"
      open={open}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Tạo kho
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* Tên kho */}
        <Form.Item
          name="warehouseName"
          label="Tên kho hàng"
          rules={[
            { required: true, message: "Vui lòng nhập tên kho" },
          ]}
        >
          <Input placeholder="Ví dụ: Kho chính, Kho phụ 1" />
        </Form.Item>

        {/* Vị trí */}
        <Form.Item
          name="locationDescription"
          label="Vị trí / Mô tả địa chỉ"
          rules={[
            { required: true, message: "Vui lòng nhập vị trí kho" },
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Ví dụ: 123 Đường ABC, Quận XYZ, TP HCM"
          />
        </Form.Item>

        {/* Area ID */}
        <Form.Item
          name="areaId"
          label="Vùng (Tỉnh/Thành phố)"
          rules={[
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve(); // không bắt buộc
                if (value > 0) return Promise.resolve();
                return Promise.reject(
                  new Error("Vui lòng nhập đúng ID khu vực")
                );
              },
            },
          ]}
        >
          <Select
            showSearch
            allowClear
            loading={provincesLoading}
            placeholder="Chọn tỉnh/thành phố (có thể để trống)"
            options={provinceOptions}
            optionFilterProp="label"
            filterOption={(input, option) =>
              String(option?.label ?? "")
                .toLowerCase()
                .includes(String(input ?? "").toLowerCase())
            }
          />
        </Form.Item>

        {/* Ngân sách */}
        <Form.Item
          name="availableBudget"
          label="Ngân sách khả dụng (₫)"
          rules={[]}
        >
          <InputNumber
            min={0}
            placeholder="Nhập số tiền"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateWarehouseModal;
