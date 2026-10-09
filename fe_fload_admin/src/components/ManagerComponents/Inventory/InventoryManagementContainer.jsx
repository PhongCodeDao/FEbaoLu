import { useEffect, useMemo, useState } from "react";
import {
  Input,
  InputNumber,
  Select,
  Table,
  Space,
  Tabs,
  message,
  Button,
  Popconfirm,
} from "antd";

import {
  getAllWarehouses,
  getAllReliefItems,
  getWarehouseInventory,
  deleteWarehouse,
  deleteReliefItem,
} from "../../../../api/axios/ManagerApi/inventoryApi";
import axiosInstance from "../../../../api/axiosInstance";

import CreateWarehouseModal from "./CreateWarehouseModal/CreateWarehouseModal";
import EditWarehouseModal from "./EditWarehouseModal/EditWarehouseModal";
import CreateReliefItemModal from "./CreateReliefItemModal/CreateReliefItemModal";
import EditReliefItemModal from "./EditReliefItemModal/EditReliefItemModal";

export default function InventoryManagement() {
  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [activeTab, setActiveTab] = useState("");
  const [openCreateWarehouse, setOpenCreateWarehouse] = useState(false);
  const [openEditWarehouse, setOpenEditWarehouse] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  const [openCreateItem, setOpenCreateItem] = useState(false);
  const [openEditItem, setOpenEditItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [provinceLoading, setProvinceLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [warehouseAreaId, setWarehouseAreaId] = useState(null);
  const [warehouseMinBudget, setWarehouseMinBudget] = useState(null);
  const [warehouseMaxBudget, setWarehouseMaxBudget] = useState(null);

  const [itemQuery, setItemQuery] = useState("");
  const [itemUnitFilter, setItemUnitFilter] = useState(null);
  const [itemMinCost, setItemMinCost] = useState(null);
  const [itemMaxCost, setItemMaxCost] = useState(null);

  const [inventoryQuery, setInventoryQuery] = useState("");
  const [inventoryMinQty, setInventoryMinQty] = useState(null);
  const [inventoryMaxQty, setInventoryMaxQty] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadProvinces = async () => {
      try {
        setProvinceLoading(true);
        const res = await axiosInstance.get("/api/geographic-areas/provinces");
        const data = res?.data;
        if (cancelled) return;
        setProvinces(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        message.error("Không thể tải danh sách tỉnh/thành phố");
        setProvinces([]);
      } finally {
        if (!cancelled) setProvinceLoading(false);
      }
    };

    loadProvinces();

    return () => {
      cancelled = true;
    };
  }, []);

  const provinceOptions = useMemo(
    () =>
      (Array.isArray(provinces) ? provinces : [])
        .map((p) => ({
          value: p?.id,
          label: p?.name ?? "",
        }))
        .filter((x) => x.value != null && String(x.label).trim().length > 0),
    [provinces]
  );

  // ================= LOAD ALL =================
  async function loadAll(preferredTab = "") {
    try {
      const [w, i] = await Promise.all([
        getAllWarehouses(),
        getAllReliefItems(),
      ]);

      const warehouseData = w.data.map((x) => ({
        ...x,
        id: x.id || x.warehouseId,
      }));

      setWarehouses(warehouseData);
      setItems(i.data.map((x) => ({ ...x, id: x.id || x.reliefItemId })));

      if (preferredTab === "warehouses") {
        setActiveTab("warehouses");
        return;
      }

      if (preferredTab === "items") {
        setActiveTab("items");
        return;
      }

      if (preferredTab?.startsWith("warehouse-")) {
        const preferredId = Number(preferredTab.split("-")[1]);
        const hasPreferredWarehouse = warehouseData.some((x) => x.id === preferredId);

        if (hasPreferredWarehouse) {
          setSelectedWarehouseId(preferredId);
          setActiveTab(preferredTab);
          loadInventory(preferredId);
          return;
        }
      }

      if (warehouseData.length > 0) {
        const firstId = warehouseData[0].id;
        setSelectedWarehouseId(firstId);
        setActiveTab(`warehouse-${firstId}`);
        loadInventory(firstId);
      } else {
        setSelectedWarehouseId(null);
        setInventory([]);
        setActiveTab("warehouses");
      }
    } catch {
      message.error("Lỗi tải dữ liệu");
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // ================= INVENTORY =================
  const loadInventory = async (warehouseId) => {
    try {
      const res = await getWarehouseInventory(warehouseId);

      setInventory(
        res.data.map((x, index) => ({
          key: `${warehouseId}-${index}`,
          itemName: x.itemName,
          quantity: x.quantity,
        }))
      );
    } catch {
      message.error("Lỗi tải tồn kho");
    }
  };

  const handleSelectWarehouse = (id) => {
    setSelectedWarehouseId(id);
    setActiveTab(`warehouse-${id}`);
    loadInventory(id);
  };

  // ================= DELETE WAREHOUSE =================
  const handleDeleteWarehouse = async (id) => {
    try {
      await deleteWarehouse(id);
      message.success("Xóa kho hàng thành công!");
      await loadAll("warehouses");
    } catch (err) {
      message.error(err.message || "Xóa kho hàng thất bại");
    }
  };

  // ================= DELETE RELIEF ITEM =================
  const handleDeleteItem = async (id) => {
    try {
      await deleteReliefItem(id);
      message.success("Xóa vật phẩm thành công!");
      await loadAll("items");
    } catch (err) {
      message.error(err.message || "Xóa vật phẩm thất bại");
    }
  };

  // ================= TABLE =================

  // 👉 Kho (đã bỏ Khu vực)
  const warehouseColumns = [
    { title: "ID", dataIndex: "id" },
    { title: "Tên kho", dataIndex: "warehouseName" },
    { title: "Vị trí", dataIndex: "locationDescription" },
    {
      title: "Ngân sách",
      dataIndex: "availableBudget",
      render: (v) => v?.toLocaleString("vi-VN") + " ₫",
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            onClick={() => {
              setSelectedWarehouse(record);
              setOpenEditWarehouse(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa kho?"
            description="Bạn có chắc chắn muốn xóa kho hàng này?"
            onConfirm={() => handleDeleteWarehouse(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 👉 Item
  const itemColumns = [
    { title: "ID", dataIndex: "id" },
    { title: "Tên item", dataIndex: "itemName" },
    { title: "Đơn vị", dataIndex: "unit" },
    {
      title: "Giá tiền",
      dataIndex: "cost",
      render: (v) => (v ? v.toLocaleString("vi-VN") + " ₫" : "—"),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            onClick={() => {
              setSelectedItem(record);
              setOpenEditItem(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa vật phẩm?"
            description="Bạn có chắc chắn muốn xóa vật phẩm này?"
            onConfirm={() => handleDeleteItem(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 👉 Tồn kho
  const inventoryColumns = [
    { title: "STT", render: (_, __, i) => i + 1 },
    { title: "Tên item", dataIndex: "itemName" },
    { title: "Số lượng", dataIndex: "quantity" },
  ];

  // 👉 Tabs theo từng kho (click được)
  const warehouseTabs = warehouses.map((w) => ({
    key: `warehouse-${w.id}`,
    label: w.warehouseName,
    children: (
      <div>
        <Space style={{ marginBottom: 16, width: "100%" }} wrap>
          <Input
            allowClear
            placeholder="Tìm item trong kho"
            value={inventoryQuery}
            onChange={(e) => setInventoryQuery(e.target.value)}
            style={{ width: 260 }}
          />
          <InputNumber
            min={0}
            placeholder="SL tối thiểu"
            value={inventoryMinQty}
            onChange={setInventoryMinQty}
            style={{ width: 140 }}
          />
          <InputNumber
            min={0}
            placeholder="SL tối đa"
            value={inventoryMaxQty}
            onChange={setInventoryMaxQty}
            style={{ width: 140 }}
          />
          <Button
            onClick={() => {
              setInventoryQuery("");
              setInventoryMinQty(null);
              setInventoryMaxQty(null);
            }}
          >
            Xóa filter
          </Button>
        </Space>

        <Table
          columns={inventoryColumns}
          dataSource={inventory.filter((row) => {
            const q = inventoryQuery.trim().toLowerCase();
            const name = (row.itemName ?? "").toString().toLowerCase();
            const matchesQuery = !q || name.includes(q);
            const qty = typeof row.quantity === "number" ? row.quantity : Number(row.quantity);
            const meetsMin = inventoryMinQty == null || (!Number.isNaN(qty) && qty >= inventoryMinQty);
            const meetsMax = inventoryMaxQty == null || (!Number.isNaN(qty) && qty <= inventoryMaxQty);
            return matchesQuery && meetsMin && meetsMax;
          })}
          pagination={false}
        />
      </div>
    ),
  }));

  const filteredWarehouses = warehouses.filter((w) => {
    const matchesArea =
      warehouseAreaId == null ||
      Number(w.areaId || 0) === Number(warehouseAreaId);

    const budgetRaw = w.availableBudget;
    const budget =
      typeof budgetRaw === "number"
        ? budgetRaw
        : budgetRaw == null
          ? null
          : Number(budgetRaw);
    const meetsMin = warehouseMinBudget == null || (budget != null && budget >= warehouseMinBudget);
    const meetsMax = warehouseMaxBudget == null || (budget != null && budget <= warehouseMaxBudget);

    return matchesArea && meetsMin && meetsMax;
  });

  const filteredItems = items.filter((it) => {
    const q = itemQuery.trim().toLowerCase();
    const name = (it.itemName ?? "").toString().toLowerCase();
    const unit = (it.unit ?? "").toString();
    const matchesQuery = !q || name.includes(q);
    const matchesUnit = itemUnitFilter == null || unit === itemUnitFilter;
    const costRaw = it.cost;
    const cost =
      typeof costRaw === "number" ? costRaw : costRaw == null ? null : Number(costRaw);
    const meetsMin = itemMinCost == null || (cost != null && cost >= itemMinCost);
    const meetsMax = itemMaxCost == null || (cost != null && cost <= itemMaxCost);
    return matchesQuery && matchesUnit && meetsMin && meetsMax;
  });

  const unitOptions = Array.from(
    new Set(items.map((x) => (x.unit ?? "").toString()).filter((u) => u.trim().length > 0))
  ).map((u) => ({ value: u, label: u }));

  return (
    <div style={{ padding: 20 }}>
    

      {/* <Space style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 250 }}
          placeholder="Chọn kho để xem tồn kho"
          value={selectedWarehouseId}
          options={warehouses.map((w) => ({
            value: w.id,
            label: w.warehouseName,
          }))}
          onChange={handleSelectWarehouse}
        />
      </Space> */}

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);

          // 👉 Khi click tab kho → load inventory
          if (key.startsWith("warehouse-")) {
            const id = key.split("-")[1];
            loadInventory(id);
          }
        }}
        items={[
          {
            key: "warehouses",
            label: "Danh sách kho",
            children: (
              <div>
                <Space style={{ marginBottom: 16, width: "100%" }} wrap>
                  <Button
                    type="primary"
                    onClick={() => setOpenCreateWarehouse(true)}
                  >
                    + Tạo kho mới
                  </Button>

                  <Select
                    allowClear
                    showSearch
                    loading={provinceLoading}
                    placeholder="Chọn tỉnh/thành phố"
                    value={warehouseAreaId}
                    onChange={setWarehouseAreaId}
                    options={provinceOptions}
                    optionFilterProp="label"
                    style={{ width: 280 }}
                  />

                  <InputNumber
                    min={0}
                    placeholder="Ngân sách tối thiểu"
                    value={warehouseMinBudget}
                    onChange={setWarehouseMinBudget}
                    style={{ width: 180 }}
                  />

                  <InputNumber
                    min={0}
                    placeholder="Ngân sách tối đa"
                    value={warehouseMaxBudget}
                    onChange={setWarehouseMaxBudget}
                    style={{ width: 180 }}
                  />

                  <Button
                    onClick={() => {
                      setWarehouseAreaId(null);
                      setWarehouseMinBudget(null);
                      setWarehouseMaxBudget(null);
                    }}
                  >
                    Xóa filter
                  </Button>
                </Space>

                <Table columns={warehouseColumns} dataSource={filteredWarehouses} />
              </div>
            ),
          },
          {
            key: "items",
            label: "Danh sách item",
            children: (
              <div>
                <Space style={{ marginBottom: 16, width: "100%" }} wrap>
                  <Button
                    type="primary"
                    onClick={() => setOpenCreateItem(true)}
                  >
                    + Tạo vật phẩm mới
                  </Button>

                  <Input
                    allowClear
                    placeholder="Tìm theo tên item"
                    value={itemQuery}
                    onChange={(e) => setItemQuery(e.target.value)}
                    style={{ width: 260 }}
                  />

                  <Select
                    allowClear
                    showSearch
                    placeholder="Lọc theo đơn vị"
                    value={itemUnitFilter}
                    onChange={setItemUnitFilter}
                    options={unitOptions}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    style={{ width: 180 }}
                  />

                  <InputNumber
                    min={0}
                    placeholder="Giá tối thiểu"
                    value={itemMinCost}
                    onChange={setItemMinCost}
                    style={{ width: 160 }}
                  />

                  <InputNumber
                    min={0}
                    placeholder="Giá tối đa"
                    value={itemMaxCost}
                    onChange={setItemMaxCost}
                    style={{ width: 160 }}
                  />

                  <Button
                    onClick={() => {
                      setItemQuery("");
                      setItemUnitFilter(null);
                      setItemMinCost(null);
                      setItemMaxCost(null);
                    }}
                  >
                    Xóa filter
                  </Button>
                </Space>

                <Table columns={itemColumns} dataSource={filteredItems} />
              </div>
            ),
          },
          ...warehouseTabs,
        ]}
      />

      {/* CREATE WAREHOUSE MODAL */}
      <CreateWarehouseModal
        open={openCreateWarehouse}
        onClose={() => setOpenCreateWarehouse(false)}
        onSuccess={async () => {
          await loadAll("warehouses");
          setActiveTab("warehouses");
          setOpenCreateWarehouse(false);
        }}
      />

      {/* EDIT WAREHOUSE MODAL */}
      <EditWarehouseModal
        open={openEditWarehouse}
        onClose={() => {
          setOpenEditWarehouse(false);
          setSelectedWarehouse(null);
        }}
        warehouse={selectedWarehouse}
        onSuccess={async () => {
          await loadAll("warehouses");
          setActiveTab("warehouses");
          setOpenEditWarehouse(false);
          setSelectedWarehouse(null);
        }}
      />

      {/* CREATE RELIEF ITEM MODAL */}
      <CreateReliefItemModal
        open={openCreateItem}
        onClose={() => setOpenCreateItem(false)}
        onSuccess={async () => {
          await loadAll("items");
          setActiveTab("items");
          setOpenCreateItem(false);
        }}
      />

      {/* EDIT RELIEF ITEM MODAL */}
      <EditReliefItemModal
        open={openEditItem}
        onClose={() => {
          setOpenEditItem(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onSuccess={async () => {
          await loadAll("items");
          setActiveTab("items");
          setOpenEditItem(false);
          setSelectedItem(null);
        }}
      />
    </div>
  );
}