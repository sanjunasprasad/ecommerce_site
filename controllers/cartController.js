const cloudinary = require('../database/cloudinary')
const User = require("../models/usermodel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Address = require("../models/addressmodel");


var  walletBalance=0
exports. loadCart = async (req, res) => {
    try {
        req.session.checkout = true
        logged=req.session.user
        const userData = req.session.user;
        const userId = userData._id;
        const usertest= await User.findById(userId).lean();
        console.log("User before population:", usertest);

        // walletBalance=userData.wallet.balance
        const categoryData = await Category.find({ is_blocked: false });

        const user = await User.findById(userId).populate("cart.product").lean();

        await User.populate(user, { path: "cart.product" });
        console.log("User after population:", user);

        const cart = user.cart;
        console.log("cart:",cart);
        let subTotal = 0;

        cart.forEach((val) => {
            val.total = val.product.price * val.quantity;
            subTotal += val.total;
        });
     
        console.log("length of cart:",cart.length);
        if (cart.length === 0) {
            res.render("emptyCart", { userData, categoryData ,cart:{},subTotal:0,logged});
        } else {
            res.render("cart", { userData, cart, subTotal, categoryData,logged});
        }
    } catch (error) {
        console.log(error.message);
        const userData = req.session.user;
        const categoryData = await Category.find({ is_blocked: false });
        res.render("404", { userData, categoryData ,loggedIn:true});
    }
};


exports. addToCart = async (req, res) => {
    try {
       

        const logged=req.session.user
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
};

exports. updateCart = async (req, res) => {
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
            offerDiscount += element.offerDiscount;
            }
        });

        const now = new Date();
        // const availableCoupons = await Coupon.find({
        //     expiryDate: { $gte: now },
        //     usedBy: { $nin: [userId] },
        //     status: true,
        // });

       

        res.render("checkout", { 
            userData, 
            categoryData, 
            addressData, 
            subTotal, 
            cart, 
            loggedIn:true,  
        });
        
    } catch (error) {
        console.log(error.message);
    }
};
