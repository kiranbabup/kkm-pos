import React, { useEffect, useState } from "react";
import { createProduct, getAllCategories, getAllSuppliers, getAllBrands, getAllUnits } from "../../services/api";
import {
    Box, Button, Typography, Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField
} from "@mui/material";
import LeftPannel from "../../components/LeftPannel";
import HeaderPannel from "../../components/HeaderPannel";

function CreateMainProducts() {
    const [loading, setLoading] = useState(false);
    const [productMesg, setProductMesg] = useState("");
    const [productErrMesg, setProductErrMesg] = useState("");
    const [formData, setFormData] = useState({
        products_name: "",
        products_description: "",
        products_price: "",
        discount_price: "",
        gst: "",
        barcode: "",
        batch_number: "",
        quantity: "",
        qty_alert: "",
        stock_type: "package",
        unit_id: "",
        category_id: "",
        supplier_id: "",
        brand_id: "",
        manufacturing_date: "",
        expiry_date: "",
    });
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [brands, setBrands] = useState([]);
    const [units, setUnits] = useState([]);

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const catRes = await getAllCategories();
                const supRes = await getAllSuppliers();
                const brandRes = await getAllBrands();
                const unitRes = await getAllUnits();
                console.log(unitRes);

                setCategories(catRes.data || []);
                setSuppliers(supRes.data || []);
                setBrands(brandRes.data || []);
                setUnits(unitRes.data || []);

            } catch (err) {
                console.error("Failed to fetch dropdown data", err);
            }
        };

        fetchDropdowns();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateProduct = async () => {
        try {
            setLoading(true);
            setProductMesg("");
            setProductErrMesg("");
            console.log(formData);

            const selectedUnit = units.find((u) => u.unit_id === formData.unit_id);

            const payload = {
                ...formData,
                base_unit_id: formData.unit_id,
                unit: selectedUnit ? selectedUnit.unit : null,
            };

            const response = await createProduct(payload);
            console.log(response);
            console.log(response.data);

            if (response.status === 201) {
                setProductMesg(response.data.message);
            } else {
                console.error("Failed to add Product:", response.data.message);
                setProductErrMesg(response.data.message);
            }
        } catch (error) {
            setProductErrMesg(error?.response?.data?.message || "Error creating product");
            console.error("Failed to add Product:", error.response);
        } finally {
            setLoading(false);
            setTimeout(() => {
                setProductMesg("");
                setProductErrMesg("");
            }, 20000);  // Clear messages after 20 seconds
        }
    };

    const onClear = () => {
        setFormData({
            products_name: "",
            products_description: "",
            products_price: "",
            discount_price: "",
            gst: "",
            barcode: "",
            batch_number: "",
            quantity: "",
            qty_alert: "",
            stock_type: "package",
            unit_id: "",
            category_id: "",
            supplier_id: "",
            brand_id: "",
            manufacturing_date: "",
            expiry_date: "",
        })
    }

    return (
        <Box sx={{
            width: "99vw",
            height: "94vh",
            backgroundColor: "white",
            display: "flex",
            gap: 2
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

            {/* Right pannel */}
            <Box sx={{ minWidth: "calc( 99vw - 18vw)", }} >
                <HeaderPannel HeaderTitle="Add Products to Main Inventory" />
                <Box sx={{ width: "99%" }}>
                    <Box
                        sx={{
                            borderRadius: "10px",
                            boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
                            height: "100%",
                            p: 2,
                            mb: 1,
                            background: "#fff",
                            // display: "flex",
                            // justifyContent: "space-between",
                        }}
                    >
                        <Grid container spacing={2}  >
                            {/* String Fields */}
                            <Grid item size={6}>
                                <TextField
                                    fullWidth
                                    label="Barcode (Manual input or use Scanner)"
                                    name="barcode"
                                    value={formData.barcode}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid item size={6}>
                                <TextField
                                    fullWidth
                                    label="Batch Number"
                                    name="batch_number"
                                    value={formData.batch_number}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid item size={6} container spacing={2}>
                                <Grid item size={12}>
                                    <TextField
                                        fullWidth
                                        label="Product Name"
                                        name="products_name"
                                        value={formData.products_name}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>

                                <Grid item size={4}>
                                    <TextField
                                        fullWidth
                                        label="MRP"
                                        name="products_price"
                                        type="number"
                                        inputProps={{ min: 1, step: "0.01" }}
                                        value={formData.products_price}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>

                                <Grid item size={4}>
                                    <TextField
                                        fullWidth
                                        label="Selling Price"
                                        name="discount_price"
                                        type="number"
                                        inputProps={{ min: 1, step: "0.01" }}
                                        value={formData.discount_price}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>

                                <Grid item size={4}>
                                    <TextField
                                        fullWidth
                                        label="GST (%)"
                                        name="gst"
                                        type="number"
                                        inputProps={{ min: 1, max: 18, step: "0.01" }}
                                        value={formData.gst}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                            </Grid>
                            {/* TextArea */}
                            <Grid item size={6}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="products_description"
                                    value={formData.products_description}
                                    onChange={handleChange}
                                    multiline
                                    rows={4}
                                    disabled={loading}
                                />
                            </Grid>

                            {/* Integers */}
                            <Grid item size={3}>
                                <TextField
                                    fullWidth
                                    label="Quantity"
                                    name="quantity"
                                    type="number"
                                    inputProps={{ min: 1 }}
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid item size={3}>
                                <TextField
                                    fullWidth
                                    label="Quantity Alert"
                                    name="qty_alert"
                                    type="number"
                                    inputProps={{ min: 1 }}
                                    value={formData.qty_alert}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </Grid>

                            {/* Stock Type */}
                            <Grid item size={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Stock Type</InputLabel>
                                    <Select
                                        name="stock_type"
                                        value={formData.stock_type}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        <MenuItem value="weight">Weight</MenuItem>
                                        <MenuItem value="package">Package</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Dropdowns */}
                            <Grid item size={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Unit</InputLabel>
                                    <Select
                                        name="unit_id"
                                        value={formData.unit_id}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        {units.map((u) => (
                                            <MenuItem key={u.unit_id} value={u.unit_id}>
                                                {u.unit}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item size={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        {categories.map((c) => (
                                            <MenuItem key={c.category_id} value={c.category_id}>
                                                {c.category}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item size={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Supplier</InputLabel>
                                    <Select
                                        name="supplier_id"
                                        value={formData.supplier_id}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        {suppliers.map((s) => (
                                            <MenuItem key={s.suppliers_id} value={s.suppliers_id}>
                                                {s.suppliers_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item size={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Brand</InputLabel>
                                    <Select
                                        name="brand_id"
                                        value={formData.brand_id}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        {brands.map((b) => (
                                            <MenuItem key={b.brand_id} value={b.brand_id}>
                                                {b.brand}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Dates */}
                            <Grid item size={6}>
                                <TextField
                                    fullWidth
                                    label="Manufacturing Date"
                                    name="manufacturing_date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={formData.manufacturing_date}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid item size={6}>
                                <TextField
                                    fullWidth
                                    label="Expiry Date"
                                    name="expiry_date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={formData.expiry_date}
                                    onChange={handleChange}
                                    disabled={!formData.manufacturing_date || loading}
                                    inputProps={{
                                        min: formData.manufacturing_date || undefined,
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Box
                            sx={{
                                mt: 2,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <Button variant="outlined"
                                color="error"
                                onClick={onClear}
                            >
                                Clear
                            </Button>
                            <Box>
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
                            <Button
                                variant="contained"
                                color="success"
                                onClick={handleCreateProduct}
                                disabled={loading}
                            >
                                {loading ? "Creating..." : "Create Product"}
                            </Button>
                        </Box>

                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default CreateMainProducts;