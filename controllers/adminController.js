const cloudinary = require('../database/cloudinary')

//admin login
const credentials = {
   
    email: "admin@gmail.com",
    password: "admin",
};

exports.loadLogin = async (req, res) => {
    res.render('adminlogin')
    // try {
    //     if (req.session.wrongAdmin) {
    //         res.render("adminlogin", { invalid: "invalid details" });
    //         req.session.wrongAdmin = false;
    //     } else {
    //         res.render("adminlogin",{ invalid: "" });
    //     }
    // } catch (error) {
    //     console.log(error.message);
    // }
};