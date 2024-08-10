const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const AsciiTable = require('ascii-table');

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
// Función para obtener información de los admins en la base de datos
function obtenerInfoAdmins() {
  return new Promise((resolve, reject) => {
    const sqlAdmin = 'SELECT ID, Name, Admin, Discord, warnAdmin FROM PlayaRP WHERE Admin > 0 AND NOT (ID = 3 OR ID = 4) ORDER BY Admin DESC, ID ASC';
    connection.query(sqlAdmin, async (error, adminResult) => {
      if (error) {
        reject(error);
      } else {
        const admins = [];
        for (let admin of adminResult) {
          admins.push(admin);
        }
        resolve(admins);
      }
    });
  });
}


module.exports = {
  name: "gadmins",
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

    if (userPermissionLevel <= 6) {
      // El nivel de permiso del usuario no es mayor a 8
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    try {
      const admins = await obtenerInfoAdmins();
      const totalAdmins = admins.length;
      const table = new AsciiTable('Admins');
      table.setHeading('Admin', 'Nombre', 'Discord', 'Warn');

      let content = `───────────────────────────────────────────────────────────────────
.-----------------------------------------------------------------.
|                             Admins                              |
|-----------------------------------------------------------------|
| Admin |          Nombre          |        Discord        | Warn |
|-------|--------------------------|-----------------------|------|`;

      for (let admin of admins) {
        const userId = admin.Discord;
        let username = "No hay"; // Valor predeterminado si Discord es nulo.

        if (userId) {
          try {
            const user = await client.users.fetch(userId);
            username = user.username;
          } catch (error) {
            console.error(`No se pudo encontrar el usuario con ID ${userId}`);
          }
        }

        const formattedName = `${admin.Name ? admin.Name : 'No hay'}[${admin.ID}]`;
        const usernameField = username.padEnd(21);
        const formattedWarn = admin.warnAdmin ? admin.warnAdmin.toString() : '0';

        content += `\n|   ${admin.Admin}   | ${formattedName.padEnd(24)} | ${usernameField} | ${formattedWarn.padEnd(4)} |`;
      }


      content += '\n───────────────────────────────────────────────────────────────────';

      let lines = content.split('\n');
      let chunks = [];
      let currentChunk = '';

      for (let line of lines) {
        if (currentChunk.length + line.length < 2000) {
          currentChunk += line + '\n';
        } else {
          chunks.push(currentChunk);
          currentChunk = line + '\n';
        }
      }

      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
      }

      for (let chunk of chunks) {
        message.channel.send(`\`\`\`${chunk}\`\`\``);
      }

      const mensaje = new MessageEmbed()
        .setColor('#0099ff')
        .addField('Cantidad Total de Administradores', totalAdmins);

      message.channel.send(mensaje);
    } catch (error) {
      console.error('Error al obtener la información de los admins: ', error);
    }
    message.delete()
  }
};