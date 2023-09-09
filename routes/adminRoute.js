const express = require("express");
const admin_route = express.Router();
const adminController = require("../controllers/adminController");
const adminAuth= require('../middleware/adminAuth');
const nocache=require('nocache')
const store = require("../middleware/multer");
const { isLogout, isLogin } = adminAuth

//adminlogin
admin_route.get('/',isLogout,adminController.loadLogin)
admin_route.post('/loginpost',adminController.verifyLogin)
admin_route.get('/logout',adminController.adminLogout)
// admin_route.get('/dash',adminController.dashbaord)

//user management
admin_route.get("/users",isLogin,  adminController.loadUsers)
admin_route.get("/blockUser/:id",isLogin,  adminController.blockUser);

//category management
admin_route.get("/categories",isLogin,  adminController.loadCategories)
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


module.exports=admin_route