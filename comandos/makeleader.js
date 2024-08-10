const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');

async function executeQuery(query, params) {
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


function hacerLider(usuario, idFaccion) {
  return new Promise((resolve, reject) => {
    const sqlUpdate = 'UPDATE PlayaRP SET Leader = ?, Member = ?,Rank= ?, Rvol = 0 WHERE Name = ?';
    connection.query(sqlUpdate, [idFaccion, idFaccion,idFaccion, usuario], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}
function obtenerNombreFaccion(idFaccion) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT Name FROM LeaderInfo WHERE Leader = ?';
    connection.query(sql, [idFaccion], (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result[0].Name);
      }
    });
  });
}


module.exports = {
  name: "makeleader",
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

    if (userPermissionLevel <= 5) {
      // El nivel de permiso del usuario no es mayor a 8
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    const args = message.content.split(' ');
    const usuario = args[1];
    const idFaccion = parseInt(args[2]);

    if (!usuario || isNaN(idFaccion)) {
      message.channel.send('Por favor, proporciona un nombre de usuario y un ID de facción válido.');
      return;
    }

    try {
      // Nueva consulta para obtener el estado en línea (Online)
      const sqlGetOnlineStatus = "SELECT Online FROM PlayaRP WHERE Name = ?";
      const onlineStatusResult = await executeQuery(sqlGetOnlineStatus, [usuario]);

      if (onlineStatusResult.length > 0) {
        const onlineStatus = onlineStatusResult[0].Online;

        if (onlineStatus === 1) {
          message.channel.send(`El usuario ${usuario} se encuentra Online.`);
        } else {
          await hacerLider(usuario, idFaccion);
          const nombreFaccion = await obtenerNombreFaccion(idFaccion);
          message.channel.send(`El usuario ${usuario} ahora es líder de la facción ${nombreFaccion} con ID ${idFaccion}.`);
        }
      } else {
        message.channel.send(`No se pudo obtener el estado en línea del usuario ${usuario}.`);
      }

    } catch (error) {
      console.error('Error al hacer líder al usuario: ', error);
      message.channel.send('Ocurrió un error al hacer líder al usuario. Por favor, inténtalo de nuevo.');
    }

    message.delete()
  }
};