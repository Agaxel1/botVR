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
  name: "unbanip",
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

    if (userPermissionLevel <= 4) {
      // El nivel de permiso del usuario no es mayor a 8
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    const args = message.content.split(' ');
    const ip = args[1];
    if (!ip) {
      message.channel.send('No has establecido el IP.');
      return;
    }
    if (!ip) {
      message.channel.send('Completa los campos requeridos correctamente.');
      return;
    }

    // Verificar si la IP existe en la tabla BanIP
    const selectQuery = "SELECT * FROM BanIP WHERE IP = ?";
    const selectResult = await executeQuery(selectQuery, [ip]);


    if (selectResult.length === 0) {
      message.channel.send(`La IP ${ip} no está en la lista de ban.`);
      return;
    }
    let playername = selectResult[0].Name;
    // Eliminar la IP de la tabla BanIP
    const deleteQuery = "DELETE FROM BanIP WHERE IP = ?";
    await executeQuery(deleteQuery, [ip]);

    message.channel.send(`Se ha eliminado la IP ${ip} con el nombre ${playername} de la lista de ban.`);
  }
};
