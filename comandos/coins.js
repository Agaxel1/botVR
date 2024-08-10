const Discord = require('discord.js');
const axios = require('axios');

module.exports = {
  name: "coins",
  aliases: [],
  async execute(client, message, args) {
    // Verificar que se proporcione la cantidad necesaria
    if (args.length < 1) {
      message.channel.send("Debes proporcionar la cantidad de coins o dólares.");
      return;
    }

    const input = args[0];
    let coins, dollars;

    if (input.includes("$")) {
      dollars = parseFloat(input.slice(1)); // Eliminar el símbolo "$" y convertir a número
      coins = dollars / 3 * 100; // Convertir dólares a coins
    } else {
      coins = parseFloat(input);
      dollars = coins / 100 * 3; // Convertir coins a dólares
    }

    const embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Conversión de Coins y Dólares')
      .addField('Coins', coins.toFixed(2));

    if (!isNaN(dollars)) {
      embed.addField('Dólares', dollars.toFixed(2) + ' $');
    }

    message.channel.send(embed);
    message.delete()
  }
};
