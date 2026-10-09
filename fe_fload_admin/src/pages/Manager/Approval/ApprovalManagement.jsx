import { useEffect, useState } from "react";
import { Table, Tag, Button } from "antd";
import AuthNotify from "../../../utils/Common/AuthNotify";
import { Select } from "antd";

import {
  getInventoryTransactions,
  confirmInventoryTransaction,
} from "../../../../api/axios/ManagerApi/inventoryApi";

import { getAllWarehouses } from "../../../../api/axios/ManagerApi/inventoryApi";

import CreateTransactionModal from "../../../components/ManagerComponents/Approval/CreateTransactionModal";

import { Tabs } from "antd";

export default function ApprovalManagement() {
  const [data, setData] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [filter, setFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState(null); // New state for warehouse filter
  const [transactionTypeFilter, setTransactionTypeFilter] = useState(null); // New state for IN/OUT filter

  const handleWarehouseChange = (value) => {
    setWarehouseFilter(value);
  };

  const handleTransactionTypeChange = (value) => {
    setTransactionTypeFilter(value);
  };

  const resetFilters = () => {
    setFilter("all");
    setWarehouseFilter(null);
    setTransactionTypeFilter(null);
  };

  /* ================= NORMALIZE ================= */
  const normalize = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  };

  /* ================= LOAD ================= */
  const fetchData = async () => {
    try {
      setLoading(true);

      const [resTran, resWh] = await Promise.all([
        getInventoryTransactions(),
        getAllWarehouses(),
      ]);

      const list = normalize(resTran);
      const whList = normalize(resWh);

      setWarehouses(whList);

      const mapped = list
        .map((t) => ({
          ...t,
          key: t.transactionId,
          isPending: !t.confirmedAt,
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setData(mapped);
    } catch (err) {
      console.error("LOAD ERROR:", err);
      AuthNotify.error(
        err?.response?.data?.message || "Load dữ liệu thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= HELPER ================= */

  const getWarehouseName = (id) => {
    const w = warehouses.find((x) => x.warehouseId === id);
    return w?.warehouseName || `WH-${id}`;
  };

  /* ================= FILTER ================= */

  const filteredData = data.filter((t) => {
    if (filter === "pending" && !t.isPending) return false;
    if (filter === "confirmed" && t.isPending) return false;
    if (warehouseFilter && t.warehouseId !== warehouseFilter) return false;
    if (transactionTypeFilter && t.transactionType !== transactionTypeFilter) return false;
    return true;
  });

  /* ================= CONFIRM ================= */

  const handleConfirm = async (id) => {
    try {
      await confirmInventoryTransaction(id);

      setData((prev) =>
        prev.map((t) =>
          t.transactionId === id
            ? { ...t, confirmedAt: new Date().toISOString() }
            : t
        )
      );

      AuthNotify.success("Xác nhận thành công");
    } catch (err) {
      console.error(err);

      AuthNotify.error(
        err?.response?.data?.message || "Xác nhận thất bại"
      );
    }
  };

  /* ================= COLUMNS ================= */

  const columns = [
    {
      title: "Mã",
      dataIndex: "transactionId",
      render: (id) => <strong>#{id}</strong>,
    },
    {
      title: "Kho",
      dataIndex: "warehouseId",
      render: (id) => getWarehouseName(id),
    },
    {
      title: "Loại",
      dataIndex: "transactionType",
      render: (type) => {
        const map = {
          IN: { text: "Nhập", color: "green" },
          OUT: { text: "Xuất", color: "red" },
        };
        const t = map[type] || { text: type };
        return <Tag color={t.color}>{t.text}</Tag>;
      },
    },
    {
      title: "Hàng hóa",
      dataIndex: "lines",
      render: (lines) => (
        <div>
          {lines?.map((l, i) => (
            <div key={i}>
              {l.itemName} ({l.quantity} {l.unit})
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "confirmedAt",
      render: (confirmedAt) =>
        confirmedAt ? (
          <Tag color="green">Đã duyệt</Tag>
        ) : (
          <Tag color="orange">Chờ duyệt</Tag>
        ),
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      render: (d) =>
        new Date(d).toLocaleString("vi-VN"),
    },
    {
      title: "Hành động",
      render: (_, record) =>
        !record.confirmedAt ? (
          <Button
            type="primary"
            size="small"
            onClick={() => handleConfirm(record.transactionId)}
          >
            Xác nhận
          </Button>
        ) : null,
    },
  ];

  const pendingCount = data.filter((t) => t.isPending).length;
  const approvedCount = data.filter((t) => !t.isPending).length;

  /* ================= UI ================= */

  return (
    <div style={{ padding: 20, background: "#eff3f7", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2>Quản lý giao dịch kho</h2>

        <Button type="primary" onClick={() => setOpenCreate(true)}>
          + Tạo giao dịch
        </Button>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <Select
          placeholder="Chọn kho hàng"
          onChange={handleWarehouseChange}
          style={{ width: 200 }}
          value={warehouseFilter}
        >
          {warehouses.map((wh) => (
            <Select.Option key={wh.warehouseId} value={wh.warehouseId}>
              {wh.warehouseName}
            </Select.Option>
          ))}
        </Select>

        <Select
          placeholder="Chọn loại giao dịch"
          onChange={handleTransactionTypeChange}
          style={{ width: 200 }}
          value={transactionTypeFilter}
        >
          <Select.Option value="IN">Nhập</Select.Option>
          <Select.Option value="OUT">Xuất</Select.Option>
        </Select>

        <Button onClick={resetFilters}>Quay lại</Button>
      </div>

      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab={`Chờ phê duyệt (${pendingCount})`} key="1">
          <Table
            columns={columns}
            dataSource={filteredData.filter((t) => t.isPending)}
            loading={loading}
            pagination={{ pageSize: 8 }}
            bordered
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab={`Đã phê duyệt (${approvedCount})`} key="2">
          <Table
            columns={columns}
            dataSource={filteredData.filter((t) => !t.isPending)}
            loading={loading}
            pagination={{ pageSize: 8 }}
            bordered
          />
        </Tabs.TabPane>
      </Tabs>

      <CreateTransactionModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}