const cloudinary = require('../database/cloudinary')

//admin login
const credentials = {
   
    email: "admin@gmail.com",
    password: "123",
};

exports.loadLogin = async (req, res) => {
    // res.render('adminlogin')
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
          
            res.redirect("/admindash");
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
exports.loadDashboard=(req,res)=>{
    res.render("admindash")
}