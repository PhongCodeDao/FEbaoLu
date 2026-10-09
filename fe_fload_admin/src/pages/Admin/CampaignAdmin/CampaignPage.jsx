import { useEffect, useState } from "react";
import {
  Button,
  Popconfirm,
  Table,
  Tag
} from "antd";

import {
  getAllAidCampaigns,
  deleteAidCampaign
} from "../../../../api/axios/AdminApi/suplyingApi";

import AuthNotify from "../../../utils/Common/AuthNotify";
import CreateCampaign from "../../../components/AdminComponents/AidSupplyCamping/CreateCamping/CreateCampaign";
import EditCampaign from "../../../components/AdminComponents/AidSupplyCamping/EditCamping/EditCampaign";
import { useNavigate } from "react-router-dom";

import "./CampaignPage.css";

export default function CampaignPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const navigate = useNavigate();

  /* ================= LOAD ================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await getAllAidCampaigns();

      const data =
        res?.items ||
        res?.data ||
        res ||
        [];

      setList(data);

    } catch {
      AuthNotify.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    try {
      await deleteAidCampaign(id);

      setList(prev =>
        prev.filter(x => x.campaignID !== id)
      );

      AuthNotify.success("Đã xóa");
    } catch {
      AuthNotify.error("Xóa thất bại");
    }
  };

  /* ================= STATUS ================= */

  const renderStatus = (status) => {
    const map = {
      // 🔥 REQUEST / TASK STATUS
      accepted: { text: "Đã nhận", color: "blue" },
      rejected: { text: "Từ chối", color: "red" },
      "in progress": { text: "Đang thực hiện", color: "processing" },
      completed: { text: "Hoàn thành", color: "green" },
  
      // 🔥 fallback thêm (nếu API khác)
      pending: { text: "Đang chờ", color: "gold" },
      active: { text: "Đang hoạt động", color: "blue" },
      ready: { text: "Sẵn sàng", color: "green" },
  
      // 🔥 nếu API trả tiếng Việt
      "đã nhận": { text: "Đã nhận", color: "blue" },
      "từ chối": { text: "Từ chối", color: "red" },
      "đang thực hiện": { text: "Đang thực hiện", color: "processing" },
      "hoàn thành": { text: "Hoàn thành", color: "green" },
    };
  
    // 🔥 normalize chống lỗi API
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
      title: "ID",
      dataIndex: "campaignID",
      width: 80,
    },
    {
      title: "Tên chiến dịch",
      dataIndex: "campaignName",
      render: (text, record) => (
        <span
          className="link"
          onClick={() =>
            navigate(`/admin/chien-dich-cuu-tro/${record.campaignID}`)
          }
        >
          {text}
        </span>
      ),
    },
   
    {
      title: "Thời gian",
      render: (_, record) =>
        `Tháng ${record.month}/${record.year}`,
    },
    {
      title: "Người tạo",
      dataIndex: "adminName",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (date) =>
        new Date(date).toLocaleString("vi-VN"),
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
            onClick={(e) => {
              e.stopPropagation();
              setSelected(record);
              setOpenEdit(true);
            }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xóa chiến dịch?"
            onConfirm={() => handleDelete(record.campaignID)}
          >
            <Button
              danger
              onClick={(e) => e.stopPropagation()}
            >
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  /* ================= UI ================= */

  return (
    <div className="campaign-page">

      {/* HEADER */}
      <div className="campaign-header">

        <div className="left">
          <h2>Quản lý chiến dịch</h2>

          {/* 🔥 COUNT */}
          <span className="count">
            {list.length} chiến dịch
          </span>
        </div>

        <Button type="primary" onClick={() => setOpenCreate(true)}>
          + Tạo chiến dịch
        </Button>

      </div>

      {/* TABLE */}
      <Table
        rowKey="campaignID"
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={{
          pageSize: 6,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} chiến dịch`,
        }}
      />

      {/* CREATE */}
      <CreateCampaign
  open={openCreate}
  onClose={() => setOpenCreate(false)}
  onSuccess={(newItem) => {
    if (!newItem) {
      fetchData(); // fallback
      return;
    }

    // 🔥 đưa item mới lên đầu
    setList(prev => [newItem, ...prev]);
  }}
/>

      {/* EDIT */}
      <EditCampaign
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        data={selected}
        onSuccess={fetchData}
      />

    </div>
  );
}