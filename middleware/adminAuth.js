exports.isLogin = async(req,res,next)=>{
    try {

        if(!req.session.admin){
            res.redirect('/admin')
        }
        next()
    } catch (error) {
        console.log(error.message);
    }

}

exports. isLogout = async(req,res,next)=>{
    try {
        if(req.session.admin){
            res.redirect('/admin/admindash')
        }
        next()

    } catch (error) {
        console.log(error.message);
    }

}
