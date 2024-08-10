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
  name: "banip",
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
    const ip = args[1];
    if (!ip) {
      message.channel.send('No has establecido el IP.');
      return;
    }

    // Verificar si la IP ya está en la tabla BanIP
    const selectIPQuery = "SELECT * FROM BanIP WHERE IP = ?";
    const selectIPResult = await executeQuery(selectIPQuery, [ip]);

    if (selectIPResult.length > 0) {
      message.channel.send("La IP ya está en la lista de ban.");
      message.delete({ timeout: 5000 }); // Eliminar el mensaje del usuario después de 5 segundos
      return;
    }

    // Consulta para obtener el nombre del jugador asociado a la IP
    const selectQuery =
      "SELECT Name FROM PlayaRP WHERE regIP = ? OR IP = ?";
    const selectResult = await executeQuery(selectQuery, [ip, ip]);

    if (selectResult.length === 0) {
      message.channel.send("La IP no está registrada.");
      message.delete({ timeout: 5000 }); // Eliminar el mensaje del usuario después de 5 segundos
      return;
    }

    let playerName = selectResult[0].Name;

    // Verificar si el playerName ya está en la tabla BanIP
    let selectNameQuery = "SELECT * FROM BanIP WHERE Name = ?";
    let selectNameResult = await executeQuery(selectNameQuery, [playerName]);

    let nameIndex = 1;
    while (selectNameResult.length > 0) {
      playerName = `${selectResult[0].Name}${nameIndex}`;
      selectNameQuery = "SELECT * FROM BanIP WHERE Name = ?";
      selectNameResult = await executeQuery(selectNameQuery, [playerName]);
      nameIndex++;
    }

    // Insertar un nuevo registro en la tabla BanIP
    const insertQuery =
      "INSERT INTO BanIP (Name, IP, GiveBan, Rusel) VALUES (?, ?, ?, ?)";
    await executeQuery(insertQuery, [playerName, ip, "Bot Vida rol", "En canal BanIP está"]);
    message.channel.send(`Se ha agregado la IP ${ip} a la lista de ban con el nombre ${playerName}.`)
    message.delete({ timeout: 5000 }); // Eliminar el mensaje del usuario después de 5 segundos

    // Enviar el mensaje a un canal específico
    const canalID = '1244829480640581725'; // Reemplazar con el ID del canal
    const canal = client.channels.cache.get(canalID);

    const embed = new MessageEmbed()
      .setColor('#ff0000')
      .setTitle(`IP Baneada ${ip}`)
      .setDescription(`Se ha agregado la IP ${ip} a la lista de ban con el nombre ${playerName}.`)
      .setTimestamp();

    canal.send(embed);
  }
};
