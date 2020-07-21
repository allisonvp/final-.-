//imports
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

//configs
var app = express();
var server = http.Server(app);
var io = socketIO(server);

//server init
server.listen(3000,function(){
    console.log("Servidor corriendo en el puerto 3000");
});

//rutas
app.get("/",function(request, response){
    response.sendFile(__dirname + "/index2.html");
});


var conexiones = 0;
//funcion que recepcione la solucitud del cliente para abrir la comunicacion bidireccional
io.on('connection',function (websocket) { //escucha cuando se abre una comunicacion a nivel de servidor
    console.log("nuevo usuario");
    conexiones++;
    console.log("cantidad de usuarios: " + conexiones);
    io.emit('Conexiones',conexiones);

    //escucha cuando se abre una comunicacion a nivel de canal
    websocket.on('disconnect',function () { //escucha cuando el cliente se desconecta
        console.log("usuario desconectado");
        conexiones--;
        console.log("cantidad de usuarios: " + conexiones);
        io.emit('Conexiones',conexiones);
    })

    websocket.on('chat',function (msg) { //msg=mensaje
            console.log("mensaje desde el cliente: " + msg);

         //  io.emit('mensaje recibido',msg);
        websocket.broadcast.emit('mensaje recibido',msg);

    });

});
