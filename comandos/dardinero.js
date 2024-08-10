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
  name: "dardinero",
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

    if (userPermissionLevel <= 7) {
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
    const dinero = args[2];
    const opcionCanal = args[3];
    if (!dinero || isNaN(dinero)) {
      message.channel.send('No has colocado un valor.');
      return;
    }
    // ...

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
      const Online = getIdResult[0].Online;
      if (Online === 1) {
        // Si el usuario está en línea, se le envía un mensaje para que salga del servidor
        const mensaje = `El usuario ${Usuario} está en línea. Por favor, sal del servidor y vuelve a ingresar para que se reflejen los coins.`;
        await message.channel.send(mensaje);
      } else {

        // Realiza una actualización en la base de datos para dar el dinero al usuario en PlayaRP
        const sql = 'UPDATE PlayaRP SET Bank = Bank + ? WHERE Name = ?';
        const result = await executeQuery(sql, [dinero, Usuario]);

        if (result.affectedRows > 0) {
          // Se ha actualizado el dinero del usuario en la base de datos de PlayaRP
          const mensaje = `Se han dado ${dinero} de dinero a ${Usuario}.`;
          const warnMessage = await message.channel.send(mensaje);

          const usuario = message.author;
          const listaServidores = ['1055804678857826304'];

          // Iterar sobre cada ID de servidor
          listaServidores.forEach(servidorId => {
            // Obtener el servidor a través del ID
            const servidor = client.guilds.cache.get(servidorId);
            // Verificar si se encuentra el servidor
            if (servidor) {
              // Obtener el canal de registro en el servidor actual

              let canalId;
              if (opcionCanal === '1') {
                canalId = '1244831150766293005'; // Canal 1
              } else {
                canalId = '1244831088765829200'; // Canal por defecto
              }
              const canalRegistro = servidor.channels.cache.get(canalId);
              // Verificar si se encuentra el canal de registro
              if (canalRegistro) {
                // Crea un mensaje embed con la información del usuario
                const embed = new MessageEmbed()
                  .setColor('#ff0000')
                  .setTitle(`Compra de dinero: ${Usuario} (${usuarioId})`)
                  .setDescription(`El usuario ${usuario.username} (${usuario.id}) dio ${dinero} de dinero a ${Usuario}.`)
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

          // Eliminar el mensaje original después de 5 segundos
          message.delete({ timeout: 5000 });
        } else {
          // El usuario no se encuentra en la base de datos de PlayaRP
          const mensaje = `El usuario ${Usuario} no existe en la base de datos.`;
          message.channel.send(mensaje);
        }
      }
    } catch (error) {
      console.error('Error al dar el dinero al usuario: ', error);
    } finally {
      comandoEnEjecucion = false;
    }
  }
}
