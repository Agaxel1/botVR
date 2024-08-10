const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');

module.exports = {
  name: "unantidm",
  aliases: ["quitarantidm"],

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
      // Consulta para obtener los valores de ArestPenal y JailPenal del usuario
      const selectQuery = 'SELECT Online, TimerAntiDM FROM PlayaRP WHERE Name = ?';
      const selectResult = await executeQuery(selectQuery, [nombreUsuario]);

      if (selectResult.length === 0) {
        message.channel.send('El usuario que ingresaste es inválido.');
        return;
      }
      const usuarioOnline = selectResult[0].Online;

      if (usuarioOnline === 1) {
        message.channel.send('El usuario se encuentra ON, debe quitar /q para poder quitar el antidm.');
        return;
      }

      if (selectResult[0].TimerAntiDM === 0) {
        message.channel.send('El usuario no tiene el antidm.');
        return;
      }

      // Consulta para actualizar el campo Prison del usuario
      const updateQuery = 'UPDATE PlayaRP SET TimerAntiDM = 0 WHERE Name = ?';
      const result = await executeQuery(updateQuery, [nombreUsuario]);

      if (result.affectedRows > 0) {
        message.channel.send(`El usuario ${nombreUsuario} ha sido liberado del antidm.`);
      } else {
        message.channel.send(`El usuario ${nombreUsuario} no existe en la base de datos.`);
      }
    } catch (error) {
      console.error('Error al quitar antidm al usuario: ', error);
    }
  }
};

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
