import { useState } from "react";

import ListTeamSuccessful from "../../../components/RescueCoordinatorComponents/ListTeamSuccessful/ListTeamSuccessful";
import RescueReportDetail from "../../../components/RescueCoordinatorComponents/RescueReportDetail/RescueReportDetail";

import "./RescueReportPage.css";

export default function RescueReportPage() {
  const [selectedMission, setSelectedMission] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectMission = async (mission) => {
    setLoading(true);

    // giả lập load API
    setTimeout(() => {
      setSelectedMission(mission);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="rc-mission-dispatch">
      {/* LEFT */}
      <aside className="rc-mission-dispatch__sidebar">
        <ListTeamSuccessful onSelectMission={handleSelectMission} />
      </aside>

      {/* RIGHT */}
      <section className="rc-mission-dispatch__detail">
        {loading ? (
          <div className="rc-loading">
            {/* <div className="rc-spinner" /> */}
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <RescueReportDetail mission={selectedMission} />
        )}
      </section>
    </div>
  );
}
