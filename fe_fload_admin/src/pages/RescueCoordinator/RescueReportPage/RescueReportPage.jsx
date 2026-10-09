import { useState } from "react";
import ListTeamSuccessful from "../../../components/RescueCoordinatorComponents/ListTeamSuccessful/ListTeamSuccessful";
import RescueReportDetail from "../../../components/RescueCoordinatorComponents/RescueReportDetail/RescueReportDetail";
import { Spin } from "antd";

import "./RescueReportPage.css";

export default function RescueReportPage() {
  const [selectedMission, setSelectedMission] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectMission = async (mission) => {
    setLoading(true);
    setTimeout(() => {
      setSelectedMission(mission);
      setLoading(false);
    }, 250);
  };

  return (
    <div className="rc-report-page">
      {/* LEFT LIST */}
      <aside className="rc-report-page__sidebar">
        <ListTeamSuccessful
          onSelectMission={handleSelectMission}
          selectedMissionId={selectedMission?.id}
        />
      </aside>

      {/* RIGHT REPORT */}
      <section className="rc-report-page__detail">
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>Đang trích xuất hồ sơ nghiệm thu...</p>
          </div>
        ) : (
          <RescueReportDetail mission={selectedMission} />
        )}
      </section>
    </div>
  );
}
