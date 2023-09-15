const cloudinary = require('../database/cloudinary')
const User = require("../models/usermodel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Address = require("../models/addressmodel");


exports.loadcart= async(req,res)=>{
    const logged=req.session.user
    if(req.session.user)
    {
      res.render("cart",{logged})
    }
    else
    {
      res.render("cart",{logged:null})
    }
    
};

// var  walletBalance=0
// exports. loadCart = async (req, res) => {
//     try {
//         req.session.checkout = true
//         const userData = req.session.user;
//         const userId = req.query.id;
//         walletBalance=userData.wallet.balance
//         const categoryData = await Category.find({ is_blocked: false });

//         const user = await User.findOne({ userId }).populate("cart.product").lean();
//        console.log(user);
//         const cart = user.cart;
       
//         let subTotal = 0;

//         cart.forEach((val) => {
//             val.total = val.product.price * val.quantity;
//             subTotal += val.total;
//         });
      
//         if (cart.length === 0) {
//             res.render("emptyCart", { userData, categoryData ,loggedIn:true, walletBalance,cart:{},subTotal:0});
//         } else {
//             res.render("cart", { userData, cart, subTotal, categoryData,loggedIn:true ,walletBalance});
//         }
//     } catch (error) {
//         console.log(error.message);
//         const userData = req.session.user;
//         const categoryData = await Category.find({ is_blocked: false });
//         res.render("404", { userData, categoryData ,loggedIn:true,walletBalance});
//     }
// };

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
