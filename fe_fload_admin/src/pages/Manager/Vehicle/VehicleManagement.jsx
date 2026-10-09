import VehicleManagementContainer from "../../../components/ManagerComponents/Vehicle/VehicleManagementContainer";
import "../../page-layout.css";

export default function VehicleManagement() {
  return (
    <div className="page-shell">

      <div className="page-shell__header">
        <div className="page-shell__header-left">
          <div className="page-shell__icon" style={{ background: "#f0f9ff" }}>
            🚐
          </div>
          <div>
            <h2 className="page-shell__title">Quản lý phương tiện</h2>
            <p className="page-shell__subtitle">Theo dõi trạng thái và quản lý đội xe cứu hộ</p>
          </div>
        </div>
      </div>

      <div className="page-shell__body">
        <VehicleManagementContainer />
      </div>

    </div>
  );
}