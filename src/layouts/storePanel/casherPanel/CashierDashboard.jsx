import React, { useEffect, useState } from "react";
import { Box, Typography, Button, TextField, IconButton, Paper, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Snackbar, Divider, Popover, InputAdornment } from "@mui/material";
import MuiAlert from '@mui/material/Alert';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import { get_store_product_details, get_customer_data, billing } from "../../../services/api";
import LsService, { storageKey } from "../../../services/localstorage";
import { useNavigate } from "react-router-dom";
import { AccentButton, GlassCard, PaymentButton } from "../../../data/functions";
import CloseIcon from "@mui/icons-material/Close";

const CashierDashboard = () => {
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState("cash");
  // Calculator input state
  const [amount, setAmount] = useState("0.00");
  // Change to return to customer
  const [changeAmount, setChangeAmount] = useState("");
  // Product search input
  const [search, setSearch] = useState("");
  // Products fetched from API
  const [products, setProducts] = useState([]);
  // Cart items
  const [cart, setCart] = useState([]);
  // Dropdown for product search
  const [showDropdown, setShowDropdown] = useState(false);

  // Billing dialog states
  const [billingOpen, setBillingOpen] = useState(false);
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerLoading, setCustomerLoading] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState(true);
  // Store full customer details
  const [customer, setCustomer] = useState(null);

  // Snackbar for billing success
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);

  // Track if combo is purchased for this customer
  const [isComboPurchased, setIsComboPurchased] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userLoginStatus, setuserLoginStatus] = useState("");
  const [storeId, setStoreId] = useState(null);
  const [userId, setUserId] = useState(null);

  // Get storeId and user info from localStorage
  // const userLoginStatus = LsService.getItem(storageKey);

  useEffect(() => {
    const fetchStoreId = async () => {
      try {
        const userLogin = LsService.getItem(storageKey);
        console.log(userLogin);
        if (userLogin) {
          setuserLoginStatus(userLogin);
          setStoreId(userLogin.store_id);
          setUserId(userLogin.user_id);
        } else {
          console.log("Invalid store_code, no store found");
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
        // console.log("Failed to fetch store details");
      }
    };
    fetchStoreId();
  }, []);

  const navigate = useNavigate();

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

  // Fetch products for this store and search term
  useEffect(() => {
    const fetchProducts = async () => {
      if (!storeId) return;
      try {
        const trimmedSearch = search.trim();
        const res = await get_store_product_details(trimmedSearch, storeId);
        console.log(res.data);

        const prods = res.data.products || [];
        setProducts(prods);
        // Show dropdown for name search, not barcode
        if (search && !/^\d{4,}$/.test(search.trim())) {
          setShowDropdown(prods.length > 0);
        } else {
          setShowDropdown(false);
        }
        // If barcode entered, try to add product directly
        if (search && /^\d{4,}$/.test(search.trim())) {
          tryAddByBarcode(search.trim(), prods);
        }
      } catch (err) {
        setProducts([]);
        setShowDropdown(false);
      }
    };
    fetchProducts();
    // eslint-disable-next-line
  }, [search, storeId]);

  // Add product to cart
  const handleAddToCart = (product) => {
    // Prevent adding combo if already purchased by customer
    if (product.is_combo && isComboPurchased) {
      alert("You have already purchased a combo product. You cannot buy again.");
      return;
    }
    setCart((prev) => {
      const exists = prev.find((item) => item.products_id === product.products_id);
      if (exists) {
        // Combo: quantity always 1, do not increase
        if (product.is_combo) {
          return prev;
        }
        // Individual: only increase if less than available
        if (exists.quantity >= product.quantity) {
          return prev;
        }
        return prev.map((item) =>
          item.products_id === product.products_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Add new item, set quantity_available for individual products
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
          quantity_available: product.is_combo ? 1 : product.quantity,
        },
      ];
    });
    setShowDropdown(false);
    setSearch("");
  };

  // Add product by barcode
  const tryAddByBarcode = (barcode, prods = products) => {
    const found = prods.find(
      (prod) => String(prod.barcode) === String(barcode)
    );
    if (found) {
      handleAddToCart(found);
      setSearch("");
      setShowDropdown(false);
      return true;
    }
    return false;
  };

  // Update quantity of a cart item
  // Combo items: quantity always 1, "+" button does nothing
  // Individual: cannot exceed quantity_available
  const handleQtyChange = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.products_id === id) {
            if (item.is_combo) {
              // Combo: always 1
              return { ...item, quantity: 1 };
            }
            // Individual: clamp between 1 and quantity_available
            const maxQty = item.quantity_available ?? item.quantity;
            const newQty = Math.max(1, item.quantity + delta);
            return {
              ...item,
              quantity: Math.min(newQty, maxQty),
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove an item from cart
  const handleRemove = (id) => {
    setCart((prev) => prev.filter((item) => item.products_id !== id));
  };

  // Calculate subtotal for cart (sale price)
  const subTotal = cart.reduce(
    (sum, item) => sum + (Number(item.discount_price || item.products_price) * item.quantity),
    0
  );

  // const avgGst =
  // cart && cart.length > 0
  //   ? (
  //       cart.reduce((sum, item) => sum + parseFloat(item.gst || 0), 0) /
  //       cart.length
  //     ).toFixed(2)
  //   : 0;

  const totalGst =
    cart && cart.length > 0
      ? cart.reduce((sum, item) => {
        const price = parseFloat(item.discount_price || 0);
        const qty = parseFloat(item.quantity || 0);
        const gstRate = parseFloat(item.gst || 0); // percentage
        const gstAmount = (price * qty * gstRate) / 100;
        return sum + gstAmount;
      }, 0).toFixed(2)
      : "0.00";



  // Show history handler
  const handleShowHistory = () => {
    navigate("/cashier-billing-history");
  };

  // Calculator input from buttons
  const handleAmountInput = (val) => {
    if (amount === "0.00") {
      setAmount(val === "." ? "0." : String(val));
    } else {
      if (val === "." && amount.includes(".")) return;
      setAmount(amount + String(val));
    }
  };

  // Manual typing in calculator input
  const handleAmountChange = (e) => {
    let val = e.target.value.replace(/[^0-9.]/g, "");
    if ((val.match(/\./g) || []).length > 1) {
      val = val.slice(0, -1);
    }
    setAmount(val);
  };

  // Fetch customer details by mobile number and store full object
  const fetchCustomerByMobile = async (phone) => {
    try {
      const res = await get_customer_data(phone);
      // Backend response: { data: { ...customerData }, is_purchased_combo: true/false }
      if (res.data.data && res.data.data.name) {
        setCustomer(res.data.data); // Store full customer details
        setIsComboPurchased(res.data.is_purchased_combo); // Track combo purchase status
        return res.data;
      }
      setCustomer(null);
      setIsComboPurchased(false);
      return null;
    } catch (err) {
      setCustomer(null);
      setIsComboPurchased(false);
      return null;
    }
  };

  // When mobile changes, check if customer exists and store details
  useEffect(() => {
    const checkCustomer = async () => {
      if (customerMobile.length === 10) {
        setCustomerLoading(true);
        const res = await fetchCustomerByMobile(customerMobile);
        setCustomerName(res?.data?.name || "");
        setIsExistingCustomer(!!res?.data?.name);
        setCustomerLoading(false);
      } else {
        setCustomerName("");
        setIsExistingCustomer(true);
        setCustomer(null);
        setIsComboPurchased(false);
      }
    };
    checkCustomer();
    // eslint-disable-next-line
  }, [customerMobile]);

  // Check if cart has any combo items
  const hasComboItem = cart.some(item => item.is_combo);

  // Calculate MRP total for non-existing customer
  const mrpTotal = cart.reduce(
    (sum, item) => sum + (item.products_price * item.quantity),
    0
  );

  // Billing submit handler
  const handleBillingSubmit = async () => {
    // Prepare billing payload with all required fields
    const payload = {
      customer_id: isExistingCustomer && customer ? customer.slno : null, // Use slno if existing
      customer_joined_by: isExistingCustomer && customer ? customer.joined_by : "new",
      user_id: userId, // cashier id from localStorage
      total_amount: (!hasComboItem && !isExistingCustomer) ? mrpTotal : subTotal,
      payment_method: paymentMethod,
      store_id: storeId,
      products: cart.map(item => ({
        price: (!hasComboItem && !isExistingCustomer) ? item.products_price : (item.discount_price || item.products_price),
        product_id: item.is_combo ? null : item.products_id, // null for combo, id for individual
        is_combo: item.is_combo,
        combo_id: item.is_combo ? item.barcode : null, // barcode for combo, null for individual
        quantity: item.quantity
      })),
      is_existing_customer: isExistingCustomer,
      customer_phone: customerMobile
    };

    try {
      await billing(payload); // Call the billing API
      setCart([]);
      setAmount("0.00");
      setChangeAmount("");
      setCustomerMobile("");
      setCustomerName("");
      setCustomer(null);
      setIsExistingCustomer(true);
      setSearch("");
      setBillingOpen(false);
      setSuccessSnackbarOpen(true); // Show success Snackbar
    } catch (err) {
      console.error("Billing error:", err);
      // Optionally show error Snackbar here
    }
  };

  const onCalChange = () => {
    const paid = parseFloat(amount) || 0;
    const total = (!hasComboItem && !isExistingCustomer) ? mrpTotal : subTotal;
    const change = paid - total;
    setChangeAmount(change >= 0 ? change.toFixed(2) : "0.00");
    setTimeout(() => {
      setChangeAmount("")
    }, 20000);
  }

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
      p: 2,
      display: "flex",
      flexDirection: "column",
      gap: 2,
    }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          height: 64,
          background: "#fff",
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          px: 3,
          position: "relative"
        }}
      >
        <ShoppingCartIcon sx={{ fontSize: 36, color: "#0072ff" }} />
        <Typography variant="h5" fontWeight={800} color="#222" sx={{ lineHeight: 1 }}>
          Cashier Dashboard
        </Typography>

        {/* Search Bar */}
        <Box sx={{ position: "relative", ml: 5 }}>
          <TextField
            size="medium"
            variant="outlined"
            placeholder="Search products by name or barcode"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && search && /^\d{4,}$/.test(search)) {
                tryAddByBarcode(search);
              }
            }}
            onFocus={() => { if (products.length > 0 && search && !/^\d{4,}$/.test(search)) setShowDropdown(true); }}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: "#aaa", mr: 1 }} />
              ),
              sx: { borderRadius: 2, background: "#f8fafc", height: 44 }
            }}
            sx={{ minWidth: 340 }}
            autoComplete="off"
          />
          {/* Search Results Dropdown */}
          {showDropdown && search && !/^\d{4,}$/.test(search) && (
            <Paper sx={{
              position: "absolute",
              top: 50,
              left: 0,
              width: 340,
              zIndex: 10,
              maxHeight: 300,
              overflowY: "auto",
              borderRadius: 2,
              boxShadow: 3,
              p: 1
            }}>
              {products.map((prod) => (
                <Box
                  key={prod.products_id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1,
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                    "&:hover": { background: "#f0f4ff" }
                  }}
                  onClick={() => handleAddToCart(prod)}
                >
                  <Typography>{prod.products_name}</Typography>
                  <Typography color="primary">₹{prod.discount_price || prod.products_price}</Typography>
                </Box>
              ))}
              {products.length === 0 && (
                <Typography sx={{ p: 2, color: "#888" }}>No products found.</Typography>
              )}
            </Paper>
          )}
        </Box>
        <Box sx={{ flexGrow: 1 }} />

        {/* History and Logout Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: 2 }}>
          <AccentButton
            sx={{
              background: "linear-gradient(90deg, #4e54c8 0%, #8f94fb 100%)",
            }}
            onClick={handleShowHistory}
          >
            Show History
          </AccentButton>

          <Box sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
            <Box
              sx={{
                width: 40, height: 40, bgcolor: "#f47920", color: "#fff",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "bold", fontSize: 22, cursor: "pointer"
              }}
              onClick={(e) => handleAvatarClick(e)}
            >
              {userLoginStatus ? userLoginStatus.role.slice(0, 1).toUpperCase() : ""}
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
      </Box>

      {/* Main content row: Cart & Calculator side by side */}
      <Box sx={{
        display: "flex",
        flex: 1,
        gap: 4,
        minHeight: 0,
        alignItems: "stretch",
      }}>
        {/* Left: Cart & Summary */}
        <GlassCard sx={{ flex: 2.5, minWidth: 0, mr: 2 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Cart Items
          </Typography>

          {/* Cart Table */}
          <Box
            sx={{
              mb: 2,
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              background: "#f8fafc",
            }}
          >
            {/* Table Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 2,
                py: 1,
                background: "#e0e7ff",
                fontWeight: 700,
                fontSize: 16,
                color: "#222",
              }}
            >
              <Box sx={{ width: 100, textAlign: "center" }}>Barcode / Item #</Box>
              <Box sx={{ flex: 2, textAlign: "center" }}>Product Name</Box>
              <Box sx={{ width: 90, textAlign: "center" }}>Price</Box>
              <Box sx={{ width: 90, textAlign: "center" }}>MRP</Box>
              <Box sx={{ width: 90, textAlign: "center" }}>GST</Box>
              <Box sx={{ width: 100, textAlign: "center" }}>Quantity</Box>
              <Box sx={{ width: 90, textAlign: "center" }}>Total</Box>
              <Box sx={{ width: 90, textAlign: "center" }}>Combo</Box>
              <Box sx={{ width: 120, textAlign: "center" }}>Actions</Box>
            </Box>

            {/* Table Rows */}
            {cart.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center", color: "#888" }}>No items in cart.</Box>
            ) : (
              cart.map((item, idx) => (
                <Box
                  key={item.products_id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                    py: 1.5,
                    borderBottom: "1px solid #e0e7ff",
                    background: idx % 2 === 0 ? "#0e6de1" : "#fff", // Alternate row color
                    color: idx % 2 === 0 ? "white" : "black", // Alternate row color
                    transition: "background 0.2s",
                    "&:hover": {
                      background: idx % 2 === 0 ? "#cce8e3" : "#cce8e3", // Alternate row color
                      color: "black",
                    }
                  }
                  }
                >
                  {/* Barcode */}
                  < Box sx={{ width: 100, textAlign: "center", fontSize: 15, fontWeight: 500 }}>
                    {item.barcode || item.products_id}
                  </Box>
                  {/* Title */}
                  < Box sx={{ flex: 2, fontWeight: 500, fontSize: 16, pl: 1, textAlign: "center" }}>
                    {item.products_name}
                  </Box>
                  {/* Price */}
                  <Box sx={{ width: 90, textAlign: "center", fontWeight: 600 }}>
                    ₹{item.discount_price || item.products_price}
                  </Box>
                  {/* MRP */}
                  <Box sx={{ width: 90, textAlign: "center", textDecoration: "line-through" }}>
                    {item.discount_price ? `₹${item.products_price}` : ""}
                  </Box>
                  {/* GST */}
                  <Box sx={{ width: 90, textAlign: "center", }}>
                    {item.gst ? `${item.gst}%` : `0%`}
                  </Box>
                  {/* Qty controls */}
                  <Box sx={{
                    width: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0,
                    background: "#f5f7fa",
                    borderRadius: 2,
                    py: 0.5
                  }}>
                    {/* "-" button: disabled for combo */}
                    <IconButton
                      size="small"
                      onClick={() => handleQtyChange(item.products_id, -1)}
                      sx={{ p: 0.5, minWidth: 24 }}
                      disabled={item.is_combo}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    {/* Quantity display */}
                    <Typography sx={{ mx: 0.5, minWidth: 22, textAlign: "center", fontWeight: 600, fontSize: 16, color: "black" }}>
                      {item.quantity}
                    </Typography>
                    {/* "+" button: disabled for combo and when at max */}
                    <IconButton
                      size="small"
                      onClick={() => handleQtyChange(item.products_id, 1)}
                      sx={{ p: 0.5, minWidth: 24 }}
                      disabled={
                        item.is_combo ||
                        item.quantity >= (item.quantity_available ?? item.quantity)
                      }
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  {/* Total */}
                  <Box sx={{ width: 90, textAlign: "center", fontWeight: 600 }}>
                    ₹{((item.discount_price || item.products_price) * item.quantity).toFixed(2)}
                  </Box>
                  {/* Combo */}
                  <Box sx={{ width: 90, textAlign: "center", fontWeight: 600 }}>
                    {item.is_combo ? "Yes" : "No"}
                  </Box>
                  {/* Actions */}
                  <Box sx={{ width: 120, display: "flex", justifyContent: "center", gap: 1 }}>
                    <IconButton color="error" size="small" onClick={() => handleRemove(item.products_id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))
            )}
          </Box>

          {/* Transaction Summary and Actions */}
          {
            cart.length !== 0 &&
            <Box sx={{ mb: 2 }}>
              <GlassCard sx={{ background: "rgba(0,114,255,0.07)", mb: 2 }}>
                <Typography fontWeight={600}>Transaction Summary</Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                  <Typography>Sub Total</Typography>
                  <Typography>₹{subTotal.toFixed(2)}</Typography>
                </Box>
                {/* <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography>SGST</Typography>
          <Typography>₹0.00</Typography>
        </Box> */}
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography>GST</Typography>
                  <Typography>₹{totalGst}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, fontWeight: 700, fontSize: 18 }}>
                  <Typography>Grand Total</Typography>
                  <Typography color="#0072ff">₹{subTotal.toFixed(2)}</Typography>
                </Box>
              </GlassCard>
            </Box>
          }
          {
            cart.length !== 0 &&
            <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
              <AccentButton
                sx={{ flex: 2, background: "linear-gradient(90deg, #ff5858 0%, #f09819 100%)" }}
                startIcon={<ShoppingCartIcon />}
                onClick={() => {
                  setBillingOpen(true); console.log(cart);
                }}
              >
                Checkout
              </AccentButton>
            </Box>
          }
        </GlassCard >

        {/* Right: Calculator & Payment */}
        < GlassCard sx={{ flex: 0.8, minWidth: 0, maxWidth: 300, alignItems: "center", gap: 2 }}>
          {/* Calculator input */}

          < TextField
            value={amount}
            onChange={handleAmountChange}
            variant="standard"
            size="medium"
            inputProps={{
              style: { fontSize: 28, textAlign: "center", color: "#0072ff", fontWeight: 700 },
              inputMode: "decimal",
              pattern: "[0-9.]*"
            }}
            sx={{ width: 200, mb: 2 }}
            InputProps={{
              endAdornment: (
                amount && ( // show only if there is text
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setAmount("")}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              ),
            }}
          />
          {/* Calculator UI */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 70px)", gap: 2 }}>
            {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0, "00", "."].map((val, idx) => (
              <Button
                key={idx}
                variant="contained"
                sx={{
                  borderRadius: 2,
                  fontSize: 22,
                  background: "#e0e7ff",
                  color: "#222",
                  fontWeight: 700,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
                onClick={() => handleAmountInput(val)}
              >
                {val}
              </Button>
            ))}
          </Box>

          {/* Calculate Change button */}
          <AccentButton
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => onCalChange()}
          >
            Calculate Change
          </AccentButton>

          {/* Show the change below the button */}
          {
            changeAmount !== "" && (
              <Typography sx={{ mt: 2, fontWeight: 700, fontSize: 20 }}>
                Change: <span style={{ color: "#0072ff" }}>₹ {changeAmount}</span>
              </Typography>
            )
          }
          {/* Only show Cash payment method */}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <PaymentButton
              startIcon={<AttachMoneyIcon />}
              selected={paymentMethod === "cash"}
              onClick={() => setPaymentMethod("cash")}
            >Cash</PaymentButton>
          </Box>
        </GlassCard >
      </Box >

      {/* Billing Dialog */}
      < Dialog open={billingOpen} onClose={() => setBillingOpen(false)} maxWidth="sm" fullWidth >
        <DialogTitle>Billing</DialogTitle>
        <DialogContent>
          <TextField
            label="Customer Mobile"
            value={customerMobile}
            onChange={e => setCustomerMobile(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
            fullWidth
            margin="normal"
            inputProps={{ maxLength: 10 }}
            disabled={customerLoading}
          />
          <TextField
            label="Customer Name"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            fullWidth
            margin="normal"
            disabled={customerLoading}
          />
          {customerLoading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <CircularProgress size={18} />
              <Typography variant="body2">Checking customer...</Typography>
            </Box>
          )}
          {/* Combo restriction message for non-existing customer */}
          {!isExistingCustomer && hasComboItem && (
            <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: "#fff3cd", borderRadius: 2 }}>
              <Typography color="warning.main" fontWeight={700}>
                You are not an existing customer. Please remove combo item(s) from the cart.
              </Typography>
            </Box>
          )}
          {/* Combo restriction message for existing customer who already purchased combo */}
          {isExistingCustomer && hasComboItem && isComboPurchased && (
            <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: "#ffe0e0", borderRadius: 2 }}>
              <Typography color="error.main" fontWeight={700}>
                You have already purchased a combo product. You cannot buy again.
              </Typography>
            </Box>
          )}
          {/* Non-existing customer buying individual products */}
          {!hasComboItem && !isExistingCustomer && (
            <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: "#ffe0e0", borderRadius: 2 }}>
              <Typography color="error.main" fontWeight={700}>
                You are not existing customer so this is your final price.
              </Typography>
            </Box>
          )}
          <Box sx={{ mt: 2 }}>
            <Typography fontWeight={700}>Cart Items:</Typography>
            {cart.map(item => (
              <Box key={item.products_id} sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                <Typography>{item.products_name} x {item.quantity}</Typography>
                <Typography>
                  ₹{
                    // Show price based on customer type and combo status
                    (!hasComboItem && !isExistingCustomer)
                      ? (item.products_price * item.quantity).toFixed(2)
                      : ((item.discount_price || item.products_price) * item.quantity).toFixed(2)
                  }
                </Typography>
              </Box>
            ))}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, fontWeight: 700 }}>
              <Typography>Grand Total:</Typography>
              <Typography color="primary">
                ₹{
                  (!hasComboItem && !isExistingCustomer)
                    ? mrpTotal.toFixed(2)
                    : subTotal.toFixed(2)
                }
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBillingOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            // Disable submit if non-existing customer with combo OR existing customer already purchased combo
            disabled={
              (!isExistingCustomer && hasComboItem) ||
              (isExistingCustomer && hasComboItem && isComboPurchased)
            }
            onClick={handleBillingSubmit}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog >

      {/* Snackbar for billing success */}
      < Snackbar
        open={successSnackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSuccessSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setSuccessSnackbarOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Billing successful!
        </MuiAlert>
      </Snackbar >
    </Box >
  );
};

export default CashierDashboard;