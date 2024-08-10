const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');

// Función para ejecutar consultas a la base de datos
function executeQuery(query, params) {
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
  name: "desverificar",
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

    if (userPermissionLevel <= 6) {
      // El nivel de permiso del usuario no es mayor a 8
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    try {
      let sqlGetUserInfo;
      
      // Verificar si commandArgs es un número
      if (!isNaN(commandArgs)) {
        // Si es un número, buscar por ID
        sqlGetUserInfo = "SELECT Name, ID, Discord FROM PlayaRP WHERE ID = ?";
      } else {
        // Si no es un número, buscar por nombre
        sqlGetUserInfo = "SELECT Name, ID, Discord FROM PlayaRP WHERE Name = ?";
      }

      const resultGetUserInfo = await executeQuery(sqlGetUserInfo, [commandArgs]);

      // Verificar si se encontraron resultados
      if (resultGetUserInfo.length > 0) {
        // Obtener información del primer resultado (suponiendo que solo hay uno)
        const userInfo = resultGetUserInfo[0];
        const autor = message.author;
        // Obtén el ID del autor del mensaje
        const autorId = message.author.id;
        

        // Verificar si Discord es null
        if (userInfo.Discord === null) {
          message.channel.send(`El usuario ${userInfo.Name} no está verificado.`);
          return;
        }

        // Actualizar el campo Discord a NULL
        const sqlUpdateUserDiscord = "UPDATE PlayaRP SET Discord = NULL WHERE " + (isNaN(commandArgs) ? "Name" : "ID") + " = ?";
        await executeQuery(sqlUpdateUserDiscord, [commandArgs]);

        // Crear un Embed con la información del usuario
        const embed = new MessageEmbed()
          .setTitle('Desverificación Exitosa')
          .addField('Nombre', userInfo.Name, true)
          .addField('ID', userInfo.ID, true)
          .addField('Discord', userInfo.Discord, true)
          .setColor('#0099ff')
          .setDescription(`El usuario ha sido desverificado con éxito por ${autor.username}#${autor.discriminator} (${autorId}). Discord ha sido eliminado.`);

        // Enviar el Embed al canal con ID 1244832139179065366
        const specificChannel = client.channels.cache.get('1244832139179065366');
        if (specificChannel) {
          specificChannel.send(embed);
        } else {
          console.error('Canal específico no encontrado. Verifica el ID del canal.');
        }

        // Enviar mensaje al canal desde el cual se ejecutó el comando
        message.channel.send(`El usuario ${userInfo.Name} ha sido desverificado.`);
      } else {
        // No se encontraron registros para el usuario especificado
        message.channel.send('No se encontraron registros para el usuario especificado. Verifica la información e intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al desverificar al usuario: ', error);
      message.channel.send('Hubo un error al procesar la solicitud. Por favor, intenta de nuevo más tarde.');
    }
  }
};
