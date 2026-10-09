import { Modal, Form, Select, Input, message } from "antd";
import { useEffect, useState } from "react";

import {
  createDistribution,
  getAvailableRescueTeams,
  getAllAidCampaigns
} from "../../../../../api/axios/ManagerApi/periodicAidApi";
import AuthNotify from "../../../../utils/Common/AuthNotify";
export default function CreateDistribution({ open, onClose, onSuccess }) {
  const [form] = Form.useForm();

  const [campaigns, setCampaigns] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= HELPER ================= */

  const normalize = (res) =>
    res?.items || res?.data || res || [];

  /* ================= LOAD ================= */

  useEffect(() => {
    if (open) {
      form.resetFields(); // 🔥 reset form mỗi lần mở
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [campRes, teamRes] = await Promise.all([
        getAllAidCampaigns(),
        getAvailableRescueTeams(),
      ]);

      setCampaigns(normalize(campRes));

      // 🔥 chỉ lấy team available
      const teamData = normalize(teamRes).filter(
        (t) => t.isAvailable
      );

      setTeams(teamData);

    } catch (err) {
      console.error(err);
      AuthNotify.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        campaignId: Number(values.campaignId),
        rescueTeamId: Number(values.rescueTeamId),
        distributedAt: new Date().toISOString(),

        // 🔥 mặc định
        status: "pending",

        note: values.note || "",
      };

      const res = await createDistribution(payload);

      AuthNotify.success("Tạo thành công");

      // 🔥 REMOVE TEAM ĐÃ CHỌN NGAY LẬP TỨC
      setTeams((prev) =>
        prev.filter(
          (t) => t.rescueTeamId !== values.rescueTeamId
        )
      );

      form.resetFields();
      onClose();

      onSuccess?.(res);

    } catch (err) {
      console.error(err);
      AuthNotify.error("Tạo thất bại");
    }
  };

  /* ================= UI ================= */

  return (
    <Modal
      title="Tạo phân phối cứu trợ"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Tạo"
      cancelText="Hủy"
      destroyOnHidden
    >
      <Form form={form} layout="vertical">

        {/* CAMPAIGN */}
        <Form.Item
          name="campaignId"
          label="Chiến dịch"
          rules={[{ required: true, message: "Chọn chiến dịch" }]}
        >
          <Select
            placeholder="Chọn chiến dịch"
            showSearch
            optionFilterProp="label"
            options={campaigns.map((c) => ({
              value: c.campaignId || c.campaignID,
              label: c.campaignName,
            }))}
          />
        </Form.Item>

        {/* TEAM */}
        <Form.Item
          name="rescueTeamId"
          label="Đội cứu trợ"
          rules={[{ required: true, message: "Chọn đội cứu trợ" }]}
        >
          <Select
            placeholder="Chọn đội cứu trợ"
            showSearch
            optionFilterProp="label"
            options={teams.map((t) => ({
              value: t.rescueTeamId,
              label: `${t.teamName} (${t.teamStatus})`,
              disabled: t.activeTaskCount > 0, // 🔥 bonus
            }))}
          />
        </Form.Item>

        {/* NOTE */}
        <Form.Item name="note" label="Ghi chú">
          <Input placeholder="Nhập ghi chú (nếu có)" />
        </Form.Item>

      </Form>
    </Modal>
  );
}