
import adminIcon from "../../assets/admin.png";
import managerIcon from "../../assets/manager.svg";
import coordinatorIcon from "../../assets/coordinator.svg";
import rescueIcon from "../../assets/rescueTeam.svg";
import "./rc-hd.header.css";

export default function Header() {
  const role = sessionStorage.getItem("role") || "admin";

  const roleInfo = {
    admin: {
      title: "Admin",
      subtitle: "Quản lý hệ thống cấp cao",
      icon: <img src={adminIcon} alt="admin" className="role-icon" />,
    },
  
    manager: {
      title: "Rescue Manager",
      subtitle: "Quản lý đội, phương tiện và kho hàng",
      icon: <img src={managerIcon} alt="manager" className="role-icon" />,
    },
  
    coordinator: {
      title: "Rescue Coordinator",
      subtitle: "Xác minh và điều phối cứu hộ",
      icon: <img src={coordinatorIcon} alt="coordinator" className="role-icon" />,
    },
  
    rescueteam: {
      title: "Rescue Team",
      subtitle: "Nhận nhiệm vụ và cứu hộ",
      icon: <img src={rescueIcon} alt="team" className="role-icon" />,
    },
  };

  const currentRole = roleInfo[role] || roleInfo.admin;

  return (
<header className="rc-hd">

{/* LEFT */}
<div className="rc-hd__left">
  <div className="rc-hd__logo-icon">
    {currentRole.icon}
  </div>

  <div className="rc-hd__logo-text">
    <h3>{currentRole.title}</h3>
    <span>{currentRole.subtitle}</span>
  </div>
</div>

{/* RIGHT */}
<div className="rc-hd__actions">


  <span className="rc-hd__lang">
          Ngôn Ngữ: VN
        </span>

</div>

</header>
  );
}
