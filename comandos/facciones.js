const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const AsciiTable = require('ascii-table');  // Nueva línea: requerimos ascii-table
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
// Función para obtener información de la facción en la base de datos
function obtenerInfoFacciones() {
  return new Promise((resolve, reject) => {
    const sqlFaccion = 'SELECT Leader, Name, Sklad, Sklad1 FROM LeaderInfo';
    connection.query(sqlFaccion, async (error, faccionesResult) => {
      if (error) {
        reject(error);
      } else {
        const facciones = [];
        for (let faccion of faccionesResult) {
          facciones.push(faccion);
        }
        resolve(facciones);
      }
    });
  });
}

module.exports = {
  name: "facciones",
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

    if (userPermissionLevel <= 5) {
      // El nivel de permiso del usuario no es mayor a 8
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    try {
      const facciones = await obtenerInfoFacciones();
      const table = new AsciiTable('Facciones');
      table.setHeading('ID', 'Nombre', 'Almacen de armas');

      for (let faccion of facciones) {
        let almacenArmas = faccion.Sklad1;
        if (faccion.Leader >= 1 && faccion.Leader <= 19) {
          almacenArmas = faccion.Sklad.split('|')[6];  // Mostramos solo el sexto elemento si el Leader está entre 10 y 19
        }
        table.addRow(faccion.Leader, faccion.Name, almacenArmas);
      }

      const tableString = table.toString();
      const lines = tableString.split('\n');
      const maxLength = lines.reduce((max, line) => Math.max(max, line.length), 0);
      const topLine = '─'.repeat(maxLength);

      let remainingLines = lines;

      while (remainingLines.length > 0) {
        let messageLines = [];
        let messageLength = 0;

        while (remainingLines.length > 0 && messageLength + remainingLines[0].length < 2000) {
          messageLength += remainingLines[0].length;
          messageLines.push(remainingLines.shift());
        }

        const mensaje = new MessageEmbed()
          .setDescription(`\`\`\`${topLine}\n${messageLines.join('\n')}\n${topLine}\`\`\``)
          .setColor('#0099ff');

        message.channel.send(mensaje);
      }

    } catch (error) {
      console.error('Error al obtener la información de las facciones: ', error);
    }
    message.delete()
  }
};