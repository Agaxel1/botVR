const connection = require('./database');
const { MessageEmbed } = require('discord.js');

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
    name: 'nameold',
    alias: [],

    async execute(client, message, commandArgs) {
        // Suponiendo que executeQuery es una función que ejecuta una consulta SQL y devuelve los resultados

        const userID2 = message.author.id; // ID del usuario que está intentando ejecutar el comando

        const sqlGetUserPermissions = "SELECT Admin FROM PlayaRP WHERE Discord = ?";
        const resultGetUserPermissions = await executeQuery(sqlGetUserPermissions, [userID2]);

        if (resultGetUserPermissions.length === 0) {
            // El usuario no existe en la base de datos
            message.channel.send('No tienes permiso para usar este comando.');
            return;
        }

        const userPermissionLevel = resultGetUserPermissions[0].Admin;

        if (userPermissionLevel <= 2) {
            // El nivel de permiso del usuario no es mayor a 8
            message.channel.send('No tienes permiso para usar este comando.');
            return;
        }
        let userID;
        let nameSearch = false;

        // Verificar si se proporcionó un ID o un nombre como argumento
        if (!isNaN(commandArgs[0])) {
            // Es un número, asumimos que es un ID
            userID = commandArgs[0];
        } else {
            // No es un número, asumimos que es un nombre
            userID = commandArgs[0];
            nameSearch = true;
        }

        if (!userID) {
            message.channel.send('Por favor, proporciona un ID o un nombre válido.');
            return;
        }

        try {
            let resultLastNameChange;

            // Consultar el último registro para el ID o NameOld dado y Tipo "Name"
            if (nameSearch) {
                const sqlGetLastNameChangeByName = "SELECT * FROM log_name_pass_etc WHERE NameOld = ? AND Tipo = 'Name' ORDER BY fecha DESC LIMIT 1";
                resultLastNameChange = await executeQuery(sqlGetLastNameChangeByName, [userID]);
            } else {
                const sqlGetLastNameChangeByID = "SELECT * FROM log_name_pass_etc WHERE Owner = ? AND Tipo = 'Name' ORDER BY fecha DESC LIMIT 1";
                resultLastNameChange = await executeQuery(sqlGetLastNameChangeByID, [userID]);
            }

            if (resultLastNameChange.length > 0) {
                // Obtener el Owner del último cambio de nombre
                const ownerID = resultLastNameChange[0].Owner;

                // Obtener el conteo de cambios de nombre para el Owner
                const sqlCountNameChanges = "SELECT COUNT(*) AS NameChanges FROM log_name_pass_etc WHERE Owner = ? AND Tipo = 'Name'";
                const resultCountNameChanges = await executeQuery(sqlCountNameChanges, [ownerID]);

                // Mostrar la información del último cambio de nombre
                const lastChange = resultLastNameChange[0];

                // Obtener el NameNew del último cambio de nombre (cuando se utiliza Owner como criterio)
                const sqlGetLastNewName = "SELECT NameNew FROM log_name_pass_etc WHERE Owner = ? AND Tipo = 'Name' ORDER BY fecha DESC LIMIT 1";
                const resultLastNewName = await executeQuery(sqlGetLastNewName, [ownerID]);

                // Formatear la fecha en MM-DD-AA
                const fechaFormateada = new Date(lastChange.fecha).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                });

                // Formatear la hora en HH:MM:SS
                const horaFormateada = new Date(lastChange.fecha).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                });

                const embed = new MessageEmbed()
                    .setTitle(`Último cambio de nombre para ${nameSearch ? 'Name' : 'ID'}: ${userID}`)
                    .addField('ID', lastChange.Owner)
                    .addField('Nombre Actual', nameSearch ? resultLastNewName[0].NameNew : lastChange.NameNew)
                    .addField('Nombre Viejo', lastChange.NameOld)
                    .addField('Fecha de Cambio', `${fechaFormateada} ${horaFormateada}`)
                    .addField('Cantidad de Cambios', resultCountNameChanges[0].NameChanges)
                    .setColor('#0099ff');

                message.channel.send(embed);
            } else {
                // No se encontraron registros para el ID o NameOld dado y Tipo "Name"
                message.channel.send(`No se encontraron cambios de nombre para ${nameSearch ? 'NameOld' : 'ID'}: ${userID}.`);
            }

            message.delete();
        } catch (error) {
            console.error('Error al buscar el último cambio de nombre: ', error);
            message.channel.send('Ocurrió un error al buscar el último cambio de nombre. Por favor, inténtalo de nuevo más tarde.');
        }
    },
};
