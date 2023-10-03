const cloudinary = require('../database/cloudinary')
const User = require("../models/usermodel");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Address = require("../models/addressmodel");
const Order = require("../models/orderModel");

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");




//password encryption
const securePassword = async (password) => {
  try {
      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;
  } catch (error) {
      console.log(error.message);
  }
};

//Main home+aboutus+userhome
exports.homeload = (req, res) => {
    const logged = req.session.user
    if(req.session.user)
    {
        res.render("mainhome",{logged})
    }
    else
    {
        res.render("mainhome",{logged:null})
    }
    
  }
  exports.userhomeload = (req, res) => {
    res.render("userhome")
  }
  exports.aboutus = (req, res) => {
    const logged = req.session.user
    if(req.session.user)
    {
        res.render("aboutus",{logged})
    }
    else
    {
        res.render("aboutus",{logged:null})
    }
  }
//render login page
exports.loginload = async(req, res) =>{
       
        try {
            if (req.session.user) {
                res.redirect("/login",{success:"Login successful!!!"});
                // req.session.passwordUpdated = false;
            } else {
                res.render("login");
            }
        } catch (error) {
            console.log(error.message);
        }
}
exports. err_404=(req,res)=>{
    res.render('404')
}  

function validateLogin(data) {
    const {email, password} = data;
    const errors = {}

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    


    // email validation //
    if (!email) {
        errors.emailError = "please enter your email address";
    } else if (email.length < 1 || email.trim() === "" || !emailPattern.test(email)) {
        errors.emailError = "please Enter a Valid email";
    }
    // Password Validation //
  
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

var profilename
exports.verifyLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log("user login data:",req.body);
          
            const valid = validateLogin(req.body);
            console.log("validate login data:",valid);
          
            const userData = await User.findOne({ email: email });
            console.log("fetch user from mongo:",userData);
          profilename=userData.firstName
          console.log(`...............${profilename}`)

          if (!valid.isValid) {
            return res.status(400).json({ error: valid.errors });
          }
           else if (!userData) {
              return res.status(401).json({ error: "Invalid Email address" });
             
            } else if (userData.is_blocked === true) {
              return res.status(402).json({ error: "Your Account is blocked" });
            } else {
              const passwordMatch = await bcrypt.compare(password, userData.password);
          
              if (passwordMatch) {
                console.log("Verified password");
                req.session.user = userData;
                req.session.logged = true;
                return res.status(200).end();
              } else {
                return res.status(409).json({ error: "Invalid Password" });
              }
            }
          
          
        } catch (error) {
            console.log(error.message);
        }
    };
//user logout
exports. doLogout = async (req, res) => {
    try {
      req.session.destroy()
        
        res.redirect("/");
    } catch (error) {
        console.log(error.message);
    }
};

//render register page
exports.registerload = (req, res) => {
    try 
    {
        const logged = req.session.user
      if (req.session.user) {
        res.redirect("mainhome",{logged});
      } else {
        res.render("register",{logged:null});
      }
    } 
    catch (error) 
    {
      console.log(error)
    }
  };

//registration form validation
function validateRegister(data) {
  const { firstname,lastname, email, phonenumber, password, repassword } = data;
  const errors = {}

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^\d{10}$/;
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/;

  // /Name validation //
  if (!firstname) {
      errors.firstnameError = "Please Enter Your first Name"
  } else if (firstname.length < 3 || firstname[0] == " ") {
      errors.firstnameError = "Enter a Valid Name"
  }
  if (!lastname) {
      errors.lastnameError = "Please Enter Your last Name"
  } else if (lastname.length < 1 || lastname[0] == " ") {
      errors.lastnameError = "Enter a Valid Name"
  }

  // email validation //
  if (!email) {
      errors.emailError = "please enter your email address";
  } else if (email.length < 1 || email.trim() === "" || !emailPattern.test(email)) {
      errors.emailError = "please Enter a Valid email";
  }

  // Phone No Validation //
  if (!phonenumber) {
      errors.phoneError = "please Enter your mobile number";
  } else if (!phonePattern.test(phonenumber)) {
      errors.phoneError = "please check your number and provide a valid one";
  }

  // Password Validation //
  if (!password) {
      errors.passwordError = "please Enter Your  password"
  } else if (!passwordPattern.test(password)) {
      errors.passwordError = "password must be atleast 8 characters with atleast one uppercase, lowercase, digit and special character";
  }

  // Confirm Password Validation //
  if (password && !repassword) {
      errors.repasswordError = "please Enter Your password"
  } else if (password && repassword && password !== repassword) {
      errors.repasswordError = "passwords doesn't match";
  }

  return {
      isValid: Object.keys(errors).length === 0,
      errors
  }
}

