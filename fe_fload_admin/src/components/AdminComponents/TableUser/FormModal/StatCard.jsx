import "./StatCard.css";
import {
  TeamOutlined,
  CrownOutlined,
  DashboardOutlined,
  CompassOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";

export default function StatCard({
  title,
  value,
  type,
  active,
  onClick,
}) {
  const getIcon = () => {
    switch (type) {
      case "admin":
        return <CrownOutlined className="stat-icon-svg" />;
      case "manager":
        return <DashboardOutlined className="stat-icon-svg" />;
      case "RescueCoordinator":
      case "coordinator":
        return <CompassOutlined className="stat-icon-svg" />;
      case "RescueTeam":
      case "rescueteam":
        return <MedicineBoxOutlined className="stat-icon-svg" />;
      default:
        return <TeamOutlined className="stat-icon-svg" />;
    }
  };

  const getSubtext = () => {
    switch (type) {
      case "admin":
        return "Quản trị viên";
      case "manager":
        return "Quản lý tổng";
      case "RescueCoordinator":
      case "coordinator":
        return "Điều phối viên";
      case "RescueTeam":
      case "rescueteam":
        return "Đội cứu nạn";
      default:
        return "Tất cả tài khoản";
    }
  };

  return (
    <div
      className={`statCard ${type} ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <div className="statCard__top">
        <div className={`statCard__icon-wrap ${type}`}>
          {getIcon()}
        </div>
        <span className="statCard__pill">{getSubtext()}</span>
      </div>

      <div className="statCard__main">
        <div className="statCard__value">{value ?? 0}</div>
        <div className="statCard__title">{title}</div>
      </div>

      <div className="statCard__bar">
        <div className={`statCard__bar-inner ${type}`} />
      </div>
    </div>
  );
}