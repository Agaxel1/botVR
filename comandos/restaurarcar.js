const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const moment = require('moment-timezone');

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
    name: 'restaurarcar',
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

        if (userPermissionLevel <= 7) {
            // El nivel de permiso del usuario no es mayor a 8
            message.channel.send('No tienes permiso para usar este comando.');
            return;
        }
        // Obtener argumentos del comando
        const args = message.content.split(' ');
        const usuario = args[1];
        const Modelo = args[2];
        const impuestos = args[3];
        const zasaza = args[4];

        if (!usuario || !Modelo || !impuestos || !zasaza) {
            message.channel.send('Completa bien los parámetro\n!restaurarcar (Nombre_Apellido) (ID_Modelo) (Dias Restantes) (Placa).');
            return;
        }
        try {
            // Verificar si el usuario existe en la base de datos
            const sqlUsuario = 'SELECT COUNT(*) AS userCount FROM PlayaRP WHERE Name = ?';
            const usuarioResult = await executeQuery(sqlUsuario, [usuario]);
            const usuarioExiste = usuarioResult[0].userCount > 0;

            if (!usuarioExiste) {
                message.channel.send(`El usuario ${usuario} no existe en la base de datos.`);
                return;
            }

            // Obtener el ID del usuario
            const sqlID = 'SELECT ID FROM PlayaRP WHERE Name = ?';
            const idResult = await executeQuery(sqlID, [usuario]);
            const userID = idResult[0].ID;

            // Verificar si el registro existe en log_car_delete
            const sqlCar = 'SELECT * FROM log_car_delete WHERE Owner = ? AND Model = ? AND DiasRestantes = ?';
            const carResult = await executeQuery(sqlCar, [userID, Modelo, impuestos]);

            if (carResult.length === 0) {
                message.channel.send(`No se encontró el registro correspondiente en log_car_delete.`);
                return;
            }

            // Obtener los valores del registro para eliminarlo
            const logCarDeleteOwner = carResult[0].Owner;
            const logCarDeleteModel = carResult[0].Model;
            const logCarDeleteDias = carResult[0].DiasRestantes;

            // Eliminar el registro de log_car_delete
            const sqlDeleteCar = 'DELETE FROM log_car_delete WHERE Owner = ? AND Model = ? AND DiasRestantes = ?';
            await executeQuery(sqlDeleteCar, [logCarDeleteOwner, logCarDeleteModel, logCarDeleteDias]);


            // Guardar el Number_Max y los datos de Price_car e Impuestos
            const Prise_car = carResult[0].Price;
            const Impuestos = (carResult[0].DiasRestantes * 73) + 219;
            const Maletero = carResult[0].BagInv;
            const Guantera = carResult[0].GloveInv;

            // Obtener el número máximo actual de la tabla Car
            const sqlMaxNumber = 'SELECT MAX(Number) AS maxNumber FROM Car';
            const maxNumberResult = await executeQuery(sqlMaxNumber);
            const maxNumber = maxNumberResult[0].maxNumber;

            // Insertar los datos en la tabla Car
            const sqlInsertCar = 'INSERT INTO Car VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const insertCarParams = [
                maxNumber + 1,
                userID,
                Modelo,
                Prise_car,
                Impuestos,
                '1961.27',
                '-1642.87',
                '13.0896',
                '0.337813',
                '0',
                '0',
                '0',
                '0',
                '1',
                '1',
                '1',
                '0',
                '0',
                '0',
                '93',
                '0',
                '0',
                '2992',
                '999',
                '100',
                '100',
                '100',
                '100',
                '100',
                '100',
                '1',
                '0',
                '1',
                '0',
                '1000.000000|0|0|0|0',
                '0',
                '100',
                '0',
                Maletero,
                Guantera,
                '0',
                '0',
                '0',
                '0',
                '0',
                zasaza
            ];

            await executeQuery(sqlInsertCar, insertCarParams);

            message.channel.send('Se ha restaurado el coche correctamente.');
        } catch (error) {
            console.error('Error al restaurar el coche: ', error);
        }
        message.delete();
    }
};
