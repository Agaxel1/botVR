const { MessageEmbed } = require('discord.js');
const connection = require('./database'); // Ajusta la ruta según tu estructura de carpetas

async function reiniciarCasas(message) {
  try {
    // Query de actualización
    let updateQuery = 'UPDATE House SET ';

    for (let i = 1; i <= 150; i++) {
      updateQuery += `Object${i} = '0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0', `;
    }

    // Elimina la coma extra al final
    updateQuery = updateQuery.slice(0, -2);

    connection.query(updateQuery, (error, results) => {
      if (error) {
        console.error('Error al reiniciar las casas:', error);

        const embedError = new MessageEmbed()
          .setTitle('Error al reiniciar casas')
          .setDescription('Ocurrió un error al intentar reiniciar las casas.')
          .setColor('#ff0000');

        message.channel.send(embedError);
      } else {
        console.log('Casas reiniciadas con éxito.');
      }
    });
  } catch (error) {
    console.error('Error en la función reiniciarCasas:', error);

    const embedError = new MessageEmbed()
      .setTitle('Error interno')
      .setDescription('Ocurrió un error interno al intentar reiniciar las casas.')
      .setColor('#ff0000');

    message.channel.send(embedError);
  }
}

module.exports = {
  name: 'reiniciarcasas',
  description: 'Reinicia las casas',
  execute(message, args) {
    reiniciarCasas(message);
  },
};
