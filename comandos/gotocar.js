const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const mysql = require('mysql');

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
    name: "gotocar",
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

        // Obtener los argumentos del comando
        const args = message.content.split(' ');

        // Verificar que se proporcionaron ambos argumentos
        if (args.length !== 3) {
            message.channel.send('Por favor, proporciona un número y un nombre.\n!gotocar Numero Nombre_Apellido');
            return;
        }

        // Obtener los valores de los argumentos
        const carNumber = args[1];
        const playerName = args[2];

        try {
            const getCarQuery = 'SELECT X, Y, Z, A, Service, Straf, Detenido FROM Car WHERE Number = ?';
            const carResult = await executeQuery(getCarQuery, [carNumber]);

            if (carResult.length === 0) {
                message.channel.send(`No se encontró un coche con el número ${carNumber}.`);
                return;
            }

            // Desestructurar las coordenadas y otros valores del resultado
            const { X, Y, Z, A, Service, Straf, Detenido } = carResult[0];

            // Verificar si Service, Straf o Detenido son diferentes de 0
            if (Service !== 0 || Straf !== 0 || Detenido !== 0) {
                message.channel.send('No se puede teleportar a este coche debido a que está detenido o en dilimore');
                return;
            }


            // Después de mover al jugador, obtener la columna 'Online' de PlayaRP
            const getPlayerOnlineQuery = 'SELECT Online FROM PlayaRP WHERE Name = ?';
            const playerOnlineResult = await executeQuery(getPlayerOnlineQuery, [playerName]);

            const usuarioOnline = playerOnlineResult[0].Online;

            if (usuarioOnline === 1) {
                message.channel.send('El usuario se encuentra ON, debe quitar /q para poder aplicar el TP.');
                return;
            }

            // Actualizar las coordenadas del jugador en PlayaRP usando el nombre proporcionado
            const updatePlayerQuery = 'UPDATE PlayaRP SET X = ?, Y = ?, Z = ?, A = ? WHERE Name = ?';
            const updateResult = await executeQuery(updatePlayerQuery, [X, Y, Z, A, playerName]);

            if (updateResult.affectedRows > 0) {
                message.channel.send(`Se ha movido a ${playerName} al coche número ${carNumber}.`);
            } else {
                message.channel.send(`No se pudo actualizar la ubicación de ${playerName}.`);
            }
        } catch (error) {
            console.error('Error al ejecutar el comando gotocar: ', error);
            message.channel.send('Se produjo un error al ejecutar el comando.');
        }
    }
};