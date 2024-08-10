const Discord = require('discord.js');
const AsciiTable = require('ascii-table');
const path = require('path');
const fs = require('fs');
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

module.exports = {
    name: 'vehiculoid',
    async execute(client, message, args) {
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
        const searchTerm = args.join(' ');

        // Consultar la tabla car_table en la base de datos
        connection.query(
            `SELECT * FROM car_table WHERE vehicleid = ${searchTerm}`,
            (error, results) => {
                if (error) {
                    console.error('Error al buscar vehículos:', error);
                    return;
                }

                // Comprobar si se encontraron resultados
                if (results.length === 0) {
                    message.channel.send('No se encontraron vehículos con ese término de búsqueda.');
                    return;
                }

                // Crear el mensaje a enviar
                const embed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Resultados de la búsqueda de vehículos');

                message.delete();

                results.forEach((row) => {
                    const imagePath = path.join(__dirname, 'imagenes', `${row.vehicleid}.jpg`);

                    if (fs.existsSync(imagePath)) {
                        // Agrega la imagen al mensaje embed
                        embed.setImage(`attachment://${row.vehicleid}.jpg`);
                        // Adjunta la imagen al mensaje embed
                        embed.attachFiles([{ attachment: imagePath, name: `${row.vehicleid}.jpg` }]);
                    }

                    embed.addField('ID', row.vehicleid);
                    embed.addField('Nombre', row.carname);

                    // Agrega el campo 'Precio' solo si existe en la fila
                    if (row.precio) {
                        embed.addField('Precio', `$${row.precio}`);
                      }
                });

                message.channel.send({ embed });
            }
        );
    },
};


