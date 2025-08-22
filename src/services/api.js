import axios from 'axios'

// export const baseURL = 'https://newapiroutekkmartpossystem.invtechnologies.in/'

// live in below
export const baseURL = 'https://apiroutekkmartapp.kkmartonline.com/'
// export const baseURL = 'http://192.168.0.103:1431/'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json', },
})

// login API
export const login = (data) =>
  api.post('login_pos', data);

// fetch API's
// export const getDashboardStats = () =>
//   api.get('dashboard_stats');

export const getAllCategories = () =>
  api.get('get_all_categories')

export const createCategory = (data) =>
  api.post('create_category', data)

export const updateCategory = (id, data) =>
  api.put(`update_category/${id}`, data)

export const createSupplier = (data) =>
  api.post('create_supplier', data)

export const getAllSuppliers = () =>
  api.get('get_all_suppliers')

export const updateSupplier = (id, data) =>
  api.put(`update_supplier/${id}`, data)

export const createBrand = (data) =>
  api.post('create_brand', data)

export const getAllBrands = () =>
  api.get('get_all_brands')

export const updateBrand = (id, data) =>
  api.put(`update_brand/${id}`, data)

export const createUnit = (data) =>
  api.post('create_unit', data)

export const getAllUnits = () =>
  api.get('get_all_units')

export const updateUnit = (id, data) =>
  api.put(`update_unit/${id}`, data)

export const getAllStores = () =>
  api.get('get_all_stores')

export const createStore = (data) =>
  api.post('create_stores', data)

export const updateStore = (id, data) =>
  api.put(`update_store_by_id/${id}`, data)

//user management APIs
export const getAllUsers = () =>
  api.get('get_all_users')

export const createUser = (data) =>
  api.post('create_user', data)

export const updateUser = (id, data) =>
  api.put(`update_user/${id}`, data)

export const getAllProducts = () =>
  api.get('get_all_products')

export const createProduct = (data) =>
  api.post('add_products', data)

export const updateProduct = (barcode, data) =>
  api.put(`update_product/${barcode}`, data)

export const fetchBySearchMainProducts = (search) =>
  api.get('search_products', { params: { search } });

export const createStoreProducts = (data) =>
  api.post('crete_store_products', data)

export const getStoreDetailsbyId = (storeid) =>
  api.get(`get_store_details/${storeid}`)

export const updateRemarks = (id, data) =>
  api.put(`update_checked/${id}`, data)

export const updateConfirm = (id, data) =>
  api.put(`update_confirmed/${id}`, data)

export const addCombo = (data) =>
  api.post('create_combo', data)

export const getStoreCombosbyid = (storeid) =>
  api.get(`get_store_combos/${storeid}`)

export const  get_store_product_details = (search, store_id) =>
  api.get('get_store_product_details', { params: { search, store_id } })

export const get_customer_data = async (phone) => {
  return await api.get(`check_customer_purchasing_data/${phone}`);
};

export const billing =  (payload) => {
   return api.post('billing', payload);
}

export const getAllOrders = (payload) => 
  api.post("get_all_orders", payload)

export const getStoreUsers = (storeid) =>
  api.get(`get_store_users/${storeid}`)

// export const getAllEmployeePaymentData = () =>
//   api.get('get_all_employee_payment_data')

export default api;