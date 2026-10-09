import { Modal, Form, Input, InputNumber, Button, Select, Space } from "antd";
import { useState, useEffect } from "react";

import {
  createInventoryTransaction,
  getAllWarehouses,
  getAllReliefItems,
} from "../../../../api/axios/ManagerApi/inventoryApi";

import AuthNotify from "../../../utils/Common/AuthNotify";

export default function CreateTransactionModal({ open, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);

  /* ================= NORMALIZE ================= */
  const normalize = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.items)) return res.items;
    return [];
  };

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const [whRes, itemRes] = await Promise.all([
        getAllWarehouses(),
        getAllReliefItems(),
      ]);

      const wh = normalize(whRes);
      const it = normalize(itemRes);

      console.log("🏬 Warehouses:", wh);
      console.log("📦 Items:", it);

      if (!Array.isArray(it) || it.length === 0) {
        console.warn("No items received from API");
      }

      setWarehouses(wh);
      setItems(it);
    } catch (err) {
      console.error("Error fetching data:", err);
      AuthNotify.error("Load dữ liệu thất bại");
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const rawLines = Array.isArray(values.lines) ? values.lines : [];
      if (rawLines.length === 0) {
        AuthNotify.error("Vui lòng thêm ít nhất 1 hàng hóa");
        setLoading(false);
        return;
      }

      const lines = rawLines
        .filter((l) => l && l.reliefItemId != null && l.quantity != null)
        .map((l) => ({
          reliefItemId: Number(l.reliefItemId),
          quantity: Number(l.quantity),
        }))
        .filter((l) => Number.isFinite(l.reliefItemId) && l.reliefItemId > 0 && Number.isFinite(l.quantity) && l.quantity > 0);

      if (lines.length === 0) {
        AuthNotify.error("Dữ liệu hàng hóa không hợp lệ");
        setLoading(false);
        return;
      }

      const payload = {
        warehouseId: Number(values.warehouseId),
        transactionType: values.transactionType,
        note: values.note,
        lines,
      };

      console.log("🚀 PAYLOAD:", payload);

      await createInventoryTransaction(payload);

      AuthNotify.success("Tạo giao dịch thành công");

      onSuccess?.();
      onClose();
      form.resetFields();
    } catch (err) {
      console.error(err);

      const msg =
        err?.response?.data?.message || "Tạo thất bại";

      AuthNotify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <Modal
      open={open}
      title="Tạo giao dịch"
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ lines: [{}] }}
      >

        {/* WAREHOUSE */}
        <Form.Item
          name="warehouseId"
          label="Kho"
          rules={[{ required: true, message: "Chọn kho" }]}
        >
          <Select
            placeholder="Chọn kho"
            showSearch
            optionFilterProp="label"
            options={warehouses.map((w) => ({
              label: w.warehouseName,
              value: w.warehouseId,
            }))}
          />
        </Form.Item>

        {/* TYPE */}
        <Form.Item
          name="transactionType"
          label="Loại giao dịch"
          rules={[{ required: true, message: "Chọn loại giao dịch" }]}
        >
          <Select
            placeholder="Chọn loại"
            options={[
              { label: "Nhập", value: "IN" },
              { label: "Xuất", value: "OUT" },
            ]}
          />
        </Form.Item>

        {/* DANH SÁCH HÀNG HÓA */}
        <Form.List name="lines">
          {(fields, { add, remove }) => (
            <div
              style={{
                border: "1px solid #f0f0f0",
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontWeight: 500 }}>Danh sách hàng hóa</span>
                <Button type="dashed" size="small" onClick={() => add()}>
                  + Thêm hàng hóa
                </Button>
              </div>

              {fields.length === 0 && (
                <div style={{ color: "#999", fontStyle: "italic" }}>
                  Chưa có hàng hóa nào, bấm "Thêm hàng hóa" để bắt đầu.
                </div>
              )}

              {fields.map((field, index) => (
                <Space
                  key={field.key || index} // Ensure unique keys
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...field}
                    name={[field.name, "reliefItemId"]}
                    fieldKey={[field.fieldKey, "reliefItemId"]}
                    label={index === 0 ? "Hàng hóa" : ""}
                    rules={[{ required: true, message: "Chọn hàng hóa" }]}
                  >
                    <Select
                      placeholder="Chọn hàng hóa"
                      showSearch
                      optionFilterProp="label"
                      style={{ width: 260 }}
                      options={items.map((i) => {
                        const value =
                          i?.reliefItemId ?? i?.id ?? i?.itemId;
                        const labelName =
                          i?.itemName ?? i?.name ?? i?.reliefItemName ?? `Vật phẩm #${value}`;
                        return {
                          label: `${labelName}${i.unit ? ` (${i.unit})` : ""}`,
                          value,
                        };
                      })}
                    />
                  </Form.Item>

                  <Form.Item
                    {...field}
                    name={[field.name, "quantity"]}
                    fieldKey={[field.fieldKey, "quantity"]}
                    label={index === 0 ? "Số lượng" : ""}
                    rules={[{ required: true, message: "Nhập số lượng" }]}
                  >
                    <InputNumber
                      min={1}
                      max={1000000}
                      style={{ width: 140 }}
                    />
                  </Form.Item>

                  {fields.length > 1 && (
                    <Button
                      danger
                      type="link"
                      onClick={() => remove(field.name)}
                    >
                      Xóa
                    </Button>
                  )}
                </Space>
              ))}
            </div>
          )}
        </Form.List>

        {/* NOTE */}
        <Form.Item name="note" label="Ghi chú">
          <Input placeholder="Nhập ghi chú..." />
        </Form.Item>

        <Button
          htmlType="submit"
          type="primary"
          loading={loading}
          block
        >
          Tạo giao dịch
        </Button>

      </Form>
    </Modal>
  );
}