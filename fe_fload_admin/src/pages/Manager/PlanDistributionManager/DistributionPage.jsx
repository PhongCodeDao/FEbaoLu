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
  Package,
  Users,
  RotateCcw,
  Plus,
  Flame,
  Search,
  ArrowRight,
  Truck,
  Calendar,
  Layers,
  Sparkles,
  MapPin,
  Clock,
} from "lucide-react";
import "./DistributionPage.css";
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
      title: "Mã Đợt",
      dataIndex: "distributionId",
      width: 110,
      render: (id) => (
        <span
          className="dist-id-tag"
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/manager/team-cuu-tro/${id}`)}
          title="Bấm để xem chi tiết đợt phát"
        >
          <Package size={12} />
          <strong>#{id}</strong>
        </span>
      ),
    },
    {
      title: "Chiến Dịch Cứu Trợ",
      render: (_, record) => (
        <span
          className="dist-camp-name"
          style={{ cursor: "pointer", color: "#0284c7" }}
          onClick={() => navigate(`/manager/team-cuu-tro/${record.distributionId}`)}
        >
          {campaignMap[record.campaignId] || `#${record.campaignId}`}
        </span>
      ),
    },
    {
      title: "Đội Cứu Trợ Phụ Trách",
      render: (_, record) => (
        <span className="dist-team-tag">
          <Truck size={13} style={{ color: "#0284c7" }} />
          <span>{teamMap[record.rescueTeamId] || `Đội #${record.rescueTeamId}`}</span>
        </span>
      ),
    },
    {
      title: "Thời Gian",
      dataIndex: "distributedAt",
      render: (d) =>
        d ? (
          <span className="dist-time-cell">
            {new Date(d).toLocaleString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      width: 140,
      render: renderStatus,
    },
    {
      title: "Ghi Chú",
      dataIndex: "note",
      render: (t) => t || <span style={{ color: "#94a3b8" }}>Không có ghi chú</span>,
    },
    {
      title: "Thao Tác",
      width: 160,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            size="small"
            className="btn-table-edit"
            onClick={() => {
              setSelected(record);
              setOpenEdit(true);
            }}
          >
            Chỉnh sửa
          </Button>

          <Popconfirm
            title="Xác nhận xóa đợt phân phối này?"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger className="btn-table-del">
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const distStats = useMemo(() => {
    return {
      total: list.length,
      inProgress: list.filter((d) => (d.status || "").toLowerCase() === "in progress").length,
      completed: list.filter((d) => (d.status || "").toLowerCase() === "completed").length,
      pending: list.filter((d) => (d.status || "").toLowerCase() === "pending").length,
    };
  }, [list]);

  /* ================= UI ================= */

  return (
    <div className="distributionPage">
      {/* 1. HERO OPERATIONAL BANNER */}
      <section className="distNav__hero">
        <div className="distNav__hero-glow distNav__hero-glow--1" />
        <div className="distNav__hero-glow distNav__hero-glow--2" />

        <div className="distNav__hero-inner">
          <div className="distNav__info">
            <div className="dist-badge-icon">
              <Package size={34} />
              <span className="live-pulse-dot" title="Phân phối cứu trợ trực chiến 24/7" />
            </div>

            <div className="dist-text-group">
              <div className="dist-status-row">
                <span className="operational-badge">
                  <span className="pulse-point" /> ĐIỀU PHỐI CỨU TRỢ TIỀN TUYẾN
                </span>
                <span className="team-code-badge">
                  <Flame size={12} /> {distStats.total} ĐỢT PHÂN PHỐI ĐÃ LẬP
                </span>
              </div>

              <h1 className="hero-main-title">
                Kế Hoạch & Các Đợt Phân Phối Cứu Trợ
              </h1>

              <div className="hero-sub-meta">
                <span className="meta-pill">
                  Đang phát hàng: <strong>{distStats.inProgress} đợt</strong>
                </span>
                <span className="meta-separator">•</span>
                <span className="meta-pill">
                  Đã hoàn thành: <strong>{distStats.completed} đợt</strong>
                </span>
                <span className="meta-separator">•</span>
                <span className="meta-pill">
                  Đang chờ duyệt: <strong>{distStats.pending} đợt</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="distNav__hero-actions">
            <Button
              type="primary"
              className="btn-create-dist"
              icon={<Plus size={16} />}
              onClick={() => setOpenCreate(true)}
            >
              Tạo đợt phân phối
            </Button>

            <button
              className="btn-hero-refresh"
              onClick={() => fetchAll()}
              title="Làm mới danh sách"
            >
              <RotateCcw size={15} />
              <span>Đồng bộ</span>
            </button>
          </div>
        </div>

        {/* SUMMARY STATS BAR */}
        <div className="distNav__stat-strip">
          <div className="stat-strip-box">
            <span className="stat-strip-title">Tổng đợt phân phối</span>
            <span className="stat-strip-value text-cyan">{distStats.total} đợt</span>
          </div>
          <div className="stat-strip-box">
            <span className="stat-strip-title">Đang phát thực tế</span>
            <span className="stat-strip-value text-purple">{distStats.inProgress} đợt</span>
          </div>
          <div className="stat-strip-box">
            <span className="stat-strip-title">Hoàn thành phát quà</span>
            <span className="stat-strip-value text-green">{distStats.completed} đợt</span>
          </div>
          <div className="stat-strip-box">
            <span className="stat-strip-title">Đang chờ triển khai</span>
            <span className="stat-strip-value text-amber">{distStats.pending} đợt</span>
          </div>
        </div>
      </section>

      {/* 2. TOOLBAR FILTERS */}
      <section className="distNav__toolbar">
        <div className="toolbar-search-wrap">
          <Search size={18} className="search-icon-left" />
          <input
            type="text"
            className="modern-search-input"
            placeholder="Tìm theo ID đợt phát, ghi chú..."
            value={planQuery}
            onChange={(e) => setPlanQuery(e.target.value)}
          />
          {planQuery && (
            <button className="btn-clear-query" onClick={() => setPlanQuery("")}>
              ×
            </button>
          )}
        </div>

        <div className="toolbar-filters-row">
          <Select
            allowClear
            placeholder="Theo chiến dịch"
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
            placeholder="Đội cứu trợ phụ trách"
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
            style={{ width: 170 }}
            options={[
              { value: "pending", label: "Đang chờ" },
              { value: "accepted", label: "Đã nhận" },
              { value: "in progress", label: "Đang phát" },
              { value: "completed", label: "Hoàn thành" },
              { value: "rejected", label: "Từ chối" },
            ]}
          />

          {(planQuery || campaignFilterId || teamFilterId || statusFilter) && (
            <button
              className="btn-filter-reset"
              onClick={() => {
                setPlanQuery("");
                setCampaignFilterId(null);
                setTeamFilterId(null);
                setStatusFilter(null);
              }}
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </section>

      {/* 3. TABLE */}
      <section className="distNav__table-container">
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
            showTotal: (t) => `Tổng cộng ${t} đợt phân phối`,
          }}
        />
      </section>

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