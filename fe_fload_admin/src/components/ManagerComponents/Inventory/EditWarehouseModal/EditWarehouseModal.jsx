import { Modal, Form, Input, InputNumber, Button, message } from "antd";
import { useState, useEffect } from "react";
import { updateWarehouse } from "../../../../../api/axios/ManagerApi/inventoryApi";

const EditWarehouseModal = ({ open, onClose, warehouse, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (warehouse && open) {
      form.setFieldsValue({
        warehouseName: warehouse.warehouseName,
        locationDescription: warehouse.locationDescription,
        areaId: warehouse.areaId,
        availableBudget: warehouse.availableBudget,
      });
    }
  }, [warehouse, open, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      await updateWarehouse(warehouse.id, {
        warehouseName: values.warehouseName,
        locationDescription: values.locationDescription,
        areaId: values.areaId || 0,
        availableBudget: values.availableBudget || 0,
      });

      message.success("Cập nhật kho hàng thành công!");

      onClose();

      if (onSuccess) {
        onSuccess();
      }

    } catch (err) {
      console.error(err);
      message.error(err.message || "Cập nhật kho hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Sửa thông tin kho hàng"
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
          Lưu thay đổi
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
          <Input placeholder="Tên kho" />
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
            placeholder="Vị trí kho hàng"
          />
        </Form.Item>

        {/* Area ID */}
        <Form.Item
          name="areaId"
          label="ID Khu vực"
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
          <InputNumber
            min={0}
            style={{ width: "100%" }}
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

export default EditWarehouseModal;
