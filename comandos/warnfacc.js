const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const mysql = require('mysql');

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
  name: "warnfacc",
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

    let comandoEnEjecucion = false;

    if (comandoEnEjecucion) {
      message.channel.send('Por favor, espera a que el comando anterior termine.');
      return;
    }

    const args = message.content.split(' ');
    const faccionId = args[1];
    const warn = args[2];

    if (!faccionId || !warn || isNaN(faccionId) || isNaN(warn)) {
      message.channel.send('Por favor, proporciona un ID de facción válido y la cantidad de advertencias.');
      return;
    }

    try {
      comandoEnEjecucion = true;

      // Obtener el nombre de la facción de la tabla warn_facc usando el ID de facción
      const getFactionNameQuery = 'SELECT Name, warns FROM LeaderInfo WHERE Leader = ?';
      const getFactionNameResult = await executeQuery(getFactionNameQuery, [faccionId]);

      if (getFactionNameResult.length === 0) {
        message.channel.send(`No se encontró ninguna facción en la tabla warn_facc con el ID ${faccionId}.`);
        return;
      }

      const faccionNombre = getFactionNameResult[0].Name;
      const faccionWarns = getFactionNameResult[0].warn + parseInt(warn);

      // Realizar una actualización en la base de datos para agregar las advertencias a la facción en la tabla warn_facc
      const updateQuery = 'UPDATE LeaderInfo SET warns = warns + ? WHERE Leader = ?';
      const updateResult = await executeQuery(updateQuery, [warn, faccionId]);

      if (updateResult.affectedRows > 0) {
        // Se han actualizado las advertencias de la facción en la tabla warn_facc
        const mensaje = `Se han agregado ${warn} advertencias a la facción ${faccionNombre} (ID: ${faccionId}).`;
        message.channel.send(mensaje);

        if (faccionWarns >= 3) {
          const mensajeAdicional = `La facción ${faccionNombre} ya ha alcanzado o superado los 3 warns y debe ser eliminada.`;
          message.channel.send(mensajeAdicional);
        }
      } else {
        // No se encontró ninguna facción en la tabla warn_facc con el ID proporcionado
        message.channel.send(`No se encontró ninguna facción en la tabla warn_facc con el ID ${faccionId}.`);
      }
    } catch (error) {
      console.error('Error al agregar las advertencias a la facción:', error);
      message.channel.send('Ocurrió un error al agregar las advertencias a la facción.');
    } finally {
      comandoEnEjecucion = false;
    }

    message.delete();
  }
};
