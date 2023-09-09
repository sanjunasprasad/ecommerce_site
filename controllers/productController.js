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

   

