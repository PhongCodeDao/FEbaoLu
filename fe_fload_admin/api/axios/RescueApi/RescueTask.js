import axiosInstance from "../../axiosInstance";



export const acceptRescueAssignment = async (assignmentId) => {

    try {
  
      const response = await axiosInstance.put(
        `/api/RescueAssignments/${assignmentId}/accept`
      );
  
      return response.data;
  
    } 
    catch (error) {
  
      console.error("Lỗi nhận nhiệm vụ:", error);
  
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Không thể nhận nhiệm vụ cứu hộ"
      );
  
    }
  
  };

  /* ================= REJECT ASSIGNMENT ================= */

  export const rejectRescueAssignment = async (assignmentId, data) => {

    try {
  
      const response = await axiosInstance.put(
        `/api/RescueAssignments/${assignmentId}/reject`,
        data || {}
      );
  
      return response.data;
  
    } catch (error) {
  
      console.error("REJECT ASSIGNMENT ERROR:", error);
  
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Không thể từ chối nhiệm vụ cứu hộ"
      );
  
    }
  
  };

export const getAllAssignments = async () => {

  try {

    const response = await axiosInstance.get(
      "/api/RescueAssignments"
    );

    return response.data;

  }
  catch (error) {

    console.error("Lỗi lấy danh sách assignments:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải danh sách điều phối cứu hộ"
    );

  }

};
export const getBusyRescueTeams = () => {

  return axiosInstance.get(
    "/api/RescueTeams/busy"
  );

};
/* ================= GET TEAM MEMBERS ================= */

export const getTeamMembers = async (teamId) => {

  try {

    const response = await axiosInstance.get(
      `/api/rescueteams/${teamId}/members`
    );

    return response.data;

  }
  catch (error) {

    console.error("Lỗi lấy members team:", error);

    return null; // không throw để tránh crash loop

  }

};
export const getAllUser = async () => {

  try {

    const response = await axiosInstance.get(
      "/api/User/all"   // FIX thêm dấu /
    );

    return response.data;

  } catch (error) {

    console.error("GET ALL USER ERROR:", error?.response);

    throw error?.response?.data || error;

  }

};
export const getAllVehicles = (params = {}) => {
  const query = {};

  if (params.q) query.q = params.q;
  if (params.type) query.type = params.type;
  if (params.status) query.status = params.status;

  if (params.includeDeleted !== undefined) {
    query.includeDeleted = params.includeDeleted;
  }

  return axiosInstance.get("/api/vehicles", { params: query });
};

export const getRescueTeamMembers = (teamId) => {

  return axiosInstance.get(`/api/rescueteams/${teamId}/members`);

};

