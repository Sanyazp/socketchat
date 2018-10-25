var express = require('express'),
    app = express();
var http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);

app.use(express.static('public'));
var appPort = process.env.PORT || 3000;
server.listen(appPort, function() {
    console.log("Server listening on port " + appPort);
});

var users = 0;
var usersArr = [];
io.on('connect', function(socket) {
    socket.on('username', function(username) {
        socket.userName = username;
        usersArr.push({
            username: socket.userName,
            id: socket.id
        })
        users += 1;
        reloadUsers()
        console.log(usersArr);
    })
    socket.on('disconnect', function() { // Клиент вышел из чата
        for (var i = 0; i < usersArr.length; i++) {
            var index = usersArr[i].username.indexOf(socket.userName);
            if (index >= 0) {
                usersArr.splice(index, 1);
                users -= 1;
                reloadUsers()
            }
        }
    })
    socket.on('message', function(data) {
        if (data.private == 'All Users') {
            socket.broadcast.emit('message', {
                msg: data.msg,
                username: socket.userName,
                id: socket.id
            });
        } else {
            if (io.sockets.connected[data.private]) {
                io.sockets.connected[data.private].emit('message', {
                    msg: data.msg,
                    username: socket.userName,
                    id: socket.id,
                    private: 'private'
                });
            }
        }
    })
})


function reloadUsers() {
    io.sockets.emit('UsersOnline', {
        "UO": users,
        array: usersArr
    });
}

// function checkName(socket) {
//     var test;
//     if (socket.nickname == null) test = false;
//     else test = true;
//     return test;

// }