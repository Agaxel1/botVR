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
  name: "daradmin",
  aliases: [],

  async execute(client, message, commandArgs) {
    const userID = message.author.id;

    const sqlGetUserPermissions = "SELECT Admin FROM PlayaRP WHERE Discord = ?";
    const resultGetUserPermissions = await executeQuery(sqlGetUserPermissions, [userID]);

    if (resultGetUserPermissions.length === 0) {
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    const userPermissionLevel = resultGetUserPermissions[0].Admin;

    if (userPermissionLevel !== 7 && userPermissionLevel !== 8) {
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    let comandoEnEjecucion = false;

    if (userPermissionLevel === 7) {
      const args = message.content.split(' ');
      const adminLevel = args[2];
      if (adminLevel > 7) {
        message.channel.send('No tienes permiso para dar un nivel de administrador mayor a 7.');
        return;
      }
    }

    if (comandoEnEjecucion) {
      message.channel.send('Por favor, espera a que el comando anterior termine.');
      return;
    }

    const args = message.content.split(' ');
    const Usuario = args[1];
    const adminLevel = args[2];
    const adminPass = args[3];

    try {
      comandoEnEjecucion = true;

      const sql = 'UPDATE PlayaRP SET Admin = ?, AdminPass = ? WHERE Name = ?';
      const result = await executeQuery(sql, [adminLevel, adminPass, Usuario]);

      if (result.affectedRows > 0) {
        const mensaje = `Se ha actualizado el nivel de admin a ${adminLevel} y la contraseña de admin a ${adminPass} para ${Usuario}.`;
        message.channel.send(mensaje);
      } else {
        const mensaje = `El usuario ${Usuario} no existe en la base de datos.`;
        message.channel.send(mensaje);
      }
    } catch (error) {
      console.error('Error al actualizar el nivel de admin y la contraseña del usuario: ', error);
    } finally {
      comandoEnEjecucion = false;
    }
    const usuario = message.author;
    const listaServidores = ['1055804678857826304', '929898747155054683'];
    // Iterar sobre cada ID de servidor
    listaServidores.forEach(servidorId => {
      // Obtener el servidor a través del ID
      const servidor = client.guilds.cache.get(servidorId);
      // Verificar si se encuentra el servidor
      if (servidor) {
        // Obtener el canal de registro en el servidor actual
        const canalRegistro = servidor.channels.cache.get('1104038892883161138', '1104183638326775918');
        // Verificar si se encuentra el canal de registro
        if (canalRegistro) {
          // Crea un mensaje embed con la información del usuario
          const embed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('Registro del Comando')
            .setDescription(`El usuario ${usuario.username} (${usuario.id}) dio el nivel de admin a ${adminLevel} para ${Usuario}.`)
            .setTimestamp();
          // Envía el mensaje embed al canal de registro
          canalRegistro.send(embed);
        } else {
          console.log(`No se encontró el canal de registro en el servidor ${servidor.name}`);
        }
      } else {
        console.log(`No se encontró el servidor con ID ${servidorId}`);
      }
    });
    message.delete()
  }
};