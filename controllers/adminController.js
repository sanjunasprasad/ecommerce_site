const cloudinary = require('../database/cloudinary')
const User = require("../models/usermodel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
//admin login
const credentials = {
   
    email: "admin@gmail.com",
    password: "123",
};

exports.loadLogin = async (req, res) => {
    
    try {
        if (req.session.wrongAdmin) {
            res.render("adminlogin", { invalid: "invalid details" });
            req.session.wrongAdmin = false;
        } else {
            res.render("adminlogin",{ invalid: "" });
        }
    } catch (error) {
        console.log(error.message);
    }
};
var email
exports.verifyLogin = async (req, res) => {
    
    try {
       
        if (req.body.email == credentials.email && req.body.password == credentials.password) {
            req.session.admin = req.body.email;
            email=req.body.email
          
            res.render("dashboard",{user:"Admin"});
        } else {
            req.session.wrongAdmin = true;
            res.redirect("/admin");
        }
    } catch (error) {
        console.log(error.messaage);
    }
};
exports.adminLogout = async (req, res) => {
    try {
        req.session.destroy();
        
        res.redirect("/admin");
    } catch (error) {
        console.log(error.message);
    }
};


//***********USER MANAGEMENT******************//
//all user listing
exports.loadUsers = async (req, res) => {
    try {
        const userData = await User.find();
        res.render("users", { users: userData, user: req.session.admin });
    } catch (error) {
        console.log("error is:",error.message);
    }
};

//user block
exports.blockUser = async (req, res) => {
    try {
        const id = req.params.id;

        const blockUser = await User.findById(id);

        await User.findByIdAndUpdate(id, { $set: { is_blocked: !blockUser.is_blocked } }, { new: true });

        res.redirect("/admin/users");
    } catch (error) {
        console.log(error);
    }
};


//*************CATEGORY MANAGEMENT********************//
exports.addCategory = async (req, res) => {
    try {
        res.render("addCategory");
    } catch (error) {
        console.log(error.message);
    }
};
exports. addNewCategory = async (req, res) => {
    const categoryName = req.body.name;
    const categoryDescription = req.body.categoryDescription;
    const image = req.file;
    const lowerCategoryName = categoryName.toLowerCase();

    try {

        const result = await cloudinary.uploader.upload(image.path,{
            folder: "Categories"
        })

        const categoryExist = await Category.findOne({ category: lowerCategoryName });
        if (!categoryExist) {
            const category = new Category({
                category: lowerCategoryName,
                imageUrl: {
                    public_id: result.public_id,
                    url: result.secure_url
                },
                description: categoryDescription,
            });

            await category.save();
            req.session.categorySave = true;
            res.redirect("/admin/categories");
        } else {
            req.session.categoryExist = true;
            res.redirect("/admin/categories");
        }
    } catch (error) {
        console.log(error.message);
    }
};

exports.loadCategories = async (req, res) => {
   
    try {
        const categoryData = await Category.find();
        if (req.session.categoryUpdate) {
            res.render("categories", {
                categoryData,
                catNoUpdation: "",
                catUpdated: "Category updated successfully",
                user: req.session.admin,
            });
            req.session.categoryUpdate = false;
        } else if (req.session.categorySave) {
            res.render("categories", {
                categoryData,
                catNoUpdation: "",
                catUpdated: "Category Added successfully",
                user: req.session.admin,
            });
            req.session.categorySave = false;
        } else if (req.session.categoryExist) {
            res.render("categories", {
                categoryData,
                catUpdated: "",
                catNoUpdation: "Category Already Exists!!",
                user: req.session.admin,
            });
            req.session.categoryExist = false;
        } else {
            res.render("categories", { categoryData, user: req.session.admin,catUpdated:"",catNoUpdation: ""});
        }
    } catch (error) {
        console.log(error.message);
    }
};
exports.editCategory = async (req, res) => {
    const categoryId = req.params.id;

    try {
        const categoryData = await Category.findById({ _id: categoryId });

       return  res.render("editCategory", { categoryData, user: req.session.admin,catUpdated:"" });
    } catch (error) {
        console.log(error.message);
    }
};
exports.updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const categoryName = req.body.name;
        const categoryDescription = req.body.categoryDescription;
        const newImage = req.file;

        
        const categoryData = await Category.findById(categoryId);
        const categoryImageUrl = categoryData.imageUrl.url;
        
        let result;

        if (newImage) {
            if (categoryImageUrl) {
                await cloudinary.uploader.destroy(categoryData.imageUrl.public_id);
            }
            result = await cloudinary.uploader.upload(newImage.path, {
                folder: "Categories"
            });
        } else {
            result = {
                public_id: categoryData.imageUrl.public_id,
                secure_url: categoryImageUrl
            };
        }

        const catExist = await Category.findOne({ category: categoryName });
        const imageExist = await Category.findOne({ 'imageUrl.url': result.secure_url });

        if (!catExist || !imageExist) {

            await Category.findByIdAndUpdate(
                categoryId,
                {
                    category: categoryName,
                    imageUrl: {
                        public_id: result.public_id,
                        url: result.secure_url
                    },
                    description: categoryDescription,
                },
                { new: true }
            );
            req.session.categoryUpdate = true;
            res.redirect("/admin/categories");
        } else {
            req.session.categoryExist = true;
            res.redirect("/admin/categories");
        }
    } catch (error) {
        console.log(error.message);
    }
};

