import { Box, Typography } from "@mui/material"
import LeftPannel from "../../../components/LeftPannel";
import HeaderPannel from "../../../components/HeaderPannel";
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SupervisorAccountTwoToneIcon from '@mui/icons-material/SupervisorAccountTwoTone';
import { useEffect, useState } from "react";
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, YAxis, XAxis, Bar } from "recharts";
import CountCard from "../../../components/dashboard_components/CountCard";
import { getAllProducts } from "../../../services/api";

const COLORS = ["green", "red",];

const CasherDashboard = () => {
  const [allProduactsCount, setAllProduactsCount] = useState(0);
  // const [recruiterCount, setRecruiterCount] = useState(0);
  // const [serviceRequestCount, setServiceRequestCount] = useState(0);
  // const [paymentReceivedValue, setPaymentReceivedValue] = useState(0);
  // const [withdrawRequestedValue, setWithdrawRequestedValue] = useState(0);
  // const [paymentReceivedGraph, setPaymentReceivedGraph] = useState([]);
  // const [withdrawRequestedGraph, setWithdrawRequestedGraph] = useState([]);

  useEffect(() => {
    // Fetch seeker count
    getAllProducts().then(res => {
      console.log(res.data);
      setAllProduactsCount(res.data.products?.length || 0);
    })
      .catch(() => setAllProduactsCount(0));

    // Fetch recruiter count
    // fetchAllUsers({ userType: "recruiter" }).then(res => {
    //   setRecruiterCount(res.data.pagination?.totalRecords || 0);
    // })
    //   .catch(() => setRecruiterCount(0));

    // Fetch service request count
    // fetchAllServices().then(res => {
    //   setServiceRequestCount(res.data.pagination?.totalRecords || 0);
    // })
    //   .catch(() => setServiceRequestCount(0));

    // fetchpaymentrecivedlist().then(res => {
    //   const data = res.data.data || [];
    //   // console.log(data);
    //   setPaymentReceivedGraph(
    //     data.map(row => ({
    //       done_on: row.done_on?.slice(0, 10),
    //       amount: Number(row.amount || 0)
    //     })).slice(0, 14).reverse()
    //   );
    //   // Sum all amounts (convert to Number in case they are strings)
    //   const total = data.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    //   // console.log(total);
    //   setPaymentReceivedValue(total);
    // }).catch(() => setPaymentReceivedValue(0));

    // fetchwithdrawpaymentlist().then(res => {
    //   const data = res.data.data || [];
    //   // console.log(data);
    //   setWithdrawRequestedGraph(
    //     data.map(row => ({
    //       addedon: row.addedon?.slice(0, 10),
    //       amount: Number(row.amount || 0)
    //     })).slice(0, 14).reverse()
    //   );
    //   // Sum all amounts (convert to Number in case they are strings)
    //   const total = data.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    //   // console.log(total);
    //   setWithdrawRequestedValue(total);
    // }).catch(() => setWithdrawRequestedValue(0));

  }, []);

  const itemValues = [
    {
      HeadTitle: "Products Count",
      IconCompo: SupervisorAccountIcon,
      Value: allProduactsCount,
      navpath: "/manage-seekers"
    },
    // {
    //   HeadTitle: "Recruiters Count",
    //   IconCompo: SupervisorAccountTwoToneIcon,
    //   Value: recruiterCount,
    //   navpath: "/manage-recruiters"
    // },
    // {
    //   HeadTitle: "Services Request Count",
    //   IconCompo: MiscellaneousServicesIcon,
    //   Value: serviceRequestCount,
    //   navpath: "/manage-services"
    // },
    // {
    //   HeadTitle: "Payment Received Amount",
    //   IconCompo: AccountBalanceWalletIcon,
    //   Value: paymentReceivedValue,
    //   navpath: "/manage-payments"
    // },
    // {
    //   HeadTitle: "Withdraw Requested Amount",
    //   IconCompo: CreditScoreIcon,
    //   Value: withdrawRequestedValue,
    //   navpath: "/manage-withdraw"
    // },
  ]

  const pieData = [
    // { name: "Payment Received", value: paymentReceivedValue },
    // { name: "Withdraw Requested", value: withdrawRequestedValue },
  ];

  return (
    <Box sx={{
      width: "99vw",
      height: "94vh",
      backgroundColor: "white",
      // #f4f4f5
      display: "flex",
    }}>
      {/* left pannel */}
      <Box
        sx={{
          display: "flex", justifyContent: "center", alignItems: "start",
          width: "18vw",
          mt: 1.5,
        }}
      >
        <LeftPannel HeaderTitle="Cashier Dashboard" />
      </Box>
      <Box
        sx={{ minWidth: "calc( 99vw - 18vw)", ml: 1.5, }}

      >
        <HeaderPannel HeaderTitle="Cashier Dashboard" />

        {/* Body starts here */}
        <Box sx={{ width: "99%", mb: 4 }}>

          <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap", }}>
            {itemValues.map((item, idx) => (
              <CountCard
                key={idx}
                HeadTitle={item.HeadTitle}
                IconCompo={item.IconCompo}
                Value={item.Value}
                Navpath={item.navpath}
              />
            ))}
          </Box>
          
          <Box sx={{ display: "flex", gap: 2, pt: 4, pb:4 }}>

            {/* <Box sx={{
              width: 400, height: 300, mt: 4, borderRadius: "10px",
              boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    fill="#8884d8"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box> */}
            {/* Payment Received Graph */}
            {/* <Box sx={{ width: 400, height: 300, borderRadius: "10px", boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px", p: 2 }}>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>Payment Received</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={paymentReceivedGraph}>
                  <XAxis dataKey="done_on" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="#0088FE" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </Box> */}
            {/* Withdraw Requested Graph */}
            {/* <Box sx={{ width: 400, height: 300, borderRadius: "10px", boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px", p: 2 }}>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>Withdraw Requested</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={withdrawRequestedGraph}>
                  <XAxis dataKey="addedon" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="#FF8042" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </Box> */}
          </Box>
        </Box>
        {/* Body ends here */}
      </Box>
    </Box >
  );
}

export default CasherDashboard;