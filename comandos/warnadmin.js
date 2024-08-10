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
  name: "warnadmin",
  aliases: [],

  async execute(client, message, commandArgs) {
    // Suponiendo que executeQuery es una función que ejecuta una consulta SQL y devuelve los resultados

    const userID1 = message.author.id; // ID del usuario que está intentando ejecutar el comando

    const sqlGetUserPermissions = "SELECT Admin FROM PlayaRP WHERE Discord = ?";
    const resultGetUserPermissions = await executeQuery(sqlGetUserPermissions, [userID1]);

    if (resultGetUserPermissions.length === 0) {
      // El usuario no existe en la base de datos
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    const userPermissionLevel = resultGetUserPermissions[0].Admin;

    if (userPermissionLevel <= 6) {
      // El nivel de permiso del usuario no es mayor a 8
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    const args = message.content.split(' ');
    const Usuario = args[1];
    const cantidadWarns = parseInt(args[2]);

    if (!Usuario || !cantidadWarns || isNaN(cantidadWarns)) {
      message.channel.send('Faltan argumentos en el comando o la cantidad de advertencias no es válida.');
      return;
    }


    try {
      const sqlCheckUser = 'SELECT * FROM PlayaRP WHERE Name = ? AND Admin <> 0';
      const resultCheckUser = await executeQuery(sqlCheckUser, [Usuario]);

      if (resultCheckUser.length === 0) {
        message.channel.send('El usuario mencionado no es administrador.');
        return;
      }

      const sqlUpdateWarns = 'UPDATE PlayaRP SET warnAdmin = warnAdmin + ? WHERE Name = ?';
      await executeQuery(sqlUpdateWarns, [cantidadWarns, Usuario]);

      const totalWarns = resultCheckUser[0].warnAdmin + cantidadWarns;
      message.channel.send(`Se ha actualizado la cantidad de advertencias para ${Usuario} a ${totalWarns}.`);

      if (totalWarns >= 3) {

        const sqlUpdateAdmin = 'UPDATE PlayaRP SET warnAdmin = 0, Admin = 0, AdminPass = 0 WHERE Name = ?';
        await executeQuery(sqlUpdateAdmin, [Usuario]);

        // Aquí puedes agregar cualquier lógica adicional o enviar un mensaje adicional si es necesario
        message.channel.send(`El admin ${Usuario} ha alcanzado las 3 advertencias. Se le han quitado los permisos.`);
      }
    } catch (error) {
      console.error('Error al ejecutar el comando warnadmin: ', error);
      message.channel.send('Ocurrió un error al intentar ejecutar este comando.');
    }
  }
};
