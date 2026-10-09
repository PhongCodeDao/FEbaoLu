import axiosInstance from "../../axiosInstance";

/* ================= GET DASHBOARD MANAGEMENT ================= */

export const getDashboardManagement = async (fromDate, toDate) => {
  try {

    const response = await axiosInstance.get(
      "/api/dashboard/management",
      {
        params: {
          fromDate,
          toDate,
        },
      }
    );

    return response.data;

  } catch (error) {

    console.error("GET DASHBOARD ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải dữ liệu dashboard"
    );

  }
};