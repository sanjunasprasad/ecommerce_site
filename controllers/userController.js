const User=require('../models/usermodel')
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

//Main home
exports.homeload = (req, res) => {
  res.render("mainhome")
}

//password encryption
const securePassword = async (password) => {
  try {
      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;
  } catch (error) {
      console.log(error.message);
  }
};




//render register page
exports.registerload = (req, res) => {
    try 
    {
    //   res.render("register");
      if (req.session.user) {
        res.redirect("mainhome");
      } else {
        res.render("register");
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
          // const categoryData = await Category.find({ is_blocked: false });
          res.render("otp");
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
//   const categoryData = await Category.find({ is_blocked: false });
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

//render login page
exports.loginload = (req, res) => {
    res.render("login")
}
exports.otpload = (req, res) => {
  res.render("otp")
}
exports.forgototpload = (req, res) => {
    res.render("forgotOtpEnter")
  }