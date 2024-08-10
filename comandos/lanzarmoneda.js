const Discord = require('discord.js');

module.exports = {
  name: 'lanzarmoneda',
  aliases: ['moneda', 'caraosello'],

  async execute(client, message, commandArgs) {
    const embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('¡Lanzamiento de moneda!')
      .setDescription('Lanzando la moneda...');

    const msg = await message.channel.send(embed);

    // Espera un segundo antes de mostrar el resultado
    setTimeout(() => {
      const resultado = Math.random() < 0.5 ? '🪙 Cara' : '🪙 Sello';
      embed.setDescription(`¡Ha salido ${resultado}!`);
      msg.edit(embed);
    }, 2000);
  }
};
