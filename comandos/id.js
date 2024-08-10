const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');

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
// Función para obtener el nombre del usuario en función de su ID en la base de datos
function obtenerNombreUsuario(id) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT Name FROM PlayaRP WHERE ID = ?';
    connection.query(sql, [id], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = {
  name: "id",
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
    const id = args[1];

    try {
      const result = await obtenerNombreUsuario(id);

      if (result.length > 0) {
        // Se ha encontrado el nombre del usuario en función de su ID en la base de datos de PlayaRP
        const nombre = result[0].Name;
        const mensaje = `El nombre del usuario con el ID ${id} es ${nombre}.`;
        message.channel.send(mensaje);
      } else {
        // El ID no se encuentra en la base de datos de PlayaRP
        const mensaje = `El ID ${id} no existe en la base de datos.`;
        message.channel.send(mensaje);
      }
    } catch (error) {
      console.error('Error al obtener el nombre del usuario: ', error);
    }
    message.delete();
  }
};