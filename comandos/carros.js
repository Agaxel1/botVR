const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const AsciiTable = require('ascii-table');

module.exports = {
  name: "carros",
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
    const nombreUsuario = args[1];

    try {

      // Verificar si el argumento es un número (ID)
      const isNumber = /^\d+$/.test(nombreUsuario);
      if (isNumber) {
        // Consulta para obtener el ID del usuario desde la base de datos
        const idQuery = 'SELECT ID, Name FROM PlayaRP WHERE ID = ?';
        const idResult = await executeQuery(idQuery, [nombreUsuario]);

        if (idResult.length > 0) {
          const userID = idResult[0].ID;
          const Name = idResult[0].Name;

          // Consulta para obtener los autos del usuario
          const carQuery = 'SELECT Car.Model, Car.Money/73 AS Impuesto, car_table.carname, Car.Number AS NumeroAuto FROM Car LEFT JOIN car_table ON Car.Model = car_table.vehicleid WHERE Car.Owner = ?';
          const carResult = await executeQuery(carQuery, [userID]);

          // Crear la tabla
          const table = new AsciiTable(`Autos de ${Name}`);
          table.setHeading('#Auto', 'ID Modelo', 'Modelo', 'Impuesto');

          // Agregar cada auto a la tabla
          carResult.forEach(car => {
            const vehicleName = car.carname ? car.carname : 'Desconocido';
            table.addRow(car.NumeroAuto, car.Model, vehicleName, Math.round(car.Impuesto));
          });

          // Convertir la tabla a string y dividirla en líneas
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
        } else {
          message.channel.send(`El usuario ID ${nombreUsuario} no existe en la base de datos.`);
        }

      } else {
        // Consulta para obtener el ID del usuario desde la base de datos
        const idQuery = 'SELECT ID FROM PlayaRP WHERE Name = ?';
        const idResult = await executeQuery(idQuery, [nombreUsuario]);

        if (idResult.length > 0) {
          const userID = idResult[0].ID;

          // Consulta para obtener los autos del usuario
          const carQuery = 'SELECT Car.Model, Car.Money/73 AS Impuesto, car_table.carname, Car.Number AS NumeroAuto FROM Car LEFT JOIN car_table ON Car.Model = car_table.vehicleid WHERE Car.Owner = ?';
          const carResult = await executeQuery(carQuery, [userID]);

          // Crear la tabla
          const table = new AsciiTable(`Autos de ${nombreUsuario}`);
          table.setHeading('#Auto', 'ID Modelo', 'Modelo', 'Impuesto');

          // Agregar cada auto a la tabla
          carResult.forEach(car => {
            const vehicleName = car.carname ? car.carname : 'Desconocido';
            table.addRow(car.NumeroAuto, car.Model, vehicleName, Math.round(car.Impuesto));
          });

          // Convertir la tabla a string y dividirla en líneas
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
        } else {
          message.channel.send(`El usuario ${nombreUsuario} no existe en la base de datos.`);
        }
      }
    } catch (error) {
      console.error('Error al obtener los autos: ', error);
    }

    message.delete();
  }
};

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
