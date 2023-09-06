const express = require("express");
const admin_route = express.Router();
const adminController = require("../controllers/adminController");
const adminAuth= require('../middleware/adminAuth');
const nocache=require('nocache')

//adminlogin
admin_route.get('/',adminController.loadLogin)
admin_route.post('/loginpost',adminController.verifyLogin)
admin_route.get('/logout',adminController.adminLogout)
// admin_route.get('/dash',adminController.dashbaord)

//user management
admin_route.get("/users",  adminController.loadUsers)
admin_route.get("/blockUser/:id",  adminController.blockUser);

//category management






module.exports=admin_route