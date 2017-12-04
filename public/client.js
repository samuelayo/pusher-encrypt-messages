const pusher = new Pusher(XXX_PUSHER_KEY, {
    cluster: XXX_PUSHER_CLUSTER,
    encrypted: true,
    authEndpoint: 'pusher/auth'
});
var messages = [];
var decryptKey;
const channel = pusher.subscribe('private-groupChat');

var xhttp = new XMLHttpRequest();
var c_vars = "channel_name=private-groupChat"
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        //document.getElementById("demo").innerHTML = this.responseText;
        var result = JSON.parse(this.responseText);
        decryptKey = CryptoJS.enc.Latin1.stringify(result.key);
       
    }
};
xhttp.open("POST", "/send-key", true);
xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
xhttp.send(c_vars);

channel.bind('message_sent', function(data) {
    messages.push(data);
    renderpage();
});

function renderpage() {

    var my_html = '';
    for (var i = 0; i < messages.length; i++) {
        
        var encrypted = CryptoJS.AES.decrypt(messages[i], decryptKey);
        var plaintext = encrypted.toString(CryptoJS.enc.Utf8);
        var data = JSON.parse(plaintext)

        my_html += `
            <li class="left clearfix"><span class="chat-img pull-left">
                            <img src="http://placehold.it/50/55C1E7/fff&text=` + data.username + `" alt="User Avatar" class="img-circle" />
                        </span>
                                    <div class="chat-body clearfix">
                                        <div class="header">
                                            <strong class="primary-font">` + data.username + `</strong> 
                                      
                                </div>
                                <p>
                                    ` + data.message + `
                                </p>
                            </div>
            </li>
        `;

    }
    document.getElementById('chat').innerHTML = my_html;
}

function send_message() {
    var message = document.getElementById('btn-input').value;
    var username = sessionStorage.getItem('user');

    var xhttp = new XMLHttpRequest();
    var c_vars = "username=" + username + "&message=" + message + "&channel_name=private-groupChat";
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //document.getElementById("demo").innerHTML = this.responseText;
            //sessionStorage.setItem("private-groupChat", this.responseText);
            document.getElementById('btn-input').value = '';
        }
    };
    xhttp.open("POST", "/send-message", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(c_vars);

}
