var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var listDevices = [];
var idSerer = ""
const port = process.env.PORT || 5000;

io.on('connection', function (socket) {
   let deviceName = socket.handshake.query.userId;
   let deviceId = socket.id
   let objectDevice = {"name": deviceName, "id": deviceId}
   listDevices.push(objectDevice)
   console.log('client connect');
   deviceName == "Manager" ? idSerer = deviceId : null
   updateDevice();

   console.log("====================>>>client connect: ", socket.handshake.query.userId);

   socket.on('get-all-dvices', function (){
      updateDevice()
   });

   socket.on('set-device', function (data){
      console.log("====================>>>set-device ", data);
      putRunDevice(data)
   });

   socket.on('stop-service', function (data){
      console.log("====================>>>service ", data);
      putStopDevice(data.id)
   });

   socket.on('status', function (data){
      console.log("====================>>>status ", data);
      pushStatus(data)
      
   });
   
   socket.on('start-push', function (data){
      console.log("====================>>>start-push ", data);
      putStartPush(data.id)
   });

   socket.on('stop-push-all', function (data){
      console.log("====================>>>stop-push-all ", data);
      socket.broadcast.emit('stop-push-all', '');
   })

   socket.on('change-account', function (data){
      console.log("====================>>>change-account ", data);
      changeAccount(data)
   })


   socket.on('disconnect', function () {
      for(let i = 0; i < listDevices.length; i++){
         console.log("===================>>>> ", i);
         if(listDevices[i].id == socket.id){
            listDevices.splice(i, 1);
         }
      }

      updateDevice();
      console.log('client disconnect');
   });
});

const putRunDevice = (data) => {
   io.to(`${data.id}`).emit('set-device', JSON.stringify(data));
}

const putStopDevice = (id) => {
   io.to(`${id}`).emit('stop-service', "Stop Now");
}

const putStartPush = (id) => {
   io.to(`${id}`).emit('start-push', "");
}

const updateDevice = () => {
   io.to(`${idSerer}`).emit('update-devices', JSON.stringify(listDevices));
}

const pushStatus = (data) => {
   io.to(`${idSerer}`).emit('status', JSON.stringify(data));
}

const changeAccount = (data) => {
   io.to(`${data.id}`).emit('status', JSON.stringify(data));
}

app.get('/', function (req, res) {
   res.sendFile(__dirname + '/index.html');
});


http.listen(port, function () {
   console.log('listening port: ' + port);
});