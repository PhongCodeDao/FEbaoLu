import { useState } from "react";
import "./RescueSidebar.css";

import RescueHistory from "./History/RescueHistory";
import RescueTeamList from "./TeamList/RescueTeamList";

import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";

import RestoreIcon from "@mui/icons-material/Restore";
import GroupIcon from "@mui/icons-material/Group";

const RescueSidebar = () => {
  const [value, setValue] = useState(0);

  return (
    <aside className="rescue-sidebar">
      {/* Content */}
      <div className="sidebar-content">
        {value === 0 && <RescueHistory />}
        {value === 1 && <RescueTeamList />}
      </div>

      {/* Bottom Navigator */}
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        className="sidebar-bottom-nav"
      >
        <BottomNavigationAction
          label="Tra Cứu Yêu Cầu"
          icon={<RestoreIcon />}
        />
        <BottomNavigationAction
          label="Đội Cứu Hộ"
          icon={<GroupIcon />}
        />
      </BottomNavigation>
    </aside>
  );
};

export default RescueSidebar;