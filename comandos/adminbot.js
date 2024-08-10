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
  name: "adminbot",
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

    if (userPermissionLevel <= 7) {
      // El nivel de permiso del usuario no es mayor a 8
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    const args = message.content.split(' ');
    const action = args[1]; // Acción a realizar (add, remove o update)
    const userID = args[2]; // ID de usuario
    const admin = args[3]; // Rol de administrador
    const nivel = args[4]; // Nuevo nivel (solo para la acción 'update')

    if (!action || !userID || !admin) {
      message.channel.send('Faltan argumentos en el comando.');
      return;
    }

    try {
      if (action === 'add') {
        // Verificar si el ID de usuario ya existe en la columna ID_user
        const sqlCheckUser = 'SELECT * FROM bot_admin WHERE ID_user = ?';
        const resultCheckUser = await executeQuery(sqlCheckUser, [userID]);

        if (resultCheckUser.length > 0) {
          message.channel.send('El ID de usuario ya se encuentra.');
          return;
        }

        // Insertar nuevo registro en la tabla bot_admin
        const sqlAddAdmin = 'INSERT INTO bot_admin VALUES (null, ?, ?,0, now())';
        await executeQuery(sqlAddAdmin, [admin, userID]);

        message.channel.send('Se ha agregado el usuario como administrador.');
      } else if (action === 'remove') {
        // Verificar si el ID de usuario existe en la columna ID_user
        const sqlCheckUser = 'SELECT * FROM bot_admin WHERE ID_user = ?';
        const resultCheckUser = await executeQuery(sqlCheckUser, [userID]);

        if (resultCheckUser.length === 0) {
          message.channel.send('No se encuentra el usuario para eliminar.');
          return;
        }

        // Eliminar registro de la tabla bot_admin
        const sqlRemoveAdmin = 'DELETE FROM bot_admin WHERE ID_user = ?';
        await executeQuery(sqlRemoveAdmin, [userID]);

        message.channel.send('Se ha eliminado el usuario como administrador.');
      } else if (action === 'update') {
        // Verificar si el ID de usuario existe en la columna ID_user
        const sqlCheckUser = 'SELECT * FROM bot_admin WHERE ID_user = ?';
        const resultCheckUser = await executeQuery(sqlCheckUser, [userID]);

        if (resultCheckUser.length === 0) {
          message.channel.send('No se encuentra el usuario para actualizar.');
          return;
        }

        // Actualizar el nivel de administrador en la tabla bot_admin
        const sqlUpdateAdmin = 'UPDATE bot_admin SET Admin = ? WHERE ID_user = ?';
        await executeQuery(sqlUpdateAdmin, [admin, userID]);

        message.channel.send('Se ha actualizado el nivel de administrador del usuario.');
      } else {
        message.channel.send('Acción no válida. Las acciones permitidas son: add, remove, update.');
      }
    } catch (error) {
      console.error('Error al ejecutar el comando adminbot: ', error);
      message.channel.send('Ocurrió un error al intentar ejecutar este comando.');
    }
    message.delete();
  }
};
