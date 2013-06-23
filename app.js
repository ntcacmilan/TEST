
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , util = require('util')
  , passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var FACEBOOK_APP_ID = "484741244941247"
var FACEBOOK_APP_SECRET = "bad256eab00c4ed73b0a296dfa2eeddc";
var TWITTER_CONSUMER_KEY = "QPfF5l7P9VefiZDFcpSCow";
var TWITTER_CONSUMER_SECRET = "cn7t91hGQ78ldeGRSE8h6e9k9NSbfkJ0K0HNUeBm4";
var GOOGLE_CLIENT_ID = "312966742093.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "PzfvfuCEt91fWlKyzG030UjV";

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));
// Use the TwitterStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Twitter profile), and
//   invoke a callback with a user object.
passport.use(new TwitterStrategy({
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Twitter profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Twitter account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));
// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

var app = express();

// all environments
app.configure(function() {
	app.set('port', process.env.PORT || 3000);
  	app.set('views', __dirname + '/views');
  	app.set('view engine', 'jade');
  	app.use(express.logger());
  	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
  	app.use(express.session({ secret: 'keyboard cat' }));
  	// Initialize Passport!  Also use passport.session() middleware, to support
  	// persistent login sessions (recommended).
  	app.use(passport.initialize());
  	app.use(passport.session());
  	app.use(app.router);
  	app.use(express.static(path.join(__dirname, 'public')));
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/facebook-login', passport.authenticate('facebook'));
 
app.get('/facebook-token', passport.authenticate('forcedotcom', { failureRedirect: '/error' }),
  function(req, res){
    res.send('Logged In.');
  });


app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  });

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
 
app.get('/twitter-login', passport.authenticate('twitter'));
 
app.get('/twitter-token', passport.authenticate('twitter', { failureRedirect: '/error' }),
  function(req, res){
    res.send('Logged In.');
  });
 
  app.get('/google-login', passport.authenticate('google'));
 
app.get('/google-token', passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res){
    res.send('Logged In.');
  });



app.get('/error', function(req, res){
  res.send('An error has occured.');
  });
 
app.all('/:label/:mode/*',
  ensureAuthenticated,
  function(req, res) {
    console.log(req.session);
    if(req.session["passport"]["user"] && req.params.label == "fdc") {
      var restOptions = {
        useHTTPS : true,
        host : req.session["passport"]["user"].instance_url,
        headers: {
            'Authorization': 'OAuth '+req.session["passport"]["user"].access_token,
            'Accept':'application/jsonrequest',
            'Cache-Control':'no-cache,no-store,must-revalidate'
          }
      }
 
      restProxy.proxy(req,res);
    }
  });
 
app.get('/*',function(req, res) {
  res.render(req.url.substring(1,req.url.length)); //really?
})

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}