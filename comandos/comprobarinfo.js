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
// Funci贸n para obtener informaci贸n del usuario en la base de datos
function obtenerInfoUsuario(usuario) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT Name, Mail, IP, RegIP, HorasJugadas FROM PlayaRP WHERE Name = ?';
    connection.query(sql, [usuario], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = {
  name: 'comprobarinfo',
  alias: ['ci'],

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
    const usuario = args[1];

    try {
      const result = await obtenerInfoUsuario(usuario);

      if (result.length > 0) {
        // Se han encontrado los datos del usuario en la base de datos de PlayaRP
        const data = result[0];

        // Verificar y asignar "No tiene" si la IP es nula o vacía
        const ipActual = data.IP || 'No tiene';
        const ipRegistrada = data.RegIP || 'No tiene';

        const mensaje = new MessageEmbed()
          .setTitle(`Información de ${usuario}`)
          .addField('Nombre', data.Name || 'No tiene', true)
          .addField('Correo', data.Mail || 'No tiene', true)
          .addField('IP actual', ipActual, true)
          .addField('IP registrada', ipRegistrada, true)
          .addField('Horas Jugadas', data.HorasJugadas || '0', true)
          .setColor('#0099ff');

        message.channel.send(mensaje);
      } else {
        // El usuario no se encuentra en la base de datos de PlayaRP
        const mensaje = `El usuario ${usuario} no existe en la base de datos.`;
        message.channel.send(mensaje);
      }
    } catch (error) {
      console.error('Error al obtener la información del usuario: ', error);
    }
    message.delete();
  }
};