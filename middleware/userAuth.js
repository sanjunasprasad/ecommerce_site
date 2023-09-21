const User = require('../models/usermodel')


exports. isLogin = async(req,res,next)=>{
    try {

        if(!req.session.user){
            res.redirect('/')
        }else{
            next()
        }
       
    } catch (error) {
        console.log(error.message);
    }

}


exports. isLogout = async(req,res,next)=>{
    try {
        if(req.session.user){
            res.redirect('/mainhome')
        }else{
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}

exports. isCheckout = async(req,res,next)=>{
    try {
        if(!req.session.checkout){
            return res.redirect('/myOrders')

        }
        next()       
    } catch (error) {
        
    }
}




exports. blockCheck = async ( req, res, next ) => {

    try{

        if(req.session.user){
            const userData = req.session.user;
            const id = userData._id
            const user = await User.findById(id)
        
             if(user.is_blocked){
               res.redirect('/logout')
                }else{
                    next()
                }
             }else{
                next()
           }

    }catch(error){
        console.log(error.message);
    }
    
    
 }


