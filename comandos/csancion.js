const { MessageEmbed } = require('discord.js');
const connection = require('./database');

// Función para ejecutar consultas a la base de datos
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
  name: "csancion",
  aliases: [],

  async execute(client, message, args) {
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

if (userPermissionLevel <= 3) {
  // El nivel de permiso del usuario no es mayor a 8
  message.channel.send('No tienes permiso para usar este comando.');
  return;
}
    const input = args.join(" ");

    if (!input) {
      message.channel.send('Debes proporcionar las siglas y el tipo de sanción.');
      return;
    }

    const [siglas, tipoStr] = input.split(" ");
    const siglasArray = siglas.split("+");
    const tipo = parseInt(tipoStr);

    if (isNaN(tipo) || tipo < 1 || tipo > 3) {
      message.channel.send('El tipo de sanción debe ser un número entre 1 y 3.');
      return;
    }

    try {
      // Consultar las sanciones correspondientes a las siglas y el tipo especificados
      const sqlQuery = `SELECT SUM(tipo${tipo}) AS tiempoTotal, MIN(warn) AS warnsTotal, GROUP_CONCAT(ark SEPARATOR '+') AS ark FROM sanciones WHERE sigla IN (?)`;
      const result = await executeQuery(sqlQuery, [siglasArray]);

      if (result.length === 0) {
        message.channel.send('No se encontraron sanciones con las siglas especificadas.');
        return;
      }

      const embed = new MessageEmbed()
        .setColor('#00ff00')
        .setTitle('Calculadora de Sanciones')
        .addField('Siglas:', siglas);

      result.forEach((row) => {
        let tipoSancion = '';
        if (row.ark.includes('Jail') && row.ark.includes('Mute')) {
          tipoSancion = 'Jail y Mute';
        } else if (row.ark.includes('Jail')) {
          tipoSancion = 'Jail';
        } else if (row.ark.includes('Mute')) {
          tipoSancion = 'Mute';
        }
        embed.addField('Tipo de Sanción:', tipoSancion);
        embed.addField('Tiempo de Sanción:', `${row.tiempoTotal} minutos`);
        embed.addField('Warns:', row.warnsTotal === 1 ? 'Sí' : 'No');
      });

      message.channel.send(embed);
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      message.channel.send('Ocurrió un error al obtener la información de las sanciones.');
    }
      message.delete();
  }
    
};








