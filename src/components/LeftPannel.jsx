import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../data/images/srikkmartlogo.png";
import { useEffect, useState } from "react";
import LsService, { storageKey } from "../services/localstorage";

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ClassIcon from '@mui/icons-material/Class';
import FactoryIcon from '@mui/icons-material/Factory';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GroupIcon from '@mui/icons-material/Group';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

// import WorkIcon from '@mui/icons-material/Work';
// import AssessmentIcon from '@mui/icons-material/Assessment';
// import GroupsSharpIcon from '@mui/icons-material/GroupsSharp';
// import EditLocationAltIcon from '@mui/icons-material/EditLocationAlt';
// import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
// import PsychologyIcon from '@mui/icons-material/Psychology';
// import CreditScoreIcon from '@mui/icons-material/CreditScore';
// import QuizIcon from '@mui/icons-material/Quiz';
// import AssignmentAddIcon from '@mui/icons-material/AssignmentAdd';
// import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
// import PhoneCallbackIcon from '@mui/icons-material/PhoneCallback';
// import PivotTableChartIcon from '@mui/icons-material/PivotTableChart';
// import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
// import UploadFileIcon from '@mui/icons-material/UploadFile';
// import ContactPageIcon from '@mui/icons-material/ContactPage';

const LeftPannel = ({ HeaderTitle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActiveRoute = (route) => location.pathname === route;
    const user = LsService.getItem(storageKey);
    const [sections, setSections] = useState([]);

    // Map navItems to icons
    const navIcons = {
        "/super-admin": <DashboardIcon />,
        "/warehouse-admin": <DashboardIcon />,
        "/store-admin": <DashboardIcon />,
        "/casher-panel": <DashboardIcon />,
        "/categories": <CategoryIcon />,
        "//suppliers": <BusinessIcon />,
        "/units": <ClassIcon />,
        "/stores": <FactoryIcon />,
        "/brands": <AssignmentTurnedInIcon />,
        "/employee-payments": <AccountBalanceWalletIcon />,
        "/users_management": <GroupIcon />,
        "/products": <ShoppingBasketIcon />,
        "/add-to-main": <AddShoppingCartIcon />,
        "/add-store-products": <AddShoppingCartIcon />,

        // "/manage-states": <EditLocationAltIcon />,
        // "/manage-services": <MiscellaneousServicesIcon />,
        // "/manage-posted-jobs": <WorkIcon />,
        // "/manage-free-jobs": <WorkIcon />,
        // "/manage-1499-jobs": <WorkIcon />,
        // "/manage-skills": <PsychologyIcon />,
        // "/manage-withdraw": <CreditScoreIcon />,
        // "/manage-questions": <QuizIcon />,
        // "/add-question": <AssignmentAddIcon />,
        // "/manage-chatbot": <ConfirmationNumberIcon />,
        // "/manage-vcall": <PhoneCallbackIcon />,
        // "/manage-d_b_t": <PivotTableChartIcon />,
        // "/manage-billboards": <AddPhotoAlternateIcon />,
        // "/bulk-job-posting": <UploadFileIcon />,
        // "/seekers-bulkupload": <ContactPageIcon />,
        // "/reports": <AssessmentIcon />,
    };

    // Example sections
    const superAdminSections = [
        {
            title: "Main",
            items: [
                { label: "Dashboard", route: "/super-admin" },
            ]
        },
        {
            title: "Management",
            items: [
                { label: "Users Management", route: "/users_management" },
                { label: "Stores", route: "/stores" },
            ]
        },
        {
            title: "Products Management",
            items: [
                { label: "Main Inventory", route: "/products" },
                { label: "Add to Main", route: "/add-to-main" },
            ]
        },
        {
            title: "Requirements",
            items: [
                { label: "Categories", route: "/categories" },
                { label: "Suppliers", route: "/suppliers" },
                { label: "Brands", route: "/brands" },
                { label: "Units", route: "/units" },
            ]
        },
        {
            title: "Store Products",
            items: [
                { label: "Add Store Products", route: "/add-store-products" },
            ]
        },
    ]

    const warehouseAdminSections = [
        {
            title: "Main",
            items: [
                { label: "WHAdmin Dashboard", route: "/warehouse-admin" },
            ]
        },
    ]

    const storeAdminSections = [
        {
            title: "Main",
            items: [
                { label: "StoreAdmin Dashboard", route: "/store-admin" },
            ]
        },
    ]

    const cashierSections = [
        {
            title: "Main",
            items: [
                { label: "Cashier Dashboard", route: "/casher-panel" },
            ]
        },
    ]

    useEffect(() => {
        // console.log(user);
        if (user) {
            if (user.role === "admin") {
                setSections(superAdminSections);
            } else if (user.role === "warehouse") {
                setSections(warehouseAdminSections);
            } else if (user.role === "store") {
                setSections(storeAdminSections);
            } else if (user.role === "casher") {
                setSections(cashierSections);
            }
        } else {
            return;
        }
    }, []);

    const getSectionForRoute = (pathname) => {
        const found = sections.find(section =>
            section.items.some(item => item.route === pathname)
        );
        return found ? found.title : sections[0]?.title ?? "";
    };

    const [openSection, setOpenSection] = useState(sections.length > 0 ? sections[0].title : "");

    useEffect(() => {
        setOpenSection(getSectionForRoute(location.pathname) || (sections[0]?.title ?? ""));
    }, [location.pathname, sections]);

    return (
        <Box sx={{
            width: "15vw",
            boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
            backgroundColor: "#fafafa",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            p: 2,
        }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, cursor: "pointer" }}
            // onClick={() => navigate("/admin-db")}
            >
                <img src={logo} alt="Logo" style={{ width: "3rem", height: "3rem", borderRadius: "50%", marginRight: "10px" }} />
                <Typography variant="subtitle1" fontWeight="bold">{HeaderTitle}</Typography>
            </Box>

            {sections.map((section, idx) => (
                <Box key={section.title} sx={{ width: "100%", mb: 1 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            pl: 2,
                            mb: 0.5,
                            cursor: "pointer",
                            userSelect: "none"
                        }}
                        onClick={() => setOpenSection(openSection === section.title ? "" : section.title)}
                        // onClick={() => setOpenSection(section.title)}
                    >
                        <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
                            {section.title}
                        </Typography>
                        {openSection === section.title
                            ? <KeyboardArrowUpIcon fontSize="small" />
                            : <KeyboardArrowDownIcon fontSize="small" />}
                    </Box>
                    {openSection === section.title && (
                        <List disablePadding>
                            {section.items.map(item => (
                                <ListItemButton
                                    key={item.route}
                                    selected={isActiveRoute(item.route)}
                                    onClick={() => navigate(item.route)}
                                    sx={{
                                        borderRadius: 2,
                                        my: 0.5,
                                        bgcolor: isActiveRoute(item.route) ? "#f4f4f5" : "transparent",
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        {navIcons[item.route] || <DashboardIcon />}
                                    </ListItemIcon>
                                    <ListItemText primary={item.label} primaryTypographyProps={{
                                        fontWeight: isActiveRoute(item.route) ? "bold" : "normal"
                                    }} />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                    {idx < sections.length - 1 && <Divider sx={{ my: 1 }} />}
                </Box>
            ))}
        </Box>
    );
};

export default LeftPannel;