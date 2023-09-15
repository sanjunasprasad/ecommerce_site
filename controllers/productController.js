const cloudinary = require('../database/cloudinary')
const User = require("../models/usermodel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");



exports.shop = async (req, res) => {
  const logged = req.session.user
   if(req.session.user)
   {
    try {
      
        const  productData = await Product.find();
        res.render('shop', {  productData ,logged});
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
   }
   else
   {
    try {
      
      const  productData = await Product.find();
      res.render('shop', {  productData ,logged:null});
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
   }
};

  exports.prodetail= async(req,res)=>{
    const logged = req.session.user
      const productId = req.query.id;

      try 
      {
        const userData = req.session.user
        const productData = await Product.findById(productId);
        console.log("product is",productData,)
        const image = productData.imageUrl
        res.render("productdetail", { productData, logged,image, message: "",userData });
      } 
      catch (error) 
      {
        res.status(500).send(error.message);
      }
  };
  

 
exports.myaccount= async(req,res)=>{
  const logged=req.session.user
  if(req.session.user)
  {
    res.render("myaccount",{logged})
  }
  
  
};


