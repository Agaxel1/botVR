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
  name: "tban",
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
    let comandoEnEjecucion = false;
    if (comandoEnEjecucion) {
      message.channel.send('Por favor, espera a que el comando anterior termine.');
      return;
    }

    const args = message.content.split(' ');
    const Usuario = args[1];
    const banDias = parseInt(args[2]);
    const banAutor = args[3];
    const banRazon = args.slice(4).join(' ');

    if (!banDias || isNaN(banDias)) {
      message.channel.send('No se han proporcionado los parámetros necesarios.');
      return;
    }

    const sqlGetUserOnlineStatus = "SELECT Online FROM PlayaRP WHERE Name = ?";
    const resultGetUserOnlineStatus = await executeQuery(sqlGetUserOnlineStatus, [Usuario]);

    if (resultGetUserOnlineStatus.length > 0 && resultGetUserOnlineStatus[0].Online === 1) {
      message.channel.send('El usuario se encuentra en línea. No puedes aplicar un baneo en este momento.');
      return;
    }

    try {
      comandoEnEjecucion = true;

      const sql = 'UPDATE PlayaRP SET tBan = UNIX_TIMESTAMP(fecha_ahora() + INTERVAL ? DAY) + (5 * 60 * 60), tBanN = ?, tBanR = ? WHERE Name = ?';

      const result = await executeQuery(sql, [banDias, banAutor, banRazon, Usuario]);

      if (result.affectedRows > 0) {
        // Se ha actualizado el tiempo de baneo del usuario en la base de datos de PlayaRP
        const mensaje = `Se han añadido ${banDias} día(s) de baneo a ${Usuario} por ${banAutor} debido a "${banRazon}".`;
        message.channel.send(mensaje);
      } else {
        // El usuario no se encuentra en la base de datos de PlayaRP
        const mensaje = `El usuario ${Usuario} no existe en la base de datos.`;
        message.channel.send(mensaje);
      }
    } catch (error) {
      console.error('Error al dar el tiempo de baneo al usuario: ', error);
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
        const canalRegistro = servidor.channels.cache.get('1244255628394889227', '1104183638326775918');
        // Verificar si se encuentra el canal de registro
        if (canalRegistro) {
          // Crea un mensaje embed con la información del usuario
          const embed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('Registro del Comando')
            .setDescription(`El usuario ${usuario.username} (${usuario.id}) dio ${banDias} días de baneo a ${Usuario} debido a "${banRazon}".`)
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