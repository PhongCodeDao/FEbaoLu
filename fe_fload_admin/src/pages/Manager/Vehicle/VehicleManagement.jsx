import VehicleManagementContainer from "../../../components/ManagerComponents/Vehicle/VehicleManagementContainer";
import "../../page-layout.css";
import "./VehicleManagement.css";

export default function VehicleManagement() {
  return (
    <div className="vehicle-page-wrapper">
      {/* EXECUTIVE COMMAND HERO BANNER */}
      <div className="vehicle-hero-banner">
        <div className="vehicle-hero-backdrop"></div>
        <div className="vehicle-hero-content">
          <div className="vehicle-hero-top">
            <div className="vehicle-hero-status-pill">
              <span className="vehicle-pulse-dot"></span>
              <span className="vehicle-status-text">HẠM ĐỘI CỨU HỘ 24/7</span>
              <span className="vehicle-status-divider">•</span>
              <span className="vehicle-time-text">Hệ thống định vị & phân bổ phương tiện</span>
            </div>
          </div>

          <div className="vehicle-hero-main">
            <div className="vehicle-hero-title-group">
              <div className="vehicle-hero-icon-wrap">
                🚐
              </div>
              <div>
                <h1 className="vehicle-hero-title">
                  Trung Tâm Điều Hành & Đội Xe Cứu Hộ
                </h1>
                <p className="vehicle-hero-subtitle">
                  Theo dõi trạng thái kỹ thuật, vị trí phân bổ, khả năng sẵn sàng xuất kích của ca nô, xuồng máy và xe lội nước
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="vehicle-page-content">
        <VehicleManagementContainer />
      </div>
    </div>
  );
}