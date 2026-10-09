import { useEffect, useMemo, useState } from "react";
import { Table, Button, Popconfirm, message, Input, Select, InputNumber, Space } from "antd";

import {
  getSupplyPlansByCampaign,
  deleteSupplyPlan,
  getAllReliefItems,
  getAllWarehouses // ✅ dùng luôn
} from "../../../../../api/axios/ManagerApi/periodicAidApi";

import { getAllAidCampaigns } from "../../../../../api/axios/AdminApi/suplyingApi";
import { getAllUser } from "../../../../../api/axios/AdminApi/userApi";

import CreateSupplyPlan from "../../../../components/ManagerComponents/AidSuplyManager/CreateYTableSuplan/CreateSupplyPlan";
import EditSupplyPlan from "../../../../components/ManagerComponents/AidSuplyManager/EditTableSuplylan/EditSupplyPlan";
import AuthNotify from "../../../../utils/Common/AuthNotify";
import { useParams } from "react-router-dom";

import "./SupplyPlanPage.css";

export default function SupplyPlanPage() {
  const { id } = useParams();

  const [list, setList] = useState([]);
  const [reliefItems, setReliefItems] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [warehouses, setWarehouses] = useState([]); // ✅ thêm
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState(null);

  // ================= FILTER =================
  const [planQuery, setPlanQuery] = useState("");
  const [warehouseFilterId, setWarehouseFilterId] = useState(null);
  const [itemFilterId, setItemFilterId] = useState(null);
  const [plannedMin, setPlannedMin] = useState(null);
  const [plannedMax, setPlannedMax] = useState(null);
  const [approvedMin, setApprovedMin] = useState(null);
  const [approvedMax, setApprovedMax] = useState(null);

  /* ================= GET CURRENT USER ================= */

  const getCurrentUser = () => {
    try {
      return (
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(sessionStorage.getItem("user"))
      );
    } catch {
      return null;
    }
  };

  /* ================= GET USER NAME ================= */

  const getUserName = (id) => {
    const currentUser = getCurrentUser();

    if (!currentUser) return `User ${id}`;

    if (currentUser.userId === id || currentUser.id === id) {
      return currentUser.fullName || currentUser.name || "Bạn";
    }

    return `User ${id}`;
  };

  /* ================= LOAD ================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      const [planRes, itemRes, campaignRes, warehouseRes, userRes] = await Promise.all([
        getSupplyPlansByCampaign(id),
        getAllReliefItems(),
        getAllAidCampaigns(),
        getAllWarehouses(), // ✅ thêm API kho
        getAllUser(),
      ]);

      const plans = planRes?.items || planRes?.data || planRes || [];
      const items = itemRes?.items || itemRes?.data || itemRes || [];
      const camps = campaignRes?.items || campaignRes?.data || campaignRes || [];
      const warehousesData =
        warehouseRes?.items || warehouseRes?.data || warehouseRes || [];

      setList(plans);
      setReliefItems(items);
      setCampaigns(camps);
      setWarehouses(warehousesData); // ✅ set kho
      setUsers(Array.isArray(userRes) ? userRes : userRes?.items || userRes?.data || []);

    } catch (err) {
      console.error(err);
      AuthNotify.error("Lỗi tải dữ liệu");
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
      await deleteSupplyPlan(record.supplyPlanId);

      setList(prev =>
        prev.filter(x => x.supplyPlanId !== record.supplyPlanId)
      );

      AuthNotify.success("Đã xóa");

    } catch {
      AuthNotify.error("Xóa thất bại");
    }
  };

  /* ================= HELPERS ================= */

  const getItemName = (id) => {
    return reliefItems.find(x => x.reliefItemId === id)?.itemName || "—";
  };

  const getCampaignName = (id) => {
    return campaigns.find(x => x.campaignID === id)?.campaignName || "—";
  };

  // ✅ FIX QUAN TRỌNG
  const getWarehouseName = (id) => {
    return warehouses.find(x => x.warehouseId === id)?.warehouseName || "—";
  };

  const userMap = useMemo(() => {
    const map = {};
    (Array.isArray(users) ? users : []).forEach((u) => {
      const id = u?.userId ?? u?.id;
      if (id == null) return;
      const name = u?.fullName ?? u?.name ?? u?.userName ?? "";
      if (!String(id).trim()) return;
      map[String(id)] = name || `User ${id}`;
    });
    return map;
  }, [users]);

  const getCreatorName = (record) => {
    const direct =
      record?.createdByManagerName ||
      record?.createdByName ||
      record?.adminName ||
      record?.fullName ||
      record?.name;

    if (direct) return direct;

    const id = record?.createdByManagerId ?? record?.createdById ?? record?.createdByUserId;
    if (id == null) return "—";
    const key = String(id);
    return userMap[key] || `User ${id}`;
  };

  const warehouseOptions = useMemo(() => {
    return (Array.isArray(warehouses) ? warehouses : []).map((w) => ({
      value: w.warehouseId,
      label: `${w.warehouseName}${w.areaName ? ` - ${w.areaName}` : ""}`,
    }));
  }, [warehouses]);

  const itemOptions = useMemo(() => {
    return (Array.isArray(reliefItems) ? reliefItems : []).map((it) => ({
      value: it.reliefItemId,
      label: `${it.itemName}${it.unit ? ` (${it.unit})` : ""}`,
    }));
  }, [reliefItems]);

  const filteredList = useMemo(() => {
    const q = planQuery.trim().toLowerCase();

    return list.filter((r) => {
      const matchesQuery =
        !q ||
        String(r.supplyPlanId ?? "")
          .toLowerCase()
          .includes(q) ||
        String(getWarehouseName(r.warehouseId) ?? "")
          .toLowerCase()
          .includes(q) ||
        String(getItemName(r.reliefItemId) ?? "")
          .toLowerCase()
          .includes(q);

      const matchesWarehouse =
        warehouseFilterId == null || r.warehouseId === warehouseFilterId;
      const matchesItem = itemFilterId == null || r.reliefItemId === itemFilterId;

      const plannedRaw = r.plannedQuantity ?? 0;
      const approvedRaw = r.approvedQuantity ?? 0;
      const planned =
        typeof plannedRaw === "number" ? plannedRaw : Number(plannedRaw);
      const approved =
        typeof approvedRaw === "number" ? approvedRaw : Number(approvedRaw);

      const matchesPlannedMin =
        plannedMin == null ||
        (!Number.isNaN(planned) && planned >= plannedMin);
      const matchesPlannedMax =
        plannedMax == null ||
        (!Number.isNaN(planned) && planned <= plannedMax);
      const matchesApprovedMin =
        approvedMin == null ||
        (!Number.isNaN(approved) && approved >= approvedMin);
      const matchesApprovedMax =
        approvedMax == null ||
        (!Number.isNaN(approved) && approved <= approvedMax);

      return (
        matchesQuery &&
        matchesWarehouse &&
        matchesItem &&
        matchesPlannedMin &&
        matchesPlannedMax &&
        matchesApprovedMin &&
        matchesApprovedMax
      );
    });
  }, [
    list,
    planQuery,
    warehouseFilterId,
    itemFilterId,
    plannedMin,
    plannedMax,
    approvedMin,
    approvedMax,
    warehouses,
    reliefItems,
  ]);

  /* ================= TABLE ================= */

  const columns = [
    {
      title: "ID",
      dataIndex: "supplyPlanId",
      width: 80,
    },
    {
      title: "Chiến dịch",
      render: (_, record) => getCampaignName(record.campaignId),
    },
    {
      title: "Kho hàng",
      render: (_, record) => getWarehouseName(record.warehouseId), // ✅ FIX
    },
    {
      title: "Vật phẩm",
      render: (_, record) => getItemName(record.reliefItemId),
    },
    {
      title: "Số lượng dự kiến",
      dataIndex: "plannedQuantity",
    },
    {
      title: "Số lượng duyệt",
      render: (_, record) => record.approvedQuantity ?? 0,
    },
    {
      title: "Số lượng chưa phát",
      render: (_, record) =>
        record.undistributedQuantity ??
        record.undistributed_quantity ??
        0,
    },
    {
      title: "Người tạo",
      render: (_, record) => getCreatorName(record),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      render: (date) =>
        date ? new Date(date).toLocaleString("vi-VN") : "—",
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <div className="actions">
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
    <div className="supply-page">

      <div className="header">
        <h2>Kế hoạch cấp phát</h2>

        <Button type="primary" onClick={() => setOpenCreate(true)}>
          + Tạo kế hoạch
        </Button>
      </div>

      {/* FILTER BAR */}
      <div style={{ marginBottom: 16 }}>
        <Space wrap style={{ width: "100%", justifyContent: "flex-start" }}>
          <Input
            allowClear
            placeholder="Tìm theo ID / kho / vật phẩm"
            value={planQuery}
            onChange={(e) => setPlanQuery(e.target.value)}
            style={{ width: 260 }}
          />

          <Select
            allowClear
            showSearch
            placeholder="Lọc theo kho"
            value={warehouseFilterId}
            onChange={setWarehouseFilterId}
            style={{ width: 240 }}
            options={warehouseOptions}
            optionFilterProp="label"
          />

          <Select
            allowClear
            showSearch
            placeholder="Lọc theo vật phẩm"
            value={itemFilterId}
            onChange={setItemFilterId}
            style={{ width: 260 }}
            options={itemOptions}
            optionFilterProp="label"
          />

          <InputNumber
            min={0}
            placeholder="SL dự kiến tối thiểu"
            value={plannedMin}
            onChange={setPlannedMin}
            style={{ width: 200 }}
          />

          <InputNumber
            min={0}
            placeholder="SL dự kiến tối đa"
            value={plannedMax}
            onChange={setPlannedMax}
            style={{ width: 200 }}
          />

          <InputNumber
            min={0}
            placeholder="SL duyệt tối thiểu"
            value={approvedMin}
            onChange={setApprovedMin}
            style={{ width: 190 }}
          />

          <InputNumber
            min={0}
            placeholder="SL duyệt tối đa"
            value={approvedMax}
            onChange={setApprovedMax}
            style={{ width: 190 }}
          />

          <Button
            onClick={() => {
              setPlanQuery("");
              setWarehouseFilterId(null);
              setItemFilterId(null);
              setPlannedMin(null);
              setPlannedMax(null);
              setApprovedMin(null);
              setApprovedMax(null);
            }}
          >
            Xóa filter
          </Button>
        </Space>
      </div>

      <Table
        rowKey="supplyPlanId"
        columns={columns}
        dataSource={filteredList}
        loading={loading}
        pagination={{
          pageSize: 6,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} kế hoạch`,
        }}
      />

<CreateSupplyPlan
  open={openCreate}
  onClose={() => setOpenCreate(false)}
  campaignId={Number(id)}
  onSuccess={(newItem) => {
    setList(prev => [
      {
        ...newItem,
        supplyPlanId:
          newItem?.supplyPlanId || Date.now(), // fallback
      },
      ...prev,
    ]);
  }}
/>

      <EditSupplyPlan
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        data={selected}
        onSuccess={fetchData}
      />

    </div>
  );
}