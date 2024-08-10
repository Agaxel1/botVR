const mysql = require('mysql');

const pool = mysql.createPool({
  host: 'mc.papu.host',
  user: 'u1275_oX32qKGkak',
  password: 'SBrSI7!EdIr1@oz=!vtLjiKX',
  database: 's1275_vida_roleplay',
  connectTimeout: 30000,
  acquireTimeout: 30000,
  connectionLimit: 10 // establece el límite de conexiones simultáneas en el pool
});

pool.on('connection', (connection) => {
  console.log('Conexión establecida');
});

pool.on('acquire', (connection) => {
  console.log('Conexión adquirida');
});

pool.on('release', (connection) => {
  console.log('Conexión liberada');
});

pool.on('enqueue', () => {
  console.log('Esperando una conexión disponible');
});

module.exports = pool;