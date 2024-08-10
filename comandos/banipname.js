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
  name: "banipname",
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

    const args = message.content.split(' ');
    const playerName = args[1];
    if (!playerName) {
      message.channel.send('Completa los campos requeridos correctamente.');
      return;
    }

    // Consulta para obtener la IP y RegIP asociados al jugador en la tabla PlayaRP
    const selectQuery =
      "SELECT IP, regIP FROM PlayaRP WHERE Name = ?";
    const selectResult = await executeQuery(selectQuery, [playerName]);

    if (selectResult.length === 0) {
      message.channel.send(`El jugador ${playerName} no existe en la base de datos.`);
      message.delete({ timeout: 5000 }); // Eliminar el mensaje del usuario después de 5 segundos
      return;
    }

    const ip = selectResult[0].IP;
    const regIP = selectResult[0].regIP;

    // Verificar si la IP ya está en la tabla BanIP
    const selectIPQuery = "SELECT * FROM BanIP WHERE IP = ? OR IP = ?";
    const selectIPResult = await executeQuery(selectIPQuery, [ip, regIP]);

    if (selectIPResult.length > 0) {
      message.channel.send("La IP ya está en la lista de ban.");
      message.delete({ timeout: 5000 }); // Eliminar el mensaje del usuario después de 5 segundos
      return;
    }

    // Verificar si el playerName ya está en la tabla BanIP
    const selectNameQuery = "SELECT * FROM BanIP WHERE Name = ?";
    const selectNameResult = await executeQuery(selectNameQuery, [playerName]);

    let banPlayerName = playerName;
    let nameIndex = 1;
    while (selectNameResult.length > 0) {
      banPlayerName = `${playerName}${nameIndex}`;
      nameIndex++;

      const selectNameResult = await executeQuery(selectNameQuery, [banPlayerName]);
    }

    // Insertar un nuevo registro en la tabla BanIP
    const insertQuery =
      "INSERT INTO BanIP (Name, IP, GiveBan, Rusel) VALUES (?, ?, ?, ?)";
    await executeQuery(insertQuery, [banPlayerName, ip, "Bot Vida rol", "En canal BanIP está"]);
    banPlayerName = `${banPlayerName}1`;
    const insertQuery2 = "INSERT INTO BanIP (Name, IP, GiveBan, Rusel) VALUES (?, ?, ?, ?)";
    await executeQuery(insertQuery2, [banPlayerName, regIP, "Bot Vida rol", "En canal BanIP está"]);

    message.channel.send(`Se ha agregado el jugador ${playerName} a la lista de ban con la IP ${ip} y RegIP ${regIP}.`);
    message.delete({ timeout: 5000 }); // Eliminar el mensaje del usuario después de 5 segundos

    // Enviar el mensaje a un canal específico
    const canalID = '1244829480640581725'; // Reemplazar con el ID del canal
    const canal = client.channels.cache.get(canalID);

    const embed = new MessageEmbed()
      .setColor('#ff0000')
      .setTitle(`Jugador Baneado ${playerName}`)
      .setDescription(`Se ha agregado el jugador ${playerName} a la lista de ban con la IP ${ip} y RegIP ${regIP}.`)
      .setTimestamp();

    canal.send(embed);
  }
};
