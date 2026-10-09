import { Modal, Form, InputNumber, Select, message } from "antd";
import { useEffect, useState } from "react";

import {
  updateSupplyPlan,
  getAllWarehouses
} from "../../../../../api/axios/ManagerApi/periodicAidApi";

export default function EditSupplyPlan({ open, onClose, data, onSuccess }) {
  const [form] = Form.useForm();
  const [warehouses, setWarehouses] = useState([]);

  /* ================= LOAD WAREHOUSES ================= */

  useEffect(() => {
    if (open) {
      loadWarehouses();
    }
  }, [open]);

  const loadWarehouses = async () => {
    try {
      const res = await getAllWarehouses();
      setWarehouses(res?.data || res || []);
    } catch {
      message.error("Lỗi tải kho");
    }
  };

  /* ================= FIX FORM KHÔNG BỊ TRẮNG ================= */

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({
        plannedQuantity: data.plannedQuantity,
        approvedQuantity: data.approvedQuantity ?? 0,
        warehouseId: data.warehouseId,
      });
    }
  }, [open, data]);

  /* ================= RESET FORM KHI ĐÓNG ================= */

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 🔥 check logic
      if (values.approvedQuantity > values.plannedQuantity) {
        message.error("Số lượng duyệt không được lớn hơn dự kiến");
        return;
      }

      await updateSupplyPlan(data.supplyPlanId, {
        plannedQuantity: Number(values.plannedQuantity),
        approvedQuantity: Number(values.approvedQuantity),
        warehouseId: Number(values.warehouseId),
      });

      message.success("Cập nhật thành công");

      onClose();
      onSuccess?.();

    } catch (err) {
      console.error(err);
      message.error(
        err?.response?.data?.message || "Cập nhật thất bại"
      );
    }
  };

  /* ================= UI ================= */

  return (
    <Modal
      title="Sửa kế hoạch cấp phát"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleSubmit}
      okText="Cập nhật"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical">

        {/* SỐ LƯỢNG DỰ KIẾN */}
        <Form.Item
          name="plannedQuantity"
          label="Số lượng dự kiến"
          rules={[{ required: true, message: "Nhập số lượng" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={1}
          />
        </Form.Item>

        {/* SỐ LƯỢNG DUYỆT */}
        <Form.Item
          name="approvedQuantity"
          label="Số lượng duyệt"
          rules={[{ required: true, message: "Nhập số lượng duyệt" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
          />
        </Form.Item>

        {/* KHO */}
        <Form.Item
          name="warehouseId"
          label="Kho"
          rules={[{ required: true, message: "Chọn kho" }]}
        >
          <Select
            placeholder="Chọn kho"
            showSearch
            optionFilterProp="label"
            options={warehouses.map(w => ({
              value: w.warehouseId,
              label: `${w.warehouseName} - ${w.areaName}`,
            }))}
          />
        </Form.Item>

      </Form>
    </Modal>
  );
}