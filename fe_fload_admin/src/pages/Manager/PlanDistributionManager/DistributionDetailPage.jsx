import { useEffect, useState } from "react";
import { Table, message, Tag, Button } from "antd";
import { useParams, useNavigate } from "react-router-dom";

import {
  getDistributionDetailsByDistribution,
  getBeneficiaryById
} from "../../../../api/axios/ManagerApi/periodicAidApi";

import { getAllAidCampaigns } from "../../../../api/axios/AdminApi/suplyingApi";

import EditDistributionDetail from "../../../components/ManagerComponents/DistributionPlanModal/EditDistributionDetailPlan/EditDistributionDetail";

export default function DistributionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [campaignName, setCampaignName] = useState("");

  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  const normalize = (res) => res?.items || res?.data || res || [];

  /* ================= LOAD ================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      // 🔥 1. lấy distribution details
      const res = await getDistributionDetailsByDistribution(id);
      const data = normalize(res);

      // 🔥 2. lấy campaignId từ data (QUAN TRỌNG)
      const campaignId = data[0]?.campaignId;

      console.log("📌 campaignId từ distribution:", campaignId);

      // 🔥 3. gọi campaign API
      const campaignRes = await getAllAidCampaigns();
      const campaigns = normalize(campaignRes);

      const found = campaigns.find(
        c => c.campaignID == campaignId || c.id == campaignId
      );

      setCampaignName(
        found?.campaignName || `Chiến dịch #${campaignId || id}`
      );

      // 🔥 4. enrich beneficiary
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

    } catch (err) {
      console.error(err);
      message.error("Lỗi tải chi tiết");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  /* ================= RENDER ================= */

  const renderStatus = (status) => {
    const map = {
      accepted: { text: "Đã nhận", color: "blue" },
      rejected: { text: "Từ chối", color: "red" },
      "in progress": { text: "Đang phát", color: "processing" },
      completed: { text: "Hoàn thành", color: "green" },
    };

    const key = status?.toLowerCase();
    const s = map[key] || { text: status, color: "default" };

    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const renderBeneficiaryStatus = (status) => {
    const map = {
      active: { text: "Đang hoạt động", color: "green" },
      inactive: { text: "Không hoạt động", color: "default" },
      pending: { text: "Chờ", color: "gold" },
    };

    const key = status?.toLowerCase();
    const s = map[key] || { text: status, color: "default" };

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
    // {
    //   title: "TT người nhận",
    //   dataIndex: "beneficiaryStatus",
    //   render: renderBeneficiaryStatus,
    // },
    {
      title: "TT phân phối",
      dataIndex: "status",
      render: renderStatus,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
    },
    // {
    //   title: "Hành động",
    //   render: (_, record) => {
    //     const isCompleted = record.status?.toLowerCase() === "completed";

    //     return (
    //       <Button
    //         type="primary"
    //         size="small"
    //         disabled={isCompleted}
    //         style={{
    //           opacity: isCompleted ? 0.5 : 1,
    //           cursor: isCompleted ? "not-allowed" : "pointer",
    //         }}
    //         onClick={() => {
    //           if (isCompleted) return;
    //           setSelected(record);
    //           setOpenEdit(true);
    //         }}
    //       >
    //         Sửa
    //       </Button>
    //     );
    //   },
    // },
  ];

  /* ================= UI ================= */

  return (
    <div style={{ padding: 20 }}>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 16
      }}>
        <Button onClick={() => navigate(-1)}>
          ← Quay lại
        </Button>

        <span style={{ fontWeight: 600 }}>
          Tổng: {list.length} người
        </span>
      </div>

      {/* 🔥 HEADER FIX ĐÚNG */}
      <h2>
        📦 Chi tiết phân phối -{" "}
        <span style={{ color: "#1677ff" }}>
          {campaignName}
        </span>
      </h2>

      <Table
        rowKey="detailId"
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={{
          pageSize: 6,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} người`,
        }}
      />

      <EditDistributionDetail
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        data={selected}
        onSuccess={fetchData}
      />

    </div>
  );
}