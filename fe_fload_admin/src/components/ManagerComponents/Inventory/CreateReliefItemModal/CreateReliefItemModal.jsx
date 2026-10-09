import { Modal, Form, Input, InputNumber, Button, message } from "antd";
import { useState } from "react";
import { createReliefItem } from "../../../../../api/axios/ManagerApi/inventoryApi";

const CreateReliefItemModal = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const res = await createReliefItem({
        itemName: values.itemName,
        unit: values.unit,
        cost: values.cost || 0,
      });

      message.success("Tạo vật phẩm cứu trợ thành công!");

      form.resetFields();
      onClose();

      if (onSuccess) {
        onSuccess(res);
      }

    } catch (err) {
      console.error(err);
      message.error(err.message || "Tạo vật phẩm thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Tạo vật phẩm cứu trợ mới"
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
          Tạo vật phẩm
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* Tên vật phẩm */}
        <Form.Item
          name="itemName"
          label="Tên vật phẩm"
          rules={[
            { required: true, message: "Vui lòng nhập tên vật phẩm" },
          ]}
        >
          <Input placeholder="Ví dụ: Gạo, Nước uống, Chăn ấm" />
        </Form.Item>

        {/* Đơn vị */}
        <Form.Item
          name="unit"
          label="Đơn vị"
          rules={[
            { required: true, message: "Vui lòng nhập đơn vị" },
          ]}
        >
          <Input placeholder="Ví dụ: kg, lít, chiếc, bộ" />
        </Form.Item>

        {/* Giá tiền */}
        <Form.Item
          name="cost"
          label="Giá tiền (₫)"
          rules={[]}
        >
          <InputNumber
            min={0}
            placeholder="Nhập giá tiền"
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

export default CreateReliefItemModal;
