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

module.exports = {
  name: 'viewwarnfacc',
  aliases: ['vwarnfacc'],

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

    if (userPermissionLevel <= 5) {
      // El nivel de permiso del usuario no es mayor a 8
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }
    try {
      const sqlSelectWarns = 'SELECT Leader, warns, Name FROM LeaderInfo';
      const resultWarns = await executeQuery(sqlSelectWarns);

      if (resultWarns.length === 0) {
        message.channel.send('No se encontraron registros en la tabla warn_facc.');
        return;
      }

      const table = new AsciiTable()
        .setHeading('ID', 'Nombre', 'Warns')
        .setAlign(0, AsciiTable.CENTER)
        .setAlign(1, AsciiTable.LEFT)
        .setAlign(2, AsciiTable.RIGHT);

      for (const row of resultWarns) {
        table.addRow(row.Leader, row.Name, row.warns);
      }

      const tableString = '```' + table.toString() + '```';

      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Registros de warn_facc')
        .setDescription(tableString);

      message.channel.send(embed);
    } catch (error) {
      console.error('Error al obtener los registros de warn_facc:', error);
      message.channel.send('Ocurrió un error al obtener los registros de warn_facc.');
    }
  },
};
