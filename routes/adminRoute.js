const express = require("express");
const admin_route = express.Router();
const adminController = require("../controllers/adminController");
// const adminAuth= require('../middleware/adminAuth');
// admin_route.set("views", "./views/adminView");
const nocache=require('nocache')


admin_route.get('/',adminController.loadLogin)
admin_route.post('/loginpost',adminController.verifyLogin)
admin_route.get('/logout',adminController.adminLogout)
admin_route.get('/admindash',adminController.loadDashboard)







module.exports=admin_route