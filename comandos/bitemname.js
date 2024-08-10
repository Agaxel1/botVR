const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const AsciiTable = require('ascii-table');

// Funci贸n para ejecutar consultas a la base de datos
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
  name: "bitemname",
  aliases: [],

  async execute(client, message, args) {
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
    const itemName = args.join(" ");

    if (!itemName) {
      message.channel.send('Debes proporcionar el nombre del objeto.');
      return;
    }

    try {
      // Consultar el ID del objeto con el nombre proporcionado
      const sqlQuery = 'SELECT ID, Nombre FROM Objetos WHERE Nombre LIKE ?';
      const result = await executeQuery(sqlQuery, [`%${itemName}%`]);

      if (result.length === 0) {
        message.channel.send('El nombre del objeto no se encuentra.');
        return;
      }

      // Crear una tabla ASCII para mostrar los resultados
      const table = new AsciiTable();
      table.setHeading('ID', 'Nombre');

      result.forEach((row) => {
        table.addRow(row.ID, row.Nombre);
      });

 // Obtener el contenido de la tabla y calcular la línea superior personalizada
      const tableString = table.toString();
      const lines = tableString.split('\n');
      const maxLength = lines.reduce((max, line) => Math.max(max, line.length), 0);
      const topLine = '─'.repeat(maxLength);

      // Crear un mensaje con la tabla y enviarlo al canal
      let remainingLines = lines;
      while (remainingLines.length > 0) {
        let messageLines = [];
        let messageLength = 0;

        while (remainingLines.length > 0 && messageLength + remainingLines[0].length < 2000) {
          messageLength += remainingLines[0].length;
          messageLines.push(remainingLines.shift());
        }
      // Crear un mensaje con la tabla y enviarlo al canal
      const embed = new MessageEmbed()
        .setColor('#00ff00')
        .setTitle('Información del Objeto')
         .addField('Objeto por nombre:', '```' + topLine + '\n' + messageLines.join('\n') + '```');

     message.channel.send(embed);
        message.delete()
      }
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      message.channel.send('Ocurrió un error al obtener la información del objeto.');
    }
  }
};

