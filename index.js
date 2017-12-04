require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const CryptoJS = require("crypto-js");
const Pusher = require('pusher');
const cache = require('memory-cache');
const app = express();



// function that sets key for a new channel
const setChannelKey = (name) => {
    var newkey = CryptoJS.SHA256(name).toString();
    cache.put(name, newkey)
    return newkey;
}


// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Session middleware
app.use(session({
    secret: 'somesuperdupersecret',
    resave: true,
    saveUninitialized: true
}))


// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Create an instance of Pusher
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER,
    encrypted: true
});

//demo users and password

const users = {samuel:'pass3', samson: 'pass3'};

// serve home page
app.get('/', (req, res) => {
    if (!req.session.user || !req.session.authenticated) {
        res.redirect('/login');
    } else {
        res.render('index', { user: req.session.user });
    }



});

app.get('/login', function(req, res) {
    res.render('login', { error: req.session.error });
});

app.post('/login', function(req, res) {

    var userLoggingIn = users[req.body.username];
  
    if (userLoggingIn && users[req.body.username] == req.body.password) {
        req.session.authenticated = true;
        req.session.user = req.body.username;
        if (req.session.error) {
            req.session.error = null;
        }
        res.redirect('/');
    } else {
        req.session.error = 'Username or password are incorrect';
        res.redirect('/login');
    }

});


// get authentict=ation for the channel (private channel only);
app.post('/pusher/auth', (req, res) => {

    if (!req.session.user || !req.session.authenticated) {
        res.status(403).send('unauthorised');
    } else {
        const socketId = req.body.socket_id;
        const channel = req.body.channel_name;
        const auth = pusher.authenticate(socketId, channel);

        res.send(auth);
    }

});


//get key for specific channel.. client side will use this key to decrpyt data
app.post('/send-key', (req, res) => {
    if (!req.session.user || !req.session.authenticated) {
        res.status(403).send('unauthorised');
    } else {
        var channel_name = req.body.channel_name;


        try {
            var key = cache.get(channel_name);

            return res.json({ key: CryptoJS.enc.Latin1.parse(key) });
        } catch (error) {
            var key = setChannelKey(channel_name);

            return res.json({ key: CryptoJS.enc.Latin1.parse(key) });

        }
    }

});



//send message via pusher
app.post('/send-message', (req, res) => {

    var channel_name = req.body.channel_name;

    try {
        var key = cache.get(channel_name);

    } catch (error) {
        var key = setChannelKey(channel_name);
    };
    var message_to_send = JSON.stringify({
        username: req.body.username,
        message: req.body.message
    });
    var message_to_send = CryptoJS.AES.encrypt(message_to_send, key).toString()
    pusher.trigger(channel_name, 'message_sent', message_to_send);
    res.send('Message sent');
});

//listen on the app
app.listen(3000, () => {
    console.log('Server is up on 3000')
});