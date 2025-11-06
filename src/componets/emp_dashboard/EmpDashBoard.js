import React, { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Nav,
    Button,
    Badge,
    Dropdown,
    Image,
    Offcanvas,
    Card,
    Table,
    Collapse
} from 'react-bootstrap';
import {
    FaBars,
    FaBell,
    FaUserCircle,
    FaTachometerAlt,
    FaChartLine,
    FaUsers,
    FaCog,
    FaFileAlt,
    FaSignOutAlt,
    FaSearch,
    FaEnvelope,
    FaCalendarAlt,
    FaShoppingCart,
    FaPlus,
    FaChevronDown,
    FaChevronRight
} from 'react-icons/fa';
import "../../assets/css/emp_dashboard.css"

const EmpDashBoard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [openSubmenu, setOpenSubmenu] = useState(null);
    const [notifications, setNotifications] = useState([
        { id: 1, text: 'New message from John', time: '2 min ago', read: false },
        { id: 2, text: 'Your order has been shipped', time: '1 hour ago', read: false },
        { id: 3, text: 'Weekly report is ready', time: '3 hours ago', read: true },
    ]);
    const [unreadCount, setUnreadCount] = useState(2);

    // Check if we're on mobile or tablet
    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1024);

            if (width < 768) {
                setSidebarOpen(false); // Close sidebar on mobile
            } else if (width >= 768 && width < 1024) {
                setSidebarOpen(false); // Close sidebar on tablet by default
            } else {
                setSidebarOpen(true); // Open sidebar on desktop
            }
        };

        // Initial check
        checkDevice();

        // Add event listener for window resize
        window.addEventListener('resize', checkDevice);

        // Cleanup
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const toggleSubmenu = (index) => {
        if (openSubmenu === index) {
            setOpenSubmenu(null);
        } else {
            setOpenSubmenu(index);
        }
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
        ));
        setUnreadCount(prev => prev - 1);
    };

    const menuItems = [
        {
            icon: <FaTachometerAlt />,
            label: 'Dashboard',
            active: true
        },
        {
            icon: <FaChartLine />,
            label: 'Analytics',
            submenu: [
                { label: 'Overview' },
                { label: 'Statistics' },
                { label: 'Reports' },
                { label: 'Real-time' }
            ]
        },
        { icon: <FaUsers />, label: 'Users' },
        { icon: <FaShoppingCart />, label: 'Orders' },
        { icon: <FaEnvelope />, label: 'Messages' },
        { icon: <FaCalendarAlt />, label: 'Calendar' },
        { icon: <FaFileAlt />, label: 'Documents' },
        { icon: <FaCog />, label: 'Settings' },
    ];

    const statsData = [
        { title: 'Total Revenue', value: '$45,231', change: '+12.5%', icon: <FaChartLine /> },
        { title: 'New Users', value: '2,350', change: '+8.2%', icon: <FaUsers /> },
        { title: 'Orders', value: '1,234', change: '+5.7%', icon: <FaShoppingCart /> },
        { title: 'Conversion Rate', value: '3.24%', change: '+1.2%', icon: <FaTachometerAlt /> },
    ];

    const recentOrders = [
        { id: '#12345', customer: 'John Doe', amount: '$125.00', status: 'Delivered' },
        { id: '#12346', customer: 'Jane Smith', amount: '$89.50', status: 'Processing' },
        { id: '#12347', customer: 'Bob Johnson', amount: '$210.00', status: 'Shipped' },
        { id: '#12348', customer: 'Alice Brown', amount: '$75.25', status: 'Pending' },
    ];

    return (
        <div className="dashboard-container">
            {/* Sidebar - Hidden on mobile and tablet */}
            <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <div className="sidebar-header">
                    <div className="logo-container">
                        <div className="logo">
                            <span className="logo-icon">D</span>
                            <span className="logo-text">Dashboard</span>
                        </div>
                    </div>
                </div>

                <Nav className="sidebar-nav flex-column">
                    {menuItems.map((item, index) => (
                        <div key={index}>
                            <Nav.Link
                                className={`nav-item ${item.active ? 'active' : ''}`}
                                onClick={() => item.submenu ? toggleSubmenu(index) : null}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-text">{item.label}</span>
                                {item.submenu && (
                                    <span className="submenu-arrow">
                                        {openSubmenu === index ? <FaChevronDown /> : <FaChevronRight />}
                                    </span>
                                )}
                            </Nav.Link>

                            {item.submenu && (
                                <Collapse in={openSubmenu === index}>
                                    <div className="submenu-container">
                                        {item.submenu.map((subItem, subIndex) => (
                                            <Nav.Link
                                                key={subIndex}
                                                className="submenu-item"
                                                href="#"
                                            >
                                                <span className="nav-text">{subItem.label}</span>
                                            </Nav.Link>
                                        ))}
                                    </div>
                                </Collapse>
                            )}
                        </div>
                    ))}
                </Nav>

                <div className="sidebar-footer">
                    <Nav.Link className="nav-item logout-btn" href="#">
                        <span className="nav-icon"><FaSignOutAlt /></span>
                        <span className="nav-text">Logout</span>
                    </Nav.Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Header */}
                <header className="dashboard-header">
                    <Container fluid>
                        <Row className="align-items-center">
                            <Col xs="auto">
                                <Button
                                    variant="light"
                                    className="sidebar-toggle"
                                    onClick={toggleSidebar}
                                >
                                    <FaBars />
                                </Button>
                            </Col>

                            <Col>
                                <div className="search-bar">
                                    <FaSearch className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="search-input"
                                    />
                                </div>
                            </Col>

                            <Col xs="auto">
                                <div className="header-actions">
                                    {/* Notifications */}
                                    <Dropdown align="end">
                                        <Dropdown.Toggle variant="light" className="notification-btn">
                                            <FaBell />
                                            {unreadCount > 0 && (
                                                <Badge pill bg="danger" className="notification-badge">
                                                    {unreadCount}
                                                </Badge>
                                            )}
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu className="notification-dropdown">
                                            <div className="notification-header">
                                                <h6>Notifications</h6>
                                                <Button variant="link" size="sm">Mark all as read</Button>
                                            </div>
                                            {notifications.map(notif => (
                                                <Dropdown.Item
                                                    key={notif.id}
                                                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                                    onClick={() => markAsRead(notif.id)}
                                                >
                                                    <div className="notification-content">
                                                        <p>{notif.text}</p>
                                                        <small>{notif.time}</small>
                                                    </div>
                                                    {!notif.read && <div className="unread-dot"></div>}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown>

                                    {/* User Profile */}
                                    <Dropdown align="end">
                                        <Dropdown.Toggle variant="light" className="user-profile-btn">
                                            <Image
                                                src="https://picsum.photos/seed/user123/40/40.jpg"
                                                roundedCircle
                                                className="user-avatar"
                                            />
                                            <span className="user-name d-none d-md-inline">John Doe</span>
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu>
                                            <Dropdown.Item href="#">
                                                <FaUserCircle className="me-2" /> Profile
                                            </Dropdown.Item>
                                            <Dropdown.Item href="#">
                                                <FaCog className="me-2" /> Settings
                                            </Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item href="#">
                                                <FaSignOutAlt className="me-2" /> Logout
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </header>

                {/* Dashboard Content */}
                <Container fluid className="dashboard-body">
                    <Row className="mb-4">
                        <Col>
                            <h1 className="page-title">Dashboard Overview</h1>
                            <p className="text-muted">Welcome back! Here's what's happening today.</p>
                        </Col>
                    </Row>

                    {/* Stats Cards */}
                    <Row className="mb-4">
                        {statsData.map((stat, index) => (
                            <Col lg={3} md={6} sm={6} className="mb-3" key={index}>
                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-content">
                                            <div className="stat-icon">
                                                {stat.icon}
                                            </div>
                                            <div className="stat-info">
                                                <h6 className="stat-title">{stat.title}</h6>
                                                <h3 className="stat-value">{stat.value}</h3>
                                                <span className="stat-change positive">{stat.change}</span>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Recent Orders Table */}
                    <Row>
                        <Col lg={8} md={12}>
                            <Card className="recent-orders-card">
                                <Card.Header>
                                    <h5 className="card-title">Recent Orders</h5>
                                    <Button variant="link" size="sm">View All</Button>
                                </Card.Header>
                                <Card.Body>
                                    <div className="table-responsive">
                                        <Table hover>
                                            <thead>
                                                <tr>
                                                    <th>Order ID</th>
                                                    <th>Customer</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentOrders.map((order, index) => (
                                                    <tr key={index}>
                                                        <td>{order.id}</td>
                                                        <td>{order.customer}</td>
                                                        <td>{order.amount}</td>
                                                        <td>
                                                            <Badge
                                                                bg={
                                                                    order.status === 'Delivered' ? 'success' :
                                                                        order.status === 'Processing' ? 'warning' :
                                                                            order.status === 'Shipped' ? 'info' : 'secondary'
                                                                }
                                                            >
                                                                {order.status}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={4} md={12}>
                            <Card className="quick-actions-card">
                                <Card.Header>
                                    <h5 className="card-title">Quick Actions</h5>
                                </Card.Header>
                                <Card.Body>
                                    <div className="quick-actions">
                                        <Button variant="primary" className="w-100 mb-2">
                                            <FaPlus className="me-2" /> New Order
                                        </Button>
                                        <Button variant="outline-primary" className="w-100 mb-2">
                                            <FaUsers className="me-2" /> Add Customer
                                        </Button>
                                        <Button variant="outline-primary" className="w-100">
                                            <FaFileAlt className="me-2" /> Generate Report
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Mobile & Tablet Sidebar (Offcanvas) */}
            <Offcanvas
                show={(isMobile || isTablet) && sidebarOpen}
                onHide={() => setSidebarOpen(false)}
                className="mobile-sidebar"
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className="flex-column">
                        {menuItems.map((item, index) => (
                            <div key={index}>
                                <Nav.Link
                                    className={`nav-item ${item.active ? 'active' : ''}`}
                                    onClick={() => item.submenu ? toggleSubmenu(index) : null}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-text">{item.label}</span>
                                    {item.submenu && (
                                        <span className="submenu-arrow">
                                            {openSubmenu === index ? <FaChevronDown /> : <FaChevronRight />}
                                        </span>
                                    )}
                                </Nav.Link>

                                {item.submenu && (
                                    <Collapse in={openSubmenu === index}>
                                        <div className="submenu-container">
                                            {item.submenu.map((subItem, subIndex) => (
                                                <Nav.Link
                                                    key={subIndex}
                                                    className="submenu-item"
                                                    href="#"
                                                >
                                                    <span className="nav-text">{subItem.label}</span>
                                                </Nav.Link>
                                            ))}
                                        </div>
                                    </Collapse>
                                )}
                            </div>
                        ))}
                    </Nav>
                </Offcanvas.Body>
            </Offcanvas>
        </div>
    );
};

export default EmpDashBoard;