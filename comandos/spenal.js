const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');

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

module.exports = {
  name: "spenal",
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
      // Consulta para obtener los valores de ArestPenal y JailPenal del usuario
      const selectQuery = 'SELECT ArestPenal, JailPenal, Online FROM PlayaRP WHERE Name = ?';
      const selectResult = await executeQuery(selectQuery, [nombreUsuario]);

      if (selectResult.length === 0) {
        message.channel.send('El usuario que ingresaste es inválido.');
        return;
      }

      // Verificar si ArestPenal y JailPenal son diferentes de 0
      const arestPenal = selectResult[0].ArestPenal;
      const jailPenal = selectResult[0].JailPenal;
      const onlineStatus = selectResult[0].Online;

      if (onlineStatus === 1) {
        message.channel.send(`Está en línea, que quitee /q para poder hacerlo`);
        return;
      }

      if (arestPenal !== 0 || jailPenal !== 0) {
        // Consulta para actualizar los campos y eliminar el último registro de la tabla Antecedentes
        const updateQuery = 'UPDATE PlayaRP SET ArestPenal = 0, JailPenal = 0, Antecedentes = Antecedentes - 1, X = "1545.52", Y = "-1675.21", Z = "13.0931", A = "0" WHERE Name = ?';
        const deleteQuery = 'DELETE FROM Antecedentes WHERE Name = ? ORDER BY Number DESC LIMIT 1';

        // Ejecutar las consultas
        await executeQuery(updateQuery, [nombreUsuario]);
        await executeQuery(deleteQuery, [nombreUsuario]);

        message.channel.send(`Se han realizado las acciones penales correspondientes para el usuario ${nombreUsuario}.`);
      } else {
        message.channel.send(`El usuario ${nombreUsuario} no está en el penal`);
      }
    } catch (error) {
      console.error('Error al realizar las acciones penales: ', error);
    }
  }
};
