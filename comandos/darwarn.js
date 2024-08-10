const Discord = require('discord.js');
const client = new Discord.Client();
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
  name: "warn",
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
    const usuarioNombre = args[1];
    const warn = args[2];

    if (!warn || isNaN(warn)) {
      message.channel.send('No has establecido la cantidad de warns.');
      return;
    }

    try {
      comandoEnEjecucion = true;

      // Obtener el ID del usuario a partir del nombre
      const getIdQuery = 'SELECT ID, Online, Warn FROM PlayaRP WHERE Name = ?';
      const getIdResult = await executeQuery(getIdQuery, [usuarioNombre]);

      if (getIdResult.length === 0) {
        message.channel.send(`El usuario ${usuarioNombre} no existe en la base de datos.`);
        return;
      }

      const usuarioId = getIdResult[0].ID;
      const usuarioOnline = getIdResult[0].Online;

      if (usuarioOnline === 1) {
        message.channel.send('El usuario se encuentra ON, debe quitar /q para poder aplicar la sanción.');
        return;
      }

      // Realizar una actualización en la base de datos para dar los warnings al usuario en PlayaRP
      const updateQuery = 'UPDATE PlayaRP SET Warn = Warn + ? WHERE ID = ?';
      const updateResult = await executeQuery(updateQuery, [warn, usuarioId]);

      if (updateResult.affectedRows > 0) {
        // Se han actualizado los warnings del usuario en la base de datos de PlayaRP
        const mensaje = `Se han dado ${warn} advertencias a ${usuarioNombre}.`;
        message.channel.send(mensaje);

        // Verificar si el usuario tiene 10 o más warns
        const nuevoWarnCount = await executeQuery('SELECT Warn FROM PlayaRP WHERE ID = ?', [usuarioId]);
        const nuevoWarn = nuevoWarnCount[0].Warn;

        
        function banUsuario(nuevoWarn) {
          const mensajeBan = `El usuario ${usuarioNombre} ha alcanzado los ${nuevoWarn} warns y se le baneó 4 días por el sistema.`;
          message.channel.send(mensajeBan);
        }

        if (nuevoWarn === 3/* || nuevoWarn === 6 || nuevoWarn === 9*/) {
          banUsuario(nuevoWarn);
        }

        if (nuevoWarn >= 5) {
          const mensajeBan = `El usuario ${usuarioNombre} ha alcanzado los 5 warns o más y será baneado definitivamente.`;
          message.channel.send(mensajeBan);

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
            const canalRegistro = servidor.channels.cache.get('1244255628394889227');
            // Verificar si se encuentra el canal de registro
            if (canalRegistro) {
              // Crea un mensaje embed con la información del usuario
              const embed = new MessageEmbed()
                .setColor('#ff0000')
                .setTitle(`Warn aplicado a: ${usuarioNombre} (${usuarioId})`)
                .setDescription(`El usuario ${usuario.username} (${usuario.id}) dio ${warn} warn a ${usuarioNombre}.`)
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
      } else {
        // El usuario no se encuentra en la base de datos de PlayaRP
        const mensaje = `El usuario ${usuarioNombre} no existe en la base de datos.`;
        message.channel.send(mensaje);
      }
    } catch (error) {
      console.error('Error al dar las advertencias al usuario: ', error);
    } finally {
      comandoEnEjecucion = false;
    }
    message.delete()
  }

}

