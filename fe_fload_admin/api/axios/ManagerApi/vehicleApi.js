import axiosInstance from "../../axiosInstance";
import axios from "axios";

/* ================= SAFE NUMBER ================= */

const safeNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

/* =========================================================
   ======================== VEHICLES ========================
   ========================================================= */

/* GET ALL VEHICLES */
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


/* GET VEHICLE BY ID */
export const getVehicleById = (id) => {
  const safeId = safeNumber(id);
  if (!safeId) throw new Error("Invalid vehicleId");

  return axiosInstance.get(`/api/vehicles/${safeId}`);
};


/* CREATE VEHICLE */
export const createVehicle = (data) => {
  return axiosInstance.post("/api/vehicles", {
    vehicleType: data.vehicleType || "",
    vehicleName: data.vehicleName || "",
    vehicleLocation: data.vehicleLocation || "",
    vehicleStatus: data.vehicleStatus || "",
  });
};


/* UPDATE VEHICLE */
export const updateVehicle = (id, data) => {
  const safeId = safeNumber(id);
  if (!safeId) throw new Error("Invalid vehicleId");

  return axiosInstance.put(`/api/vehicles/${safeId}`, {
    vehicleType: data.vehicleType || "",
    vehicleName: data.vehicleName || "",
    vehicleLocation: data.vehicleLocation || "",
    vehicleStatus: data.vehicleStatus || "",
  });
};


/* DELETE VEHICLE */
export const deleteVehicle = (id) => {
  const safeId = safeNumber(id);
  if (!safeId) throw new Error("Invalid vehicleId");

  return axiosInstance.delete(`/api/vehicles/${safeId}`);
};

/* UPLOAD IMAGE */
export const uploadCommonImage = (file, folder = "vehicles") => {
  const formData = new FormData();
  formData.append("File", file);
  formData.append("Folder", folder);

  const token =
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "multipart/form-data",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return axios
    .post("/upload-api/api/Upload/image", formData, { headers })
    .catch((error) => {
      // Fallback direct API call in case local proxy is unavailable.
      const directUrl = `${(import.meta.env.VITE_API_URL || "").replace(/\/$/, "")}/api/Upload/image`;
      return axios.post(directUrl, formData, { headers }).catch(() => {
        throw error;
      });
    });
};

/* PATCH VEHICLE IMAGE */
export const updateVehicleImage = (id, vehicleImg) => {
  const safeId = safeNumber(id);
  if (!safeId) throw new Error("Invalid vehicleId");

  return axiosInstance.patch(`/api/vehicles/${safeId}/image`, {
    vehicleImg: vehicleImg || "",
  });
};