exports. unlistCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        const unlistCategory = await Category.findById(categoryId);

        await Category.findByIdAndUpdate(categoryId, { $set: { is_blocked: !unlistCategory.is_blocked } }, { new: true });

        res.status(200).send();
    } catch (error) {
        console.log(error.message);
    }
};

exports.deleteCategory = async (req, res) => {
    const categorydeleteId = req.params.id;

    try 
    {
        await Category.findByIdAndRemove(categorydeleteId);
        res.redirect("/admin/categories");
        res.status(200).send();
    } 
    catch (error) 
    {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};




//**************PRODUCT MANAGEMENT************//

exports. loadProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const productsPerPage = 4;

        const totalCount = await Product.countDocuments();
        const totalPages = Math.ceil(totalCount / productsPerPage);
        const skip = (page - 1) * productsPerPage;

        const productData = await Product.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $unwind: "$category",
            },
        ])
            .skip(skip)
            .limit(productsPerPage);

        if (req.session.productSave) {
            res.render("products", {
                productData,
                totalPages,
                currentPage: page,
                productUpdated: "Product added successfully!!",
                user: req.session.admin,
            });
            req.session.productSave = false;
        }
        if (req.session.productUpdate) {
            res.render("products", {
                productData,
                totalPages,
                currentPage: page,
                productUpdated: "Product Updated successfully!!",
                user: req.session.admin,
            });
            req.session.productUpdate = false;
        } else {
            res.render("products", {
                productData,
                user: req.session.admin,
                totalPages,
                currentPage: page,
                productUpdated:"",
            });
        }
    } catch (error) {
        console.log(error.message);
    }
};

exports. addProduct = async (req, res) => {
    try {
        const categoryData = await Category.find();
        res.render("addProduct", { 
            categoryData, 
            user: req.session.admin 
        });
    } catch (error) {
        console.log(error.message);
    }
};

exports. addNewProduct = async (req, res) => {
    try {
        const files = req.files;
        const productImages = []

        for (const file of files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "Products"
            });

            const image = {
                public_id: result.public_id,
                url: result.secure_url
            };

            productImages.push(image);
        }

        const { name, price, quantity, description, category ,offerPrice} = req.body;

        let updatedPrice
        let oldPrice
        if(offerPrice){
            updatedPrice = offerPrice
            oldPrice = price
        }else{
            updatedPrice = price
        }
        const product = new Product({
            name: name,
            price: updatedPrice,
            stock: quantity,
            description: description,
            category: category,
            imageUrl: productImages,
        });
        await product.save();
        req.session.productSave = true;
        res.redirect("/admin/products");
    } catch (error) {
        console.log(error.message);
    }
};

exports. deleteProductImage = async (req, res) => {
    try {
        const { id, image } = req.query;
        console.log(id, image);
        const product = await Product.findById(id);
        const imageUrl = product.imageUrl[image];

        await cloudinary.uploader.destroy(imageUrl.public_id);

        product.imageUrl.splice(image, 1);

        await product.save();
        res.status(200).send({ message: "Image deleted successfully" });
    } catch (error) {
        console.log(error.message);
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const proId = req.params.id;

        const productData = await Product.findById({ _id: proId });
        const categories = await Category.find();
       

        res.render("editProduct", { productData, categories,  user: req.session.admin });
    } catch (error) {
        console.log(error.message);
    }
};

exports. updateNewProduct = async (req, res) => {
    try {
        const proId = req.params.id;
        const product = await Product.findById(proId);
        const exImage = product.imageUrl;
        const files = req.files;

        let updImages = [];

        if (files && files.length > 0) {
            for (const file of files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "Products"
                });

                const image = {
                    public_id: result.public_id,
                    url: result.secure_url
                };

                updImages.push(image);
            }

            updImages = [...exImage, ...updImages];
            product.imageUrl = updImages;
        } else {
            updImages = exImage;
        }

        const { name, price, quantity, description, category,  offerPrice } = req.body;

        let updatedPrice
        let oldPrice
        if(offerPrice){
            updatedPrice = offerPrice
            oldPrice = price
        }else{
            updatedPrice = price
        }

        

        await Product.findByIdAndUpdate(
            proId,
            {
                name: name,
                price: updatedPrice,
                stock: quantity,
                description: description,
                category: category,
                imageUrl: updImages,
                // offerlabel: offerLabel && offerLabel.length > 0 ? offerLabel : [],
                oldPrice: oldPrice
            },
            { new: true }
        );
        req.session.productUpdate = true;
        res.redirect("/admin/products");
    } catch (error) {
        console.log(error.message);
    }
};

exports. deleteProduct = async (req, res) => {
    try {
        const deleteId = req.params.id;

        await Product.findByIdAndDelete(deleteId);
        res.status(200).send();
    } catch (error) {
        console.log(error.message);
    }
};
