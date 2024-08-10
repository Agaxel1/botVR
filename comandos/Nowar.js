const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const moment = require('moment-timezone');

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

async function obtenerFechaNoWar(leaderId) {
  return new Promise((resolve, reject) => {
    const noWarColumn = 'NoWar'; // Cambiar por el nombre real de la columna en la tabla GasStations

    const sql = `SELECT ${noWarColumn} FROM Salon WHERE Number = ?`;
    connection.query(sql, [leaderId], (error, results) => {
      if (error) {
        reject(error);
      } else {
        const noWarTimestamp = results[0][noWarColumn];
        const formattedDate = moment.unix(noWarTimestamp).tz('Chile/Continental').add(8, 'hours').format('YYYY-MM-DD HH:mm:ss');
        resolve(formattedDate);
      }
    });
  });
}



module.exports = {
  name: "nowar",
  aliases: [],

  async execute(client, message, commandArgs) {
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

    const args = message.content.split(' ');
    const leaderId = parseInt(args[1]);

    try {
      // Obtener la fecha legible desde la columna NoWar
      const fechaNoWar = await obtenerFechaNoWar(leaderId);

      const mensaje = new MessageEmbed()
        .setTitle('Fecha NoWar de líder')
        .addField('Leader ID', leaderId, true)
        .addField('Fecha NoWar', fechaNoWar, true)
        .setColor('#0099ff');

      message.channel.send(mensaje);
    } catch (error) {
      console.error('Error al obtener la información del líder: ', error);
      message.channel.send('Hubo un error al obtener la información del líder.');
    }

    message.delete();
  }
};
