const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('./database.js');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy((username, password, done) => {
            //Get user data from database
            db.query("SELECT id AS user_id, user_pass FROM users WHERE ? IN (user_login, user_email) LIMIT 1;", [username], function(err, result) {
                if (err) {
                    //throw(err);
                    return done(null, false, { message: 'No database connection.' });
                }
                if (result.length > 0) {
                    //Check hash stored in database matches password provided.
                    bcrypt.compare(password, result[0].user_pass, function(err, hashMatched) {
                        if (hashMatched) { //Successful login.
                            return done(null, result[0].user_id);
                        } else {
                            return done(null, false, { message: 'Invalid username/password' });
                        }
                    })
                } else {
                    return done(null, false, { message: 'Invalid username/password' });
                }
            });
        })
    )

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
};