// rgistration form posting+OTP sending
let saveOtp;
var firstName;
let email;
let mobile;
let password;
let forgotPasswordOtp;
let repassword

  exports.sendOtp = async (req, res) => {
        console.log(req.body);
        try {
            
            const { emailvalid, phonenumber } = req.body
            
            const emailExist = await User.findOne({ email: emailvalid })
            const phoneExist = await User.findOne({ phone: phonenumber })
    
            const valid = validateRegister(req.body)
    
            if (emailExist) {
    
                return res.status(401).json({ error: "user with same Email already Exists" })
    
            } else if (phoneExist) {
    
                return res.status(409).json({ error: "The user with same Mobile Number already Exist please try another Number" })
    
            } else if (!valid.isValid) {
                return res.status(400).json({ error: valid.errors })
            }
            else {
                   const generatedOtp = generateOTP();
                    saveOtp = generatedOtp;
                    firstName = req.body.firstname;
                    lastName=req.body.lastname;
                    email = req.body.email;
                    mobile = req.body.phonenumber;
                    password = req.body.password;
                    repassword=req.body.repassword
                    sendOtpMail(email, generatedOtp);
                 
    
                return res.status(200).end();
    
            }
        } catch (error) {
            return res.status(409).json({ error: "server down" })
            console.log(error);
        }
    }
     
    exports.showOtp = async (req, res) => {
      try {
         
          const logged = req.session.user
          if(req.session.user)
          {
            res.render("otp",{logged});
          }
          else
          {
            res.render("otp",{logged:null});
          }
         
      } catch (error) {
        console.log(error);
      }
  };

  function generateOTP() {
      let otp = "";
      for (let i = 0; i < 4; i++) {
          otp += Math.floor(Math.random() * 10);
      }
      return otp;
      
  }

  async function sendOtpMail(email, otp) {
    console.log(otp);
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "sanjunasprasad@gmail.com",
                pass: "hgbexrtifxmyakpd",
            },
        });

        const mailOptions = {
            from: "sanjunasprasad@gmail.com",
            to: email,
            subject: "Your OTP for user verification",
            text: `Your OTP is ${otp} . Please enter this code to verify your account`,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(result);
    } catch (error) {
        console.log(error.message);
    }
}

exports.verifyOtp = async (req, res) => {
         
  var txt1=req.body.txt1;
  var txt2 =req.body.txt2
  var txt3=req.body.txt3
  var txt4=req.body.txt4
  const EnteredOtp=txt1+txt2+txt3+txt4
  console.log(`entered otp${EnteredOtp}`);
  console.log(`saveotp${saveOtp}`);
  if (EnteredOtp === saveOtp) {

      const securedPassword = await securePassword(password);        
          
      const newUser = new User({
          firstName: firstName,
          lastName:lastName,
          email: email,
          phoneNumber: mobile,
          password: securedPassword,
          is_blocked: false,
         
      });
      console.log("user register:",newUser);

     
      try {
          await newUser.save();
          
              res.render("login", { success: "Successfully registered!" });
          
      } catch (error) {
          console.log(error);
          res.render("otp", { invalidOtp: "Error registering new user" });
      }

  } else {
      res.render("otp", { invalidOtp: "wrong OTP" });
  }
};

