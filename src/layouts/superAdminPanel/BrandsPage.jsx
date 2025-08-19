import React, { useEffect, useState } from "react";
import { createBrand, getAllBrands, updateBrand } from "../../services/api";
import TableComponent from "../../components/TableComponent";
import { Box, Button, Switch, TextField, Typography } from "@mui/material";
import LeftPannel from "../../components/LeftPannel";
import HeaderPannel from "../../components/HeaderPannel";
import EditModalComp from "../../components/EditModalComp";

const BrandsPage = () => {
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [rowCount, setRowCount] = useState(0);
    const [allBrands, setAllBrands] = useState([]);
    const [loadingBrand, setLoadingBrand] = useState(false);
    const [brand, setBrand] = useState("");
    const [brandMesg, setBrandMesg] = useState("");
    const [brandErrMesg, setBrandErrMesg] = useState("");
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editBranValue, setEditBranValue] = useState("");
    const [editBranSrlno, setEditBranSrlno] = useState(null);

    useEffect(() => {
        fetchBrands();
    }, []);

    useEffect(() => {
        const start = paginationModel.page * paginationModel.pageSize;
        const end = start + paginationModel.pageSize;
        setTableData(allBrands.slice(start, end));
    }, [paginationModel, allBrands]);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const response = await getAllBrands();
            console.log(response.data);
            const mappedData = response.data.map((sup, index) => ({
                ...sup,
                id: index + 1, // sequential table ID
                created_on: sup.created_on?.slice(0, 10),
            }));

            setAllBrands(mappedData);
            setRowCount(response.data.length); // Total count
        } catch (error) {
            console.error("Error fetching Brands:", error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { field: "id", headerName: "ID", width: 80 },
        { field: "created_on", headerName: "Created On", flex: 1 },
        { field: "brand", headerName: "Brands Name", width: 180 },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            renderCell: (params) => (
                <Switch
                    checked={params.row.status}
                    onChange={() => toggleUsageStatus(params.row.brand_id, params.row.status)}
                    color="primary"
                />
            )
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            sortable: false,
            renderCell: (params) => (
                <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                        setEditBranValue(params.row.brand);
                        setEditBranSrlno(params.row.brand_id);
                        setEditModalOpen(true);
                    }}
                >
                    Edit
                </Button>
            )
        }
    ];

    const onClickAddBrand = async () => {
        // const handleSave = async () => {
        try {
            setLoadingBrand(true);
            setBrandMesg("");
            setBrandErrMesg("");
            // Send state slno and city name
            const response = await createBrand({
                brand: brand.trim(),
            });
            console.log(response);
            console.log(response.data);
            if (response.status === 201) {
                setBrand("");
                setBrandMesg(response.data.message);
                fetchBrands();
            } else {
                console.error("Failed to add Brand:", response.data.message);
                setBrandErrMesg(response.data.message);
            }
        } catch (error) {
            setBrandErrMesg(error.response.data.message);
            console.error("Failed to add Brand:", error.response);
        } finally {
            setLoadingBrand(false);
            setTimeout(() => {
                setBrandMesg("");
                setBrandErrMesg("");
            }, 20000);  // Clear messages after 20 seconds
        }
    };


    const toggleUsageStatus = async (id, currentStatus, brand) => {
        try {
            const newStatus = !currentStatus;
            const response = await updateBrand(id, { status: newStatus, brand: brand });
            console.log(response);
            console.log(response.data);
            if (response.status === 200) {
                setBrandMesg(response.data.message);
                fetchBrands();
            } else {
                console.error("Failed to update status:", response.data.message);
                setBrandErrMesg(response.data.message);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setTimeout(() => {
                setBrandMesg("");
                setBrandErrMesg("");
            }, 20000); // Clear messages after 1 minute 
        }
    };

    const onClickModalFinalButton = async () => {
        console.log(editBranValue, editBranSrlno);

        try {
            setLoading(true);
            const response = await updateBrand(editBranSrlno, { brand: editBranValue, status: true });
            setBrandMesg(response.data.message);
            setEditModalOpen(false);
            fetchBrands();
        } catch (error) {
            console.error("Failed to edit supigory:", error);
        } finally {
            setLoading(false);
            setTimeout(() => {
                setBrandMesg("");
            }, 20000);
        }
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
                <HeaderPannel HeaderTitle="Manage Industries"
                    tableData={tableData}
                // onDownloadCurrentList ={onDownloadxl}
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
                                display: "flex",
                                // justifyContent: "right",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <TextField
                                label="Add Brand"
                                placeholder="Add Brand"
                                variant="outlined"
                                size="small"
                                value={brand}
                                onChange={e => setBrand(e.target.value)}
                            />

                            <Button variant="outlined" color="primary" size="small" sx={{ mr: 1, fontWeight: "bold", }}
                                onClick={() => onClickAddBrand()}
                                disabled={!brand.trim()}
                            >
                                {loadingBrand ? "Adding..." : "Add Brand"}
                                {/* <BrandIcon sx={{ ml: 1 }} /> */}
                            </Button>
                            {brandMesg && (
                                <Typography sx={{ color: "green", fontSize: "0.9rem" }}>
                                    {brandMesg}
                                </Typography>
                            )}
                            {brandErrMesg && (
                                <Typography sx={{ color: "red", fontSize: "0.9rem" }}>
                                    {brandErrMesg}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <EditModalComp
                        editModalOpen={editModalOpen}
                        setEditModalOpen={setEditModalOpen}
                        loading={loading}
                        editValue={editBranValue}
                        setEditValue={setEditBranValue}
                        editSlno={editBranSrlno}
                        onClick={onClickModalFinalButton}
                        labelName="Edit Brand"
                    />

                    <TableComponent
                        tableData={tableData}
                        columns={columns}
                        loading={loading}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        rowCount={rowCount}
                    />
                </Box>
            </Box>
        </Box>
    );
}

export default BrandsPage;