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
  name: "darpuntosrol",
  aliases: [],

  async execute(client, message, commandArgs) {
    // Suponiendo que executeQuery es una función que ejecuta una consulta SQL y devuelve los resultados

    const userID = message.author.id; // ID del usuario que está intentando ejecutar el comando

    const sqlGetUserPermissions = "SELECT Admin FROM PlayaRP WHERE Discord = ?";
    const resultGetUserPermissions = await executeQuery(sqlGetUserPermissions, [userID]);

    const allowedRoleID = '1244211006239019049'; // ID del rol permitido (ajusta según tu configuración)

    if (resultGetUserPermissions.length === 0 && !message.member.roles.cache.has(allowedRoleID)) {
      // El usuario no existe en la base de datos y no tiene el rol permitido
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    const userPermissionLevel = resultGetUserPermissions.length > 0 ? resultGetUserPermissions[0].Admin : 0;

    if (userPermissionLevel <= 5 && !message.member.roles.cache.has(allowedRoleID)) {
      // El nivel de permiso del usuario no es mayor a 8 y no tiene el rol permitido
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
    const puntosrol = args[2];

    if (!puntosrol || isNaN(puntosrol)) {
      message.channel.send('No has colocado un valor.');
      return;
    }
    const usuario = message.author;
    try {
      comandoEnEjecucion = true;

      // Realiza una actualización en la base de datos para dar los puntos de rol al usuario en PlayaRP
      const sql = 'UPDATE PlayaRP SET PuntosDeRol = PuntosDeRol + ? WHERE Name = ?';
      const result = await executeQuery(sql, [puntosrol, Usuario]);

      // Nueva consulta para obtener el estado en línea y el Discord del usuario
      const sqlGetOnlineStatus = 'SELECT Online, Discord FROM PlayaRP WHERE Name = ?';
      const resultGetOnlineStatus = await executeQuery(sqlGetOnlineStatus, [Usuario]);

      let onlineStatus = 'Desconocido';
      let userDiscord = 'Desconocido';

      if (resultGetOnlineStatus.length > 0) {
        onlineStatus = resultGetOnlineStatus[0].Online;
        userDiscord = resultGetOnlineStatus[0].Discord;
      }



      if (result.affectedRows > 0) {
        // Se han actualizado los puntos de rol del usuario en la base de datos de PlayaRP
        let mensaje;
        let mensaje2;

        if (onlineStatus === 1) {
          // Si el Online es igual a 1
          if (userDiscord === null) {
            mensaje = `El usuario ${usuario.username} (${usuario.id}) dio ${puntosrol} puntos de rol a ${Usuario}. (Tiene que verificar su cuenta)`;
          } else {
            mensaje = `El usuario ${usuario.username} (${usuario.id}) dio ${puntosrol} puntos de rol a ${Usuario}.\n<@${userDiscord}> Desconéctate para que los puntos de rol se guarden.`;
          }
        } else {
          // Si el Online es 0
          mensaje = `El usuario ${usuario.username} (${usuario.id}) dio ${puntosrol} puntos de rol a ${Usuario}.`;
        }


        // Obtener el canal de registro directamente por su ID
        const canalRegistro = client.channels.cache.get('1244832454699778141');

        // Verificar si se encuentra el canal de registro
        if (canalRegistro) {
          // Verificar si el mensaje proviene del canal de registro
          if (message.channel.id !== canalRegistro.id) {
            // El mensaje se envió fuera del canal de registro
            mensaje2 = `Si se dieron los puntos`;
            message.channel.send(mensaje2);
          }

          // Enviar el mensaje al canal de registro
          canalRegistro.send(mensaje);
        } else {
          console.log('No se encontró el canal de registro con el ID 1244832454699778141');
        }
        message.delete();
      } else {
        const mensaje = `El usuario ${Usuario} no existe en la base de datos.`;
        message.channel.send(mensaje);
      }
    } catch (error) {
      console.error('Error al dar los puntos de rol al usuario: ', error);
    } finally {
      comandoEnEjecucion = false;
    }

    const listaServidores = ['1055804678857826304', '929898747155054683'];
    // Iterar sobre cada ID de servidor
    listaServidores.forEach(servidorId => {
      // Obtener el servidor a través del ID
      const servidor = client.guilds.cache.get(servidorId);
      // Verificar si se encuentra el servidor
      if (servidor) {
        // Obtener el canal de registro en el servidor actual
        const canalRegistro = servidor.channels.cache.find(channel => ['1244832139179065366'].includes(channel.id));
        // Verificar si se encuentra el canal de registro
        if (canalRegistro) {
          // Crea un mensaje embed con la información del usuario
          const embed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle('Registro del Comando')
            .setDescription(`El usuario ${usuario.username} (${usuario.id}) dio ${puntosrol} puntos de rol a ${Usuario}.`)
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
  }
};