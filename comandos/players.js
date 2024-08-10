const { Client, MessageEmbed } = require('discord.js');
const samp = require('samp-query');
const AsciiTable = require('ascii-table');

module.exports = {
  name: 'players',
  alias: ['player', 'estado', 'jugadores', 'jugador'],

  async execute(client, message, args) {
    if (!process.env.SAMP_IP) {
      return message.channel.send('IP address is not set in the .env file!');
    }

    const member = await message.guild ? message.guild.members.fetch(message.client.user.id) : null;
    const color = member ? member.displayHexColor : '#000000';

    const ip = process.env.SAMP_IP.split(':');
    const options = {
      host: ip[0],
      port: ip[1] || 7777,
    };

    await samp(options, (error, query) => {
      if (error) {
        console.log(error);
        const embed = new MessageEmbed()
          .setColor(color)
          .setTitle(`${options.host}:${options.port}`)
          .setDescription('El servidor se encuentra apagado.')
          .setFooter('Consultado por: ' + message.member.displayName, message.author.displayAvatarURL());
        return message.channel.send(embed);
      } else {
        const title = `**${query['hostname']}** | Jugadores: ${query['online']}/${query['maxplayers']}`;
        const image = 'https://media1.tenor.com/images/4f8715706f40857afd964bdf16919aba/tenor.gif?itemid=26497184';
        const footer = 'Consultado por: ' + message.member.displayName;

        if (query['online'] > 0) {
          let table = new AsciiTable().setHeading(' ID', 'NICK', 'SCORE').setAlign(2, AsciiTable.RIGHT);
          for (let i = 0; i < query['online']; i++) {
            if (query['players'][i] !== undefined) {
              table.addRow(query['players'][i]['id'], query['players'][i]['name'], query['players'][i]['score']);
            }
          }

          const tableString = table.toString();
          const lines = tableString.split('\n');
          const maxLength = lines.reduce((max, line) => Math.max(max, line.length), 0);
          const topLine = '─'.repeat(maxLength);

          let remainingLines = lines;

          if (query['online'] > 100) {
            const embed = new MessageEmbed()
              .setColor(color)
              .setTitle(title)
              .setImage(image)
              .setDescription('Somos tantos que no puedo enumerarlos.')
              .setFooter(footer, message.author.displayAvatarURL());
            return message.channel.send(embed);
          }

          while (remainingLines.length > 0) {
            let messageLines = [];
            let messageLength = 0;

            while (remainingLines.length > 0 && messageLength + remainingLines[0].length < 2000) {
              messageLength += remainingLines[0].length;
              messageLines.push(remainingLines.shift());
            }

            const mensaje = new MessageEmbed()
              .setColor('#0099ff')
              .setTitle(title)
              .setImage(image)
              .setDescription(`\`\`\`${topLine}\n${messageLines.join('\n')}\n${topLine}\`\`\``)
              .setFooter(footer, message.author.displayAvatarURL());

            message.channel.send(mensaje);
          }

          if (remainingLines.length > 0) {
            const remainingMessage = new MessageEmbed()
              .setColor('#0099ff')
              .setDescription(`\`\`\`${topLine}\n${remainingLines.join('\n')}\n${topLine}\`\`\``)
              .setFooter(footer, message.author.displayAvatarURL());

            message.channel.send(remainingMessage);
          }
        } else if (query['online'] == 0) {
          const embed = new MessageEmbed()
            .setColor(color)
            .setTitle(title)
            .setImage(image)
            .setDescription('*El servidor se encuentra vacío.*')
            .setFooter(footer, message.author.displayAvatarURL());
          return message.channel.send(embed);
        }
      }
    });

    message.delete();
  },
};

