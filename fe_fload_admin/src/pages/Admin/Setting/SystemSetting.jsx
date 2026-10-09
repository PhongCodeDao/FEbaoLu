import SystemSettingContainer from "../../../components/AdminComponents/Setting/SystemSettingContainer";
import "../../page-layout.css";

export default function SystemSetting() {
  return (
    <div className="page-shell">

      <div className="page-shell__header">
        <div className="page-shell__header-left">
          <div className="page-shell__icon" style={{ background: "#f0fdf4" }}>
            ⚙️
          </div>
          <div>
            <h2 className="page-shell__title">Cài đặt hệ thống</h2>
            <p className="page-shell__subtitle">Cấu hình các thông số và hằng số vận hành hệ thống</p>
          </div>
        </div>
      </div>

      <div className="page-shell__body">
        <SystemSettingContainer />
      </div>

    </div>
  );
}
