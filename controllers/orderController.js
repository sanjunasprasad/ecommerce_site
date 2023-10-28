const cloudinary = require('../database/cloudinary')
const User = require("../models/usermodel");
const Category = require("../models/categorymodel");
const Product = require("../models/productmodel");
const Address = require("../models/addressmodel");
const Order = require("../models/ordermodel");
const Coupon = require("../models/couponmodel");
const moment = require("moment");
const path = require('path')
const Razorpay = require('razorpay')

var walletBalance = 0
exports.placeOrder = async (req, res) => {
    try {
        const userData = req.session.user;
        walletBalance = userData.wallet.balance
        const userId = userData._id;
        const addressId = req.body.selectedAddress;
        const amount = req.body.amount;
        const paymentMethod = req.body.selectedPayment;
        const couponData = req.body.couponData;
    //    const test
        const user = await User.findOne({ _id: userId }).populate("cart.product");
        const userCart = user.cart;

        let subTotal = 0;
        let offerDiscount = 0

        userCart.forEach((item) => {
            item.total = item.product.price * item.quantity;
            subTotal += item.total;
        });

        userCart.forEach((item) => {
            if (item.product.oldPrice > 0) {
                item.offerDiscount = (item.product.oldPrice - item.product.price) * item.quantity
                offerDiscount += item.offerDiscount;
            }
        });

        let productData = userCart.map((item) => {
            return {
                id: item.product._id,
                name: item.product.name,
                category: item.product.category,
                subCategory: item.product.subCategory,
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
            ExpectedDeliveryDate.setDate(ExpectedDeliveryDate.getDate() + 3)

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
                req.session.checkout = false

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
                    receipt: "All Silks",
                });

                saveOrder();
                req.session.checkout = false

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
                    req.session.checkout = false

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



exports.orderSuccess = async (req, res) => {
    try {
        const userData = req.session.user;
        const userId = userData._id
        const user = await User.findOne({ _id: userId }).populate("cart.product").lean();



        const cart = user.cart;

        let subTotal = 0;

        cart.forEach((val) => {
            val.total = val.product.price * val.quantity;
            subTotal += val.total;
        });

        const categoryData = await Category.find({ is_blocked: false });
        var useremail = req.session.user.email
        res.render("orderSuccess", { userData, categoryData, loggedIn: true, useremail, subTotal, cart });
    } catch (error) {
        console.log(error.message);
    }
};



exports.myOrders = async (req, res) => {
    const logged = req.session.user
    if (req.session.user) {

        try {
            const page = parseInt(req.query.page) || 1;
            const ordersPerPage = 6;
            const skip = (page - 1) * ordersPerPage;

            const userData = req.session.user;
            const userId = userData._id;
            walletBalance = userData.wallet.balance
            const categoryData = await Category.find({ is_blocked: false });

            const orders = await Order.find({ userId }).sort({ date: -1 }).skip(skip).limit(ordersPerPage);

            const totalCount = await Order.countDocuments({ userId });
            const totalPages = Math.ceil(totalCount / ordersPerPage);

            const formattedOrders = orders.map((order) => {
                const formattedDate = moment(order.date).format("MMMM D, YYYY");
                return { ...order.toObject(), date: formattedDate };
            });

            const user = await User.findOne({ _id: userId }).populate("cart.product").lean();



            const cart = user.cart;

            let subTotal = 0;

            cart.forEach((val) => {
                val.total = val.product.price * val.quantity;
                subTotal += val.total;
            });

            res.render("myOrders", {
                logged,
                userData,
                categoryData,
                myOrders: formattedOrders || [],
                currentPage: page,
                totalPages,
                loggedIn: true,
                walletBalance,
                subTotal,
                cart
            });
        } catch (error) {
            console.log(error.message);
        }
    }
};

exports.orderDetails = async (req, res) => {
    const logged = req.session.user
    if (req.session.user) {
        try {


            const userData = req.session.user;
            const userId = userData._id
            const user = await User.findOne({ _id: userId }).populate("cart.product").lean();
            const cart = user.cart;
            let subTotal = 0;

            cart.forEach((val) => {
                val.total = val.product.price * val.quantity;
                subTotal += val.total;
            });
            const orderId = req.query.orderId;
            walletBalance = userData.wallet.balance
            const categoryData = await Category.find({ is_blocked: false });
            const orderDetails = await Order.findById(orderId).
                populate({
                    path: "product",
                    populate: [
                        { path: "category", model: "category" },
                    ],
                })
                .populate("address");
            // const orderDetails = await Order.findById(orderId);
            // console.log("orderdetails*****:",orderDetails)
            const orderProductData = orderDetails.product;
            const addressId = orderDetails.address;
            console.log("address id from orderdetails:*****", addressId)
            const addressdata = await Address.findById(addressId);
            console.log("address from orderdetails:", addressdata)
            const paymentMethod = orderDetails.paymentMethod

            const ExpectedDeliveryDate = moment(orderDetails.ExpectedDeliveryDate).format('MMMM D, YYYY');
            const deliveryDate = moment(orderDetails.deliveredDate).format('MMMM D, YYYY')
            const returnEndDate = moment(orderDetails.returnEndDate).format('MMMM D, YYYY')
            const currentDate = new Date()
            const wallet = userData.wallet.balance

            res.render("orderDetails", {
                wallet,
                logged,
                currentDate,
                userData,
                categoryData,
                orderDetails,
                orderProductData,
                addressdata,
                ExpectedDeliveryDate,
                loggedIn: true,
                deliveryDate,
                returnEndDate,
                walletBalance,
                cart,
                subTotal,
                paymentMethod
            });
        } catch (error) {
            console.log(error.message);
        }
    }
};

exports.updateOrder = async (req, res) => {
    try {
        console.log("updateorder")
        const userData = req.session.user;
        const userId = userData._id;

        const orderId = req.query.orderId;
        const status = req.body.orderStatus;
        const paymentMethod = req.body.paymentMethod;
        console.log(paymentMethod)
        const updatedBalance = req.body.wallet;
        const total = req.body.total

        const order = await Order.findOne({ _id: orderId })
        const orderIdValue = order.orderId

        if (paymentMethod !== "Cash On Delivery") {
            await User.findByIdAndUpdate(userId, { $set: { "wallet.balance": updatedBalance } }, { new: true });


            if (status === "Returned") {
                await Order.findByIdAndUpdate(orderId, { $set: { status: status, }, $unset: { ExpectedDeliveryDate: "" } });

                const transaction = {
                    date: new Date(),
                    details: `Returned Order - ${orderIdValue}`,
                    amount: total,
                    status: "Credit",
                };

                await User.findByIdAndUpdate(userId, { $push: { "wallet.transactions": transaction } }, { new: true })


                res.json({
                    message: "Returned",
                    refund: "Refund",
                });
            }
            if (status === "Cancelled") {
                await Order.findByIdAndUpdate(orderId, { $set: { status: status, }, $unset: { ExpectedDeliveryDate: "" } });

                const transaction = {
                    date: new Date(),
                    details: `Cancelled Order - ${orderIdValue}`,
                    amount: total,
                    status: "Credit",
                };

                await User.findByIdAndUpdate(userId, { $push: { "wallet.transactions": transaction } }, { new: true })


                res.json({
                    message: "Cancelled",
                    refund: "Refund",
                });
            }
        } else if (paymentMethod == "Cash On Delivery" && status === "Returned") {

            await User.findByIdAndUpdate(userId, { $set: { "wallet.balance": updatedBalance } }, { new: true });


            const transaction = {
                date: new Date(),
                details: `Returned Order - ${orderIdValue}`,
                amount: total,
                status: "Credit",
            };

            await User.findByIdAndUpdate(userId, { $push: { "wallet.transactions": transaction } }, { new: true })

            await Order.findByIdAndUpdate(orderId, { $set: { status: status, }, $unset: { ExpectedDeliveryDate: "" } });
            res.json({
                message: "Returned",
                refund: "Refund",
            });
        } else if (paymentMethod == "Cash On Delivery" && status === "Cancelled") {
            await Order.findByIdAndUpdate(orderId, { $set: { status: status, }, $unset: { ExpectedDeliveryDate: "" } });
            res.json({
                message: "Cancelled",
                refund: "No Refund",
            });
        }
    } catch (error) {
        console.log(error.message);
    }
};