//********FORGOT SECTION **********//

exports. loadForgotPassword = async (req, res) => {
    try {
        // const categoryData = await Category.find({ is_blocked: false });
    
        if (req.session.forgotEmailNotExist) {
           
            res.render("verifyEmail", { emailNotExist: "Sorry, email does not exist! Please register now!" ,});
            req.session.forgotEmailNotExist = false;
        } else {
            res.render("verifyEmail",{loggedIn:false,});
        }
    } catch (error) {
        console.log(error.message);
    }
};

exports. verifyForgotpasswordEmail = async (req, res) => {
    try {
        const verifyEmail = req.body.email;
        const ExistingEmail = await User.findOne({ email: verifyEmail });

        if (ExistingEmail) {
            if (!forgotPasswordOtp) {
                forgotPasswordOtp = generateOTP();
                console.log("FORGOT password's OTP IS:",forgotPasswordOtp);
                email = verifyEmail;
                sendForgotPasswordOtp(email, forgotPasswordOtp);
                res.redirect("/forgotOtpEnter");
                setTimeout(() => {
                    forgotPasswordOtp = null;
                }, 60 * 1000);
            } else {
                res.redirect("/forgotOtpEnter");
            }
        } else {
            req.session.forgotEmailNotExist = true;
            res.redirect("/forgotPassword");
        }
    } catch (error) {
        console.log(error.message);
    }
};

async function sendForgotPasswordOtp(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "sanjunasprasad@gmail.com",
                pass: "hgbexrtifxmyakpd",
            },
        });

        const mailOptions = {
            from: "sanjunasprasad@gmail.com",
            to: email,
            subject: "Your OTP for password resetting",
            text: `Your OTP is ${otp}. Please enter this code to reset your password.`,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(result);
    } catch (error) {
        console.log(error.message);
    }
}

exports. showForgotpasswordOtp = async (req, res) => {
    try {
      
        logged=req.session.user
        
        if (req.session.wrongOtp) {
            res.render("forgotOtpEnter", { invalidOtp: "Otp does not match",logged});
            req.session.wrongOtp = false;
        } else {
            res.render("forgotOtpEnter", { countdown: true ,loggedIn:false, invalidOtp:"",logged:null});
        }
       
    } catch (error) {
        console.log("error is:",error.message);
    }
};

exports. verifyForgotOtp = async (req, res) => {
    try {
       
        var txt1=req.body.txt1;
        var txt2 =req.body.txt2
        var txt3=req.body.txt3
        var txt4=req.body.txt4
        const userEnteredOtp=txt1+txt2+txt3+txt4
     
        if (userEnteredOtp === forgotPasswordOtp) {
            res.render("passwordReset",{loggedIn:false,invalidOtp:""});
        } else {
            req.session.wrongOtp = true;
            res.redirect("/forgotOtpEnter");
        }
    } catch (error) {
        console.log(error.message);
    }
};

exports. resendForgotOtp = async (req, res) => {
    try {
        const generatedOtp = generateOTP();
        forgotPasswordOtp = generatedOtp;

        sendForgotPasswordOtp(email, generatedOtp);
        res.redirect("/forgotOtpEnter");
        setTimeout(() => {
            forgotPasswordOtp = null;
        }, 60 * 1000);
    } catch (error) {
        console.log(error.message);
    }
};

exports. updatePassword = async (req, res) => {
    try {
      
        const newPassword = req.body.password;
        const securedPassword = await securePassword(newPassword);

        const userData = await User.findOneAndUpdate({ email: email }, { $set: { password: securedPassword } });
        if (userData) {
            req.session.passwordUpdated = true;
            res.render("login",{blocked:false,loggedIn:false});
        } else {
            console.log("Something error happened");
        }
    } catch (error) {
        console.log(error.message);
    }
};


