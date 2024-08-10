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
// Función para obtener el nombre de una facción por su ID
function obtenerNombreFaccion(idFaccion) {
  return new Promise((resolve, reject) => {
    const sqlFaccion = 'SELECT Name FROM LeaderInfo WHERE Leader = ?';
    connection.query(sqlFaccion, [idFaccion], (error, nombreFaccionResult) => {
      if (error) {
        reject(error);
      } else {
        resolve(nombreFaccionResult[0].Name);
      }
    });
  });
}

// Función para obtener información de los miembros de una facción en la base de datos
function obtenerInfoMiembrosFaccion(idFaccion) {
  return new Promise((resolve, reject) => {
    const sqlMiembros = 'SELECT ID, Name, Warn, Leader FROM PlayaRP WHERE Member = ?';
    connection.query(sqlMiembros, [idFaccion], (error, miembrosResult) => {
      if (error) {
        reject(error);
      } else {
        resolve(miembrosResult);
      }
    });
  });
}

module.exports = {
  name: "lmenu",
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


    const args = message.content.split(' ');
    const idFaccion = args[1];

    // Verificar si el ID de la facción es inválido
    if (isNaN(idFaccion)) {
      message.channel.send('ID de la facción inválido.');
      return;
    }

    try {

      // Verificar el número total de miembros de la facción
      const sqlFaccionTotal = 'SELECT COUNT(*) AS faccionTotal FROM PlayaRP WHERE Member = ?';
      const resultFaccionTotal = await executeQuery(sqlFaccionTotal, [idFaccion]);

      // Almacenar el valor de faccionTotal en una variable
      const faccionTotal = resultFaccionTotal.length > 0 ? resultFaccionTotal[0].faccionTotal : 0;

      const nombreFaccion = await obtenerNombreFaccion(idFaccion);
      const miembros = await obtenerInfoMiembrosFaccion(idFaccion);
      const table = new AsciiTable(`Miembros de la facción ${nombreFaccion}`);
      table.setHeading('ID', 'Nombre', 'Warn');

      for (let miembro of miembros) {
        let nombre = miembro.Leader !== 0 ? `${miembro.Name} (LG)` : miembro.Name;
        table.addRow(miembro.ID, nombre, miembro.Warn);
      }


      const tableString = table.toString();
      const lines = tableString.split('\n');
      const maxLength = lines.reduce((max, line) => Math.max(max, line.length), 0);
      const topLine = '─'.repeat(maxLength);

      const mensaje = new MessageEmbed()
        .setDescription(`\`\`\`${topLine}\n${tableString}\n\nTotal: ${faccionTotal}\`\`\``)
        .setColor('#0099ff');

      message.channel.send(mensaje);
    } catch (error) {
      console.error('Error al obtener la información de los miembros de la facción: ', error);
    }
    message.delete();
  }
};
