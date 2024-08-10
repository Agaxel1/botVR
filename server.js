const express = require('express')
const server = express();
 
server.all('/', (req, res) => {
    res.send('Estoy prendido y a tu disposicion!');
});
 
function keepAlive() {
   server.listen(3000, () => { console.log("Bot Encendido" ) });
}

module.exports = keepAlive;