export const getPendingRescueRequests = async (params = {}) => {

  try {

    const response = await axiosInstance.get(
      `/api/RescueRequests`,
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
export const getAllRescueTeams = () => {

  return axiosInstance.get("/api/RescueTeams");

};
/* ================= DEPART ASSIGNMENT ================= */

export const departRescueAssignment = async (assignmentId) => {

  try {

    const response = await axiosInstance.put(
      `/api/RescueAssignments/${assignmentId}/depart`
    );

    return response.data;

  }
  catch (error) {

    console.error("DEPART ASSIGNMENT ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể xuất phát nhiệm vụ"
    );

  }

};
/* ================= ARRIVE ASSIGNMENT ================= */

export const arriveRescueAssignment = async (assignmentId) => {

  try {

    const response = await axiosInstance.put(
      `/api/RescueAssignments/${assignmentId}/arrive`
    );

    return response.data;

  }
  catch (error) {

    console.error("ARRIVE ASSIGNMENT ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể cập nhật đã đến hiện trường"
    );

  }

};
/* ================= COMPLETE ASSIGNMENT ================= */

export const completeRescueAssignment = async (assignmentId) => {

  try {

    const response = await axiosInstance.put(
      `/api/RescueAssignments/${assignmentId}/complete`
    );

    return response.data;

  }
  catch (error) {

    console.error("COMPLETE ASSIGNMENT ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể hoàn thành nhiệm vụ"
    );

  }

};
/* ================= GET ALL DISTRIBUTIONS ================= */

export const getAllDistributions = async () => {

  try {

    const response = await axiosInstance.get(
      "/api/periodic-aid-distributions"
    );

    return response.data;

  } 
  catch (error) {

    console.error("Lỗi lấy distributions:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải danh sách cứu trợ"
    );

  }

};
/* ================= GET DISTRIBUTION DETAIL ================= */

export const getDistributionById = async (id) => {

  try {

    const response = await axiosInstance.get(
      `/api/periodic-aid-distributions/${id}`
    );

    return response.data;

  } 
  catch (error) {

    console.error("Lỗi lấy chi tiết distribution:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải chi tiết cứu trợ"
    );

  }

};
/* ================= UPDATE DISTRIBUTION STATUS ================= */

export const updateDistributionStatus = async (id, data) => {

  try {

    const response = await axiosInstance.put(
      `/api/periodic-aid-distributions/${id}/status`,
      data
    );

    return response.data;

  } 
  catch (error) {

    console.error("UPDATE DISTRIBUTION STATUS ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể cập nhật trạng thái cứu trợ"
    );

  }

};
/* ================= GET ALL AID CAMPAIGNS ================= */

export const getAllAidCampaigns = async () => {
  try {

    const response = await axiosInstance.get(
      "/api/PeriodicAidCampaigns"
    );

    return response.data;

  } catch (error) {

    console.error("GET AID CAMPAIGNS ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải danh sách chiến dịch cứu trợ"
    );

  }
};
export const getPeriodicAidCampaignById = async (id) => {
  try {

    const response = await axiosInstance.get(
      `/api/PeriodicAidCampaigns/${id}`
    );

    return response.data;

  } catch (error) {

    console.error("GET AID CAMPAIGN DETAIL ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải chi tiết chiến dịch cứu trợ"
    );

  }
};
export const getPeriodicAidDistributionDetails = async (distributionId) => {
  try {
    const response = await axiosInstance.get(
      `/api/periodic-aid-distribution-details/by-distribution/${distributionId}`,
      {
        headers: {
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching periodic aid distribution details:", error);
    throw error;
  }
};


export const getPeriodicAidBeneficiaries = async (id) => {
  try {
    const response = await axiosInstance.get(
      `/api/periodic-aid-beneficiaries/${id}`,
      {
        headers: {
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching periodic aid beneficiaries:", error);
    throw error;
  }
};
export const deletePeriodicAidDistributionDetail = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `/api/periodic-aid-distribution-details/${id}`,
      {
        headers: {
          accept: "*/*",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting periodic aid distribution detail:", error);
    throw error;
  }
};
export const confirmAllDistributionDetail = async (distributionId, beneficiaryId) => {
  try {
    if (!distributionId || !beneficiaryId) {
      throw new Error("Thiếu distributionId hoặc beneficiaryId");
    }

    const response = await axiosInstance.put(
      `/api/periodic-aid-distribution-details/distribution/${distributionId}/beneficiary/${beneficiaryId}/confirm-all`
    );

    return response.data;

  } catch (error) {

    console.error("CONFIRM ALL DISTRIBUTION DETAIL ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể xác nhận tất cả"
    );
  }
};
export const getSupplyPlansByCampaign = async (campaignId) => {
  try {
    if (!campaignId) {
      throw new Error("Thiếu campaignId");
    }

    const response = await axiosInstance.get(
      `/api/periodic-aid-supply-plans/by-campaign/${campaignId}`
    );

    return response.data;

  } catch (error) {

    console.error("GET SUPPLY PLANS BY CAMPAIGN ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể lấy danh sách kế hoạch"
    );
  }
};
export const getReliefWarehouses = async () => {
  try {
    const response = await axiosInstance.get(
      `/api/relief-warehouses`
    );

    return response.data;

  } catch (error) {

    console.error("GET RELIEF WAREHOUSES ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể lấy danh sách kho cứu trợ"
    );
  }
};
export const getReliefItems = async () => {
  try {
    const response = await axiosInstance.get(
      `/api/relief-items`
    );

    return response.data;

  } catch (error) {

    console.error("GET RELIEF ITEMS ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể lấy danh sách vật phẩm"
    );
  }
};
export const getBeneficiariesByCampaign = async (campaignId) => {
  try {
    if (!campaignId) {
      throw new Error("Thiếu campaignId");
    }

    const response = await axiosInstance.get(
      `/api/periodic-aid-beneficiaries/by-campaign/${campaignId}`
    );

    return response.data;

  } catch (error) {

    console.error("GET BENEFICIARIES BY CAMPAIGN ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể lấy danh sách người nhận"
    );
  }
};