const cloudinary = require('../database/cloudinary')
const User = require("../models/usermodel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Address = require("../models/addressmodel");
const Order = require("../models/orderModel");


exports. placeOrder = async (req, res) => {
    try {
         console.log(400)
        const userData = req.session.user;
        // walletBalance=userData.wallet.balance
        const userId = userData._id;
        const addressId = req.body.selectedAddress
        console.log(500,addressId)
        const amount = req.body.amount;
        const paymentMethod = req.body.selectedPayment;
        console.log(500,paymentMethod)
        // const couponData = req.body.couponData;

        const user = await User.findOne({ _id: userId }).populate("cart.product");
        const userCart = user.cart;

        let subTotal = 0;
        let offerDiscount = 0

        userCart.forEach((item) => {
            item.total = item.product.price * item.quantity;
            subTotal += item.total;
        });

        userCart.forEach((item) => {
            if(item.product.oldPrice > 0){
            item.offerDiscount = (item.product.oldPrice - item.product.price) * item.quantity
            offerDiscount += item.offerDiscount;
            }
        });

        let productData = userCart.map((item) => {
            return {
                id: item.product._id,
                name: item.product.name,
                category: item.product.category,
                price: item.product.price,
                oldPrice: item.product.oldPrice,
                quantity: item.quantity,
                image: item.product.imageUrl[0].url,
            };
        });

        const result = Math.random().toString(36).substring(2, 7);
        const id = Math.floor(100000 + Math.random() * 900000);
        const orderId = result + id;

        let saveOrder = async () => {

            const ExpectedDeliveryDate = new Date()
            ExpectedDeliveryDate.setDate(ExpectedDeliveryDate.getDate() + 3 )

            if (couponData) {
                const order = new Order({
                    userId: userId,
                    product: productData,
                    address: addressId,
                    orderId: orderId,
                    total: amount,
                    ExpectedDeliveryDate: ExpectedDeliveryDate,
                    offerDiscount: offerDiscount,
                    paymentMethod: paymentMethod,
                    discountAmount: couponData.discountAmount,
                    amountAfterDiscount: couponData.newTotal,
                    couponName: couponData.couponName,
                });

                await order.save();

                const couponCode = couponData.couponName
                await Coupon.updateOne({ code: couponCode }, { $push: { usedBy: userId } })

                
            } else {
                const order = new Order({
                    userId: userId,
                    product: productData,
                    address: addressId,
                    orderId: orderId,
                    total: subTotal,
                    ExpectedDeliveryDate: ExpectedDeliveryDate,
                    offerDiscount: offerDiscount,
                    paymentMethod: paymentMethod,
                });

                const orderSuccess = await order.save();
            }

            let userDetails = await User.findById(userId);
            let userCartDetails = userDetails.cart;

            userCartDetails.forEach(async (item) => {
                const productId = item.product;
                const quantity = item.quantity;

                const product = await Product.findById(productId);
                const stock = product.stock;
                const updatedStock = stock - quantity;

                await Product.findByIdAndUpdate(
                    productId,
                    { $set: { stock: updatedStock, isOnCart: false } },
                    { new: true }
                );
            });

            userDetails.cart = [];
            await userDetails.save();
        };

        if (addressId) {
            if (paymentMethod === "Cash On Delivery") {

                saveOrder();               
                req.session.checkout =false
                
                res.json({
                    order: "Success",
                });
                
            } else if (paymentMethod === "Razorpay") {
                var instance = new Razorpay({
                    key_id: process.env.RAZORPAY_KEY_ID,
                    key_secret: process.env.RAZORPAY_KEY_SECRET,
                });

                const order = await instance.orders.create({
                    amount: amount * 100,
                    currency: "INR",
                    receipt: "Gadgetry",
                });

                saveOrder();
                req.session.checkout =false

                res.json({
                    order: "Success",
                });
                
            } else if (paymentMethod === "Wallet") {
                try {
                    const walletBalance = req.body.walletBalance;

                    await User.findByIdAndUpdate(userId, { $set: { "wallet.balance": walletBalance } }, { new: true });
                    
                    const transaction = {
                        date: new Date(),
                        details: `Confirmed Order - ${orderId}`,
                        amount: subTotal,
                        status: "Debit",
                    };

                    await User.findByIdAndUpdate(userId, { $push: { "wallet.transactions": transaction } }, { new: true })

                    saveOrder();
                    req.session.checkout =false

                    res.json({
                        order: "Success",
                    });
                } catch (error) {
                    console.log(error.message);
                }
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};

exports. orderSuccess = async (req, res) => {
    try {
        const userData = req.session.user;
        const userId=userData._id
        const user = await User.findOne({ _id: userId }).populate("cart.product").lean();
        const cart = user.cart;
       
        let subTotal = 0;

        cart.forEach((val) => {
            val.total = val.product.price * val.quantity;
            subTotal += val.total;
        });

        const categoryData = await Category.find({ is_blocked: false });
        var useremail=req.session.user.email
        res.render("orderSuccess", { userData, categoryData ,loggedIn:true,useremail,subTotal,cart});
    } catch (error) {
        console.log(error.message);
    }
};