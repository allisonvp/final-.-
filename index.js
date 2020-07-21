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
    database: "movies"
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
var lisuras = ["hdp", "mrd", "el delicioso", "sexo", "sex", "el sin respeto", "fuck", "nigga"];

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

        var faltoso = false;
        for (i = 0; i < msgsplit.length; i++) {
            if (lisuras.indexOf(msgsplit[i]) >= 0) {
                faltoso = true;
            }
        }

        if (!faltoso) {
            websocket.broadcast.emit('mensaje recibido', msg);
        } else {
            websocket.broadcast.emit('mensaje recibido', "Usuario baneado por faltoso");
            websocket.emit("mensajeban", "Fuiste eliminado :( por faltoso ctm")
            websocket.disconnect();
        }

        //  io.emit('mensaje recibido',msg);
    });
});
