import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Popconfirm,
  message,
  Tag
} from "antd";
import { useParams, useNavigate } from "react-router-dom";

import {
  getBeneficiariesByCampaign,
  deleteBeneficiary
} from "../../../../../api/axios/AdminApi/suplyingApi";

import { getAllAidCampaigns } from "../../../../../api/axios/AdminApi/suplyingApi";

import CreateBeneficiary from "../../../../components/AdminComponents/AidSupplyCamping/CreateBenefitSuply/CreateBeneficiary";
import EditBeneficiary from "../../../../components/AdminComponents/AidSupplyCamping/EditBenefitSuply/EditBeneficiary";

import "./BeneficiaryPage.css";

export default function BeneficiaryPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [campaignName, setCampaignName] = useState(""); // 🔥 thêm

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const normalize = (res) => res?.items || res?.data || res || [];

  /* ================= LOAD ================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      const [res, campaignRes] = await Promise.all([
        getBeneficiariesByCampaign(id),
        getAllAidCampaigns() // 🔥 lấy campaign
      ]);

      const data = normalize(res);
      const campaigns = normalize(campaignRes);

      setList(data);

      // 🔥 tìm campaign name
      const found = campaigns.find(
        c => c.campaignID == id || c.id == id
      );

      setCampaignName(
        found?.campaignName || `Chiến dịch #${id}`
      );

    } catch (err) {
      console.error(err);
      message.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  /* ================= DELETE ================= */

  const handleDelete = async (record) => {
    try {
      const bid = record.id || record.beneficiaryId;

      await deleteBeneficiary(bid);

      setList(prev =>
        prev.filter(x => (x.id || x.beneficiaryId) !== bid)
      );

      message.success("Đã xóa");

    } catch {
      message.error("Xóa thất bại");
    }
  };

  /* ================= STATUS ================= */

  const renderStatus = (status) => {
    const map = {
      accepted: { text: "Đã nhận", color: "blue" },
      rejected: { text: "Từ chối", color: "red" },
      "in progress": { text: "Đang thực hiện", color: "processing" },
      completed: { text: "Hoàn thành", color: "green" },
      pending: { text: "Đang chờ", color: "gold" },
      active: { text: "Đang hoạt động", color: "blue" },
      ready: { text: "Sẵn sàng", color: "green" },
    };

    const key = status?.toLowerCase()?.trim();

    const s = map[key] || {
      text: status || "Không rõ",
      color: "default",
    };

    return <Tag color={s.color}>{s.text}</Tag>;
  };

  /* ================= TABLE ================= */

  const columns = [
    {
      title: "Tên",
      dataIndex: "fullName",
    },
    {
      title: "SĐT",
      dataIndex: "phone",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
    },
    {
      title: "Số người",
      dataIndex: "householdSize",
    },
    {
      title: "Nhóm",
      dataIndex: "targetGroup",
    },
    {
      title: "Ưu tiên",
      dataIndex: "priorityLevel",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: renderStatus,
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <div
          style={{ display: "flex", gap: 8 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            onClick={() => {
              setSelected(record);
              setOpenEdit(true);
            }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xóa?"
            onConfirm={() => handleDelete(record)}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  /* ================= UI ================= */

  return (
    <div className="beneficiary-page">

      {/* HEADER */}
      <div className="header">

        <div className="left">

          <Button
            className="btn-back"
            onClick={() => navigate(-1)}
          >
            ← Quay lại
          </Button>

          <div>
            {/* 🔥 TITLE FIX */}
            <h2>
              📦 Danh sách người nhận -{" "}
              <span style={{ color: "#1677ff" }}>
                {campaignName}
              </span>
            </h2>

            <span className="count">
              {list.length} người
            </span>
          </div>

        </div>

        <Button type="primary" onClick={() => setOpenCreate(true)}>
          + Thêm
        </Button>

      </div>

      {/* TABLE */}
      <Table
        rowKey={(r) => r.id || r.beneficiaryId}
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={{
          pageSize: 6,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} người`,
        }}
      />

      {/* CREATE */}
      <CreateBeneficiary
  open={openCreate}
  onClose={() => setOpenCreate(false)}
  campaignId={id}
  onSuccess={(newItem) => {
    setList(prev => [newItem, ...prev]); // 🔥 lên đầu
  }}
/>

      {/* EDIT */}
      <EditBeneficiary
  open={openEdit}
  onClose={() => setOpenEdit(false)}
  data={selected}
  onSuccess={(updatedItem) => {
    setList(prev => [
      updatedItem, // 🔥 đưa lên đầu
      ...prev.filter(
        x =>
          (x.id || x.beneficiaryId) !==
          (updatedItem.id || updatedItem.beneficiaryId)
      ),
    ]);
  }}
/>

    </div>
  );
}