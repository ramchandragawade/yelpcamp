const User = require('../models/user');

module.exports = {

    // show register form
    showRegisterForm: (req,res)=>{
        res.render('users/register');
    },

    // register the user
    registerUser: async(req,res,next)=>{
        try {
            const {username,password,email} = req.body;
            const user = new User({email,username});
            const registeredUser = await User.register(user,password);
            req.login(registeredUser,err=>{
                if(err) return next(err)
                req.flash('success','Welcome to YelpCamp! '+ username);
                res.redirect('/campgrounds');
            });
        } catch(e) {
            req.flash('error', e.message);
            res.redirect('/register');
        }
    },

    //show login form
    showLoginForm: (req,res)=>{
        res.render('users/login');
    },

    // submit login req & auth
    postLogin: async(req,res)=>{
        req.flash('success',`Welcome back ${req.body.username}!!!`);
        const redirectUrl = res.locals.returnTo || '/campgrounds';
        delete res.locals.returnTo;
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    },

    //logout the user
    logoutUser: (req,res)=>{
        req.logout(function (err) {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Goodbye!');
            res.redirect('/campgrounds');
        });
    }
}