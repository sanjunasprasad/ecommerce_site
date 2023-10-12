const cloudinary = require('../database/cloudinary');
const User = require("../models/usermodel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Address = require("../models/addressmodel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponmodel");

var  walletBalance=0
exports. loadCart = async (req, res) => {
    try {
        req.session.checkout = true
        logged=req.session.user
        const userData = req.session.user;
        const userId = userData._id;
        const usertest= await User.findById(userId).lean();
        console.log("User before population:", usertest);

        walletBalance=userData.wallet.balance
        const categoryData = await Category.find({ is_blocked: false });

        const user = await User.findById(userId).populate("cart.product").lean();

        // await User.populate(user, { path: "cart.product" });
        // console.log("User after population:", user);

        const cart = user.cart;
        console.log("cart:",cart);
        let subTotal = 0;

        cart.forEach((val) => {
            val.total = val.product.price * val.quantity;
            subTotal += val.total;
        });
     
        console.log("length of cart:",cart.length);
        if (cart.length === 0) {
            res.render("emptyCart", { userData, categoryData ,cart:{},subTotal:0,walletBalance,logged});
        } else {
            res.render("cart", { userData, cart, subTotal,walletBalance, categoryData,logged});
        }
    } catch (error) {
        console.log(error.message);
        const userData = req.session.user;
        const categoryData = await Category.find({ is_blocked: false });
        res.render("404", { userData, categoryData ,loggedIn:true,walletBalance});
    }
};


exports. addToCart = async (req, res) => {
    const logged=req.session.user
    if(req.session.user)
    {
        try {
        
            const userData = req.session.user;
            const productId = req.query.id;
            const quantity = req.query.quantity;
            const userId = userData._id;
    
            const product = await Product.findById(productId);
            const existed = await User.findOne({ _id: userId, "cart.product": productId });
            const filter={_id:productId}
            if (existed) {
                await User.findOneAndUpdate(
                    { _id: userId, "cart.product": productId },
                    { $inc: { "cart.$.quantity": quantity ? quantity : 1 } },
                    { new: true }
                );
              
    
               return res.json({ message: "Item already in cart!!" });
            } else {
                await Product.findOneAndUpdate(filter, { isOnCart: true });
                await User.findByIdAndUpdate(
                    userId,
                    {
                        $push: {
                            cart: {
                                product: product._id,
                                quantity: quantity ? quantity : 1,
                            },
                        },
                    },
                    { new: true }
                );
                console.log(User)
    
              return  res.json({ message: "Item added to cart" });
            }
        } catch (error) {
            console.log(error.message);
            const userData = req.session.user;
            return res.status(500).json({ error: "Internal Server Error" });
        }

    }
   
};

exports. updateCart = async (req, res) => {
    const logged=req.session.user
    if(req.session.user)
    {
        try {
      
            const userData = req.session.user;
            const data = await User.find({ _id: userData._id }, { _id: 0, cart: 1 }).lean();
            data[0].cart.forEach((val, i) => {
                val.quantity = req.body.datas[i].quantity;
            });
    
            await User.updateOne({ _id: userData._id }, { $set: { cart: data[0].cart } });
            res.status(200).send();
        } catch (error) {
            console.log(error.message);
        }

    }
   
};

exports. removeCart = async (req, res) => {
    try {
        const userData = req.session.user;
        const userId = userData._id;
        const productId = req.query.productId;
        const cartId = req.query.cartId;

        await Product.findOneAndUpdate({ _id: productId }, { $set: { isOnCart: false } }, { new: true });

        await User.updateOne({ _id: userId }, { $pull: { cart: { _id: cartId } } });

        res.status(200).send();
    } catch (error) {
        console.log(error.message);
    }
};


exports. checkStock = async (req, res) => {
    try {
        const userData = req.session.user;
        const userId = userData._id;

        const userCart = await User.findOne({ _id: userId }).populate("cart.product").lean();
        const cart = userCart.cart;

        let stock = [];

        cart.forEach((element) => {
            if (element.product.stock - element.quantity <= 0) {
                stock.push(element.product);
            }
        });

        if (stock.length > 0) {
            res.json(stock);
        } else {
            res.json({ message: "In stock" });
        }
    } catch (error) {
        console.log(error.message);
    }
};




exports. loadCheckout = async (req, res) => {

    try {
       
        const userData = req.session.user;
        const userId = userData._id;
        const categoryData = await Category.find({ is_blocked: false });
        const addressData = await Address.find({ userId: userId })

        const userCart = await User.findOne({ _id: userId }).populate("cart.product").lean();
        const cart = userCart.cart;
        let subTotal = 0;
        let offerDiscount = 0

        cart.forEach((element) => {
            element.total = element.product.price * element.quantity;
            subTotal += element.total
        });

        cart.forEach((element) => {
            if(element.product.oldPrice > 0){
            element.offerDiscount = (element.product.oldPrice - element.product.price) * element.quantity;
            offerDiscount += element.offerDiscount
            }
        });

        const now = new Date();
        const availableCoupons = await Coupon.find({
            expiryDate: { $gte: now },
            usedBy: { $nin: [userId] },
            status: true,
        })


        res.render("checkout", { 
            userData, 
            categoryData, 
            addressData, 
            walletBalance,
            offerDiscount, 
            availableCoupons,
            subTotal, 
            cart, 
            loggedIn:true,  
        });
        
    } catch (error) {
        console.log(error.message);
    }
};


exports.validateCoupon = async (req, res) => {
    try {
        const { coupon, subTotal } = req.body;
        const couponData = await Coupon.findOne({ code: coupon });

        if (!couponData) {
            res.json("invalid");
        } else if (couponData.expiryDate < new Date()) {
            res.json("expired");
        } else {
            const couponId = couponData._id;
            const discount = couponData.discount;
            const minDiscount = couponData.minDiscount
            const maxDiscount = couponData.maxDiscount
            const userId = req.session.user._id;

            const couponUsed = await Coupon.findOne({ _id: couponId, usedBy: { $in: [userId] } });

            if (couponUsed) {
                res.json("already used");
            } else {

                let discountAmount
                let maximum

                const discountValue = Number(discount);
                const couponDiscount = (subTotal * discountValue) / 100;

                if(couponDiscount < minDiscount){

                    res.json("minimum value not met")

                }else{
                    if(couponDiscount > maxDiscount){
                        discountAmount = maxDiscount
                        maximum = "maximum"
                    }else{
                        discountAmount = couponDiscount
                    }
                    
                    const newTotal = subTotal - discountAmount;
                    const couponName = coupon;
    
                    res.json({
                        couponName,
                        discountAmount,
                        newTotal,
                        maximum
                    });
                }
                
                
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};



exports. loadWishlist = async (req, res) => {
    const logged = req.session.user
    if(req.session.user)
    {
        try {
            const userData = req.session.user;
            const userId = userData._id;
            const categoryData = await Category.find({ is_blocked: false });
    
            const user = await User.findById(userId).populate("wishlist");
            const wishlistItems = user.wishlist;
    
            const userCart = await User.findOne({ _id: userId }).populate("cart.product").lean();
            const cart = userCart.cart;
            walletBalance=userData.wallet.balance
            let subTotal = 0;
            cart.forEach((element) => {
                element.total = element.product.price * element.quantity;
                subTotal += element.total;
            });
            if (wishlistItems.length === 0) 
            {
                res.render("emptyWishlist", { userData, logged,categoryData,walletBalance,cart ,subTotal});
            } 
            else 
            {
                res.render("wishlist", { userData, categoryData,logged, cart, wishlistItems,  walletBalance ,cart,subTotal});
            }
        } catch (error) {
            console.log(error.message);
        }

    }
    
};


exports. addToWishlist = async (req, res) => {
    try {
        const userData = req.session.user;
        const userId = userData._id;
        const productId = req.query.productId;
        console.log("productid:",productId)
        const cartId = req.query.cartId;

        const existItem = await User.findOne({ _id: userId, wishlist: { $in: [productId] } });

        if (!existItem) {
            await User.updateOne({ _id: userId }, { $push: { wishlist: productId } });
            await Product.updateOne({ _id: productId }, { isWishlisted: true });

            await Product.findOneAndUpdate({ _id: productId }, { $set: { isOnCart: false } }, { new: true });
            await User.updateOne({ _id: userId }, { $pull: { cart: { _id: cartId } } });

            res.json({
                message: "Added to wishlist",
            });
        } else {
            res.json({
                message: "Already Exists in the wishlist",
            });
        }
    } catch (error) {
        console.log(error.message);
    }
};

exports. addToCartFromWishlist = async (req, res) => {
    try {
        const userData = req.session.user;
        const userId = userData._id;
        const productId = req.query.productId;

        const user = await User.findById(userId);
        const product = await Product.findById(productId);
        const existed = await User.findOne({ _id: userId, "cart.product": productId });

        if (existed) {
            res.json({ message: "Product is already in cart!!" });
        } else {
            await Product.findOneAndUpdate({_id:productId}, { isOnCart: true });
            await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        cart: {
                            product: product._id,
                            quantity: 1,
                        },
                    },
                },
                { new: true }
            );
            const itemIndex = user.wishlist.indexOf(productId);

            if (itemIndex >= 0) {
                await User.updateOne({ _id: userId }, { $pull: { wishlist: productId } });
                await Product.updateOne({ _id: productId }, { isWishlisted: false });
            } else {
                res.json({
                    message: "Error Occured!",
                });
            }

            res.json({ message: "Moved to cart from wishlist" });
        }
    } catch (error) {
        console.log(error.message);
    }
}



exports. removeWishlist = async (req, res) => {
    try {
        const userData = req.session.user;
        const userId = userData._id;
        const productId = req.query.productId;

        const user = await User.findById(userId);
        const itemIndex = user.wishlist.indexOf(productId);

        if (itemIndex >= 0) {
            await User.updateOne({ _id: userId }, { $pull: { wishlist: productId } });
            await Product.updateOne({ _id: productId }, { isWishlisted: false });

            res.status(200).send();
        } else {
            res.json({
                message: "Error Occured!",
            });
        }
    } catch (error) {
        console.log(error.message);
    }
};
