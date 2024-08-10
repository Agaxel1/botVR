const { MessageEmbed } = require('discord.js');


module.exports = {
    name: "salirdelsotano",
    aliases: [],

    async execute(client, message, args) {
        // Suponiendo que executeQuery es una función que ejecuta una consulta SQL y devuelve los resultados

        const userID = message.author.id; // ID del usuario que está intentando ejecutar el comando

        if (userID != 1124378891050561748) {
            message.channel.send('No puedes usar el comando.');
            return;
        }

        try {
            message.channel.send(`<@1124378891050561748> en hora buena!, no saldrás del sótano, pero subiste a ADMIN, felicidades.`);
            message.delete()
        } catch (error) {
            console.error('Error al ejecutar la consulta:', error);
            message.channel.send('Ocurrió un error al obtener la información de los usuarios.');
            message.delete()
        }
    }
};
