const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const axios = require('axios');
const connection = require('./database');

const API_KEY = 'ptlc_kuRMWSpf6E543eKougLnoG5KsObtYEffPlYQpZLhBp5';
const SERVER_ID = '15098309-5251-40a8-851c-abdd43612a04';
// Función para ejecutar consultas a la base de datos
function executeQuery(query, params) {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}
module.exports = {
  name: 'encender',
  alias: ['on'],
  description: 'Enciende el servidor de VIDA ROL.',
  async execute(client, message, commandArgs) {
    // Suponiendo que executeQuery es una función que ejecuta una consulta SQL y devuelve los resultados

    const userID = message.author.id; // ID del usuario que está intentando ejecutar el comando

    const sqlGetUserPermissions = "SELECT Admin FROM PlayaRP WHERE Discord = ?";
    const resultGetUserPermissions = await executeQuery(sqlGetUserPermissions, [userID]);

    if (resultGetUserPermissions.length === 0) {
      // El usuario no existe en la base de datos
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    const userPermissionLevel = resultGetUserPermissions[0].Admin;

    if (userPermissionLevel <= 7) {
      // El nivel de permiso del usuario no es mayor a 8
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    axios.post(`https://game.papu.host/api/client/servers/${SERVER_ID}/power`, {
      signal: 'start'
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    })
      .then(response => {
        console.log('Respuesta de encendido:', response.data);
        message.channel.send('El servidor de VIDA ROL se encendió.');
      })
      .catch(error => {
        console.error('Error al encender el servidor de VIDA ROL:', error.message);
        message.channel.send('Hubo un error al encender el servidor.');
      });
    message.delete();
  },
};
