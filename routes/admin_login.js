var express = require('express');
var router = express.Router();

const passport = require('passport');
const db = require('../database.js');
const bcrypt = require('bcrypt');

/**
 * Display the login page. If they are already logged in they are redirected to /admin/dashboard OR the path in the query URL.
 */
router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/admin/dashboard");
    } else {
        res.render('login');
    }
})

/**
 * Process a login request. Passport handles the session token & login script (found in passport.js).
 */
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/admin/dashboard',
        failureRedirect: '/admin/login',
        failureFlash: true
    })(req, res, next);
})

/**
 * Display the change password page.
 */
router.get('/changepassword', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('changepassword');
    } else {
        req.flash('error_msg', 'You are not authenticated.');
        res.redirect("/admin/login");
    }
})

/**
 * Process a changepassword request.
 */
router.post('/changepassword', (req, res, next) => {
    if (req.isAuthenticated()) {
        let oldpass = req.body.oldpass
        let newpass = req.body.newpass
        let passmatch = req.body.newpass == req.body.newpass2
        if (oldpass == "" || newpass == "") { //Check that fields are not empty.
            req.flash('error_msg', 'Missing field.');
            res.redirect("/admin/changepassword");
        } else if (!passmatch) { //Check that both new password and confirm new password match.
            req.flash('error_msg', 'Passwords do not match.');
            res.redirect("/admin/changepassword");
        } else { //Get old password hash from database.
            db.query("SELECT id AS user_id, user_pass FROM users WHERE ? = id LIMIT 1;", [req.user], function(err, result) {
                if (err) {
                    req.flash('error_msg', 'No database connection.');
                    res.redirect("/admin/changepassword");
                }
                bcrypt.compare(oldpass, result[0].user_pass, function(err, hashMatched) {
                    if (hashMatched) { //Check old password is correct before updating.
                        bcrypt.hash(newpass, 10, function(err, newhash) { //Hash new password and update database.
                            db.query("UPDATE users SET user_pass = ? WHERE id = ?;", [newhash, req.user], function(err, result) {
                                if (err) {
                                    req.flash('error_msg', 'No database connection.');
                                    res.redirect("/admin/changepassword");
                                }
                                req.flash('success_msg', 'Password updated!');
                                res.redirect("/admin/changepassword");
                            });
                        });
                    } else {
                        req.flash('error_msg', 'Incorrect password.');
                        res.redirect("/admin/changepassword");
                    }
                })
            });
        }
    } else {
        req.flash('error_msg', 'You are not authenticated.');
        res.redirect("/admin/login");
    }
})

/**
 * Display forgot password page.
 */
router.get('/forgotpassword', (req, res) => {
    res.render('forgotpassword-request');
})

/**
 * Display forgot password page when a token is provided. This shows the update password form when the token is valid.
 */
router.get('/forgotpassword/:token', (req, res) => {
    verifyJWTReset(req, res, function(req, res, token, decodedUserID) {
        res.render('forgotpassword-reset', { token: token }); //Token is provided to page as post url unique to token.
    })
})

/**
 * Process a forgot password request with a provided token.
 */
router.post('/forgotpassword/:token', (req, res) => {
    verifyJWTReset(req, res, function(req, res, token, decodedUserID) {
        let newpass = req.body.newpass
        let passmatch = req.body.newpass == req.body.newpass2
        if (newpass == "") { //Check that fields are not empty.
            req.flash('error_msg', 'Missing field.');
            res.redirect("/admin/forgotpassword/" + token);
        } else if (!passmatch) { //Check that both new password and confirm new password match.
            req.flash('error_msg', 'Passwords do not match.');
            res.redirect("/admin/forgotpassword/" + token);
        } else {
            bcrypt.hash(newpass, 10, function(err, newhash) { //Hash new password and update database.
                db.query("UPDATE users SET user_pass = ? WHERE id = ?;", [newhash, decodedUserID], function(err, result) {
                    if (err) {
                        req.flash('error_msg', 'No database connection.');
                        res.redirect("/admin/forgotpassword/" + token);
                    }
                    req.flash('success_msg', 'Password updated! Please login:');
                    res.redirect("/admin/login");
                });
            });
        }
    })
})

