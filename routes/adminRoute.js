const express = require("express");
const admin_route = express.Router();
const adminController = require("../controllers/adminController");
// const adminAuth= require('../middleware/adminAuth');
// admin_route.set("views", "./views/adminView");
const nocache=require('nocache')

//login
admin_route.get('/',adminController.loadLogin)
admin_route.post('/loginpost',adminController.verifyLogin)
admin_route.get('/logout',adminController.adminLogout)
// admin_route.get('/dash',adminController.dashbaord)

//user management
admin_route.get("/users",  adminController.loadUsers)
admin_route.get("/blockUser/:id",  adminController.blockUser);









module.exports=admin_route