import { useState } from "react";
import MissionHistory from "../../../components/RescueTeamComponents/HistoryComponentsTask/RescueMissionHistory/MissionHistory";
import DistributionListRescueHistory from "../../../pages/RescueTeam/DistributionListCuuTro/ListTaskCompletedHistory/DistributionListRescueHistory";

import "./HistoryNavigator.css";

export default function HistoryNavigator() {

  const [activeTab, setActiveTab] = useState("mission");

  return (
    <div className="hn-container">

      {/* ===== BUTTON NAV ===== */}
      <div className="hn-tabs">
        <button
          className={activeTab === "mission" ? "active" : ""}
          onClick={() => setActiveTab("mission")}
        >
           Lịch sử nhiệm vụ
        </button>

        <button
          className={activeTab === "distribution" ? "active" : ""}
          onClick={() => setActiveTab("distribution")}
        >
           Lịch sử cứu trợ
        </button>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="hn-content">

        {activeTab === "mission" && <MissionHistory />}

        {activeTab === "distribution" && <DistributionListRescueHistory />}

      </div>

    </div>
  );
}