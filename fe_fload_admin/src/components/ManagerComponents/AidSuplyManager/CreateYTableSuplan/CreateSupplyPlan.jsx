import { Modal, Form, InputNumber, Select, message } from "antd";
import { useEffect, useState } from "react";

import {
  createSupplyPlan,
  getAllReliefItems,
  getAllWarehouses
} from "../../../../../api/axios/ManagerApi/periodicAidApi";

export default function CreateSupplyPlan({
  open,
  onClose,
  onSuccess,
  campaignId
}) {
  const [form] = Form.useForm();

  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const normalize = (res) => res?.items || res?.data || res || [];

  const getManagerId = () => {
    try {
      const user =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(sessionStorage.getItem("user"));

      return user?.userId || user?.id || 0;
    } catch {
      return 0;
    }
  };

  /* ================= LOAD ================= */
  useEffect(() => {
    if (open) loadData();
  }, [open]);

  const loadData = async () => {
    try {
      const [itemRes, whRes] = await Promise.all([
        getAllReliefItems(),
        getAllWarehouses()
      ]);

      setItems(normalize(itemRes));
      setWarehouses(normalize(whRes));

    } catch {
      message.error("Lỗi tải dữ liệu dropdown");
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        campaignId: Number(campaignId),
        reliefItemId: Number(values.reliefItemId),
        plannedQuantity: Number(values.plannedQuantity),
        approvedQuantity: 0,
        createdByManagerId: getManagerId(),
        warehouseId: Number(values.warehouseId),
      };

      const res = await createSupplyPlan(payload);

      console.log("📥 CREATE RES:", res);

      message.success("Tạo thành công");

      form.resetFields();
      onClose();

      // 🔥 đảm bảo luôn có object
      const newItem =
        res?.data ||
        res?.item ||
        res ||
        payload;

      onSuccess?.(newItem);

    } catch (err) {
      console.error(err);
      message.error("Tạo thất bại");
    }
  };

  /* ================= UI ================= */
  return (
    <Modal
      title="Tạo kế hoạch cấp phát"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleSubmit}
      okText="Tạo"
      cancelText="Hủy"
      destroyOnClose
    >
      <Form form={form} layout="vertical">

        <Form.Item
          name="reliefItemId"
          label="Sản phẩm"
          rules={[{ required: true, message: "Chọn sản phẩm" }]}
        >
          <Select
            placeholder="Chọn sản phẩm"
            options={items.map(item => ({
              value: item.reliefItemId,
              label: `${item.itemName}${item.unit ? ` (${item.unit})` : ""}`,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="warehouseId"
          label="Kho"
          rules={[{ required: true, message: "Chọn kho" }]}
        >
          <Select
            placeholder="Chọn kho"
            options={warehouses.map(w => ({
              value: w.warehouseId,
              label: `${w.warehouseName}${w.areaName ? ` - ${w.areaName}` : ""}`,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="plannedQuantity"
          label="Số lượng dự kiến"
          rules={[{ required: true, message: "Nhập số lượng" }]}
        >
          <InputNumber style={{ width: "100%" }} min={1} max={1000000} />
        </Form.Item>

      </Form>
    </Modal>
  );
}