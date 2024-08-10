const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');

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
// Función para obtener el nombre de una facción específica
function obtenerNombreFaccion(numeroFaccion) {
    return new Promise((resolve, reject) => {
      const sqlQuery = 'SELECT Name FROM LeaderInfo WHERE Leader = ?';
      connection.query(sqlQuery, [numeroFaccion], (error, results) => {
        if (error) {
          reject(error);
        } else if (results.length === 0) {
          reject(new Error('NoFactionFound'));
        } else {
          resolve(results[0].Name);
        }
      });
    });
  }
// Función para limpiar la información de los miembros de una facción
function limpiarFaccion(numeroFaccion) {
    return new Promise((resolve, reject) => {
      const sqlUpdate = 'UPDATE PlayaRP SET Leader = 0, Member = 0, Rank=0, \`Group\` = 0,Rvol = 0 WHERE Member = ?';
      connection.query(sqlUpdate, [numeroFaccion], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.affectedRows);
        }
      });
    });
  }
  
  module.exports = {
    name: "cleanfacc",
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
        // Obtener el número de la facción de los argumentos del comando
        const numeroFaccion = parseInt(commandArgs[0]);
        if (isNaN(numeroFaccion)) {
          message.channel.send('Por favor, proporciona un número de facción válido.');
          return;
        }
  
        // Obtener el nombre de la facción
        const nombreFaccion = await obtenerNombreFaccion(numeroFaccion);
  
        // Limpiar la información de los miembros de la facción
        const affectedRows = await limpiarFaccion(numeroFaccion);
        if (affectedRows > 0) {
          message.channel.send(`Se ha limpiado la información de los miembros de la facción ${nombreFaccion}.`);
        } else {
          message.channel.send(`No hay miembros en la facción ${nombreFaccion} para limpiar.`);
        }
  
      } catch (error) {
        if (error.message === 'NoFactionFound') {
          message.channel.send('No has ingresado un número de facción válido.');
        } else {
          console.error('Error al limpiar la información de la facción: ', error);
        }
      }
      message.delete()
    }
  };
  
  