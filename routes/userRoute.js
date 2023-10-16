const userController = require("../controllers/userController");
const productController = require('../controllers/productController');
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const express = require("express");
const user_route = express.Router();
const auth = require("../middleware/userAuth")
const { isLogout, isLogin,isCheckout, blockCheck } = auth


//home page
user_route.get('/',userController.homeload)
user_route.get('/userhome',userController.userhomeload)
user_route.get('/aboutus',userController.aboutus)

//login
user_route.get("/login",isLogout ,userController.loginload);
user_route.post('/login',  userController.verifyLogin);
user_route.get('/logout',  userController.doLogout)


//register+OTP send+OTP verification
user_route.get('/register',isLogout,userController.registerload)
user_route.post('/signup',  userController.sendOtp)
user_route.get('/showOtp', isLogout,userController.showOtp) //send otp for verfication
user_route.post('/otpEnter' ,isLogout,userController.verifyOtp); //otp postverfication

//forgot 
user_route.get('/forgotPassword',isLogout,userController.loadForgotPassword)
user_route.post('/verifyEmail',isLogout,userController.verifyForgotpasswordEmail)
user_route.get('/forgotOtpEnter',isLogout,userController.showForgotpasswordOtp)//forgot otp
user_route.post('/verifyForgotOtp',isLogout,userController.verifyForgotOtp)
user_route.get('/resendForgotPasswordotp', isLogout ,userController.resendForgotOtp)//forgot otp resend
user_route.post('/newPassword',isLogout, userController.updatePassword)

//user side productview
user_route.get("/shop",blockCheck, productController.shop)    
user_route.get("/prodetail",blockCheck,productController.prodetail)


//sort+search+filter
user_route.get('/categoryFilter', productController.categoryFilter)
user_route.post('/sortProduct', productController.sortProduct)



//cart
user_route.get('/cart',isLogin,blockCheck,cartController.loadCart)
user_route.get("/addToCart",cartController.addToCart)
user_route.post('/cartUpdation',cartController.updateCart)
user_route.get('/removeCart',cartController.removeCart)
user_route.get('/checkStock', cartController.checkStock)
user_route.get('/checkout',isCheckout, isLogin, blockCheck,cartController.loadCheckout)
user_route.post('/validateCoupon', cartController.validateCoupon)

//order
user_route.post('/placeOrder', orderController.placeOrder)
user_route.get('/orderSuccess', orderController.orderSuccess)
user_route.get('/myOrders', orderController.myOrders)
user_route.get('/orderDetails',orderController.orderDetails)
user_route.post('/updateOrder', orderController.updateOrder)


//wishlist
user_route.get('/wishlist', isLogin, blockCheck, cartController.loadWishlist)
user_route.get('/addToWishlist', cartController.addToWishlist)
user_route.get('/removeWishlist', cartController.removeWishlist)
user_route.get('/addToCartFromWishlist', cartController.addToCartFromWishlist)



//user profile 
user_route.get("/myaccount",isLogin, blockCheck,userController.loadProfile);
user_route.get('/editaccount', userController.editaccount);
user_route.post("/editaccountpost", userController.editaccountpost );
user_route.get('/wallet',userController.walletTransaction);

//profile address
user_route.post('/addNewAddress', userController.addNewAddress);
user_route.get('/deleteAddress', userController.deleteAddress)
user_route.get('/editAddress', userController.editAddress)
user_route.post('/editAddressPost', userController.editAddressPost)





module.exports=user_route