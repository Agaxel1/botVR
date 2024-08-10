const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const mysql = require('mysql');

module.exports = {
    name: 'sigla',
    aliases: ['s'],
    description: 'Busca una sigla en la tabla de infracciones.',
    
    async execute(client, message, args) {
        const infracciones = {
            'AA2': 'Abusar de animaciones del servidor para beneficio propio en cualquier rol.',
            'AIOOC': 'Insultar a un administrador a través de un canal OOC.',
            'BA': 'Abusar de un bug del servidor.',
            'BH': 'Ir saltando mientras corres para llegar más rápido o evitar cansarse.',
            'CJ': 'Bajar de su vehículo al conductor sin rol alguno.',
            'CK': 'Asesinar/Atropellar a una persona sin motivo ni rol alguno.',
            'DM': 'Golpear/Asesinar a una persona sin motivo ni rol alguno.',
            'FA': 'Abusar de comandos únicos de facción para el beneficio de un rol.',
            'IOOC': 'Insultar a un usuario a través de un canal OOC.',
            'LA2': 'Ningún nuevo puede ser líder de facción por la cantidad de horas solicitadas al postular a líder de alguna.',
            'MUD': 'Usar mal el canal de dudas/ask.',
            'MG': 'Utilizar información OOC para beneficio IC.',
            'MG2': 'Confundir canales, bien sea IC u OOC.',
            'NIP': 'Nula interpretación del personaje.',
            'NRC': 'No rolear un choque.',
            'NRE': 'No rolear entorno.',
            'NRH': 'No rolear heridas.',
            'NVVPJ': 'No valorar la vida del personaje.',
            'PG': 'Realizar acciones IC que serían imposibles de realizar OOC.',
            'PG2': 'Forzar un rol para un beneficio propio.',
            'RK': 'Regresar al lugar de tu muerte para tomar venganza y volver a participar en el rol.',
            'SK': 'Asesinar a un usuario mientras está entrando o saliendo de algún interior, también aplica a usuarios que están conectando.',
            'TK': 'Asesinar a los mismos miembros de tu facción.',
            'IDS': 'Interferir en la dinámica del servidor (ejemplo: usar el /b cuando se está llevando a cabo un rol).'

        
        };

        const sigla = args[0];
        if (!sigla) {
            message.channel.send('Por favor, proporciona una sigla a buscar.');
            return;
        }

        const infraccion = infracciones[sigla.toUpperCase()];
        if (infraccion) {
            const embed = new Discord.MessageEmbed()
                .setColor('#ff0000')
                .setTitle(`Sigla: ${sigla.toUpperCase()}`)
                .setDescription(infraccion);

            message.channel.send(embed);
            message.delete()
        } else {
            message.channel.send(`No se encontró ninguna infracción para la sigla "${sigla.toUpperCase()}".`);
            message.delete()
        }
    },
};







