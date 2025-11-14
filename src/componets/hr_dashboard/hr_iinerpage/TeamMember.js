import React from "react";
import { Card } from "react-bootstrap";
import Women from "../../../assets/images/women.jpg";
import "../../../assets/css/Teammember.css";

function TeamMember() {
  return (
    <div>
      <Card className="br-team-card p-3 shadow-sm">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">Team Members</h3>
          <p className="mb-0 text-primary" style={{ cursor: "pointer" }}>
            See all
          </p>
        </div>

        {/* Team Member Row */}
        <div className="d-flex justify-content-between flex-wrap">
          <div className="text-center">
            <img
              src={Women}
              alt="team"
              className="img-fluid br-team-img br-team-img-checked mb-2"
            />
            <p className="text-muted mb-0">Checked</p>
          </div>

          <div className="text-center">
            <img
              src={Women}
              alt="team"
              className="img-fluid br-team-img  br-leave-img mb-2"
            />
            <p className="text-muted mb-0">On Leave</p>
          </div>

          <div className="text-center">
            <img
              src={Women}
              alt="team"
              className="img-fluid br-team-img mb-2"
            />
            <p className="text-muted mb-0">Present</p>
          </div>

          <div className="text-center">
            <img
              src={Women}
              alt="team"
              className="img-fluid br-team-img br-wfh-img mb-2"
            />
            <p className="text-muted mb-0">WFH</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default TeamMember;
