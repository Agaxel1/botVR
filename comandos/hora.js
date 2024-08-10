const Discord = require('discord.js');
const moment = require('moment');
const { MessageEmbed } = require('discord.js');
const connection = require('./database');

module.exports = {
    name: "hora",
    alias: ['horaic'],

    async execute(client, message, commandArgs) {
        try {
            // Consulta para obtener la hora actual desde la base de datos
            const horaQuery = 'SELECT fecha_ahora() as hora_actual';
            const horaResult = await executeQuery(horaQuery);

            if (horaResult.length > 0) {
                const fechaHoraActual = moment(horaResult[0].hora_actual).format('YYYY-MM-DD HH:mm:ss');

                const mensaje = new MessageEmbed()
                    .setDescription(`La fecha y hora actual del servidor es: \`${fechaHoraActual}\``)
                    .setColor('#0099ff');

                message.channel.send(mensaje);
            } else {
                message.channel.send(`No se pudo obtener la hora actual del servidor.`);
            }
        } catch (error) {
            console.error('Error al obtener la hora actual: ', error);
        }

        message.delete();
    }
};

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
