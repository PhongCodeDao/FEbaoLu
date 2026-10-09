import { useEffect, useState, useMemo } from "react";
import { Table, Tag, Button, Select, Tabs, Spin, message, Tooltip } from "antd";
import {
  CheckCircle2,
  Clock3,
  RotateCcw,
  Warehouse,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Package,
  Calendar,
  Filter,
  Layers,
  Sparkles,
} from "lucide-react";
import AuthNotify from "../../../utils/Common/AuthNotify";
import "./ApprovalManagement.css";

import {
  getInventoryTransactions,
  confirmInventoryTransaction,
  getAllWarehouses,
} from "../../../../api/axios/ManagerApi/inventoryApi";

import CreateTransactionModal from "../../../components/ManagerComponents/Approval/CreateTransactionModal";

export default function ApprovalManagement() {
  const [data, setData] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const [openCreate, setOpenCreate] = useState(false);
  const [warehouseFilter, setWarehouseFilter] = useState(null);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  /* ================= NORMALIZE ================= */
  const normalize = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  };

  /* ================= LOAD ================= */
  const fetchData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

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
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("LOAD ERROR:", err);
      AuthNotify.error(
        err?.response?.data?.message || "Tải danh sách giao dịch kho thất bại"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getWarehouseName = (id) => {
    const w = warehouses.find((x) => x.warehouseId === id);
    return w?.warehouseName || `Kho #${id}`;
  };

  const resetFilters = () => {
    setWarehouseFilter(null);
    setTransactionTypeFilter(null);
  };

  /* ================= FILTER ================= */
  const filteredData = useMemo(() => {
    return data.filter((t) => {
      if (warehouseFilter && t.warehouseId !== warehouseFilter) return false;
      if (transactionTypeFilter && t.transactionType !== transactionTypeFilter) return false;
      return true;
    });
  }, [data, warehouseFilter, transactionTypeFilter]);

  const pendingList = useMemo(() => filteredData.filter((t) => t.isPending), [filteredData]);
  const approvedList = useMemo(() => filteredData.filter((t) => !t.isPending), [filteredData]);

  /* ================= CONFIRM ================= */
  const handleConfirm = async (id) => {
    try {
      setConfirmingId(id);
      await confirmInventoryTransaction(id);

      setData((prev) =>
        prev.map((t) =>
          t.transactionId === id
            ? { ...t, confirmedAt: new Date().toISOString(), isPending: false }
            : t
        )
      );

      AuthNotify.success("Phê duyệt thành công", `Giao dịch #${id} đã được xác nhận vào kho.`);
    } catch (err) {
      console.error(err);
      AuthNotify.error(
        err?.response?.data?.message || "Phê duyệt giao dịch thất bại"
      );
    } finally {
      setConfirmingId(null);
    }
  };

  /* ================= COLUMNS ================= */
  const columns = [
    {
      title: "Mã Giao Dịch",
      dataIndex: "transactionId",
      width: 130,
      render: (id) => (
        <span className="tx-id-badge">
          <Package size={13} />
          <strong>#{id}</strong>
        </span>
      ),
    },
    {
      title: "Kho Hàng Thực Hiện",
      dataIndex: "warehouseId",
      render: (id) => (
        <div className="tx-warehouse-cell">
          <Warehouse size={15} className="wh-icon" />
          <span>{getWarehouseName(id)}</span>
        </div>
      ),
    },
    {
      title: "Loại Giao Dịch",
      dataIndex: "transactionType",
      width: 140,
      render: (type) => {
        const isIN = type === "IN";
        return (
          <span className={`tx-type-chip ${isIN ? "tx-type-in" : "tx-type-out"}`}>
            {isIN ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
            <span>{isIN ? "Nhập Kho" : "Xuất Kho"}</span>
          </span>
        );
      },
    },
    {
      title: "Danh Sách Hàng Hóa",
      dataIndex: "lines",
      render: (lines) => (
        <div className="tx-items-list">
          {lines?.map((l, i) => (
            <span key={i} className="tx-item-tag">
              <span className="item-name">{l.itemName}</span>
              <span className="item-qty">
                +{l.quantity} {l.unit}
              </span>
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "confirmedAt",
      width: 140,
      render: (confirmedAt) =>
        confirmedAt ? (
          <span className="tx-status-badge tx-status-confirmed">
            <CheckCircle2 size={13} /> Đã Phê Duyệt
          </span>
        ) : (
          <span className="tx-status-badge tx-status-pending">
            <Clock3 size={13} /> Chờ Phê Duyệt
          </span>
        ),
    },
    {
      title: "Thời Gian Khởi Tạo",
      dataIndex: "createdAt",
      width: 170,
      render: (d) => (
        <span className="tx-date-cell">
          <Calendar size={13} />
          {new Date(d).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      title: "Thao Tác",
      width: 130,
      render: (_, record) =>
        record.isPending ? (
          <Button
            type="primary"
            className="btn-approve-action"
            loading={confirmingId === record.transactionId}
            onClick={() => handleConfirm(record.transactionId)}
          >
            Phê duyệt
          </Button>
        ) : (
          <span className="text-muted-check">
            <CheckCircle2 size={16} /> Hoàn tất
          </span>
        ),
    },
  ];

  return (
    <div className="approvalPage">
      {/* 1. HERO OPERATIONAL BANNER */}
      <section className="apprNav__hero">
        <div className="apprNav__hero-glow apprNav__hero-glow--1" />
        <div className="apprNav__hero-glow apprNav__hero-glow--2" />

        <div className="apprNav__hero-inner">
          <div className="apprNav__team-info">
            <div className="team-badge-icon">
              <CheckCircle2 size={34} />
              <span className="live-pulse-dot" title="Trung tâm phê duyệt thời gian thực" />
            </div>

            <div className="team-text-group">
              <div className="team-status-row">
                <span className="operational-badge">
                  <span className="pulse-point" /> HỆ THỐNG PHÊ DUYỆT XUẤT NHẬP KHO
                </span>
                <span className="team-code-badge">
                  <Warehouse size={12} /> {warehouses.length} KHO BÃI ĐANG QUẢN LÝ
                </span>
              </div>

              <h1 className="hero-main-title">
                Kiểm Soát & Phê Duyệt Giao Dịch Kho Nhu Yếu Phẩm
              </h1>

              <div className="hero-sub-meta">
                <span className="meta-pill">
                  Đang chờ duyệt: <strong>{data.filter((t) => t.isPending).length} phiếu</strong>
                </span>
                <span className="meta-separator">•</span>
                <span className="meta-pill">
                  Đã duyệt hoàn tất: <strong>{data.filter((t) => !t.isPending).length} phiếu</strong>
                </span>
                <span className="meta-separator">•</span>
                <span className="meta-pill">
                  Cập nhật: <span>{lastRefreshed.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="apprNav__hero-actions">
            <Button
              type="primary"
              className="btn-create-tx"
              icon={<Plus size={16} />}
              onClick={() => setOpenCreate(true)}
            >
              Tạo giao dịch mới
            </Button>

            <button
              className={`btn-hero-refresh ${refreshing ? "btn-hero-refresh--active" : ""}`}
              onClick={() => fetchData(true)}
              title="Làm mới danh sách giao dịch"
            >
              <RotateCcw size={15} />
              <span>Đồng bộ</span>
            </button>
          </div>
        </div>

        {/* SUMMARY STATS BAR */}
        <div className="apprNav__stat-strip">
          <div className="stat-strip-box">
            <span className="stat-strip-title">Phiếu chờ phê duyệt</span>
            <span className="stat-strip-value text-amber">
              {data.filter((t) => t.isPending).length} phiếu
            </span>
          </div>
          <div className="stat-strip-box">
            <span className="stat-strip-title">Phiếu đã duyệt xong</span>
            <span className="stat-strip-value text-green">
              {data.filter((t) => !t.isPending).length} phiếu
            </span>
          </div>
          <div className="stat-strip-box">
            <span className="stat-strip-title">Tổng đợt nhập kho</span>
            <span className="stat-strip-value text-cyan">
              {data.filter((t) => t.transactionType === "IN").length} lượt
            </span>
          </div>
          <div className="stat-strip-box">
            <span className="stat-strip-title">Tổng đợt xuất cứu trợ</span>
            <span className="stat-strip-value text-purple">
              {data.filter((t) => t.transactionType === "OUT").length} lượt
            </span>
          </div>
        </div>
      </section>

      {/* 2. TOOLBAR FILTERS */}
      <section className="apprNav__toolbar">
        <div className="toolbar-filters-row">
          <div className="filter-item">
            <span className="filter-label">
              <Warehouse size={14} /> Kho hàng:
            </span>
            <Select
              placeholder="Tất cả kho hàng"
              allowClear
              onChange={(val) => setWarehouseFilter(val)}
              value={warehouseFilter}
              style={{ width: 220 }}
            >
              {warehouses.map((wh) => (
                <Select.Option key={wh.warehouseId} value={wh.warehouseId}>
                  {wh.warehouseName}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="filter-item">
            <span className="filter-label">
              <Filter size={14} /> Loại giao dịch:
            </span>
            <Select
              placeholder="Tất cả loại giao dịch"
              allowClear
              onChange={(val) => setTransactionTypeFilter(val)}
              value={transactionTypeFilter}
              style={{ width: 200 }}
            >
              <Select.Option value="IN">Nhập kho cứu trợ</Select.Option>
              <Select.Option value="OUT">Xuất kho phân phát</Select.Option>
            </Select>
          </div>

          {(warehouseFilter || transactionTypeFilter) && (
            <button className="btn-filter-reset" onClick={resetFilters}>
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </section>

      {/* 3. TABS & TABLE */}
      <section className="apprNav__table-container">
        <Tabs defaultActiveKey="1" className="modern-approval-tabs">
          <Tabs.TabPane
            tab={
              <span className="tab-title-wrap">
                <Clock3 size={15} />
                <span>Chờ phê duyệt</span>
                <span className="tab-badge tab-badge--pending">{pendingList.length}</span>
              </span>
            }
            key="1"
          >
            <Table
              columns={columns}
              dataSource={pendingList}
              loading={loading}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              className="modern-tx-table"
              rowKey="transactionId"
            />
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <span className="tab-title-wrap">
                <CheckCircle2 size={15} />
                <span>Đã phê duyệt</span>
                <span className="tab-badge tab-badge--approved">{approvedList.length}</span>
              </span>
            }
            key="2"
          >
            <Table
              columns={columns}
              dataSource={approvedList}
              loading={loading}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              className="modern-tx-table"
              rowKey="transactionId"
            />
          </Tabs.TabPane>
        </Tabs>
      </section>

      {/* MODAL */}
      <CreateTransactionModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={() => fetchData(true)}
      />
    </div>
  );
}