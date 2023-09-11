const cloudinary = require('../database/cloudinary')
const User = require("../models/usermodel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");



exports. shop = async (req, res) => {
   
    try {
      
        const  productData = await Product.find();
        res.render('shop', {  productData });
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
};

  exports.prodetail= async(req,res)=>{

      const productId = req.query.id;
      try 
      {
        // const userData = req.session.user
        const productData = await Product.findById(productId);
        console.log("product is",productData)
        const image = productData.imageUrl
        res.render("productdetail", { productData, image, message: "" });
      } 
      catch (error) 
      {
        res.status(500).send(error.message);
      }
  };
  

