import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import MainLayout from "../pages/mainLayout";
import RequireAuth from "./PrivateRoute";

/* ================= ADMIN ================= */
import UserManagement from "../pages/Admin/UserRoleManagement/UserManagement";
import SystemSetting from "../pages/Admin/Setting/SystemSetting";
import Logs from "../pages/Admin/Logs/LogsChange";
import Permissions from "../pages/Admin/Permissions/Permissions";
import CampaignPage from "../pages/Admin/CampaignAdmin/CampaignPage";
import BeneficiaryPage from "../pages/Admin/CampaignAdmin/BeneficiaryPageAdmin/BeneficiaryPage";


/* ================= MANAGER ================= */
import DashboardOverview from "../pages/Manager/Dashboard/DashboardOverview";
import Vehicle from "../pages/Manager/Vehicle/VehicleManagement";
import Inventory from "../pages/Manager/Inventory/InventoryManagement";
import ApprovalManagement from "../pages/Manager/Approval/ApprovalManagement";
import ManagerRescueTeam from "../pages/Manager/RescueTeamRoleManagement/RescueTeamManagement";
import CampaignPageManagerSuply from "../pages/Manager/CompaningManagerMent/CampaignPageManagerSuply";
import SupplyPlanPage from "../pages/Manager/CompaningManagerMent/SuplyPlanPageDeatilManager/SupplyPlanPage";
import DistributionPage from "../pages/Manager/PlanDistributionManager/DistributionPage";
import DistributionDetailPage from "../pages/Manager/PlanDistributionManager/DistributionDetailPage";


/* ================= COORDINATOR ================= */
import CoordinatorDispatch from "../pages/RescueCoordinator/MissionDispatch/MissionDispatch";
import DispatchMapPage from "../pages/RescueCoordinator/DispatchMapPage/DispatchMapPage";
import RescueOperationLayout from "../pages/RescueCoordinator/RescueOperationLayout/RescueOperationLayout";
import RescueReportPage from "../pages/RescueCoordinator/RescueReportPage/RescueReportPage";



/* ================= RESCUE ================= */
import TaskNavigator from "../pages/RescueTeam/TaskRescueTeam/TaskNavigator";
import MissionDetailRescue from "../pages/RescueTeam/RescueMission/DetailRescueMission/MissionDetailRescue";
import HistoryNavigator from "../pages/RescueTeam/HistoryTastRescueTeam/HistoryNavigator";
import MissionInProgress from "../pages/RescueTeam/RescueMissionProgress/MissionInProgress";
import RescueMissionComplete from "../pages/RescueTeam/MissionComplete/RescueMissionComplete";
import TeamMembersMisionList from "../pages/RescueTeam/ListTeamRerscueMission/TeamMembersMisionList";
import DistributionDetail from "../pages/RescueTeam/DistributionListCuuTro/DetailCuuHo/DistributionDetail";
import TaskDashboard from "../pages/RescueTeam/DashboardTaskRescue/TaskDashboardForTeam";
import TaskDistributionDetailPage from "../pages/RescueTeam/DistributionListCuuTro/TaskCuuTroForTeam/TaskDistributionDetailPage";


export default function AppRoutes() {
  const isAuth = sessionStorage.getItem("isAuth") === "true";
   const role    = sessionStorage.getItem("role");

  const redirectByRole = {
    admin: "/admin/user",
    manager: "/manager",
    coordinator: "/coordinator",
    rescue: "/rescue",
  };

  return (
    <Routes>
      {/* ================= LOGIN ================= */}
      <Route path="/login" element={<Login />} />

      {/* ================= ADMIN ================= */}
      <Route
        path="/admin"
        element={
          <RequireAuth role="admin">
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="user" replace />} />
        <Route path="user" element={<UserManagement />} />
        <Route path="settings" element={<SystemSetting />} />
        <Route path="logs" element={<Logs />} />
        <Route path="permissions" element={<Permissions />} />
        <Route path="chien-dich-cuu-tro" element={<CampaignPage />} />
        <Route path="chien-dich-cuu-tro/:id" element={<BeneficiaryPage />} />
        
        
      </Route>

      {/* ================= MANAGER ================= */}
      <Route
        path="/manager"
        element={
          <RequireAuth role="manager">
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="vehicles" element={<Vehicle />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="approve" element={<ApprovalManagement />} />
        <Route path="rescue-team" element={<ManagerRescueTeam />} />
        <Route path="ke-hoach-cuu-tro" element={<CampaignPageManagerSuply />} />
        <Route path="ke-hoach-cuu-tro/:id" element={<SupplyPlanPage />} />
        <Route path="team-cuu-tro" element={<DistributionPage />} />
        <Route path="team-cuu-tro/:id" element={<DistributionDetailPage />} />
        
        
      </Route>

      {/* ================= COORDINATOR ================= */}
      <Route
        path="/coordinator"
        element={
          <RequireAuth role="coordinator">
            <MainLayout />
          </RequireAuth>
        }
      >
      <Route index element={<CoordinatorDispatch />} />
      <Route path="dang" element={< DispatchMapPage/>} />
      <Route path="mina" element={<RescueOperationLayout />} />
      <Route path="reports" element={<RescueReportPage />} />
      </Route>

      {/* ================= RESCUE ================= */}
      <Route
        path="/rescueTeam"
        element={
          <RequireAuth role="rescueteam">
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route index element={<TaskNavigator />} />
        <Route path="mission/:id" element={<MissionDetailRescue />} />
        <Route path="history" element={<HistoryNavigator />} />
        <Route path="history/:id" element={<RescueMissionComplete />} />
        <Route path="/rescueTeam/dangcuho/:id" element={<MissionInProgress />} />
        <Route path="/rescueTeam/list-member" element={<TeamMembersMisionList />} />    
        <Route path="/rescueTeam/cuu-tro/:id" element={<DistributionDetail />} />
        <Route path="dashboard-task" element={<TaskDashboard />} />
        <Route path="/rescueTeam/chi-tiet-tro/:id" element={<TaskDistributionDetailPage />} />
    
        

      </Route>
      
      {/* ================= ROOT ================= */}
      <Route
        path="/"
        element={
          isAuth && role && redirectByRole[role] ? (
            <Navigate to={redirectByRole[role]} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
