const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database'); // Asegúrate de importar la conexión a tu base de datos

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
    name: 'unmc',
    aliases: [],
    description: 'Actualiza el valor de MC a 0 para el ID especificado.',
    async execute(client, message, commandArgs) {
        const userID = message.author.id;
        const usuario = message.author;
        const sqlGetUserPermissions = "SELECT Admin FROM PlayaRP WHERE Discord = ?";
        const resultGetUserPermissions = await executeQuery(sqlGetUserPermissions, [userID]);

        if (resultGetUserPermissions.length === 0 || resultGetUserPermissions[0].Admin <= 5) {
            message.channel.send('No tienes permiso para usar este comando.');
            return;
        }

        const args = message.content.split(' ');

        // Verificar que el comando se use correctamente
        if (args.length !== 2 || isNaN(args[1])) {
            return message.reply('Uso correcto: !unmc ID');
        }

        const idToUpdate = args[1]; // Obtener el ID del argumento

        // Query SQL para actualizar la columna MC a 0 donde ID sea igual al ID proporcionado
        const sqlUpdateMC = 'UPDATE PlayaRP SET MC = 0 WHERE ID = ?';

        // Ejecutar la consulta utilizando async/await
        try {
            const result = await executeQuery(sqlUpdateMC, [idToUpdate]);

            // Si la actualización se realiza correctamente
            if (result.affectedRows > 0) {
                message.reply(`Se quitó correctamente la Multicuenta para el ID ${idToUpdate}.`);
            } else {
                message.reply(`No se encontró ningún registro con ID ${idToUpdate}.`);
            }
        } catch (error) {
            console.error('Error al actualizar MC:', error);
            message.reply('Ocurrió un error al intentar actualizar MC.');
        }

        const listaServidores = ['1055804678857826304', '929898747155054683'];
        // Iterar sobre cada ID de servidor
        listaServidores.forEach(servidorId => {
            // Obtener el servidor a través del ID
            const servidor = client.guilds.cache.get(servidorId);
            // Verificar si se encuentra el servidor
            if (servidor) {
                // Obtener el canal de registro en el servidor actual
                const canalRegistro = servidor.channels.cache.find(channel => ['1244832139179065366'].includes(channel.id));
                // Verificar si se encuentra el canal de registro
                if (canalRegistro) {
                    // Crea un mensaje embed con la información del usuario
                    const embed = new MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('Registro del Comando')
                        .setDescription(`El usuario ${usuario.username} (${usuario.id}) hizo !unmc al ID ${idToUpdate}.`)
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
    },
};
