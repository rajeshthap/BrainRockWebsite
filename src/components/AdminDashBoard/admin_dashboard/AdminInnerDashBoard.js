import React, { useEffect, useState } from "react";
import "../../../assets/css/AdminLeftNav.css";
import axios from "axios";
// import "../../../assets/CSS/DashBoard.css";


import AdminLeftNav from "./AdminLeftNav";


const AdminInnerDashBoard = () => {


    return (
        <>
            {/* Main Wrapper */}
            <div className="dashboard-wrapper">
                {/* Sidebar */}
                <aside className="sidebar">
                    <AdminLeftNav />
                </aside>

                {/* Right-hand Main Container */}
                <main className="main-container">
                    <div className="content-box">

 
                         Admin DashBoard
     

                      
                    </div>
                </main>
            </div>
        </>
    );
};

export default AdminInnerDashBoard;