//*****************profile****************//
exports.loadProfile = async (req, res) => {
    logged=req.session.user
    if(req.session.user)
    {
        try {
            
            const userData = req.session.user;
            const userId = userData._id;
            const categoryData = await Category.find({ is_blocked: false });
            const addressData = await Address.find({ userId: userId });
            const orderData = await Order.find({ userId: userId });
            const productData = await Product.find();

    
            const user = await User.findById(userId);

            const usercart = await User.findOne({_id:userId }).populate("cart.product").lean();
           console.log(user);


            const cart = usercart.cart;
        
            let subTotal = 0;
    
            cart.forEach((val) => {
                val.total = val.product.price * val.quantity;
                subTotal += val.total;
            });
            res.render("myaccount", { userData, categoryData, addressData,orderData,productData,loggedIn:true ,profilename,subTotal,logged,cart});
        } catch (error) {
            console.log(error.message);
        }
    }
   
};


// exports.profileEditPost = async (req, res) => {
//     try {
//       const accountDetails = req.body;
//       const user = await User.findOne({ email: req.session.email });
//       if (user) {
//         user.firstName = accountDetails.firstName || user.firstName;
//         user.lastName = accountDetails.lastName || user.lastName;
//         user.phoneNo = accountDetails.phoneNo || user.phoneNo;
//         if (
//           accountDetails &&
//           accountDetails.newPassword > 6 &&
//           accountDetails.newPassword == accountDetails.confirmNewPassword
//         ) {
//           user.password = accountDetails.newPassword;
//         }
//       }
//       await user.save();
//       return res.status(200).end();
//     } catch (err) {
//       console.log(err);
//     }
//   };

  exports. profileEditPost = async (req, res) => {
    try {
      const userId = req.session.user;
      const updatedProfile = await User.findByIdAndUpdate(
        userId,
        {
          user_fname: req.body.firstName,
          user_lname: req.body.lastName,
          phone: req.body.phoneNumber,
          email: req.body.email
        },
        { new: true }
      );
  
    } catch (error) {
      console.log(error);
  
    }
  };
  
exports. addNewAddress = async (req, res) => {
    try {
        console.log(531);
        const userData = req.session.user;
        const userId = userData._id;
console.log(534,userId);
        const address = new Address({
            userId: userId,
            name: req.body.name,
            mobile: req.body.mobileNumber,
            addressLine: req.body.addressLine,
            city: req.body.city,
            email: req.body.email,
            state: req.body.state,
            pincode: req.body.pincode,
            is_default: false,
        });
        console.log(546,address);

        await address.save();
        res.status(200).send();
    } catch (error) {
        res.status(500).send();
        console.log(error.message);
    }
};

// exports. getAddressdata = async (req, res) => {
//     try {
//         const addressId = req.query.addressId;
//         const addressData = await Address.findById(addressId);

//         if (addressData) {
//             res.json(addressData); // Return the addressData as JSON response
//         } 
//         else 
//         {
//             res.json({ message: "Address not found"}); // Handle address not found case
//         }
//     } catch {
//         console.log(error.message);
//     }
// };

exports. updateAddress = async (req, res) => {
    try {
        const addressId = req.query.addressId;

        console.log(addressId);

        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            {
                name: req.body.name,
                mobile: req.body.mobile,
                addressLine: req.body.addressLine,
                email: req.body.email,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pincode,
            },
            { new: true }
        );

        if (updatedAddress) {
            res.status(200).send();
        } else {
            res.status(500).send();
        }
    } catch (error) {
        console.log(error.message);
    }
};

exports. deleteAddress = async (req, res) => {
    try {
        const addressId = req.query.addressId;

        const success = await Address.findByIdAndDelete(addressId);

        if (success) {
            res.status(200).send();
        } else {
            res.status(500).send();
        }
    } catch (error) {
        console.log(error.message);
    }
};
