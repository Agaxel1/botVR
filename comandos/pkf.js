const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const mysql = require('mysql');

// Función para ejecutar consultas a la base de datos
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
  name: "pkf",
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
    const name_s = args[1];

    if (!name_s) {
      message.channel.send('Falta el nombre de usuario en el comando.');
      return;
    }

    try {
      // Verificar el estado en línea del usuario
      const sqlCheckOnline = 'SELECT Online FROM PlayaRP WHERE Name = ?';
      const resultCheckOnline = await executeQuery(sqlCheckOnline, [name_s]);

      if (resultCheckOnline.length === 0) {
        message.channel.send('El usuario no existe en la base de datos.');
        return;
      }

      const isOnline = resultCheckOnline[0].Online;

      if (isOnline === 1) {
        message.channel.send('El usuario se encuentra en línea. Debe salirse para aplicar el PKF.');
        return;
      }

      // Aplicar el PKF
      const sqlCallProcedure = 'CALL pfk(?)';
      await executeQuery(sqlCallProcedure, [name_s]);

      message.channel.send(`Al usuario ${name_s} se le ha aplicado el PKF.`);
    } catch (error) {
      console.error('Error al ejecutar el comando pfk: ', error);
      message.channel.send('Ocurrió un error al intentar ejecutar este comando.');
    }
  }
};
