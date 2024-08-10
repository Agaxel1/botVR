const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const mysql = require('mysql');
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

// Función para obtener el nombre de usuario del Discord basado en el ID de usuario
async function obtenerNombreUsuario(client, userID) {
  try {
    const user = await client.users.fetch(userID);
    return user ? user.tag : 'Desconocido';
  } catch (error) {
    console.error('Error al obtener el nombre de usuario: ', error);
    return 'Desconocido';
  }
}

// Función para obtener los registros de bot_admin en la base de datos
function obtenerRegistrosBotAdmin() {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT Admin, ID_user, fecha, warns FROM bot_admin';
    connection.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

module.exports = {
  name: 'viewadminbot',
  alias: ['botadmins'],

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

    try {
      const registros = await obtenerRegistrosBotAdmin();

      const table = new AsciiTable().setHeading('Admin', 'Usuario', 'Fecha Agregado', 'Advertencias').setAlign(2, AsciiTable.RIGHT);

      for (let registro of registros) {
        const nombreUsuario = await obtenerNombreUsuario(client, registro.ID_user);
        const fecha = registro.fecha.toISOString().slice(0, 19).replace('T', ' ');
        table.addRow(registro.Admin, nombreUsuario, fecha, registro.warns);
      }

      const tableString = table.toString();
      const lines = tableString.split('\n');
      const maxLength = lines.reduce((max, line) => Math.max(max, line.length), 0);
      const topLine = '─'.repeat(maxLength);

      const chunks = chunkArray(lines, 15); // Dividir las líneas en grupos de 15 líneas

      for (let chunk of chunks) {
        const embed = new MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Registros de Bot Admin')
          .setDescription('Lista de registros de bot admin')
          .addField('Registros:', `\`\`\`${topLine}\n${chunk.join('\n')}\n${topLine}\`\`\``)
          .setFooter('Consultado por: ' + message.member.displayName, message.author.displayAvatarURL());

        message.channel.send(embed);
      }
    } catch (error) {
      console.error('Error al obtener los registros de bot admin: ', error);
    }

    message.delete();
  },
};

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
