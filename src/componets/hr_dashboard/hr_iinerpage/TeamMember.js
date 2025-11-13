import React from 'react'
import { Card } from 'react-bootstrap'
import Women from "../../../assets/images/women.jpg";
import "../../../assets/css/Teammember.css";

function TeamMember() {
  return (
    <div>
<Card className='mt-'>
    <div className="d-flex justify-content-between align-items-center">
  <h3 className="mb-0">Team Members</h3>
  <p className="mb-0 text-primary" style={{ cursor: "pointer" }}>
    See all
  </p>
</div>
<div className=''>
    <img src={Women} alt="team" className='img-fluid br-team-img'></img>
</div>


</Card>

    </div>
  )
}

export default TeamMember