const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');

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
    name: "buscards",
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

        let targetUserID;

        // Verificar si se proporcionó un ID directo o una mención de usuario
        if (/^\d{17,19}$/.test(commandArgs)) {
            targetUserID = commandArgs; // Es un ID directo
        } else if (message.mentions.users.first()) {
            targetUserID = message.mentions.users.first().id; // Es una mención de usuario
        } else {
            // Buscar por nombre en caso de no ser un ID ni una mención
            const sqlGetUserInfoByName = "SELECT Discord, ID FROM PlayaRP WHERE Name = ?";
            const resultGetUserInfoByName = await executeQuery(sqlGetUserInfoByName, [commandArgs]);

            if (resultGetUserInfoByName.length === 0) {
                message.channel.send('No se encontró ningún usuario con ese nombre o ID.');
                return;
            }

            targetUserID = resultGetUserInfoByName[0].Discord;

            // Mostrar el ID y el nombre de usuario de Discord
            const embedNameSearch = new MessageEmbed()
                .setTitle('Búsqueda por Nombre')
                .addField('Nombre', commandArgs, true)
                .addField('ID', resultGetUserInfoByName[0].ID, true)
                .addField('Usuario de Discord', `<@${targetUserID}>`, true) // Mencionar al usuario
                .setColor('#0099ff');

            message.channel.send(embedNameSearch);
            return;
        }

        try {
            // Consulta para obtener el nombre y el ID del usuario desde la base de datos
            const sqlGetUserInfo = "SELECT Name, ID FROM PlayaRP WHERE Discord = ?";
            const resultGetUserInfo = await executeQuery(sqlGetUserInfo, [targetUserID]);

            // Verificar si se encontraron resultados
            if (resultGetUserInfo.length === 0) {
                message.channel.send('Este usuario de discord no está verificado.');
                return;
            }

            // Crear un Embed con la información del usuario
            const embed = new MessageEmbed()
                .setTitle('Información del Usuario')
                .addField('Nombre', resultGetUserInfo[0].Name, true)
                .addField('ID', resultGetUserInfo[0].ID, true)
                .setColor('#0099ff');

            // Enviar el Embed al canal
            message.channel.send(embed);
        } catch (error) {
            console.error('Error al obtener la información del usuario: ', error);
            message.channel.send('Hubo un error al procesar la solicitud. Por favor, intenta de nuevo más tarde.');
        }
    }
};
