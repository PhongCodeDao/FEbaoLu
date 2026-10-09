import { useEffect, useState, useMemo } from "react";
import {
  Table,
  Button,
  Popconfirm,
  message,
  Tag,
  Spin,
  Empty,
  Modal,
  Input,
  Select,
  Space
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  getAllDistributions,
  deleteDistribution,
  getAllRescueTeams,
  getAllAidCampaigns,
  getDistributionDetailsByDistribution,
  getBeneficiaryById,
  getAllReliefItems
} from "../../../../api/axios/ManagerApi/periodicAidApi";
import { deletePeriodicAidDistributionDetail } from "../../../../api/axios/RescueApi/RescueTask";
import AuthNotify from "../../../utils/Common/AuthNotify";
import CreateDistribution from "../../../components/ManagerComponents/DistributionPlanModal/CreateDistribuionPlan/CreateDistribution";
import EditDistribution from "../../../components/ManagerComponents/DistributionPlanModal/EditDistribuitonPlan/EditDistribution";
import EditDistributionDetail from "../../../components/ManagerComponents/DistributionPlanModal/EditDistributionDetailPlan/EditDistributionDetail";
import AddDistributionDetail from "../../../components/ManagerComponents/DistributionPlanModal/AddDistributionDetail/AddDistributionDetail";

