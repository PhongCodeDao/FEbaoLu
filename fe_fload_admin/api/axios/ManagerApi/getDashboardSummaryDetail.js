import axiosInstance from "../../axiosInstance";

const FINAL_REQUEST_STATUS_IDS = [5, 6];
const CLOSED_CAMPAIGN_STATUSES = ["COMPLETED", "CANCELLED", "CLOSED"];
const INACTIVE_ASSIGNMENT_STATUSES = ["COMPLETED", "REJECTED", "CANCELLED"];

const normalize = (response) => response?.data ?? response ?? [];

const isFinalRequest = (request) =>
  FINAL_REQUEST_STATUS_IDS.includes(Number(request?.statusId));

const isClosedCampaign = (campaign) =>
  CLOSED_CAMPAIGN_STATUSES.includes(
    String(campaign?.status || "").trim().toUpperCase()
  );

const isActiveAssignment = (assignment) =>
  !INACTIVE_ASSIGNMENT_STATUSES.includes(
    String(assignment?.assignmentStatus || "").trim().toUpperCase()
  );

const getAllRescueRequests = async () => {
  const response = await axiosInstance.get("/api/RescueRequests");
  return normalize(response);
};

const getAllRescueAssignments = async () => {
  const response = await axiosInstance.get("/api/RescueAssignments");
  return normalize(response);
};

const getAllUrgencyLevels = async () => {
  const response = await axiosInstance.get("/api/urgency-levels");
  return normalize(response);
};

const getAllCampaigns = async () => {
  const response = await axiosInstance.get("/api/PeriodicAidCampaigns");
  return normalize(response);
};

const getManagementDashboard = async () => {
  const response = await axiosInstance.get("/api/dashboard/management");
  return normalize(response);
};

const buildListPayload = (items, extra = {}) => ({
  items,
  total: items.length,
  ...extra,
});

const getTotalRequestsDetail = async () => {
  const requests = await getAllRescueRequests();
  return buildListPayload(requests);
};

const getOpenRequestsDetail = async () => {
  const requests = await getAllRescueRequests();
  const openRequests = requests.filter((request) => !isFinalRequest(request));

  return buildListPayload(openRequests);
};

const getCompletedRequestsDetail = async () => {
  const requests = await getAllRescueRequests();
  const completedRequests = requests.filter(
    (request) => Number(request?.statusId) === 5
  );

  return buildListPayload(completedRequests);
};

const getCompletedRequestsCount = async () => {
  const requests = await getAllRescueRequests();
  return requests.filter((request) => Number(request?.statusId) === 5).length;
};

const getLegacyAssignedRequestsDetail = async () => {
  const assignments = await getAllRescueAssignments();
  const activeAssignments = assignments.filter(isActiveAssignment);

  return buildListPayload(activeAssignments);
};

const getOverdueRequestsDetail = async () => {
  const [requests, urgencyLevels] = await Promise.all([
    getAllRescueRequests(),
    getAllUrgencyLevels(),
  ]);

  const urgencyLevelMap = new Map(
    urgencyLevels.map((level) => [Number(level.urgencyLevelId), level])
  );

  const now = Date.now();
  const overdueRequests = requests.filter((request) => {
    if (isFinalRequest(request)) {
      return false;
    }

    const urgencyLevel = urgencyLevelMap.get(Number(request?.urgencyLevelId));
    const slaMinutes = Number(urgencyLevel?.slaMinutes);
    const createdAt = request?.createdAt ? new Date(request.createdAt).getTime() : null;

    if (!createdAt || !Number.isFinite(slaMinutes) || slaMinutes <= 0) {
      return false;
    }

    return createdAt + slaMinutes * 60 * 1000 < now;
  });

  return buildListPayload(overdueRequests, {
    note: "Được tính ở FE theo công thức createdAt + slaMinutes vì backend chưa có endpoint chi tiết riêng cho quá hạn.",
  });
};

const getCampaignsDetail = async () => {
  const campaigns = await getAllCampaigns();
  const activeCampaigns = campaigns.filter((campaign) => !isClosedCampaign(campaign));

  return buildListPayload(activeCampaigns);
};

const getInventoryAlertsDetail = async () => {
  const dashboard = await getManagementDashboard();
  const inventoryAlerts = Array.isArray(dashboard?.inventoryAlerts)
    ? dashboard.inventoryAlerts
    : [];

  return buildListPayload(inventoryAlerts, {
    note: "Backend hiện chưa có endpoint chi tiết riêng cho thẻ cảnh báo kho, đang dùng inventoryAlerts từ dashboard management.",
  });
};

const summaryDetailResolvers = {
  total: getTotalRequestsDetail,
  open: getOpenRequestsDetail,
  completed: getCompletedRequestsDetail,
  assigned: getLegacyAssignedRequestsDetail,
  overdue: getOverdueRequestsDetail,
  campaign: getCampaignsDetail,
  stock: getInventoryAlertsDetail,
};

export const getDashboardSummaryDetail = async (summaryKey) => {
  try {
    const resolver = summaryDetailResolvers[summaryKey];

    if (!resolver) {
      throw new Error(`Không tìm thấy xử lý cho thẻ: ${summaryKey}`);
    }

    return await resolver();
  } catch (error) {
    console.error("GET DASHBOARD SUMMARY DETAIL ERROR:", error);

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Không thể tải dữ liệu chi tiết dashboard"
    );
  }
};

export { getCompletedRequestsCount, getLegacyAssignedRequestsDetail };