# What’s the best way to encrypt messages sent via Pusher?

This repo consists of working code for the topic What’s the best way to encrypt messages sent via Pusher?


The write-up to this codebase can be found here [to be updated soon]
## Getting Started
- Clone this repo 
```
git clone https://github.com/samuelayo/pusher-encrypt-messages.git
```

- change directory into the newly cloned repo

```
cd pusher-encrypt-messages
```

- Install required packages

```
npm install
```
- Setup Pusher

If you don't have one already, create a free Pusher account at https://pusher.com/signup then login to your dashboard and create an app. Then fill in your Pusher app credentials in your .env file replacing the x's

```
PUSHER_APP_ID=XXXXXX
PUSHER_APP_KEY=XXXXXXXXXX
PUSHER_APP_SECRET=XXXXXXXXXX
PUSHER_APP_CLUSTER=XXX``
```
Next, replace both `PUSHER_APP_KEY` and `PUSHER_APP_CLUSTER` with thier corresponding values in `public/client.js` where you have 

```
const pusher = new Pusher('PUSHER_APP_KEY', {
    cluster: 'PUSHER_APP_CLUSTER',
    encrypted: true,
    authEndpoint: 'pusher/auth'
});
```

- Run the app

```
node index.js
```
The app should run now and can be accessed through http://localhost:3000. Try the app out.

