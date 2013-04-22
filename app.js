// Requirements
var mqtt = require("mqtt");
var clientio = require('socket.io-client')
var socket = clientio.connect('http://localhost:8080');

// Configuration
var mqttPort = 1883;
var mqttHost = "api.pinocc.io";
var controlChannel = 'erictj/openrov-control';
var mqtt_login = {
  username: "erictj",
  password: "321",
}
// mqtt handling
var mqtt = mqtt.createClient(mqttPort, mqttHost, mqtt_login);
if (!mqtt) {
  console.dir(err);
  return process.exit(-1);
}

mqtt.on("message", function(topic, payload){
  console.log("received MQTT message on " + topic + ': ' + payload);

  if (topic == controlChannel) {
    var controls = {};
    
    var motors = payload.split(":");
    
    var leftMotor = motors[0];
    var rightMotor = motors[1];
    var topMotor = motors[2];
    
    controls.throttle = (leftMotor + rightMotor) / 2;
    controls.yaw = (leftMotor - rightMotor);
    controls.lift = topMotor;
    console.log("emitting control_update: " + require('util').inspect(controls, false, null));
    socket.emit("control_update", controls);
  }
});

socket.on('connect', function(){
  console.log('Connected');
  mqtt.subscribe(controlChannel);
  console.log("subscribed to " + controlChannel);
});
socket.on('disconnect', function () {
  console.log('Disconnected');
  mqtt.unsubscribe(controlChannel);
  console.log("unsubscribed to " + controlChannel);
});