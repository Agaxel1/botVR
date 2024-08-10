const { MessageEmbed } = require('discord.js');
const connection = require('./database');

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
  name: "rbackpack",
  alias: ["rb"],

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

    const args = message.content.split(' ');
    const name = args[1];

    if (!name) {
      message.channel.send('Debes proporcionar la parte del nombre del usuario.');
      return;
    }

    try {
      // Realizar la consulta para obtener los nombres de usuarios y sus respectivas ID filtrando por la parte del nombre
      const sqlQuery = 'SELECT ID, Vip, Maxinv, Slot FROM PlayaRP WHERE Name = ?';
      const result = await executeQuery(sqlQuery, [name]);

      if (result.length > 0) {
        const usuario = result[0];
        const vipNivel = usuario.Vip;
        const maxInvActual = usuario.Maxinv;
        const tieneMochila = usuario.Slot.split('|').pop() !== '0';

        let nuevoMaxInv = 0;
        if (vipNivel === 0) {
          nuevoMaxInv = Math.max(maxInvActual, 7000);
        } else if (vipNivel === 1) {
          nuevoMaxInv = Math.max(maxInvActual, 10000);
        } else if (vipNivel === 2) {
          nuevoMaxInv = Math.max(maxInvActual, 11000);
        } else if (vipNivel === 3) {
          nuevoMaxInv = Math.max(maxInvActual, 12000);
        } else if (vipNivel === 4) {
          nuevoMaxInv = Math.max(maxInvActual, 14000);
        } else if (vipNivel === 5) {
          nuevoMaxInv = Math.max(maxInvActual, 16000);
        }

        if (tieneMochila && maxInvActual > 7000 + 5000) {
          message.channel.send(`El usuario ${name} ya tiene actualizado bien su inventario.`);
        } else {
          // Actualizar Maxinv si no cumple con las condiciones anteriores
          const updateQuery = 'UPDATE PlayaRP SET Maxinv = ? WHERE ID = ?';
          await executeQuery(updateQuery, [nuevoMaxInv, usuario.ID]);
          message.channel.send(`Se ha actualizado el inventario del usuario ${name} correctamente.`);
        }

        // Resto del código para mostrar información en caso necesario

      } else {
        message.channel.send(`No se encontró al usuario ${name} en la base de datos.`);
      }
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      message.channel.send('Ocurrió un error al obtener la información de los usuarios.');
    }
  }
};
