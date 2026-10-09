import axiosInstance from "../../axiosInstance";

/* ================= GET SUPPLY PLANS BY CAMPAIGN ================= */

export const getSupplyPlansByCampaign = async (campaignId) => {
  try {
    if (!campaignId) {
      throw new Error("campaignId không hợp lệ");
    }

    const response = await axiosInstance.get(
      `/api/periodic-aid-supply-plans/by-campaign/${campaignId}`
    );

    return response.data;

  } catch (error) {

    console.error("GET SUPPLY PLANS ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải danh sách kế hoạch cấp phát"
    );

  }
};
/* ================= UPDATE SUPPLY PLAN ================= */

export const updateSupplyPlan = async (id, data) => {
  try {
    if (!id) throw new Error("ID không hợp lệ");

    // 🔥 lọc payload sạch
    const payload = {
      plannedQuantity: data.plannedQuantity,
      approvedQuantity: data.approvedQuantity,
      warehouseId: data.warehouseId,
    };

    console.log("📦 UPDATE SUPPLY PLAN:", payload);

    const res = await axiosInstance.put(
      `/api/periodic-aid-supply-plans/${id}`,
      payload
    );

    return res.data;

  } catch (error) {
    console.error("❌ UPDATE ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể cập nhật kế hoạch cấp phát"
    );
  }
};
/* ================= DELETE SUPPLY PLAN ================= */

export const deleteSupplyPlan = async (id) => {
  try {

    if (!id) {
      throw new Error("ID không hợp lệ");
    }

    const response = await axiosInstance.delete(
      `/api/periodic-aid-supply-plans/${id}`
    );

    return response.data;

  } catch (error) {

    console.error("DELETE SUPPLY PLAN ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể xóa kế hoạch cấp phát"
    );

  }
};


/* ================= CREATE SUPPLY PLAN ================= */

export const createSupplyPlan = async (data) => {
  try {
    const warehouseId = Number(data.warehouseId);
    if (!Number.isFinite(warehouseId) || warehouseId <= 0) {
      throw new Error("warehouseId không hợp lệ");
    }

    const payload = {
      campaignId: Number(data.campaignId),
      reliefItemId: Number(data.reliefItemId),

      plannedQuantity: Number(data.plannedQuantity || 0),
      approvedQuantity: Number(data.approvedQuantity || 0),

      createdByManagerId: Number(data.createdByManagerId),
      warehouseId,
    };

    const response = await axiosInstance.post(
      "/api/periodic-aid-supply-plans",
      payload
    );

    return response.data;

  } catch (error) {

    console.error("CREATE SUPPLY PLAN ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tạo kế hoạch cấp phát"
    );

  }
};
/* ================= GET ALL RELIEF ITEMS ================= */

export const getAllReliefItems = async () => {
  try {

    const response = await axiosInstance.get(
      "/api/relief-items"
    );

    return response.data;

  } catch (error) {

    console.error("GET RELIEF ITEMS ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải danh sách vật phẩm"
    );

  }
};

export const getAllWarehouses = async () => {
  try {

    const response = await axiosInstance.get(
      "/api/relief-warehouses"
    );

    return response.data;

  } catch (error) {

    console.error("GET WAREHOUSES ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải danh sách kho"
    );

  }
};
export const getAllDistributions = async () => {
  try {
    const res = await axiosInstance.get(
      "/api/periodic-aid-distributions"
    );

    return res?.data;
  } catch (err) {
    console.error("GET DISTRIBUTIONS ERROR:", err);
    throw err;
  }
};
export const createDistribution = async (payload) => {
  try {
    const res = await axiosInstance.post(
      "/api/periodic-aid-distributions",
      payload
    );

    return res?.data || res;
  } catch (err) {
    console.error("CREATE DISTRIBUTION ERROR:", err);
    throw err;
  }
};
export const updateDistribution = async (id, payload) => {
  try {
    const res = await axiosInstance.put(
      `/api/periodic-aid-distributions/${id}`,
      payload
    );

    return res?.data || res;
  } catch (err) {
    console.error("UPDATE DISTRIBUTION ERROR:", err);
    throw err;
  }
};
export const deleteDistribution = async (id) => {
  try {
    const res = await axiosInstance.delete(
      `/api/periodic-aid-distributions/${id}`
    );

    return res?.data || res;
  } catch (err) {
    console.error("DELETE DISTRIBUTION ERROR:", err);
    throw err;
  }
};
export const getAllRescueTeams = async () => {
  try {
    const response = await axiosInstance.get(
      "/api/RescueTeams"
    );

    return response.data;

  } catch (error) {

    console.error("GET RESCUE TEAMS ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải danh sách đội cứu trợ"
    );
  }
};

export const getAllAidCampaigns = async () => {
  try {

    const response = await axiosInstance.get(
      "/api/PeriodicAidCampaigns"
    );

    return response.data;

  } catch (error) {

    console.error("GET ALL AID CAMPAIGNS ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải danh sách chiến dịch cứu trợ"
    );

  }
};
export const getAvailableRescueTeams = async () => {
  try {
    const response = await axiosInstance.get(
      "/api/RescueTeams/available"
    );

    return response.data;

  } catch (error) {
    console.error("GET AVAILABLE RESCUE TEAMS ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải danh sách đội cứu hộ đang hoạt động"
    );
  }
};
export const getDistributionDetailsByDistribution = async (distributionId) => {
  try {
    if (!distributionId) {
      throw new Error("distributionId không hợp lệ");
    }

    const response = await axiosInstance.get(
      `/api/periodic-aid-distribution-details/by-distribution/${distributionId}`
    );

    return response.data;

  } catch (error) {
    console.error("GET DISTRIBUTION DETAILS ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải chi tiết phân phối"
    );
  }
};
export const getBeneficiaryById = async (beneficiaryId) => {
  try {
    if (!beneficiaryId) {
      throw new Error("beneficiaryId không hợp lệ");
    }

    const response = await axiosInstance.get(
      `/api/periodic-aid-beneficiaries/${beneficiaryId}`
    );

    return response.data;

  } catch (error) {
    console.error("GET BENEFICIARY ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải thông tin người nhận"
    );
  }
};
/* ================= UPDATE DISTRIBUTION DETAIL ================= */

export const updateDistributionDetail = async (id, data) => {
  try {

    if (!id) {
      throw new Error("ID không hợp lệ");
    }

    const payload = {
      status: data.status,
      note: data.note || "",
    };

    const response = await axiosInstance.put(
      `/api/periodic-aid-distribution-details/${id}`,
      payload
    );

    return response.data;

  } catch (error) {

    console.error("UPDATE DISTRIBUTION DETAIL ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể cập nhật chi tiết phân phối"
    );

  }
};

/* ================= CREATE DISTRIBUTION DETAIL ================= */

export const createDistributionDetail = async (data) => {
  try {
    if (!data.distributionId || !data.beneficiaryId || !data.reliefItemId) {
      throw new Error("Thiếu thông tin bắt buộc");
    }

    const payload = {
      distributionId: Number(data.distributionId),
      beneficiaryId: Number(data.beneficiaryId),
      reliefItemId: Number(data.reliefItemId),
      distributedQuantity: Number(data.distributedQuantity || 1),
      status: data.status || "pending",
      note: data.note || "",
    };

    const response = await axiosInstance.post(
      `/api/periodic-aid-distribution-details`,
      payload
    );

    return response.data;

  } catch (error) {
    console.error("CREATE DISTRIBUTION DETAIL ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tạo chi tiết phân phối"
    );
  }
};
