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
// Función para obtener información del usuario en la base de datos
function demoteUsuario(userName) {
  return new Promise((resolve, reject) => {
    const sqlDemote = 'UPDATE PlayaRP SET Leader = 0, Member = 0, Rank=0, \`Group\` = 0,Rvol = 0 WHERE Name = ?';
    connection.query(sqlDemote, [userName], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = {
    name: "demote",
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
      const userName = args[1];
  
      if (!userName) {
        message.channel.send('No colocaste el usuario.');
        return;
      }
  
      try {
        await demoteUsuario(userName);
        message.channel.send(`El usuario ${userName} ha sido expulsado de su facción.`);
      } catch (error) {
        console.error('Error al demote el usuario: ', error);
        message.channel.send('Hubo un error al intentar demote el usuario. Por favor intenta nuevamente.');
      }
      message.delete();
    }
  };
