const cloudinary = require('../database/cloudinary')
const User = require("../models/usermodel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");



exports. shop = async (req, res) => {
    res.render("shop")
};

