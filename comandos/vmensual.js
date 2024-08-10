
/* INDICACIONES
• Cuidado al ingresar una nueva facción.
• Si solo se agrega para el log de armas, solo ingresar el ID_canal, lo demás dejarlo en null o escribe otra cosa.
• Si se agrega un log bizwar aparte, se aumenta 1 al ID_facc, con todo, ID_server,ID_canal_ID_rol.
*/

const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database'); // Asegúrate de importar correctamente tu módulo de conexión a la base de datos
const AsciiTable = require('ascii-table');

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

module.exports = {
    name: 'vmensual',
    aliases: [],

    async execute(client, message, commandArgs) {
        try {
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
            // Verificar si se proporciona "add" como primer argumento
            if (commandArgs[0] === 'add') {
                // Verificar si se proporcionan los argumentos necesarios
                if (commandArgs.length < 5) {
                    message.channel.send('Faltan argumentos para agregar un registro.\nUsar: !vmensual add [ID Faccion] [ID server] [ID canal] [ID rol]');
                    return;
                }

                const ID_facc = commandArgs[1];
                const ID_server = commandArgs[2];
                const ID_canal = commandArgs[3];
                const ID_rol = commandArgs[4];

                // Insertar el nuevo registro en la base de datos
                const sqlInsert = `INSERT INTO Mensual (ID_facc, ID_server, ID_canal, ID_rol, Fecha) VALUES (?, ?, ?, ?, ?)`;
                await executeQuery(sqlInsert, [ID_facc, ID_server, ID_canal, ID_rol, 30]);


                message.channel.send('Se ha agregado un nuevo registro.');
                message.delete();
                return;
            }

            if (commandArgs[0] === 'update') {
                // Verificar si se proporcionan los argumentos necesarios
                if (commandArgs.length < 4) {
                    message.channel.send('Faltan argumentos para actualizar un registro.\nUsar: !vmensual update [ID Faccion] [campo] [valor]\nLos Campos son:\n•ID_facc\n•ID_server\n•ID_canal\n•ID_rol\n•Fecha');
                    return;
                }

                const ID_facc = commandArgs[1];
                const campo = commandArgs[2];
                const valor = commandArgs.slice(3).join(' ');

                // Antes de actualizar el registro en 'update'
                const checkExistingRecord = "SELECT ID_facc FROM Mensual WHERE ID_facc = ?";
                const existingRecord = await executeQuery(checkExistingRecord, [ID_facc]);

                if (existingRecord.length === 0) {
                    message.channel.send('No existe un registro con ese ID de facción.');
                    return;
                }



                // Actualizar el registro en la base de datos
                const sqlUpdate = `UPDATE Mensual SET ${campo} = ? WHERE ID_facc = ?`;
                await executeQuery(sqlUpdate, [valor, ID_facc]);

                message.channel.send('Se ha actualizado el registro.');
                message.delete();
                return;
            }

            if (commandArgs[0] === 'delete') {
                // Verificar si se proporciona el ID_facc como argumento
                if (!commandArgs[1]) {
                    message.channel.send('Falta el ID_facc para eliminar un registro.\nUsar: !vmensual delete [ID_Facc]');
                    return;
                }

                const ID_facc = commandArgs[1];

                // Antes de eliminar el registro en 'delete'
                const checkExistingRecord = "SELECT ID_facc FROM Mensual WHERE ID_facc = ?";
                const existingRecord = await executeQuery(checkExistingRecord, [ID_facc]);

                if (existingRecord.length === 0) {
                    message.channel.send('No existe un registro con ese ID de facción para eliminar.');
                    return;
                }


                // Eliminar el registro de la base de datos
                const sqlDelete = `DELETE FROM Mensual WHERE ID_facc = ?`;
                await executeQuery(sqlDelete, [ID_facc]);

                message.channel.send('Se ha eliminado el registro.');
                message.delete();
                return;
            }

            if (commandArgs[0] === 'renovar') {
                // Verificar si se proporciona el ID_facc como argumento
                if (!commandArgs[1]) {
                    message.channel.send('Falta el ID_facc para renovar un registro.\nUsar: !vmensual renovar [ID Faccion]');
                    return;
                }

                const ID_facc = commandArgs[1];

                // Verificar si el registro existe antes de renovarlo
                const checkExistingRecord = "SELECT ID_facc, ID_server FROM Mensual WHERE ID_facc = ?";
                const existingRecord = await executeQuery(checkExistingRecord, [ID_facc]);

                if (existingRecord.length === 0) {
                    message.channel.send('No existe un registro con ese ID de facción para renovar.');
                    return;
                }

                const serverID = existingRecord[0].ID_server;

                // Obtener el nombre del servidor
                const server = client.guilds.cache.get(serverID);
                const serverName = server ? server.name : 'Desconocido';

                // Actualizar la columna Fecha en la base de datos
                const sqlUpdateFecha = `UPDATE Mensual SET Fecha = 31, Paga = 1, Comando = 1 WHERE ID_facc = ?`;
                await executeQuery(sqlUpdateFecha, [ID_facc]);

                message.channel.send(`Se ha renovado el nuevo mes del servidor ${serverName} a 30 días.`);
                message.delete();
                return;
            }




            // Obtener registros de la tabla Mensual
            const sqlQuery = `SELECT ID_facc, ID_server, Fecha FROM Mensual WHERE ID_facc < 100 AND NOT ID_facc = 21`;
            const results = await executeQuery(sqlQuery);


            const table = new AsciiTable('Pagos Mensuales');
            table.setHeading('ID', 'Servidor', 'Días');

            // Ajustar la alineación y el número de espacios de las columnas
            table.setAlign(0, AsciiTable.RIGHT, 5); // Alinear ID a la derecha y usar 5 espacios
            table.setAlign(1, AsciiTable.LEFT, 20); // Alinear Servidor a la izquierda y usar 15 espacios
            table.setAlign(2, AsciiTable.RIGHT, 5); // Alinear Días a la derecha y usar 5 espacios

            for (const resultado of results) {
                let serverName = (client.guilds.cache.get(resultado.ID_server) || {}).name || resultado.ID_server;
                serverName = serverName.length > 10 ? `${serverName.substring(0, 10)}` : serverName;

                table.addRow(
                    resultado.ID_facc,
                    serverName,
                    resultado.Fecha
                );
            }

            // Resto de tu código para crear y enviar el mensaje embed
            const tableString = '```' + table.toString() + '```';

            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setDescription(tableString);

            message.channel.send(embed);
        } catch (error) {
            console.error('Error en el comando !vmensual:', error);
            message.channel.send('Ocurrió un error al obtener los registros.');
        }
        message.delete();
    }
};