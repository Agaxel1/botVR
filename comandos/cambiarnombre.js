const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const mysql = require('mysql');
const crypto = require('crypto');

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
  name: 'cambiarnombre',
  alias: ['cn'],

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
    let comandoEnEjecucion = false;
    if (comandoEnEjecucion) {
      message.channel.send('Por favor, espera a que el comando anterior termine.');
      return;
    }

    const args = message.content.split(' ');
    const ID = args[1];
    const nuevoNombre = args[2];

    // Verificar si el nuevoNombre ya existe en la tabla PlayaRP
    const sqlCheckDuplicateName = 'SELECT COUNT(*) AS count FROM PlayaRP WHERE Name = ?';
    const resultCheckDuplicateName = await executeQuery(sqlCheckDuplicateName, [nuevoNombre]);

    if (resultCheckDuplicateName[0].count > 0) {
      // El nuevoNombre ya existe en la base de datos
      message.channel.send(`El nombre ${nuevoNombre} ya existe. Por favor, elige otro nombre.`);
      message.delete();
      return;
    }


    try {
      comandoEnEjecucion = true;

      const sql = 'UPDATE PlayaRP SET Name = ? WHERE ID = ?';
      const result = await executeQuery(sql, [nuevoNombre, ID]);

      if (result.affectedRows > 0) {
        // La contraseña del usuario se ha actualizado correctamente en la base de datos de PlayaRP
        const mensajeCanalActual = `El Nombre del ID ${ID} ha sido cambiada a: ${nuevoNombre}.`;
        const mensajeCanalID = '1169462976319852674'; // ID del canal donde quieres enviar el mensaje

        // Enviar mensaje al canal actual
        message.channel.send(mensajeCanalActual);



        // Enviar mensaje al canal con ID 1169462976319852674
        const canalID = client.channels.cache.get(mensajeCanalID);

        if (canalID && canalID.type === 'text') {
          const mensajeCanalID = `El admin ${message.author.username}(${userID}) le cambió el nombre al ID ${ID}: ${nuevoNombre}`;
          canalID.send(mensajeCanalID);
        } else {
          console.error('No se pudo encontrar el canal o no es un canal de texto válido.');
        }

      } else {
        // El usuario no se encuentra en la base de datos de PlayaRP
        const mensaje = `El usuario ${ID} no existe en la base de datos.`;
        message.channel.send(mensaje);
      }

      message.delete();

    } catch (error) {
      console.error('Error al cambiar el nombre del usuario: ', error);
    } finally {
      comandoEnEjecucion = false;
    }
  }
};
