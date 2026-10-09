import axiosInstance from "../../axiosInstance";


export const createTeamMember = (teamId, data) => {

  return axiosInstance.post(

    `/api/rescueteams/${teamId}/members`,

    {

      rescueTeamId: teamId,

      userId: data.userId,

      fullName: data.fullName,

      phone: data.phone,

      roleInTeam: data.roleInTeam,

    }

  );

};


export const createRescueTeam = (data) => {

  return axiosInstance.post(
    "/api/RescueTeams",
    {

      rcName: data.rcName,
      rcPhone: data.rcPhone,
      areaId: Number(data.areaId),
      rcStatus: data.rcStatus,

    }
  );

};
/**
 * Lấy tất cả đội cứu hộ
 */
export const getAllRescueTeams = () => {

  return axiosInstance.get("/api/RescueTeams");

};


/**
 * Lấy thành viên đội cứu hộ
 */
export const getRescueTeamMembers = (teamId) => {

  return axiosInstance.get(`/api/rescueteams/${teamId}/members`);

};


/**
 * Xóa thành viên khỏi đội
 */
export const deleteTeamMember = (teamId, userId) => {

  return axiosInstance.delete(

    `/api/rescueteams/${teamId}/members/${userId}`

  );

};


/**
 * Xóa đội cứu hộ
 */
export const deleteRescueTeam = (teamId) => {

  return axiosInstance.delete(

    `/api/RescueTeams/${teamId}`

  );

};


/**
 * Update đội cứu hộ
 */
export const updateRescueTeam = (teamId, data) => {

  return axiosInstance.put(

    `/api/RescueTeams/${teamId}`,

    data

  );

};


/**
 * Update thành viên đội
 */
export const updateTeamMember = (teamId, userId, data) => {

  return axiosInstance.put(

    `/api/rescueteams/${teamId}/members/${userId}`,

    data

  );

};


/**
 * ✅ NEW: Lấy vị trí đội cứu hộ
 */
export const getRescueTeamLocation = (teamId) => {

  return axiosInstance.get(

    `/api/rescueteams/${teamId}/location`

  );

};
export const updateRescueTeamLocation = (
  teamId,
  location
) => {
  return axiosInstance.put(
    `/api/rescueteams/${teamId}/location`,
    {
      location: location
    }
  );
};


/**
 * ✅ NEW: Lấy đội cứu hộ đang AVAILABLE
 */
export const getAvailableRescueTeams = () => {

  return axiosInstance.get(
    "/api/RescueTeams/available"
  );

};


/**
 * ✅ NEW: Lấy đội cứu hộ đang BUSY
 */
export const getBusyRescueTeams = () => {

  return axiosInstance.get(
    "/api/RescueTeams/busy"
  );

};

/* ================= TEAM VEHICLES ================= */

/**
 * 🔥 Lấy danh sách phương tiện của team (có sẵn nhưng chuẩn lại)
 */
export const getRescueTeamVehicles = (teamId, activeOnly = true) => {

  return axiosInstance.get(
    `/api/rescueteams/${teamId}/vehicles`,
    {
      params: { activeOnly }
    }
  );

};


/**
 * 🔥 Thêm phương tiện vào team
 */
export const addVehicleToTeam = (teamId, vehicleId) => {

  return axiosInstance.post(
    `/api/rescueteams/${teamId}/vehicles`,
    {
      vehicleId: vehicleId
    }
  );

};


/**
 * 🔥 Xóa phương tiện khỏi team
 */
export const removeVehicleFromTeam = (teamId, vehicleId) => {

  return axiosInstance.delete(
    `/api/rescueteams/${teamId}/vehicles/${vehicleId}`
  );

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