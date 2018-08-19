const port = process.env.PORT;
// const sessionKey = process.env.SESSION_KEY;
const client_ID = process.env.CLIENT_ID;
const client_Secret = process.env.CLIENT_SECRET;



const express = require('express');
const exphbs = require('express-handlebars');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const passport = require('passport');
const uuid = require('uuid/v4')

const app = express();

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(client_ID);


passport.use(new GoogleStrategy(
    {
        clientID: client_ID,
        clientSecret: client_Secret,
        callbackURL: 'https://my-money-dashboard.herokuapp.com/auth/google/callback',
    },
    (token, refreshToken, profile, done) => {
        console.log("Authenticated USer:" + token);
        return done(null, {
            profile: profile,
            token: token
        });
    }
));
passport.serializeUser((user, done) => {
    console.log('Serialising user'+JSON.stringify(user));
    let userObj = {}
    userObj.name = user.profile.name.givenName;
    userObj.surname = user.profile.name.familyName;
    userObj.email = user.profile.emails[0].value;
    userObj.photo = user.profile.photos[0].value;
    done(null, userObj);
});
passport.deserializeUser((user, done) => {
    console.log('Deserialising user');
    done(null, user);
});


// Use Handlebars view engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
// Use Handlebars view engine
app.set('view engine', 'handlebars');


app.use(express.static(__dirname + '/public'));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', (req, res) => {
    console.log('Login page loaded');
    res.render('login', {googleClientId: client_ID});
});



app.get('/auth/google', (req, res, next) => {
    console.log('Auth called'); next(); },
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);


app.get('/auth/google/callback', (req, res, next) => {
    console.log('Callback called'); next(); },
        passport.authenticate('google', {failureRedirect:'/login'
    }),
    (req, res) => {
        req.session.token = req.user.token;
        // const ticket =  client.verifyIdToken({
        //     idToken: req.user.token,
        //     audience: client_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // });
        // const payload = ticket.getPayload();
        // const givenName = payload['given_name'];
        // console.log("Given name: "+ givenName);

        console.log("Google callback called, redirecting to dashboard"+ req.session.token);
        res.render('dashboard', {name: "Bex", bex_monzo: '52.06', peet_monzo: '66.43', bex_firstdirect: '150.23', peet_lloyds: '9,998.12', bex_barclaycard: '-500', peet_mbna1: '-9,786.99'});
    }
);


app.get('/' , (req, res) => {
    console.log("in get(/)");
    console.log("Request: " +req.isAuthenticated())
    if (!req.isAuthenticated()) {
        console.log("redirecting to logon page");
        return res.redirect('/login')
    }
    console.log("About to render dashboard");
    res.render('dashboard', {name: 'Bex', bex_monzo: '52.06', peet_monzo: '66.43', bex_firstdirect: '150.23', peet_lloyds: '9,998.12', bex_barclaycard: '-500', peet_mbna1: '-9,786.99'});
});




app.listen(port, function () {
    console.log('Example server listening on port' + port);
});


