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
  name: "untban",
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
    
      
       if (!Usuario) {
      message.channel.send('Coloca el usuario.');
      return;
    }
      
     

    try {
      comandoEnEjecucion = true;

      // Realiza una actualización en la base de datos para dar el tiempo de baneo al usuario en PlayaRP
      const sql = 'UPDATE PlayaRP SET tBan = 0, tBanN = "", tBanR = "" WHERE Name = ?';
      const result = await executeQuery(sql, [Usuario]);

      if (result.affectedRows > 0) {
        // Se ha actualizado el tiempo de baneo del usuario en la base de datos de PlayaRP
        const mensaje = `Se ha quitado el baneo a ${Usuario}.`;
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
    const canalRegistro = servidor.channels.cache.get('1244829480640581725','1104183638326775918');
    // Verificar si se encuentra el canal de registro
    if (canalRegistro) {
      // Crea un mensaje embed con la información del usuario
      const embed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle('Registro del Comando')
        .setDescription(`El usuario ${usuario.username} (${usuario.id}) dio desban a ${Usuario}.`)
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