const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const AsciiTable = require('ascii-table');

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

module.exports = {
  name: "lugar",
  aliases: [],

  async execute(client, message, commandArgs) {
    const userID = message.author.id; // ID del usuario que está intentando ejecutar el comando

    const sqlGetUserPermissions = "SELECT Admin FROM PlayaRP WHERE Discord = ?";
    const resultGetUserPermissions = await executeQuery(sqlGetUserPermissions, [userID]);

    if (resultGetUserPermissions.length === 0 || resultGetUserPermissions[0].Admin <= 7) {
      // El usuario no existe en la base de datos o no tiene permisos suficientes
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    try {
      let args;
      if (Array.isArray(commandArgs)) {
        args = commandArgs.join(" ");
      } else {
        args = commandArgs;
      }

      const argsArray = args.split(" ");
      if (argsArray.length !== 3) {
        message.channel.send('Formato incorrecto. Debes usar !lugar ID Negocio Number');
        return;
      }

      const playaID = parseInt(argsArray[0]);
      const negocioID = parseInt(argsArray[1]);
      console.log('Negocio ID:', negocioID); // Add this line for debugging

      let negocioTable;
      let identifierFieldName; // Nuevo campo para almacenar el nombre del campo que se utilizará en la consulta SQL

      switch (negocioID) {
        case 1:
          negocioTable = "Shop24";
          identifierFieldName = "Number";
          break;
        case 2:
          negocioTable = "GlobalInfo";
          identifierFieldName = "Number";
          break;
        case 3:
          negocioTable = "GasStations";
          identifierFieldName = "ID";
          break;
        case 4:
          negocioTable = "Salon";
          identifierFieldName = "Number";
          break;
        default:
          message.channel.send('Negocio no válido. Debe ser 1, 2, 3 o 4.');
          return;
      }

      const sqlGetNegocioLocation = `SELECT X, Y, Z, A FROM ${negocioTable} WHERE ${identifierFieldName} = ?`;
      const resultNegocioLocation = await executeQuery(sqlGetNegocioLocation, [identifier]);

      if (resultNegocioLocation.length === 0) {
        message.channel.send('Identificador de negocio no encontrado.');
        return;
      }

      const { X, Y, Z, A } = resultNegocioLocation[0];

      // Actualizar las coordenadas en la tabla PlayaRP
      const sqlUpdatePlayaRP = "UPDATE PlayaRP SET X = ?, Y = ?, Z = ?, A = ? WHERE ID = ?";
      await executeQuery(sqlUpdatePlayaRP, [X, Y, Z, A, playaID]);

      message.channel.send(`Coordenadas del negocio actualizadas en la playa ${playaID}.`);

    } catch (error) {
      console.error('Error al poner el lugar: ', error);
      message.channel.send('Error al ejecutar el comando.');
    }

    message.delete();
  }
};
