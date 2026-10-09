import { useState } from "react";

import MissionListRescue from "../../../components/RescueTeamComponents/ListTaskMission/MissionListRescue";
import DistributionListRescue from "../../../components/RescueTeamComponents/HistoryComponentsTask/DistributionListRescue";

import "./TaskNavigator.css";

export default function TaskNavigator() {

  const [activeTab, setActiveTab] = useState("mission");

  return (
    <div className="tn-container">

      {/* ===== TAB BUTTON ===== */}
      <div className="tn-tabs">

        <button
          className={activeTab === "mission" ? "active" : ""}
          onClick={() => setActiveTab("mission")}
        >
           Nhiệm vụ cứu hộ
        </button>

        <button
          className={activeTab === "distribution" ? "active" : ""}
          onClick={() => setActiveTab("distribution")}
        >
           Nhiệm vụ cứu trợ
        </button>

      </div>

      {/* ===== CONTENT ===== */}
      <div className="tn-content">

        {activeTab === "mission" && <MissionListRescue />}

        {activeTab === "distribution" && <DistributionListRescue />}

      </div>

    </div>
  );
}