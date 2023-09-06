const userController = require("../controllers/userController");
const express = require("express");
const user_route = express.Router();
const auth = require("../middleware/userAuth")
const { isLogout, isLogin, blockCheck } = auth


//home page
user_route.get('/',userController.homeload)
user_route.get('/userhome',userController.userhomeload)
user_route.get('/aboutus',userController.aboutus)

//login
user_route.get("/login", userController.loginload)
user_route.post('/login',  userController.verifyLogin);
user_route.get('/logout',  userController.doLogout)


//register+OTP send+OTP verification
user_route.get('/register',userController.registerload)
user_route.post('/signup',  userController.sendOtp)
user_route.get('/showOtp', userController.showOtp) //send otp for verfication
user_route.post('/otpEnter' ,userController.verifyOtp); //otp postverfication
// user_route.get('/forgotOtpEnter',isLogout,userController.showForgotOtp)
// user_route.post('/verifyForgotOtp',isLogout,userController.verifyForgotOtp)
// user_route.get('/resendForgotPasswordotp', isLogout ,userController.resendForgotOtp)











module.exports=user_route