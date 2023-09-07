const express = require("express");
const admin_route = express.Router();
const adminController = require("../controllers/adminController");
const adminAuth= require('../middleware/adminAuth');
const nocache=require('nocache')
const store = require("../middleware/multer");

//adminlogin
admin_route.get('/',adminController.loadLogin)
admin_route.post('/loginpost',adminController.verifyLogin)
admin_route.get('/logout',adminController.adminLogout)
// admin_route.get('/dash',adminController.dashbaord)

//user management
admin_route.get("/users",  adminController.loadUsers)
admin_route.get("/blockUser/:id",  adminController.blockUser);

//category management
admin_route.get("/categories",  adminController.loadCategories)
admin_route.get('/addCategory',adminController.addCategory)
admin_route.post('/addCategory', store.single('image') , adminController.addNewCategory)
admin_route.get('/editCategory/:id', adminController.editCategory)
admin_route.post('/updateCategory/:id', adminAuth.isLogin, store.single('image') , adminController.updateCategory)
admin_route.get('/unlistCategory/:id', adminAuth.isLogin, adminController.unlistCategory)
admin_route.get('/deleteCategory/:id',  adminController.deleteCategory)

//product management
admin_route.get("/products",  adminController.loadProducts)
// admin_route.get('/addProduct', adminAuth.isLogin, adminController.addProduct)
// admin_route.post('/addProduct', adminAuth.isLogin, store.array('image', 4), adminController.addNewProduct)
// admin_route.delete('/product_img_delete', adminController.deleteProductImage)
// admin_route.get('/updateProduct/:id', store.array('image', 4) , adminAuth.isLogin, adminController.updateProduct)
// admin_route.post('/updateProduct/:id', store.array('image', 5) , adminAuth.isLogin, adminController.updateNewProduct)
// admin_route.get('/deleteProduct/:id', adminAuth.isLogin, adminController.deleteProduct)






module.exports=admin_route