const { MessageEmbed } = require('discord.js');
const connection = require('./database');

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
  name: "sancion",
  aliases: [],

  async execute(client, message, args) {
    const input = args.join(" ");

    if (!input) {
      message.channel.send('Debes proporcionar las siglas y el tipo de sanción.');
      message.delete()
      return;
    }

    const [siglas, tipoStr] = input.split(" ");
    const siglasArray = siglas.split("+");
    const tipo = parseInt(tipoStr);

    if (isNaN(tipo) || tipo < 1 || tipo > 3) {
      message.channel.send('El tipo de sanción debe ser un número entre 1 y 3.');
      message.delete()
      return;
    }

    try {
      // Consultar las sanciones correspondientes a las siglas y el tipo especificados
      const sqlQuery = `SELECT sigla, tipo${tipo} AS tiempo, warn, ark FROM sanciones WHERE sigla IN (?)`;
      const result = await executeQuery(sqlQuery, [siglasArray]);

      if (result.length === 0) {
        message.channel.send('No se encontraron sanciones con las siglas especificadas.');
        return;
      }

      const embed = new MessageEmbed()
        .setColor('#00ff00')
        .setTitle('Calculadora de Sanciones')
        .addField('Siglas:', siglas);

      result.forEach((row) => {
        embed.addField(row.sigla, `Tipo de Sanción: ${row.ark}\nTiempo de Sanción: ${row.tiempo} minutos\nWarn: ${row.warn === 1 ? 'Sí' : 'No'}`);
      });
message.delete()
      message.channel.send(embed);
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      message.channel.send('Ocurrió un error al obtener la información de las sanciones.');
      message.delete()
    }
  }
};