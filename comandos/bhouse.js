const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');

function obtenerInfoCasa(numeroCasa) {
  return new Promise((resolve, reject) => {
    const sqlQuery = 'SELECT h.Number, p.Name as Owner, (h.Money/103) as Impuesto FROM House h JOIN PlayaRP p ON h.Owner = p.ID WHERE h.Number = ?';

    connection.query(sqlQuery, [numeroCasa], (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length === 0) {
        reject('No se encontró ninguna casa con ese número.');
      } else {
        resolve(results[0]);
      }
    });
  });
}
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
  name: "bhouse",
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

    if (userPermissionLevel <= 4) {
      // El nivel de permiso del usuario no es mayor a 8
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }


    const args = message.content.split(' ');
    const numeroCasa = args[1];

    try {
      const casa = await obtenerInfoCasa(numeroCasa);

      const mensaje = new MessageEmbed()
        .setTitle(`Información de la Casa ${numeroCasa}`)
        .addField('Número', casa.Number)
        .addField('Dueño', casa.Owner)
        .addField('Impuesto', Math.round(casa.Impuesto))
        .setColor('#0099ff');

      message.channel.send(mensaje);
    } catch (error) {
      console.error('Error al obtener la información de la casa: ', error);
      if (typeof error === 'string') {
        // Si el error es un string, lo enviamos como un mensaje de error al usuario
        message.channel.send(error);
        message.delete()
      }
    }
    message.delete();
  }
};
