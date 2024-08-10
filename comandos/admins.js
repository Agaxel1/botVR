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


// Función para obtener información de los admins en la base de datos
function obtenerInfoAdmins() {
  return new Promise((resolve, reject) => {
    const sqlAdmin = 'SELECT ID, Name, Level, Admin FROM PlayaRP WHERE Admin > 1 AND Online = 1';
    connection.query(sqlAdmin, (error, adminResult) => {
      if (error) {
        reject(error);
      } else {
        resolve(adminResult);
      }
    });
  });
}

module.exports = {
  name: 'admins',
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

    if (userPermissionLevel <= 1) {
      // El nivel de permiso del usuario no es mayor a 8
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    try {
      const admins = await obtenerInfoAdmins();

      const adminTable = new AsciiTable().setHeading('ID', 'Nombre', 'Score', 'Nivel Admin').setAlign(2, AsciiTable.RIGHT);

      for (let admin of admins) {
        adminTable.addRow(admin.ID, admin.Name, admin.Level, admin.Admin);
      }

      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Registros de Admins')
        .setDescription('Lista de administradores con nivel superior a 1 y en línea')
        .addField('Registros:', '```\n' + adminTable.toString() + '```')
        .setFooter('Consultado por: ' + message.member.displayName, message.author.displayAvatarURL());

      message.channel.send(embed);
    } catch (error) {
      console.error('Error al obtener la información de los admins: ', error);
    }

    message.delete();
  },
};
