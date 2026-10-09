import axiosInstance from "../../axiosInstance";


/* ================= GET ALL CAMPAIGNS ================= */

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
/* ================= CREATE CAMPAIGN ================= */

export const createAidCampaign = async (data) => {
    try {
  
      const response = await axiosInstance.post(
        "/api/PeriodicAidCampaigns",
        data
      );
  
      return response.data;
  
    } catch (error) {
  
      console.error("CREATE AID CAMPAIGN ERROR:", error);
  
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo chiến dịch cứu trợ"
      );
  
    }
  };
  export const updateAidCampaign = async (id, data) => {
    try {
  
      const response = await axiosInstance.put(
        `/api/PeriodicAidCampaigns/${id}`,
        data
      );
  
      return response.data;
  
    } catch (error) {
  
      console.error("UPDATE AID CAMPAIGN ERROR:", error);
  
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật chiến dịch cứu trợ"
      );
  
    }
  };
  export const deleteAidCampaign = async (id) => {
    try {
  
      const response = await axiosInstance.delete(
        `/api/PeriodicAidCampaigns/${id}`
      );
  
      return response.data;
  
    } catch (error) {
  
      console.error("DELETE AID CAMPAIGN ERROR:", error);
  
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Không thể xóa chiến dịch cứu trợ"
      );
  
    }
  };
  export const getBeneficiariesByCampaign = async (campaignId) => {
    try {
  
      const response = await axiosInstance.get(
        `/api/periodic-aid-beneficiaries/by-campaign/${campaignId}`
      );
  
      return response.data?.items || response.data || [];
  
    } catch (error) {
  
      console.error("GET BENEFICIARIES BY CAMPAIGN ERROR:", error);
  
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Không thể tải danh sách người nhận cứu trợ"
      );
  
    }
  };
  export const updateBeneficiary = async (id, data) => {
    try {
  
      const response = await axiosInstance.put(
        `/api/periodic-aid-beneficiaries/${id}`,
        data
      );
  
      return response.data;
  
    } catch (error) {
  
      console.error("UPDATE BENEFICIARY ERROR:", error);
  
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật người nhận cứu trợ"
      );
  
    }
  };
  export const deleteBeneficiary = async (id) => {
    try {
  
      const response = await axiosInstance.delete(
        `/api/periodic-aid-beneficiaries/${id}`
      );
  
      return response.data;
  
    } catch (error) {
  
      console.error("DELETE BENEFICIARY ERROR:", error);
  
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Không thể xóa người nhận cứu trợ"
      );
  
    }
  };
  export const createBeneficiary = async (data) => {
    try {
  
      const response = await axiosInstance.post(
        "/api/periodic-aid-beneficiaries",
        data
      );
  
      return response.data;
  
    } catch (error) {
  
      console.error("CREATE BENEFICIARY ERROR:", error);
  
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo người nhận cứu trợ"
      );
  
    }
  };