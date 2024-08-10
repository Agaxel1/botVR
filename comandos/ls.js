const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');

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
  name: "ls",
  aliases: [],

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

    if (userPermissionLevel <= 3) {
      // El nivel de permiso del usuario no es mayor a 8
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    const args = message.content.split(' ');
    const nombreUsuario = args[1];

    try {
      // Consulta para obtener el ID del usuario
      const selectQuery = 'SELECT ID, Online FROM PlayaRP WHERE Name = ?';
      const selectResult = await executeQuery(selectQuery, [nombreUsuario]);

      if (selectResult.length === 0) {
        message.channel.send('El usuario que ingresaste es inválido.');
        return;
      }

      const userID = selectResult[0].ID;
      const Online = selectResult[0].Online;

      if (Online === 1) {
        message.channel.send('El usuario está Online, no se puede aplicar el TP.');
        return;
      }

      // Consulta para actualizar los campos en la tabla PlayaRP
      const updateQuery = 'UPDATE PlayaRP SET X = "1545.52", Y = "-1675.21", Z = "13.0931", A = "0" WHERE ID = ?';
      await executeQuery(updateQuery, [userID]);

      message.channel.send(`Se ha mandado a LS a ${nombreUsuario}.`);
    } catch (error) {
      console.error('Error al actualizar las coordenadas: ', error);
    }
  }
};
