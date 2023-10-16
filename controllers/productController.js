const cloudinary = require('../database/cloudinary')
const User = require("../models/usermodel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Address = require("../models/addressmodel");






// mycode
exports.shop = async (req, res) => {
  const logged = req.session.user
   if(req.session.user)
   {
    try {
        const  productData = await Product.find();
        res.render('shoporiginal', {  
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
      res.render('shoporiginal', {  
        productData ,
       
        logged:null});
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
   }
};


// exports.shop = async (req, res) => {
//   try {
//     let filtertype;
//     let productDatas, keyword;
//     let query = {};
//     const ITEMS_PER_PAGE = 8;

//     // Retaining search key for the search input
//     if (req.query.keyword && req.query.keyword !== 'false') {
//       keyword = req.query.keyword;
//       query.name = new RegExp(keyword, 'i');
//     } else {
//       keyword = false;
//     }

//     // Initialize the base query
//     if (req.query.filtertype && req.filtertype !== 'false') {
//       query.category = req.query.filtertype;
//     } else {
//       filtertype = false;
//     }

//     let sortOption = {}; 
//     if (req.query.sort) {
//       if (req.query.sort === 'low-to-high') {
//         sortOption = { price: 1 }; 
//       } else if (req.query.sort === 'high-to-low') {
//         sortOption = { price: -1 }; 
//       }
//     }

//     const page = +req.query.page || 1;
//     const totalProducts = await Product.countDocuments(query); 
//     const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
//     const skip = (page - 1) * ITEMS_PER_PAGE;
//     productDatas = await Product.find(query).sort(sortOption).skip(skip).limit(ITEMS_PER_PAGE).populate({ path: 'categoryID', model: 'category' });

    

//     // category filter
//     if (req.session.user) {
//       req.session.checkout = true;
//       const userDatas = req.session.user;
//       const userId = userDatas._id;
//       const filtertype= req.query.filtertype
//       // walletBalance=userDatas.wallet.balance
//       const categoryData = await Category.find({ is_blocked: false });
//       const user = await User
//         .findOne({ _id: userId })
//         .populate({ path: "cart" })
//         .populate({ path: "cart.product", model: "Product" });
//       const cart = user.cart;
//       let subTotal = 0;

//       res.render("shop", {productDatas,userDatas,cart,subTotal,categoryData,filtertype,wishlistLength:null,message: "true",keyword,cartId: null,sort: req.query.sort,currentPage: page,totalPages,logged});
//     } else {
//       res.render("shop", { productDatas,filtertype, message: "false",keyword , cartId: null,sort: req.query.sort,currentPage: page,totalPages,logged});
//     }


//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// };







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

