import React, { useEffect, useState } from "react";
import { createStoreProducts, getAllProducts, getAllStores } from "../../../services/api";
import { Box, Button, Typography, Grid, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import LeftPannel from "../../../components/LeftPannel";
import HeaderPannel from "../../../components/HeaderPannel";

function AddStoreProducts() {
    const [loading, setLoading] = useState(false);
    const [productMesg, setProductMesg] = useState("");
    const [productErrMesg, setProductErrMesg] = useState("");
    const [stores, setStores] = useState([]);
    const [mainProducts, setMainProducts] = useState([]);
    const [formData, setFormData] = useState({
        store_id: "",
        products: [{ product_id: "", quantity: "" }], // [{ product_id, quantity }]
    });

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const strRes = await getAllStores();
                const proRes = await getAllProducts();
                setStores(strRes.data.stores || []);
                setMainProducts(proRes.data.products || []);
            } catch (err) {
                console.error("Failed to fetch dropdown data", err);
            }
        };
        fetchDropdowns();
    }, []);

    useEffect(() => {
        if (formData.products.length === 0 && mainProducts.length > 0) {
            setFormData((prev) => ({
                ...prev,
                products: [{ product_id: "", quantity: "" }],
            }));
        }
    }, [mainProducts]);

    const handleStoreChange = (e) => {
        setFormData((prev) => ({ ...prev, store_id: e.target.value }));
    };

    const handleProductChange = (index, name, value) => {
        const updatedProducts = [...formData.products];
        updatedProducts[index][name] = value;
        // reset quantity if product changed
        if (name === "product_id") {
            updatedProducts[index].quantity = "";
        }
        setFormData((prev) => ({ ...prev, products: updatedProducts }));
    };

    const handleAddMore = () => {
        setFormData((prev) => ({
            ...prev,
            products: [...prev.products, { product_id: "", quantity: "" }],
        }));
    };

    const handleRemove = (index) => {
        const updatedProducts = [...formData.products];
        updatedProducts.splice(index, 1);
        setFormData((prev) => ({ ...prev, products: updatedProducts }));
    };

    const handleCreateProduct = async () => {
        try {
            setLoading(true);
            setProductMesg("");
            setProductErrMesg("");

            // convert products array into required format
            const productIds = formData.products.map((p) => p.product_id).join(",");
            const quantities = formData.products.map((p) => p.quantity).join(",");

            const payload = {
                store_id: formData.store_id,
                product_ids: productIds,
                product_quantities: quantities,
            };

            console.log("Final Payload:", payload);

            const response = await createStoreProducts(payload);
            console.log(response);
            
            if (response.status === 200) {
                setProductMesg(response.data.message);
            } else {
                setProductErrMesg(response.data.message);
            }
        } catch (error) {
            setProductErrMesg(
                error?.response?.data?.message || "Error adding product"
            );
        } finally {
            setLoading(false);
            setTimeout(() => {
                setProductMesg("");
                setProductErrMesg("");
            }, 20000);
        }
    };

    const onClear = () => {
        setFormData({
            store_id: "",
            products: [{ product_id: "", quantity: "" }],
        })
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
                    display: "flex", justifyContent: "center", alignItems: "start", width: "18vw", mt: 1.5
                }}
            >
                <LeftPannel HeaderTitle="Store Manager" />
            </Box>

            {/* Right pannel */}
            <Box sx={{ minWidth: "calc( 99vw - 18vw)", }} >
                <HeaderPannel HeaderTitle="Add Products to Store Inventory" />
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
                        {/* Store dropdown */}
                        <FormControl sx={{ width: "25%", marginBottom: 2 }}>
                            <InputLabel>Stores</InputLabel>
                            <Select
                                name="store_id"
                                value={formData.store_id}
                                onChange={handleStoreChange}
                                disabled={loading}
                            >
                                {stores.map((u) => (
                                    <MenuItem key={u.store_id} value={u.store_id}>
                                        {u.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Dynamic Product Rows */}
                        {formData.products.map((p, index) => {
                            // get available quantity for selected product
                            const selectedProduct = mainProducts.find(
                                (mp) => mp.products_id === p.product_id
                            );
                            const availableQty = selectedProduct
                                ? selectedProduct.quantity
                                : 0;

                            // exclude already selected products
                            const selectedIds = formData.products
                                .map((pr) => pr.product_id)
                                .filter((id, i) => i !== index);

                            const filteredProducts = mainProducts.filter(
                                (mp) => !selectedIds.includes(mp.products_id)
                            );

                            return (
                                <Box
                                    key={index}
                                    sx={{
                                        mb: 2,
                                        border: "1px solid #ddd",
                                        borderRadius: "8px",
                                        p: 2,
                                    }}
                                >
                                    <Grid container spacing={2}>
                                        <Grid item size={4}>
                                            <FormControl fullWidth>
                                                <InputLabel>Products</InputLabel>
                                                <Select
                                                    value={p.product_id}
                                                    onChange={(e) =>
                                                        handleProductChange(
                                                            index,
                                                            "product_id",
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={loading}
                                                >
                                                    {filteredProducts.map((u) => (
                                                        <MenuItem
                                                            key={u.products_id}
                                                            value={u.products_id}
                                                        >
                                                            {u.products_name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item size={2} sx={{display:"flex", alignItems:"center"}}>
                                            {/* <TextField
                                                fullWidth
                                                label="Available Quantity"
                                                type="number"
                                                value={availableQty}
                                                disabled
                                            /> */}
                                            <Typography sx={{color:"grey"}}>Available Quantity: <strong style={{color:"black"}}>{availableQty}</strong></Typography>
                                        </Grid>

                                        <Grid item size={2}>
                                            <TextField
                                                fullWidth
                                                label="Send Quantity"
                                                type="number"
                                                inputProps={{ min: 1, max: availableQty }}
                                                value={p.quantity}
                                                onChange={(e) =>
                                                    handleProductChange(index, "quantity", e.target.value)
                                                }
                                                disabled={!p.product_id || loading}
                                            />
                                        </Grid>

                                        <Grid item size={4} sx={{ display: "flex" }}>
                                            <Button
                                                color="error"
                                                onClick={() => handleRemove(index)}
                                                disabled={formData.products.length === 1}
                                            >
                                                Remove
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            );
                        })}

                        {/* Add More Button */}
                        {formData.products.length < mainProducts.length && (
                            <Button
                                variant="outlined"
                                onClick={handleAddMore}
                                disabled={loading}
                            >
                                Add More
                            </Button>
                        )}

                        {/* Action Buttons */}
                        <Box
                            sx={{
                                mt: 2,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Button variant="outlined" color="error" onClick={onClear}>
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
                                {loading ? "Adding..." : "Add Product"}
                            </Button>
                        </Box>

                    </Box>
                </Box>
            </Box>
        </Box >
    );
}

export default AddStoreProducts;