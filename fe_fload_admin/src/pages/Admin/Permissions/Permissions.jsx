import PermissionsContainer from "../../../components/AdminComponents/Permissions/PermissionsContainer";
import "../../page-layout.css";

export default function Permissions() {
  return (
    <div className="page-shell">

      <div className="page-shell__header">
        <div className="page-shell__header-left">
          <div className="page-shell__icon" style={{ background: "#fdf4ff" }}>
            🔐
          </div>
          <div>
            <h2 className="page-shell__title">Quản lý phân quyền</h2>
            <p className="page-shell__subtitle">Cấu hình quyền hạn chi tiết theo role và chức năng</p>
          </div>
        </div>
      </div>

      <div className="page-shell__body">
        <PermissionsContainer />
      </div>

    </div>
  );
}
