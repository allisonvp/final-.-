//imports
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require("body-parser");
const mysql = require("mysql2");

//configs
var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.use(bodyParser.urlencoded({extended: true}));

var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "teletok"
});


//server init
server.listen(3000, function () {
    console.log("Servidor corriendo en el puerto 3000");
});

//rutas
app.get("/", function (request, response) {


    response.sendFile(__dirname + "/index2.html");


});


var conexiones = 0;
var lisuras = ["hdp", "mrd", "el delicioso", "sexo", "sex", "el sin respeto", "fuck", "nigga","katty"];
var users = {};
var lastwritten = 0;

io.on('connection', function (websocket) {
    console.log("nuevo usuario");
    conexiones++;
    console.log("cantidad de usuarios: " + conexiones);
    io.emit('Conexiones', conexiones);


    websocket.on('disconnect', function () {
        console.log("usuario desconectado");
        conexiones--;
        console.log("cantidad de usuarios: " + conexiones);
        io.emit('Conexiones', conexiones);
    });

    websocket.on('chat', function (msg) {
        console.log("mensaje desde el cliente: " + msg);

        var msgsplit = msg.split(" ");

        var esfaltoso = false;
        for (i = 0; i < msgsplit.length; i++) {
            if (lisuras.indexOf(msgsplit[i]) >= 0) {
                esfaltoso = true;
            }
        }

        if (!esfaltoso) {
            websocket.broadcast.emit('mensaje recibido', {
                username: users[websocket.id],
                msg: msg
            });
            var query = "insert into chat(username,msg) values(?,?)";
            var param = [users[websocket.id], msg];
            conn.query(query, param, function (err, resultado) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("chat guardado");
                }
            });


            //websocket.broadcast.emit('mensaje recibido', msg);
        } else {
            websocket.broadcast.emit('mensaje recibido', {username: users[websocket.id], msg: "Usuario baneado por faltoso"});
            websocket.emit("mensajeban", "Fuiste eliminado :( por faltoso ctm")
            websocket.disconnect();
            websocket.broadcast.emit("stop");
        }

        //  io.emit('mensaje recibido',msg);
    });

    websocket.on('username', function (username) {
        users[websocket.id] = username;//nombre -> users[id de conexion]
    });
    websocket.on('writing', function () {
        var username = users[websocket.id];//nombre -> users[id de conexion]
        websocket.broadcast.emit("escribiendo", username + " está escribiendo...");
        lastwritten++;
        setTimeout(function () {
            lastwritten--;
            if (lastwritten === 0) {
                websocket.broadcast.emit("stop");
            }
        }, 4000);
    });

    websocket.on('stopwriting', function () {
        websocket.broadcast.emit("stop");
    });

    websocket.on('lastchat', function () {
        var query = "(SELECT * FROM teletok.chat order by idchat DESC limit 5) order by idchat;";
        conn.query(query, function (err, resultado) {
            if (err) {
                console.log(err);
            } else {
                websocket.emit('getlastchat', resultado);
            }
        });
    });
});
