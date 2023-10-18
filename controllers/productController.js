const cloudinary = require('../database/cloudinary')
const User = require("../models/usermodel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Address = require("../models/addressmodel");


// const ITEMS_PER_PAGE = 6;
// exports.shop = async (req, res) => {
//   const logged = req.session.user;
//   const page = +req.query.page || 1;
//   const searchQuery = req.query.q || ''; 

//   try {
//     let query = {};
//     if (searchQuery) {
//       query = {
//         $or: [
//           { title: { $regex: searchQuery, $options: 'i' } }, 
//           { description: { $regex: searchQuery, $options: 'i' } }, 
//         ],
//       };
//     }

//     const totalProducts = await Product.countDocuments(query);
//     const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

//     const products = await Product.find(query)
//       .skip((page - 1) * ITEMS_PER_PAGE)
//       .limit(ITEMS_PER_PAGE);

//     res.render('shoporiginal', {
//       productData: products,
//       logged,
//       currentPage: page,
//       totalPages,
//       searchQuery,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Internal Server Error');
//   }
// };



const ITEMS_PER_PAGE = 6;

exports.shop = async (req, res) => {
  const logged = req.session.user;
  const page = +req.query.page || 1;
  const searchQuery = req.query.q || '';
  const minPrice = parseFloat(req.query.minPrice) || 0; // Minimum price from user input
  const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_VALUE; // Maximum price from user input

  try {
    let query = {};
    if (searchQuery) {
      query = {
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
        ],
      };
    }

    // Include price filtering conditions in the query
    query.price = { $gte: minPrice, $lte: maxPrice };

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

    const products = await Product.find(query)
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res.render('shoporiginal', {
      productData: products,
      logged,
      currentPage: page,
      totalPages,
      searchQuery,
      minPrice, // Pass these values back to the view to repopulate the filter form
      maxPrice,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
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
                console.log(cartId,"cartiddddd 1111111");

                if (!productData) 
                {
                    res.render("404", { userData });
                } 
                else 
                res.render("productdetail", { productData,cartId,logged:true,image,  userData, cart});
            } 
            else 
            {
              console.log(cartId,"cartiddddd");
                res.render("productdetail", { productData, userData ,cartId,logged:true,image,cart:{}});
            }
        
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

