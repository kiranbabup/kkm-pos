import { Box, Popover, Typography, Button, Divider } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LsService, { storageKey } from "../services/localstorage";
import DownloadIcon from '@mui/icons-material/Download';

const HeaderPannel = ({ HeaderTitle, tableData, onDownloadCurrentList }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();

    const userLoginStatus = LsService.getItem(storageKey);

    // useEffect(() => {
    //     // console.log(userLoginStatus);

    //     if (!userLoginStatus) {
    //         navigate("/");
    //     }
    // }, [userLoginStatus, navigate]);

    const handleAvatarClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const onLogoutClick = () => {
        LsService.removeItem(storageKey);
        navigate("/");
    };

    const open = Boolean(anchorEl);

    return (
        <Box sx={{
            height: "6vh",
            mt: 1.5,
            mb: 1.5,
            mr: 1.5,
            p: 2,
            boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
            backgroundColor: "#fafafa",
            borderRadius: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        }} >
            <Typography sx={{ fontWeight: "bold", fontSize: 22, }}>{HeaderTitle}</Typography>

            {
                tableData && (<Button variant="outlined" color="primary" size="small" sx={{ mr: 1, fontWeight: "bold", }} onClick={() => onDownloadCurrentList()}>
                    Download Current list <DownloadIcon sx={{ ml: 1 }} />
                </Button>)
            }

            <Box sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                <Box
                    sx={{
                        width: 40, height: 40, bgcolor: "#222", color: "#fff",
                        borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: "bold", fontSize: 22, cursor: "pointer"
                    }}
                    onClick={(e) => handleAvatarClick(e)}
                >
                    {userLoginStatus.role.slice(0, 1).toUpperCase()}
                </Box>
                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    PaperProps={{
                        sx: { p: 2, minWidth: 220, borderRadius: 3 }
                    }}
                >
                    <Typography fontWeight="bold" fontSize="1rem" mb={0.5}>
                        {userLoginStatus.username}
                    </Typography>
                    <Typography fontSize="0.95rem" color="text.secondary" mb={0.5}>
                        {userLoginStatus.warehouse_code}
                    </Typography>
                    <Typography fontSize="0.95rem" color="text.secondary" mb={0.5}>
                        {userLoginStatus.store_code}
                    </Typography>
                    <Typography fontSize="0.9rem" color="text.secondary" mb={1}>
                        Role: {userLoginStatus.role}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Button
                        fullWidth
                        variant="text"
                        color="error"
                        onClick={onLogoutClick}
                        sx={{ justifyContent: "flex-start", textTransform: "none", fontWeight: "bold" }}
                        startIcon={<span style={{ fontSize: 18 }}>↩</span>}
                    >
                        Log out
                    </Button>
                </Popover>
            </Box>
        </Box>
    );
};

export default HeaderPannel;