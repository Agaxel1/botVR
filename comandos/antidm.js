const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const mysql = require('mysql');


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
  name: "antidm",
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

    if (userPermissionLevel <= 3) {
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
    const Usuario = args[1];
    const jailDias = parseInt(args[2]);

    if (!jailDias || isNaN(jailDias)) {
      message.channel.send('No has establecido un tiempo en días.');
      return;
    }

    try {
      comandoEnEjecucion = true;

      // Obtener el ID del usuario a partir del nombre
      const getIdQuery = 'SELECT ID, Online FROM PlayaRP WHERE Name = ?';
      const getIdResult = await executeQuery(getIdQuery, [Usuario]);

      if (getIdResult.length === 0) {
        message.channel.send(`El usuario ${Usuario} no existe en la base de datos.`);
        return;
      }

      const usuarioId = getIdResult[0].ID;
      const usuarioOnline = getIdResult[0].Online;

      if (usuarioOnline === 1) {
        message.channel.send('El usuario se encuentra ON, debe quitar /q para poder aplicar la sentencia.');
        return;
      }

      // Obtén el autor del mensaje
      const autor = message.author;
      // Obtén el ID del autor del mensaje
      const autorId = message.author.id;

      // Realiza una actualización en la base de datos para dar el tiempo de jail al usuario en PlayaRP
      const sql = 'UPDATE PlayaRP SET TimerAntiDM = UNIX_TIMESTAMP(fecha_ahora() + INTERVAL ? DAY) + (5 * 60 * 60) WHERE ID = ?';
      const result = await executeQuery(sql, [jailDias, usuarioId]);

      if (result.affectedRows > 0) {
        // Se ha actualizado el tiempo de jail del usuario en la base de datos de PlayaRP
        const mensaje = `Se han añadido ${jailDias} días de antidm a ${Usuario}.`;
        const warnMessage = await message.channel.send(mensaje);
        // Obtener la hora actual en la zona horaria del servidor

        // Enviar mensaje al canal deseado
        const channelId = '1056270263139971243'; // Cambia por el ID del canal destino
        const channel = client.channels.cache.get(channelId);
        if (channel && channel.isText()) {
          const embed = new MessageEmbed()
            .setTitle(`Sanción aplicada a: ${Usuario}(${usuarioId})`)
            .setDescription(`El usuario ${autor.username}#${autor.discriminator}(${autorId}) dio ${jailDias} días de antidm a ${Usuario}.`)
            .setColor('#FF0000'); // Cambia el color a tu preferencia
          channel.send(embed);
        } else {
          console.error('No se pudo encontrar el canal o no es un canal de texto válido.');
        }
      } else {
        // El usuario no se encuentra en la base de datos de PlayaRP
        const mensaje = `El usuario ${Usuario} no existe en la base de datos.`;
        message.channel.send(mensaje);
      }
    } catch (error) {
      console.error('Error al dar el tiempo de antidm al usuario: ', error);
    } finally {
      comandoEnEjecucion = false;
    }

  }
}
