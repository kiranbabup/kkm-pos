import React, { useEffect, useState } from "react";
import { getAllOrders, getStoreUsers } from "../../../services/api";
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Collapse, IconButton, } from "@mui/material";
import LeftPannel from "../../../components/LeftPannel";
import HeaderPannel from "../../../components/HeaderPannel";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LsService, { storageKey } from "../../../services/localstorage";
import TablePagination from "@mui/material/TablePagination";
import * as XLSX from "xlsx";

function Row({ order }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Parent Row = Order */}
            <TableRow>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{order.invoice_number}</TableCell>
                <TableCell>{order.customerDetails === null ? "N/A" : order.customerDetails?.customerName}</TableCell>
                <TableCell>{order.customerDetails === null ? order.customerPhone : order.customerDetails?.customerMobile}</TableCell>
                <TableCell>{order.order_date} {order.order_time}</TableCell>
                <TableCell>{order.paymentMethod}</TableCell>
                <TableCell>₹{order.total}</TableCell>
                <TableCell>{order.user_name}</TableCell>
            </TableRow>

            {/* Collapsible Child Row = Cart Items */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            <Typography variant="h6" gutterBottom>
                                Cart Items
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Barcode</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell align="right">Qty</TableCell>
                                        <TableCell align="right">Price</TableCell>
                                        <TableCell align="right">GST</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {order.cart?.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{item.barcode}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell align="right">{item.quantity}</TableCell>
                                            <TableCell align="right">₹{item.price}</TableCell>
                                            <TableCell align="right">{item.gst}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

function StoreBillings() {
    const [loading, setLoading] = useState(false);
    const [storeId, setStoreId] = useState(0);
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState("");
    const [orders, setOrders] = useState([]);
    const [productMesg, setProductMesg] = useState("");
    const [productErrMesg, setProductErrMesg] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const paginatedOrders = orders.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    useEffect(() => {
        setPage(0); // go back to page 0 whenever orders change
    }, [orders]);

    useEffect(() => {
        const fetchStoreId = async () => {
            try {
                const userLoginStatus = LsService.getItem(storageKey);
                const code = userLoginStatus.store_id;
                if (code) {
                    setStoreId(code);
                } else {
                    setProductErrMesg("Invalid store_code, no store found");
                }
            } catch (error) {
                console.error("Error fetching stores:", error);
                setProductErrMesg("Failed to fetch store details");
            } finally {
                setLoading(false);
            }
        };
        fetchStoreId();
    }, []);

    const fetchUsers = async (strId) => {
        try {
            const strUsers = await getStoreUsers(strId);
            console.log(strUsers);

            setUsers(strUsers.data.users || []);
        } catch (err) {
            console.error("Failed to fetch users by store", err);
        }
    };

    const fetchStoreOrders = async () => {
        try {
            setProductMesg("");
            setProductErrMesg("");
            setLoading(true);
            const payload = {
                "user_id": userId || "",
                "store_id": storeId
            }
            console.log(payload);

            const response = await getAllOrders(payload);
            console.log(response);
            console.log(response.data.orders);

            setOrders(response.data.orders || []);

            setProductMesg(response.data.message);
        } catch (error) {
            setProductErrMesg(error.response.data.message);
        } finally {
            setLoading(false);
            setTimeout(() => {
                setProductErrMesg("");
                setProductMesg("");
            }, 20000);
        }
    };

    useEffect(() => {
        if (storeId > 0) {
            setUserId("");     // reset user filter when store changes
            setOrders([]);
            fetchStoreOrders();
            fetchUsers(storeId);
        }
    }, [storeId]);

    useEffect(() => {
        if (userId !== "") {
            setOrders([]);
            fetchStoreOrders();
        }
    }, [userId]);

    const onDownloadxl = () => {
        if (orders.length === 0) {
            alert("No billing data available to download.");
            return;
        }

        // Flatten each order + its cart
        const exportData = orders.flatMap((order) =>
            order.cart.map((item) => ({
                Invoice_No: order.invoice_number,
                Customer_Name: order.customerDetails?.customerName || "",
                Mobile: order.customerDetails?.customerMobile || "",
                customerPhone: order.customerPhone,
                Order_Date: `${order.order_date} ${order.order_time}`,
                Payment_Method: order.paymentMethod,
                Cashier: order.user_name,
                Product_Barcode: item.barcode,
                Product_Name: item.name,
                Quantity: item.quantity,
                Price: item.price,
                GST: item.gst,
                Order_Total: order.total,
            }))
        );

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Billings");
        XLSX.writeFile(workbook, "Billings.xlsx");
    }

    return (
        <Box sx={{
            width: "99vw",
            height: "94vh",
            backgroundColor: "white",
            display: "flex",
        }}>
            {/* left pannel */}
            <Box
                sx={{
                    display: "flex", justifyContent: "center", alignItems: "start",
                    width: "18vw",
                    mt: 1.5
                }}
            >
                <LeftPannel HeaderTitle="Super Admin" />
            </Box>

            <Box
                sx={{ minWidth: "calc( 99vw - 18vw)", }}
            >
                <HeaderPannel HeaderTitle="View Billings"
                    tableData={orders}
                    onDownloadCurrentList={onDownloadxl}
                />

                <Box sx={{ width: "99%" }}>
                    <Box
                        sx={{
                            borderRadius: "10px",
                            boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
                            height: "100%",
                            p: 2,
                            mb: 1,
                            background: "#fff",
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >

                        {/* <IconButton onClick={() => fetchCitiesData()} ><RefreshIcon /></IconButton> */}
                        <Box
                            sx={{
                                width: "99%",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            {
                                users.length !== 0 &&
                                <FormControl sx={{ width: "25%", marginBottom: 2 }}>
                                    <InputLabel>Store Users</InputLabel>
                                    <Select
                                        name="user_id"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        disabled={loading}
                                    >
                                        {users.map((u) => (
                                            <MenuItem key={u.user_id} value={u.user_id}>
                                                {u.username}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            }

                            {productMesg && (
                                <Typography sx={{ color: "green", fontSize: "0.9rem" }}>
                                    {productMesg}
                                </Typography>
                            )}
                            {productErrMesg && (
                                <Typography sx={{ color: "red", fontSize: "0.9rem" }}>
                                    {productErrMesg}
                                </Typography>
                            )}

                        </Box>
                    </Box>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell />
                                    <TableCell>Invoice No</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Mobile</TableCell>
                                    <TableCell>Order Date</TableCell>
                                    <TableCell>Payment</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Cashier</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedOrders.map((order) => (
                                    <Row key={order.order_id} order={order} />
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            component="div"
                            count={orders.length}
                            page={page}
                            onPageChange={(event, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(event) => {
                                setRowsPerPage(parseInt(event.target.value, 10));
                                setPage(0); // reset to first page
                            }}
                            rowsPerPageOptions={[10, 25, 50]}
                        />
                    </TableContainer>
                    <Box p={1} />
                </Box>
            </Box>
        </Box>
    );
}

export default StoreBillings;