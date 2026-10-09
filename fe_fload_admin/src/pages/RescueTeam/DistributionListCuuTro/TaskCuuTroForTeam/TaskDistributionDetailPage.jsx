import { useEffect, useState } from "react";
import { Table, message, Tag, Button, Input } from "antd";
import { useParams, useNavigate } from "react-router-dom";

import {
  getDistributionDetailsByDistribution,
  getBeneficiaryById
} from "../../../../../api/axios/ManagerApi/periodicAidApi";

import EditDistributionDetailTask from "./EditDistributionDetailTask";

export default function TaskDistributionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState(""); // 🔥 search state

  /* ================= LOAD ================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await getDistributionDetailsByDistribution(id);
      const data = res?.items || res?.data || res || [];

      const enriched = await Promise.all(
        data.map(async (item) => {
          try {
            const b = await getBeneficiaryById(item.beneficiaryId);

            return {
              ...item,
              fullName: b?.fullName,
              phone: b?.phone,
              address: b?.address,
              householdSize: b?.householdSize,
              targetGroup: b?.targetGroup,
              beneficiaryStatus: b?.status,
              priorityLevel: b?.priorityLevel,
            };
          } catch {
            return { ...item, fullName: "Không rõ" };
          }
        })
      );

      setList(enriched);

    } catch {
      message.error("Lỗi tải chi tiết");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  /* ================= SEARCH ================= */

  const normalize = (str) =>
    str
      ?.toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const filteredList = list.filter(item => {
    const keyword = normalize(search);

    return (
      normalize(item.fullName)?.includes(keyword) ||
      normalize(item.phone)?.includes(keyword)
    );
  });

  /* ================= RENDER ================= */

  const renderStatus = (status) => {
    const map = {
      accepted: { text: "Đã nhận", color: "blue" },
      rejected: { text: "Từ chối", color: "red" },
      "in progress": { text: "Đang phát", color: "processing" },
      completed: { text: "Hoàn thành", color: "green" },
      pending: { text: "Chờ xử lý", color: "orange" },

      "đã nhận": { text: "Đã nhận", color: "blue" },
      "từ chối": { text: "Từ chối", color: "red" },
      "đang phát": { text: "Đang phát", color: "processing" },
      "hoàn thành": { text: "Hoàn thành", color: "green" },
      "chờ xử lý": { text: "Chờ xử lý", color: "orange" },
    };

    const key = String(status || "").trim().toLowerCase();
    const s = map[key] || { text: status || "Không rõ", color: "default" };

    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const renderPriority = (level) => {
    const map = {
      1: { text: "Ưu tiên", color: "red" },
      2: { text: "Trung bình", color: "gold" },
      3: { text: "Thấp", color: "green" },
    };

    const p = map[level] || { text: level };
    return <Tag color={p.color}>{p.text}</Tag>;
  };

  /* ================= TABLE ================= */

  const columns = [
    { title: "ID", dataIndex: "detailId", width: 80 },
    { title: "Người nhận", dataIndex: "fullName" },
    { title: "SĐT", dataIndex: "phone" },
    { title: "Địa chỉ", dataIndex: "address" },
    { title: "Số người", dataIndex: "householdSize" },
    { title: "Nhóm", dataIndex: "targetGroup" },
    {
      title: "Ưu tiên",
      dataIndex: "priorityLevel",
      render: renderPriority,
    },
    {
      title: "TT phân phối",
      dataIndex: "status",
      render: renderStatus,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
    },
    {
      title: "Hành động",
      render: (_, record) => {
        const status = record.status?.toLowerCase();
        const isCompleted =
          status === "completed" || status === "hoàn thành";

        return (
          <Button
            type="primary"
            size="small"
            disabled={isCompleted}
            style={{
              opacity: isCompleted ? 0.5 : 1,
              cursor: isCompleted ? "not-allowed" : "pointer",
            }}
            onClick={() => {
              if (isCompleted) return;

              setSelected(record);
              setOpenEdit(true);
            }}
          >
            Sửa
          </Button>
        );
      },
    },
  ];

  /* ================= UI ================= */

  return (
    <div style={{ padding: 20 }}>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 16,
        gap: 10
      }}>
        <Button onClick={() => navigate(-1)}>
          ← Quay lại
        </Button>

        {/* 🔥 SEARCH */}
        <Input
          placeholder="Tìm tên hoặc SĐT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 300 }}
        />

        <span style={{ fontWeight: 600 }}>
          Tổng: {filteredList.length} người
        </span>
      </div>

      <h2>Chi tiết phân phối #{id}</h2>

      <Table
        rowKey="detailId"
        columns={columns}
        dataSource={filteredList} // 🔥 dùng filtered
        loading={loading}
        pagination={{
          pageSize: 6,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} người`,
        }}
      />

      {/* MODAL */}
      <EditDistributionDetailTask
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        data={selected}
        onSuccess={fetchData}
      />

    </div>
  );
}