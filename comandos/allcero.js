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
  name: "allcero",
  aliases: [],

  async execute(client, message, commandArgs) {
    // Suponiendo que executeQuery es una función que ejecuta una consulta SQL y devuelve los resultados

    const allowedUserIDs = ['56', '265', '40']; // Lista de IDs permitidos

    const userID = message.author.id; // ID del usuario que está intentando ejecutar el comando

    const sqlGetUserPermissions = "SELECT ID FROM PlayaRP WHERE Discord = ?";
    const resultGetUserPermissions = await executeQuery(sqlGetUserPermissions, [userID]);

    if (resultGetUserPermissions.length === 0 || allowedUserIDs.includes(resultGetUserPermissions[0].ID)) {
      // El usuario no existe en la base de datos o no tiene un ID permitido
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    try {

      // Consulta para actualizar los campos y eliminar el último registro de la tabla Antecedentes
      const updateQuery = 'UPDATE PlayaRP SET Online = 0';

      // Ejecutar las consultas
      await executeQuery(updateQuery);

      message.channel.send(`Se ha realizado lo ordenado.`);
    } catch (error) {
      console.error('Error al realizar las acciones dichas: ', error);
    }
  }
};
