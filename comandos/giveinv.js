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
  name: "giveinv",
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

    if (userPermissionLevel <= 7) {
      // El nivel de permiso del usuario no es mayor a 8
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    const args = message.content.split(' ');
    const Usuario = args[1];
    const item = args[2];
    const amount = args[3];
    const data = args[4];

    if (!data || isNaN(data)) {
      message.channel.send('No has colocado los parámetros necesarios.');
      return;
    }

    try {
      // Realiza una consulta a la base de datos para obtener el inventario del usuario
      const sqlGetInventory = 'SELECT Inventory FROM PlayaRP WHERE Name = ?';
      const resultGetInventory = await executeQuery(sqlGetInventory, [Usuario]);

      if (resultGetInventory.length > 0) {
        let inventory = resultGetInventory[0].Inventory;

        // Busca la posición después de los primeros 7 caracteres de la cadena
        const position = inventory.indexOf('|0|0|0|', 7);

        if (position > -1) {
          const newPosition = position + 1;
          // Construye el nuevo inventario reemplazando solo en la posición encontrada
          const newInventory = inventory.slice(0, newPosition) + `${item}|${amount}|${data}|` + inventory.slice(newPosition + 7);

          // Actualiza el inventario en la base de datos
          const sqlUpdateInventory = 'UPDATE PlayaRP SET Inventory = ? WHERE Name = ?';
          const resultUpdateInventory = await executeQuery(sqlUpdateInventory, [newInventory, Usuario]);

          if (resultUpdateInventory.affectedRows > 0) {
            message.channel.send(`Se ha añadido el item ${item} al inventario de ${Usuario}.`);
          } else {
            message.channel.send(`Ocurrió un error al actualizar el inventario de ${Usuario}.`);
          }
        } else {
          // No se encontró la secuencia después de los primeros 7 caracteres
          message.channel.send(`No se encontró la secuencia "|0|0|0|" después de los primeros 7 caracteres.`);
        }
      } else {
        // El usuario no se encuentra en la base de datos
        message.channel.send(`El usuario ${Usuario} no existe en la base de datos.`);
      }
    } catch (error) {
      console.error('Error al dar el item al usuario: ', error);
      message.channel.send('Ocurrió un error al intentar ejecutar este comando.');
    }
  }
};