export default function DistributionPage() {
  const [list, setList] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [teams, setTeams] = useState([]);

  const [loading, setLoading] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState({});
  const [expandedLoading, setExpandedLoading] = useState({});

  // ================= FILTER =================
  const [planQuery, setPlanQuery] = useState("");
  const [campaignFilterId, setCampaignFilterId] = useState(null);
  const [teamFilterId, setTeamFilterId] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openEditDetail, setOpenEditDetail] = useState(false);
  const [openAddDetail, setOpenAddDetail] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedDistributionForAdd, setSelectedDistributionForAdd] = useState(null);
  const [reliefItems, setReliefItems] = useState([]);
  const navigate = useNavigate();
  /* ================= HELPER ================= */

  const normalize = (res) =>
    res?.items || res?.data || res || [];

  /* ================= LOAD RELIEF ITEMS ================= */

  const loadReliefItems = async () => {
    try {
      const res = await getAllReliefItems();
      setReliefItems(normalize(res));
    } catch (err) {
      console.error("Load relief items error:", err);
    }
  };

  /* ================= LOAD EXPANDED DETAILS ================= */

  const loadExpandedDetails = async (distributionId) => {
    try {
      setExpandedLoading(prev => ({ ...prev, [distributionId]: true }));

      const detailsRes = await getDistributionDetailsByDistribution(distributionId);
      const details = normalize(detailsRes);

      // 🔥 enrich each detail with beneficiary info
      const enriched = await Promise.all(
        details.map(async (detail) => {
          try {
            const beneficiary = await getBeneficiaryById(detail.beneficiaryId);
            return {
              ...detail,
              fullName: beneficiary?.fullName || "—",
              phone: beneficiary?.phone,
              address: beneficiary?.address,
              householdSize: beneficiary?.householdSize,
            };
          } catch {
            return { ...detail, fullName: "—" };
          }
        })
      );

      setExpandedDetails(prev => ({
        ...prev,
        [distributionId]: enriched
      }));

    } catch (err) {
      console.error("Load details error:", err);
      message.error("Lỗi tải chi tiết người nhận");
    } finally {
      setExpandedLoading(prev => ({ ...prev, [distributionId]: false }));
    }
  };

  /* ================= RELIEF ITEMS MAP ================= */

  const reliefItemMap = useMemo(() => {
    const map = {};
    reliefItems.forEach(item => {
      // API có thể trả về key khác nhau cho id vật phẩm
      const id = item.itemId ?? item.reliefItemId ?? item.reliefItemID ?? item.relief_item_id;
      if (id == null) return;
      map[String(id)] = item.itemName;
    });
    return map;
  }, [reliefItems]);

  /* ================= LOAD ================= */

  const fetchAll = async () => {
    try {
      setLoading(true);
  
      const [distRes, campRes, teamRes] = await Promise.all([
        getAllDistributions(),
        getAllAidCampaigns(),
        getAllRescueTeams(),
      ]);
  
      const data = normalize(distRes);
  
      // 🔥 FIX QUAN TRỌNG: sort mới nhất lên đầu
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.distributedAt) - new Date(a.distributedAt)
      );
  
      setList(sorted);
      setCampaigns(normalize(campRes));
      setTeams(normalize(teamRes));

      // 🔥 load relief items
      await loadReliefItems();
  
    } catch (err) {
      console.error(err);
      message.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* ================= DELETE ================= */

  const handleDelete = async (record) => {
    try {
      await deleteDistribution(record.distributionId);

      setList(prev =>
        prev.filter(x => x.distributionId !== record.distributionId)
      );

      AuthNotify.success("Đã xóa");
    } catch {
      AuthNotify.error("Xóa thất bại");
    }
  };

  /* ================= MAP ================= */

  const campaignMap = useMemo(() => {
    const map = {};
    campaigns.forEach(c => {
      const id = c.campaignId || c.campaignID;
      map[id] = c.campaignName;
    });
    return map;
  }, [campaigns]);

  const teamMap = useMemo(() => {
    const map = {};
    teams.forEach(t => {
      map[t.rcid] = t.rcName;
    });
    return map;
  }, [teams]);

  const filteredList = useMemo(() => {
    const q = planQuery.trim().toLowerCase();
    return list.filter((r) => {
      const matchesQuery =
        !q ||
        String(r.distributionId ?? "")
          .toLowerCase()
          .includes(q) ||
        String(r.note ?? "").toLowerCase().includes(q);

      const matchesCampaign =
        campaignFilterId == null ||
        String(r.campaignId ?? r.campaignID) === String(campaignFilterId);

      const matchesTeam =
        teamFilterId == null || String(r.rescueTeamId) === String(teamFilterId);

      const matchesStatus =
        statusFilter == null ||
        String(r.status ?? "").toLowerCase().trim() ===
          String(statusFilter).toLowerCase().trim();

      return matchesQuery && matchesCampaign && matchesTeam && matchesStatus;
    });
  }, [list, planQuery, campaignFilterId, teamFilterId, statusFilter]);

  /* ================= STATUS ================= */

  const renderStatus = (status) => {
    const map = {
      pending: { text: "Đang chờ", color: "gold" },
      accepted: { text: "Đã nhận", color: "blue" },
      "in progress": { text: "Đang phát", color: "processing" },
      completed: { text: "Hoàn thành", color: "green" },
      rejected: { text: "Từ chối", color: "red" },
    };

    const key = status?.toLowerCase()?.trim();
    const s = map[key] || { text: status, color: "default" };

    return <Tag color={s.color}>{s.text}</Tag>;
  };

  /* ================= EXPANDED ROW RENDER ================= */

  const expandedRowRender = (record) => {
    const details = expandedDetails[record.distributionId] || [];
    const isLoading = expandedLoading[record.distributionId];

    if (isLoading) {
      return <div style={{ padding: 12 }}><Spin size="small" /> Đang tải...</div>;
    }

    if (!details || details.length === 0) {
      return (
        <div style={{ padding: "12px 16px" }}>
          <Empty description="Không có người nhận" style={{ marginBottom: 16 }} />

          <Button
            type="primary"
            onClick={() => {
              setSelectedDistributionForAdd(record);
              setOpenAddDetail(true);
            }}
          >
            + Thêm người nhận
          </Button>
        </div>
      );
    }

    const detailColumns = [
      {
        title: "ID",
        dataIndex: "detailId",
        width: 70,
      },
      {
        title: "Người nhận",
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
        title: "Vật phẩm",
        dataIndex: "reliefItemId",
        render: (_, row) => {
          const rawId =
            row?.reliefItemId ?? row?.reliefItemID ?? row?.relief_item_id ?? row?.reliefItemID;
          if (rawId == null) return "—";
          const key = String(rawId);
          return reliefItemMap[key] || "—";
        },
      },
      {
        title: "Số lượng",
        dataIndex: "distributedQuantity",
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        render: renderStatus,
      },
      {
        title: "Ghi chú",
        dataIndex: "note",
        ellipsis: true,
      },
      {
        title: "Hành động",
        width: 160,
        render: (_, detail) => (
          <Space size="small">
            <Button
              size="small"
              onClick={() => {
                setSelectedDetail(detail);
                setOpenEditDetail(true);
              }}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Xóa người nhận khỏi đợt này?"
              onConfirm={async () => {
                try {
                  const id = detail.detailId || detail.id;
                  if (!id) {
                    AuthNotify.error("Không xác định được ID chi tiết");
                    return;
                  }
                  await deletePeriodicAidDistributionDetail(id);
                  AuthNotify.success("Đã xóa khỏi đợt phân phối");
                  // reload details for this distribution
                  loadExpandedDetails(record.distributionId);
                } catch (err) {
                  console.error(err);
                  AuthNotify.error("Xóa thất bại");
                }
              }}
            >
              <Button size="small" danger>
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ];

    return (
      <div style={{ padding: "12px 16px" }}>
        <Table
          rowKey="detailId"
          columns={detailColumns}
          dataSource={details}
          pagination={false}
          size="small"
          style={{ marginBottom: 16 }}
        />

        <Button type="primary" onClick={() => {
          setSelectedDistributionForAdd(record);
          setOpenAddDetail(true);
        }}>
          + Thêm người nhận
        </Button>
      </div>
    );
  };

  /* ================= TABLE ================= */

  const columns = [
    {
      title: "ID",
      dataIndex: "distributionId",
      width: 80,
      render: (id) => (
        <span
          style={{ color: "#1677ff", cursor: "pointer" }}
          onClick={() => navigate(`/manager/team-cuu-tro/${id}`)}
        >
          #{id}
        </span>
      ),
    },
    {
      title: "Chiến dịch",
      render: (_, record) =>
        campaignMap[record.campaignId] || `#${record.campaignId}`,
    },
    {
      title: "Đội cứu trợ",
      render: (_, record) =>
        teamMap[record.rescueTeamId] || `#${record.rescueTeamId}`,
    },
    {
      title: "Thời gian",
      dataIndex: "distributedAt",
      render: (d) =>
        d ? new Date(d).toLocaleString("vi-VN") : "—",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: renderStatus,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
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
    <div style={{ padding: 20 }}>

      <div style={{
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap"
      }}>
        <h2 style={{ margin: 0 }}>Phân phối cứu trợ ({filteredList.length})</h2>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Input
            allowClear
            placeholder="Tìm theo ID / ghi chú"
            value={planQuery}
            onChange={(e) => setPlanQuery(e.target.value)}
            style={{ width: 260 }}
          />

          <Select
            allowClear
            placeholder="Chiến dịch"
            value={campaignFilterId}
            onChange={setCampaignFilterId}
            style={{ width: 220 }}
            options={campaigns.map((c) => ({
              value: c.campaignId || c.campaignID,
              label: c.campaignName,
            }))}
            optionFilterProp="label"
            showSearch
          />

          <Select
            allowClear
            placeholder="Đội cứu trợ"
            value={teamFilterId}
            onChange={setTeamFilterId}
            style={{ width: 200 }}
            options={teams.map((t) => ({
              value: t.rcid,
              label: t.rcName,
            }))}
            optionFilterProp="label"
            showSearch
          />

          <Select
            allowClear
            placeholder="Trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 180 }}
            options={[
              { value: "pending", label: "Đang chờ" },
              { value: "accepted", label: "Đã nhận" },
              { value: "in progress", label: "Đang phát" },
              { value: "completed", label: "Hoàn thành" },
              { value: "rejected", label: "Từ chối" },
            ]}
          />

          <Button
            onClick={() => {
              setPlanQuery("");
              setCampaignFilterId(null);
              setTeamFilterId(null);
              setStatusFilter(null);
            }}
          >
            Xóa filter
          </Button>

          <Button type="primary" onClick={() => setOpenCreate(true)}>
            + Tạo
          </Button>
        </div>
      </div>

      <Table
        rowKey="distributionId"
        columns={columns}
        dataSource={filteredList}
        loading={loading}
        expandable={{
          expandedRowRender,
          onExpand: (expanded, record) => {
            if (expanded && !expandedDetails[record.distributionId]) {
              loadExpandedDetails(record.distributionId);
            }
          },
        }}
        pagination={{
          pageSize: 6,
          showSizeChanger: true,
          showTotal: (t) => `Tổng ${t}`,
        }}
      />

      <CreateDistribution
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={fetchAll}
      />

      <EditDistribution
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        data={selected}
        onSuccess={fetchAll}
      />

      <EditDistributionDetail
        open={openEditDetail}
        onClose={() => setOpenEditDetail(false)}
        data={selectedDetail}
        onSuccess={() => {
          setOpenEditDetail(false);
          if (selectedDetail?.distributionId) {
            loadExpandedDetails(selectedDetail.distributionId);
          }
        }}
      />

      <AddDistributionDetail
        open={openAddDetail}
        onClose={() => {
          setOpenAddDetail(false);
          setSelectedDistributionForAdd(null);
        }}
        distributionId={selectedDistributionForAdd?.distributionId}
        campaignId={selectedDistributionForAdd?.campaignId}
        onSuccess={() => {
          if (selectedDistributionForAdd?.distributionId) {
            loadExpandedDetails(selectedDistributionForAdd.distributionId);
          }
        }}
      />

    </div>
  );
}