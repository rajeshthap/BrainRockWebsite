import React from "react";
import "../../assets/css/LeftNav.css";
// import "../../../assets/CSS/DashBoard.css";
import { Col, Row } from "react-bootstrap";
import Card from 'react-bootstrap/Card';

import { FaHandsPraying } from "react-icons/fa6";
import { Link } from "react-router-dom";
import LeftNav from "./LeftNav";

const InnerDashBoard = () => {
    return (
        <>
            {/* Main Wrapper */}
            <div className="dashboard-wrapper">
                {/* Sidebar */}
                <aside className="sidebar">
                    <LeftNav />
                </aside>

                {/* Right-hand Main Container */}
                <main className="main-container">
                    <div className="content-box">

                        <h1>Dashboard</h1>
                      
                    </div>
                </main>
            </div>
        </>
    );
};

export default InnerDashBoard;
