const express = require("express");
const admin_route = express.Router();
const adminController = require("../controllers/adminController");
const adminDashboard = require('../controllers/adminDashboard')
const adminAuth= require('../middleware/adminAuth');
const nocache=require('nocache')
const store = require("../middleware/multer");
const { isLogout, isLogin } = adminAuth

//adminlogin
admin_route.get('/',isLogout,adminController.loadLogin)
admin_route.post('/login',adminController.verifyLogin)
admin_route.get('/logout',adminController.adminLogout)

//dashboard
admin_route.get('/admindash',adminDashboard.loadDashboard);
admin_route.get('/chartData', adminDashboard.chartData)
admin_route.get('/getSales', adminDashboard.getSales)
admin_route.post('/downloadSalesReport', adminDashboard.downloadSalesReport)
admin_route.get('/renderSalesReport', adminDashboard.renderSalesReport)


//user management
admin_route.get("/users",isLogin,  adminController.loadUsers)
admin_route.get("/blockUser/:id",isLogin,  adminController.blockUser);

//category management
admin_route.get("/categories",isLogin,  adminController.loadCategories);
admin_route.get('/addCategory',isLogin,adminController.addCategory)
admin_route.post('/addCategory',isLogin, store.single('image') , adminController.addNewCategory)
admin_route.get('/editCategory/:id', isLogin,adminController.editCategory)
admin_route.post('/updateCategory/:id',isLogin, store.single('image') , adminController.updateCategory)
admin_route.get('/unlistCategory/:id',isLogin, adminController.unlistCategory)
admin_route.get('/deleteCategory/:id', isLogin, adminController.deleteCategory)

//product management
admin_route.get("/products", isLogin, adminController.loadProducts)
admin_route.get('/addProduct', isLogin, adminController.addProduct)
admin_route.post('/addProduct', isLogin,  store.array('image', 4), adminController.addNewProduct)
admin_route.delete('/product_img_delete', adminController.deleteProductImage)
admin_route.get('/updateProduct/:id', store.array('image', 4) , isLogin, adminController.updateProduct)
admin_route.post('/updateProduct/:id', store.array('image', 5) , isLogin, adminController.updateNewProduct)
admin_route.get('/deleteProduct/:id',  adminController.deleteProduct)

//order management
admin_route.get("/orders",adminController.loadOrders)
admin_route.post('/updateOrder', adminController.updateOrder)
admin_route.get('/orderDetails', adminController.orderDetails)

//coupon management
admin_route.get('/coupons', adminAuth.isLogin, adminController.loadCoupons)
admin_route.get('/loadAddCoupon', adminAuth.isLogin, adminController.loadAddCoupon)
admin_route.post('/addCoupon', adminController.addCoupon)
admin_route.post('/blockCoupon', adminController.blockCoupon)
admin_route.post('/deleteCoupon', adminController.deleteCoupon)


module.exports=admin_route