/**
 * Verify that a password reset token is valid. If an invalid token is provided, redirect to forgot password form.
 */
function verifyJWTReset(req, res, action) {
    let token = req.params.token;
    if (token != "") {
        let jwt = require('jsonwebtoken');
        let decodedUserID = "";
        try { //Attempt to get user id provided by user inside of token. This does not verify that the token is signed/valid and can be any user.
            decodedUserID = jwt.decode(token).id
        } catch (err) { //If a malformed token is provided, no data would be accessible and therefore accessing token.id would fail.
            req.flash('error_msg', 'Invalid Token. Please try again.');
            res.redirect('/admin/forgotpassword');
            return;
        }
        //Get the password hash of the user provided.
        db.query("SELECT id AS user_id, user_pass FROM users WHERE ? = id LIMIT 1;", [decodedUserID], function(err, result) {
            if (err) {
                req.flash('error_msg', 'No database connection.');
                res.redirect('/admin/forgotpassword');
            }
            if (result.length > 0) {
                //Check the requested user's password hash & salt as the jwt secret or if the token might have expired.
                jwt.verify(token, result[0].user_pass, function(err, decoded) {
                    if (err) {
                        req.flash('error_msg', 'Invalid Token. Please try again.');
                        res.redirect('/admin/forgotpassword');
                    } else {
                        //Once the token is verified and genuine and active, process action code. (call)
                        action(req, res, token, decodedUserID)
                    }
                });
            } else {
                req.flash('error_msg', 'Invalid Token. Please try again.');
                res.redirect('/admin/forgotpassword');
            }
        });
    } else {
        res.redirect('/admin/forgotpassword');
    }
}

/**
 * Process a forgot password request.
 */
router.post('/forgotpassword', (req, res) => {
    if (req.body.username != "") {
        //Get the user data from the username/email provided.
        db.query("SELECT id AS user_id, user_pass, user_email FROM users WHERE ? IN (user_login, user_email) LIMIT 1;", [req.body.username], function(err, result) {
            if (err) {
                req.flash('error_msg', 'No database connection.');
                res.redirect('/admin/forgotpassword');
            }
            if (result.length > 0) {
                let jwt = require('jsonwebtoken');
                /**
                 * Create and sign a json web token with data of user_id (the requested user id), signed with their current password hash & salt.
                 * This token automatically expires after 24 hours or when the password is finally changed.
                 * (as this will change the password hash & salt used a secret)
                 */

                let token = jwt.sign({
                    id: result[0].user_id
                }, result[0].user_pass, { expiresIn: '24h' });

                //TODO: Here is where we should email the user their reset url
                console.log("Reset password for user '" + req.body.username + "' at [URL]/admin/forgotpassword/" + token)

                req.flash('success_msg', 'Password reset email has been sent.');
                res.redirect('/admin/forgotpassword');
            } else {
                req.flash('error_msg', 'Invalid username or email.'); //do we really want to let a user know if a user exists/doesn't exist? Could send "If this user exists, a password reset has been sent" as same message as real user
                res.redirect('/admin/forgotpassword');
            }
        });
    } else {
        req.flash('error_msg', 'Enter a username or email address.');
        res.redirect('/admin/forgotpassword');
    }
})

router.get('/register', (req, res) => {
    res.render('register-partA');
})

router.post('/register', (req, res) => {
    if(req.body.code != ""){
        res.redirect('/admin/register/' + req.body.code);
    } else {
        req.flash('error_msg', 'Please enter an account creation code.');
        res.redirect('/admin/register');
    }

})

router.get('/register/:token', (req, res) => {
    isValidRegToken(req.params.token).then(function (result) {
        if(result){
            res.render('register-partB', { token: req.params.token });
        } else {
            req.flash('error_msg', 'Invalid code.');
            res.redirect('/admin/register');
        }
    })
})

