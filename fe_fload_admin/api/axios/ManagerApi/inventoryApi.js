import axiosInstance from "../../axiosInstance";
import axios from "axios";
/* ================= SAFE NUMBER ================= */

const safeNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

/* =========================================================
   ================== RELIEF WAREHOUSES ====================
   ========================================================= */

export const getAllWarehouses = () => {
  return axiosInstance.get("/api/relief-warehouses");
};

export const getWarehouseById = (id) => {
  const safeId = safeNumber(id);
  if (!safeId) throw new Error("Invalid warehouseId");
  return axiosInstance.get(`/api/relief-warehouses/${safeId}`);
};

export const createWarehouse = (data) => {
  return axiosInstance.post("/api/relief-warehouses", {
    warehouseName: data.warehouseName || "",
    locationDescription: data.locationDescription || "",
    areaId: safeNumber(data.areaId) || 0,
    availableBudget: safeNumber(data.availableBudget) || 0,
  });
};

export const updateWarehouse = (id, data) => {
  const safeId = safeNumber(id);
  if (!safeId) throw new Error("Invalid warehouseId");

  return axiosInstance.put(`/api/relief-warehouses/${safeId}`, {
    warehouseName: data.warehouseName || "",
    locationDescription: data.locationDescription || "",
    areaId: safeNumber(data.areaId) || 0,
    availableBudget: safeNumber(data.availableBudget) || 0,
  });
};

export const deleteWarehouse = (id) => {
  const safeId = safeNumber(id);
  if (!safeId) throw new Error("Invalid warehouseId");
  return axiosInstance.delete(`/api/relief-warehouses/${safeId}`);
};

/* =========================================================
   ====================== RELIEF ITEMS ======================
   ========================================================= */

export const getAllReliefItems = () => {
  return axiosInstance.get("/api/relief-items");
};

export const getReliefItemById = (id) => {
  const safeId = safeNumber(id);
  if (!safeId) throw new Error("Invalid reliefItemId");
  return axiosInstance.get(`/api/relief-items/${safeId}`);
};

export const createReliefItem = (data) => {
  return axiosInstance.post("/api/relief-items", {
    itemName: data.itemName || "",
    unit: data.unit || "",
    cost: safeNumber(data.cost) || 0,
  });
};

export const updateReliefItem = (id, data) => {
  const safeId = safeNumber(id);
  if (!safeId) throw new Error("Invalid reliefItemId");

  return axiosInstance.put(`/api/relief-items/${safeId}`, {
    itemName: data.itemName || "",
    unit: data.unit || "",
    cost: safeNumber(data.cost) || 0,
  });
};

export const deleteReliefItem = (id) => {
  const safeId = safeNumber(id);
  if (!safeId) throw new Error("Invalid reliefItemId");
  return axiosInstance.delete(`/api/relief-items/${safeId}`);
};

/* =========================================================
   ================= INVENTORY TRANSACTIONS =================
   ========================================================= */

export const getInventoryTransactions = (warehouseId) => {
  const safeId = safeNumber(warehouseId);

  return axiosInstance.get("/api/inventory-transactions", {
    params: safeId ? { warehouseId: safeId } : {},
  });
};

export const getInventoryTransactionById = (id) => {
  const safeId = safeNumber(id);
  if (!safeId) throw new Error("Invalid transactionId");
  return axiosInstance.get(`/api/inventory-transactions/${safeId}`);
};

export const createInventoryTransaction = (data) => {
  const warehouseId = safeNumber(data.warehouseId);
  if (!warehouseId) throw new Error("warehouseId is required");

  return axiosInstance.post("/api/inventory-transactions", {
    warehouseId,
    transactionType: data.transactionType,
    rescueRequestId: safeNumber(data.rescueRequestId) || null,
    note: data.note || "",
    lines: Array.isArray(data.lines)
      ? data.lines
          .filter(l => l.reliefItemId && l.quantity)
          .map(l => ({
            reliefItemId: safeNumber(l.reliefItemId),
            quantity: safeNumber(l.quantity),
          }))
      : [],
  });
};

export const confirmInventoryTransaction = (id) => {
  const safeId = safeNumber(id);
  if (!safeId) throw new Error("Invalid transactionId");

  return axiosInstance.post(
    `/api/inventory-transactions/${safeId}/confirm`
  );
};

export const getWarehouseInventory = (warehouseId) => {
  const safeId = safeNumber(warehouseId);
  if (!safeId) throw new Error("Invalid warehouseId");

  return axiosInstance.get(
    `/api/relief-warehouses/${safeId}/inventory`
  );
};
export const getPendingRescueRequests = async (params = {}) => {

  try {

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/RescueRequests`,
      {
        params,
        headers: {
          Accept: "application/json"
        }
      }
    );

    return response.data;

  }
  catch (error) {

    console.error("Lỗi lấy RescueRequests:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải danh sách RescueRequests"
    );

  }

};