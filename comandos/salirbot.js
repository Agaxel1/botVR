const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const mysql = require('mysql');

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
let comandoEnEjecucion = false;

module.exports = {
    name: 'salir',
    description: 'Hace que el bot salga del servidor actual o de un servidor específico',

    async execute(client, message, commandArgs) {
        const userID = message.author.id;

        const sqlGetUserPermissions = "SELECT Admin FROM PlayaRP WHERE Discord = ?";
        const resultGetUserPermissions = await executeQuery(sqlGetUserPermissions, [userID]);

        if (resultGetUserPermissions.length === 0) {
            message.channel.send('No tienes permiso para usar este comando.');
            return;
        }

        const userPermissionLevel = resultGetUserPermissions[0].Admin;

        if (userPermissionLevel <= 7) {
            message.channel.send('No tienes permiso para usar este comando.');
            return;
        }

        if (comandoEnEjecucion) {
            message.channel.send('Por favor, espera a que el comando anterior termine.');
            return;
        }

        comandoEnEjecucion = true;

        let serverID = message.guild.id;

        if (commandArgs.length > 0) {
            serverID = commandArgs[0];
        }

        const servidor = client.guilds.cache.get(serverID);

        if (servidor) {
            servidor.leave();
            message.channel.send(`El bot ha abandonado el servidor ${servidor.name}.`);
        } else {
            message.channel.send(`No se encontró un servidor con el ID ${serverID}.`);
        }

        comandoEnEjecucion = false;

        message.delete(); // Elimina el mensaje del comando !salir
    }
}
