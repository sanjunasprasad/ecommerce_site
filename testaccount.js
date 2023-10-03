const User = require("../../model/users");
const Order = require("../../model/orders");

exports.userAccountDeatailsGet = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.email });
      const userId = user._id;
      const order = await Order.find({ userId: userId }).sort({ date: -1 });
      const userAddresses = user.address;

      res.render("user_account", {
        loggedIn: true,
        user,
        userAddresses,
        order,
      });
  } catch (err) {
    console.log(err);
  }
};

exports.userAccountDetailsEditPost = async (req, res) => {
  try {
    const accountDetails = req.body;
    const user = await User.findOne({ email: req.session.email });
    if (user) {
      user.firstName = accountDetails.firstName || user.firstName;
      user.lastName = accountDetails.lastName || user.lastName;
      user.phoneNo = accountDetails.phoneNo || user.phoneNo;
      if (
        accountDetails &&
        accountDetails.newPassword > 6 &&
        accountDetails.newPassword == accountDetails.confirmNewPassword
      ) {
        user.password = accountDetails.newPassword;
      }
    }
    await user.save();
    return res.status(200).end();
  } catch (err) {
    console.log(err);
  }
};
const User = require("../../model/users");

exports.userAddressPost = async (req, res) => {
  const { fullName, email, phoneNo, address, city, pinCode, stateId } =
    req.body;
  try {
    const user = await User.findOne({ email: req.session.email });
    const newAddress = {
      name: fullName,
      email: email,
      phoneNo: phoneNo,
      streetAddress: address,
      city: city,
      pinCode: pinCode,
      state: stateId,
    };
    user.address.push(newAddress);
    await user.save();
    return res.status(200).json(newAddress);
  } catch (err) {
    console.log(err);
  }
};

exports.userAddressRemovePost = async (req, res) =>{
  const addressId = req.query.addressId;
    try{
      const user = await User.findOne({email: req.session.email});
      if(user){
        const addressIndex = user.address.findIndex(address => address._id.toString() == addressId)
        if(addressIndex > -1){
          user.address.splice(addressIndex, 1);
          await user.save();
          return res.status(200).end();
        }
      }
    }catch(err){
      console.log(err);
    }
}
//////////////////////////////////////////// USER PROFILE BASED FUNCTIONS /////////////////////////////////////////
router.get("/user_account_details_get", userHeaderMiddleware, isLogged, userAccountDetails.userAccountDeatailsGet );
router.post("/user_account_edit_post", isUser, userHeaderMiddleware, blockCheck, userAccountDetails.userAccountDetailsEditPost );
router.post("/user_address_post", isUser, userHeaderMiddleware, blockCheck, userAddress.userAddressPost )
router.post("/user_address_remove_post", isUser, userHeaderMiddleware, blockCheck, userAddress.userAddressRemovePost );
