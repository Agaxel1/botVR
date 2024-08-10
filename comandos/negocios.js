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
// Función para obtener información de los negocios
function obtenerInfoNegocios(tipoNegocio) {
  return new Promise((resolve, reject) => {
    let sqlQuery;
    let tableHeader;
    switch (tipoNegocio) {
      case '1':
        sqlQuery = 'SELECT s.Number, IF(p.Name IS NULL, "Nadie", p.Name) as Owner, (s.Money/274) as Impuesto FROM Shop24 s LEFT JOIN PlayaRP p ON s.Owner = p.ID';
        tableHeader = ['Tiendas', 'Numero', 'Dueño', 'Impuesto'];
        break;
      case '2':
        sqlQuery = 'SELECT s.Number, IF(p.Name IS NULL, "Nadie", p.Name) as Owner, (s.Money/385) as Impuesto FROM Salon s LEFT JOIN PlayaRP p ON s.Owner = p.ID';
        tableHeader = ['Concesionarios', 'Numero', 'Dueño', 'Impuesto'];
        break;
      case '3':
        sqlQuery = 'SELECT g.Number, g.Info, IF(p.Name IS NULL, "Nadie", p.Name) as Owner, (g.Money/225) as Impuesto FROM GlobalInfo g LEFT JOIN PlayaRP p ON g.Owner = p.ID';
        tableHeader = ['Negocios Generales','Numero', 'Negocio', 'Dueño', 'Impuesto'];
        break;
      case '4':
        sqlQuery = 'SELECT g.ID as Number, IF(p.Name IS NULL, "Nadie", p.Name) as Owner, (g.Money/315) as Impuesto FROM GasStations g LEFT JOIN PlayaRP p ON g.Owner = p.ID';
        tableHeader = ['Gasolineras', 'Numero', 'Dueño', 'Impuesto'];
        break;
      default:
        reject('Número no permitido. Debe ser un número entre 1 y 4.');
        return;
    }

    connection.query(sqlQuery, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve({tableHeader, results});
      }
    });
  });
}

module.exports = {
  name: "negocios",
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
    const tipoNegocio = args[1];

    try {
      const { tableHeader, results } = await obtenerInfoNegocios(tipoNegocio);
      const table = new AsciiTable(tableHeader[0]);
      table.setHeading(...tableHeader.slice(1));

      for (let result of results) {
        switch (tipoNegocio) {
          case '1':
          case '2':
          case '4':
            table.addRow(result.Number, result.Owner, Math.round(result.Impuesto));
            break;
          case '3':
            const info = result.Info.length > 14 ? result.Info.substring(0, 14) : result.Info;
            table.addRow(result.Number, info, result.Owner, Math.round(result.Impuesto));
            break;
        }
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
      console.error('Error al obtener la información de los negocios: ', error);
      if (typeof error === 'string') {
        // Si el error es un string, lo enviamos como un mensaje de error al usuario
        message.channel.send(error +
          '\n1 - Tiendas' +
          '\n2 - Concesionarios' +
          '\n3 - Negocios Generales' +
          '\n4 - Gasolineras');
      }
    }

    message.delete();
  }
};