router.post('/register/:token', (req, res) => {
    isValidRegToken(req.params.token).then(function (result) {
        if (result) {
            //check fields are not empty
            if (req.body.email == "" ||
                req.body.username == "" ||
                req.body.fname == "" ||
                req.body.lname == "" ||
                req.body.newpass == "" ||
                req.body.newpass2 == "") { //Check that fields are not empty.
                req.flash('error_msg', 'Missing field(s).');
                res.redirect("/admin/register/" + req.params.token);
            } else {
                //check passwords match
                let passmatch = req.body.newpass == req.body.newpass2
                if (!passmatch) {
                    req.flash('error_msg', 'Passwords do not match.');
                    res.redirect("/admin/register/" + req.params.token);
                } else {
                    //check tos accepted
                    if(!req.body.tos) {
                        req.flash('error_msg', 'You must accept the Terms and Condition and Privacy Policy.');
                        res.redirect("/admin/register/" + req.params.token);
                    } else {
                        //check if email/username in use.
                        db.query("SELECT id AS user_id FROM users WHERE ? = user_email LIMIT 1;", [req.body.email], function(err, result) {
                            if (err) {
                                req.flash('error_msg', 'No database connection.');
                                res.redirect("/admin/register/" + req.params.token);
                            }
                            if (result.length > 0){
                                req.flash('error_msg', 'This email is already in use.');
                                res.redirect("/admin/register/" + req.params.token);
                            } else {
                                db.query("SELECT id AS user_id FROM users WHERE ? = user_login LIMIT 1;", [req.body.username], function(err, result) {
                                    if (err) {
                                        req.flash('error_msg', 'No database connection.');
                                        res.redirect("/admin/register/" + req.params.token);
                                    }
                                    if (result.length > 0){
                                        req.flash('error_msg', 'This username is already in use.');
                                        res.redirect("/admin/register/" + req.params.token);
                                    } else {

                                        //add user to database
                                        bcrypt.hash(newpass, 10, function(err, newhash) { //Hash new password and update database.
                                            db.query("INSERT INTO `users` (`id`, `user_login`, `user_email`, `user_pass`, `user_fname`, `user_lname`) VALUES (NULL, '?', '?', '?', '?', '?')", [req.body.username, req.body.email, newhash, req.body.fname, req.body.lname], function(err, result) {
                                                if (err) {
                                                    req.flash('error_msg', 'No database connection.');
                                                    res.redirect("/admin/register/" + req.params.token);
                                                }

                                                //TODO: user activation/must confirm email to continue?

                                                //MISSING: Email preferences ignored/not stored

                                                //success, redirect to login/homepage & decrement uses remaining
                                                decrementRegToken(req.params.token)
                                                req.flash('success_msg', 'Account created! Please login:');
                                                res.redirect("/admin/login");

                                            });
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            }
        } else {
            req.flash('error_msg', 'Invalid code.');
            res.redirect('/admin/register');
        }
    })
})

function isValidRegToken(token) {
    return new Promise(function (resolve, reject) {
        db.query("SELECT * FROM registration_codes WHERE code = ? AND expiry > CURRENT_TIMESTAMP AND uses_remaining > 0 LIMIT 1;", [token], function (err, result) {
            if (err) {
                reject("No database connection.");
            } else {
                if (result.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        });
    });
}

function decrementRegToken(token) {
    db.query("UPDATE registration_codes SET uses_remaining = uses_remaining - 1 WHERE code = ?;", [token]);
}

/**
 * Process a user logout. This kills the session.
 */
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You have been logged out.');
    res.redirect('/admin/login');
})


// Everything after this middleware will REQUIRE a login!
/**
 * Middleware to enforce that the user is logged in.
 */
router.use('/', async (req, res, next) => {
    if (req.isAuthenticated()) {
        next()
    } else {
        req.flash('error_msg', 'You are not authenticated.');
        res.redirect("/admin/login");
    }
})

/**
 * If a user navigates to /admin, and is already logged in, redirect to the dashboard.
 */
router.get('/', function(req, res, next) {
    res.redirect("/admin/dashboard");
});

module.exports = router;