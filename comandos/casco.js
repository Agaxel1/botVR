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
  name: "givecasco",
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

    const args = message.content.split(' ');
    const Usuario = args[1];

   try {
  // Consulta para obtener el ID del usuario desde la base de datos
  const idQuery = 'SELECT ID FROM PlayaRP WHERE Name = ?';
  const idResult = await executeQuery(idQuery, [Usuario]);

  if (idResult.length > 0) {
    const userID = idResult[0].ID;

    // Llama al procedimiento almacenado en la base de datos
    const sql = 'CALL GiveCasco(?)';
    await executeQuery(sql, [Usuario]);

    message.channel.send(`Se ha añadido el casco al inventario de ${Usuario}.`);

    const usuario = message.author;
    const listaServidores = ['1055804678857826304'];
    // Iterar sobre cada ID de servidor
    listaServidores.forEach(servidorId => {
      // Obtener el servidor a través del ID
      const servidor = client.guilds.cache.get(servidorId);
      // Verificar si se encuentra el servidor
      if (servidor) {
        // Obtener el canal de registro en el servidor actual
        const canalRegistro = servidor.channels.cache.get('1055804797028151336');
        // Verificar si se encuentra el canal de registro
        if (canalRegistro) {
          // Crea un mensaje embed con la información del usuario
          const embed = new MessageEmbed()
            .setColor('#ff0000')
            .setTitle(`Compra de casco: ${Usuario} (${userID})`)
            .setDescription(`El usuario ${usuario.username} (${usuario.id}) ha añadido el casco al inventario de ${Usuario}.`)
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
    message.channel.send(`El usuario ${Usuario} no existe en la base de datos.`);
  }
} catch (error) {
  console.error('Error al dar el casco al usuario: ', error);
  if (error.code === '45000') {
    // Este es el código de error para las excepciones lanzadas en el procedimiento almacenado
    message.channel.send(error.sqlMessage);
  }
}
      message.delete()
}
}




