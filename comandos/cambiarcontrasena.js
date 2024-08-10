const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const mysql = require('mysql');
const crypto = require('crypto');

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
  name: 'cambiarcontraseña',
  alias: ['cc'],

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
    let comandoEnEjecucion = false;
    if (comandoEnEjecucion) {
      message.channel.send('Por favor, espera a que el comando anterior termine.');
      return;
    }

    const args = message.content.split(' ');
    const Usuario = args[1];
    const nuevaContraseña = args[2]; // Nueva contraseña como argumento

    const mencion = args[3] ? args[3].slice(2, -1) : null;
    try {
      comandoEnEjecucion = true;

      let salt = '';
      for (let i = 0; i < 10; i++) {
        salt += String.fromCharCode(Math.floor(Math.random() * 79) + 47);
      }

      const combined = nuevaContraseña + salt;
      const hashedContraseña = crypto.createHash('sha256').update(combined).digest('hex');

      const sql = 'UPDATE PlayaRP SET Pass = ?, Salt = ? WHERE Name = ?';
      const result = await executeQuery(sql, [hashedContraseña, salt, Usuario]);

      if (result.affectedRows > 0) {
        // La contraseña del usuario se ha actualizado correctamente en la base de datos de PlayaRP
        const sqlGetUser = "SELECT Discord FROM PlayaRP WHERE Name = ?";
        const resultGetUser = await executeQuery(sqlGetUser, [Usuario]);

        if (resultGetUser.length > 0) {
          const discordID = resultGetUser[0].Discord;

          let mensajeCanalActual = `La contraseña de ${Usuario} ha sido cambiada a: ${nuevaContraseña}\n\nDentro del servidor /mm » configuración para poder cambiarla.`;
          if (discordID === null) {
            // Si el campo Discord es nulo
            mensajeCanalActual = `La contraseña de ${Usuario} ha sido cambiada a: ${nuevaContraseña}\n\nDentro del servidor /mm » configuración para poder cambiarla.\n\nVerifícate en https://discord.com/channels/929898747155054683/1195808748682350702 si después de 1 día no te verificas, se retira la contraseña nuevamente.`;
          }
          const mensajeCanalID = '1169462976319852674'; // ID del canal donde quieres enviar el mensaje
          const usuarioMencionado = message.guild.members.cache.get(mencion);

          if (mencion) {
            usuarioMencionado.send(mensajeCanalActual);
            if (discordID === null) {
              message.channel.send(`La contraseña de ${Usuario} ha sido cambiada y se ha enviado un mensaje al usuario en privado.\n\nSe tiene que verificar.`);
            } else {
              message.channel.send(`La contraseña de ${Usuario} ha sido cambiada y se ha enviado un mensaje al usuario en privado.`);
            }

          } else {
            // Enviar mensaje al canal actual
            message.channel.send(mensajeCanalActual);
          }



          // Enviar mensaje al canal con ID 1169462976319852674
          const canalID = client.channels.cache.get(mensajeCanalID);

          if (canalID && canalID.type === 'text') {
            const mensajeCanalID = `El admin ${message.author.username}(${userID}) le cambió la contraseña a ${Usuario}: ${nuevaContraseña}`;
            canalID.send(mensajeCanalID);
          } else {
            console.error('No se pudo encontrar el canal o no es un canal de texto válido.');
          }

        } else {
          // El usuario no se encuentra en la base de datos de PlayaRP
          const mensaje = `El usuario ${Usuario} no existe en la base de datos.`;
          message.channel.send(mensaje);
        }
      }

      message.delete();

    } catch (error) {
      console.error('Error al cambiar la contraseña del usuario: ', error);
    } finally {
      comandoEnEjecucion = false;
    }
  }
};
