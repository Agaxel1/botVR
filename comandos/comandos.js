const { MessageEmbed } = require('discord.js');

// Objeto para rastrear el tiempo del último uso del comando por cada usuario
const cooldowns = new Map();

module.exports = {
    name: "comandos",
    aliases: [],

    execute(client, message, commandArgs) {
        // Verificar si el usuario está en cooldown
        if (cooldowns.has(message.author.id)) {
            const cooldownTime = 5000; // Tiempo en milisegundos (en este caso, 5 segundos)
            const expirationTime = cooldowns.get(message.author.id) + cooldownTime;

            if (Date.now() < expirationTime) {
                const timeLeft = (expirationTime - Date.now()) / 1000;
                message.author.send(`Debes esperar ${timeLeft.toFixed(1)} segundos antes de volver a usar este comando.`);
                message.delete();
                return;
            }

        }


        const embed = new MessageEmbed()
            .setTitle('Comandos de discord de Vida Rol')
            .setDescription(
                '**!invitacion**\nPara ver la invitación del servidor de discord.\n\n**!web**\nPuedes ver la web del servidor\n\n**!estado**\nPuedes ver los jugadores conectados en el servidor.\n\n**Comandos solo para usuarios verificados.\nTe puedes verificar en https://discord.com/channels/929898747155054683/1147729678216474664 **\n\n**!impuestos**\nSirve para ver tus propiedades y te envía mensaje al privado.\n\n**!mistats**\nSirve para ver sus stats de personaje.'
            )
            .setColor('GREEN')
            .setTimestamp()
            .setImage("https://media1.tenor.com/images/340b7c0a114f0827b8eeffc610944431/tenor.gif?itemid=26497201");

        // Enviar el mensaje al usuario
        message.author.send(embed)
            .then(() => {
                message.reply('¡Te he enviado los comandos al privado!');
                // Establecer el tiempo del último uso del comando para el usuario en cooldown
                cooldowns.set(message.author.id, Date.now());
            })
            .catch(error => {
                console.error(`Error al enviar el mensaje al privado: ${error}`);
                message.reply('¡Hubo un error al intentar enviarte los comandos al privado!');
            });
        // Eliminar el mensaje original del usuario
        message.delete();
    }
};
