const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');

module.exports = {
  name: "quitarmochila",
  aliases: ["removebackpack"],

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
    // Obtener registros con el nombre de usuario proporcionado
    const args = message.content.split(' ');
    const nombreUsuario = args[1];

    try {
      // Consulta para obtener el registro del usuario
      const selectQuery = 'SELECT Slot, Online FROM PlayaRP WHERE Name = ?';
      const result = await executeQuery(selectQuery, [nombreUsuario]);

      if (result.length > 0) {
        const slotData = result[0].Slot;
        const onlineStatus = result[0].Online;
        const slots = slotData.split('|');
        const lastIndex = slots.length - 1;

        // Verificar si el último espacio de la mochila ya es 0
        if (slots[lastIndex] === '0') {
          message.channel.send(`El usuario ${nombreUsuario} no tiene mochila puesta.`);
          return;
        }

        // Verificar si el usuario está en línea (Online = 1)
        if (onlineStatus === 1) {
          message.channel.send(`El usuario ${nombreUsuario} está en línea. Debe quitar /q antes de modificar la mochila.`);
          return;
        }

        slots[lastIndex] = '0';

        // Construir el nuevo valor de la columna Slot
        const newSlotData = slots.join('|');

        // Consulta para actualizar la columna Slot del usuario
        const updateQuery = 'UPDATE PlayaRP SET Slot = ?, MaxInv = MaxInv - 5000 WHERE Name = ?';
        const updateResult = await executeQuery(updateQuery, [newSlotData, nombreUsuario]);

        if (updateResult.affectedRows > 0) {
          message.channel.send(`Se ha eliminado el último espacio de la mochila de ${nombreUsuario}.`);
        } else {
          message.channel.send(`No se pudo actualizar la mochila de ${nombreUsuario}.`);
        }
      } else {
        message.channel.send(`No se encontró al usuario ${nombreUsuario} en la base de datos.`);
      }
    } catch (error) {
      console.error('Error al eliminar el espacio de la mochila: ', error);
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
