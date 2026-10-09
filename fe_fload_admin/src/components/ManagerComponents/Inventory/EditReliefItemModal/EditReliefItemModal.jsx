import { Modal, Form, Input, InputNumber, Button, message } from "antd";
import { useState, useEffect } from "react";
import { updateReliefItem } from "../../../../../api/axios/ManagerApi/inventoryApi";

const EditReliefItemModal = ({ open, onClose, item, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item && open) {
      form.setFieldsValue({
        itemName: item.itemName,
        unit: item.unit,
        cost: item.cost,
      });
    }
  }, [item, open, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      await updateReliefItem(item.id || item.reliefItemId, {
        itemName: values.itemName,
        unit: values.unit,
        cost: values.cost || 0,
      });

      message.success("Cập nhật vật phẩm thành công!");

      onClose();

      if (onSuccess) {
        onSuccess();
      }

    } catch (err) {
      console.error(err);
      message.error(err.message || "Cập nhật vật phẩm thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Sửa thông tin vật phẩm"
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
        {/* Tên vật phẩm */}
        <Form.Item
          name="itemName"
          label="Tên vật phẩm"
          rules={[
            { required: true, message: "Vui lòng nhập tên vật phẩm" },
          ]}
        >
          <Input placeholder="Tên vật phẩm" />
        </Form.Item>

        {/* Đơn vị */}
        <Form.Item
          name="unit"
          label="Đơn vị"
          rules={[
            { required: true, message: "Vui lòng nhập đơn vị" },
          ]}
        >
          <Input placeholder="Đơn vị" />
        </Form.Item>

        {/* Giá tiền */}
        <Form.Item
          name="cost"
          label="Giá tiền (₫)"
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

export default EditReliefItemModal;
