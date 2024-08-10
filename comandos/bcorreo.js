const { MessageEmbed } = require('discord.js');
const connection = require('./database');
const AsciiTable = require('ascii-table');

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
  name: "bcorreo",
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

if (userPermissionLevel <= 4) {
  // El nivel de permiso del usuario no es mayor a 8
  message.channel.send('No tienes permiso para usar este comando.');
  return;
}

    const correo = args[0];

    if (!correo) {
      message.channel.send('Debes proporcionar un correo electrónico.');
      return;
      message.delete()
    }

    try {
      // Realizar la consulta para obtener los nombres de usuarios y sus respectivas ID filtrando por correo electrónico
      const sqlQuery = 'SELECT ID, Name FROM PlayaRP WHERE Mail = ?';
      const result = await executeQuery(sqlQuery, [correo]);

      if (result.length === 0) {
        message.channel.send('No se encontraron usuarios con el correo electrónico proporcionado.');
        return;
      }

      // Crear una tabla ASCII para mostrar los resultados
      const table = new AsciiTable();
      table.setHeading('ID', 'Nombre');

      result.forEach((row) => {
        table.addRow(row.ID, row.Name);
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

        const embed = new MessageEmbed()
          .setColor('#00ff00')
          .setTitle('Usuarios Filtrados por Correo Electrónico')
          .addField('ID | Nombre:', '```' + topLine + '\n' + messageLines.join('\n') + '```');

        message.channel.send(embed);
        message.delete()
      }
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      message.channel.send('Ocurrió un error al obtener la información de los usuarios.');
      messagel.delete()
    }
  }
};
