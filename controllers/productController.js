const cloudinary = require('../database/cloudinary')
const User = require("../models/usermodel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Address = require("../models/addressmodel");



exports.shop = async (req, res) => {
  const logged = req.session.user
   if(req.session.user)
   {
    try {
         
        const  productData = await Product.find();
        res.render('shop', {  
          productData ,
          
          logged});
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
   }
   else
   {
    try {
      
      const  productData = await Product.find();
      res.render('shop', {  
        productData ,
     
        logged:null});
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
   }
};







  exports.prodetail= async(req,res)=>{
    const logged = req.session.user
      const productId = req.query.id;
      if(req.session.user)
      {
        try 
        {
          const userData = req.session.user
          const userId = userData._id;
          const user = await User.findOne({ _id: userId }).populate("cart.product").lean();
          const cart = user.cart;


          const productData = await Product.findById(productId);
          console.log("product is:",productData,)
          const image = productData.imageUrl
          
         
            let cartId = null;
            if (user.cart && user.cart.length > 0) 
            {
                cartId = user.cart[0]._id;

                if (!productData) 
                {
                    res.render("404", { userData });
                } 
                else 
                res.render("productdetail", { productData,cartId,logged:true,image,  userData, cart});
            } 
            else 
            {
                res.render("productdetail", { productData, userData ,cartId,logged:true,image,cart:{}});
            }
          // res.render("productdetail", { productData, logged:true,image, message: "",userData });
        } 
        catch (error) 
        {
          res.status(500).send(error.message);
        }
      }
      else
      {
        try 
        {
          const userData = req.session.user
          const productData = await Product.findById(productId);
          console.log("product is:",productData,)
          const image = productData.imageUrl
          res.render("productdetail", { productData, logged:null,image, message: "",userData });
        } 
        catch (error) 
        {
          res.status(500).send(error.message);
        }
      }
     
  };
  

  exports. categoryFilter = async (req, res) => {
    try {
        const categoryId = req.query.categoryId;
        console.log(categoryId);
        const productData = await Product.find({ category: categoryId });
        res.json(productData);
    } catch (error) {
        console.log(error.message);
    }
};

exports.sortProduct = async (req, res) => {
  try {
      const sort = req.body.sort;
      const productData = await Product.find().sort({ price: sort });
      res.json(productData);
      console.log("sort**************:",productData)
  } catch (error) {
      console.log(error.message);
  }
};

 

