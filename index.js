require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const CryptoJS = require("crypto-js");
const Pusher = require('pusher');
const fs = require('fs');
const app = express();

// function that sets key for a new channel
const setChannelKey = (name) => {
    var salt = CryptoJS.lib.WordArray.random(128 / 8);
    var newkey = CryptoJS.PBKDF2(name, salt, { keySize: 512 / 32, iterations: 1000 }).toString();

    try {
        fs.writeFileSync('setChannelKeyDecrypt-' + name, newkey)
        //console.log("name is " + name);
        //console.log("The file was saved!" + newkey);
        return newkey;
    } catch (error) {

    }


}


// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Create an instance of Pusher
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER,
    encrypted: true
});

// serve home page
app.get('/', (req, res) => {
    res.sendFile('index.html', {
        root: __dirname
    });
});

// get authentict=ation for the channel (private channel only);
app.post('/pusher/auth', (req, res) => {
    const socketId = req.body.socket_id;
    const channel = req.body.channel_name;
    const auth = pusher.authenticate(socketId, channel);
    res.send(auth);
});


//get key for specific channel.. client side will use this key to decrpyt data
app.post('/get-key', (req, res) => {

    var channel_name = req.body.channel_name;

    try {
        var key = fs.readFileSync('setChannelKeyDecrypt-' + channel_name, 'utf8');
	
        return res.json({ key: CryptoJS.enc.Latin1.parse(key)});
    } catch (error) {
        var key = setChannelKey(channel_name);

        return res.json({ key: CryptoJS.enc.Latin1.parse(key) });

    }


});


//send message via pusher
app.post('/send-message', (req, res) => {

    var channel_name = req.body.channel_name;

    try {
        var key = fs.readFileSync('setChannelKeyDecrypt-' + channel_name, 'utf8');

    } catch (error) {
        var key = '';

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
