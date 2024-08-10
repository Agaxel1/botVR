const Discord = require('discord.js');
const axios = require('axios');

module.exports = {
  name: "convert",
  aliases: [],
  async execute(client, message, args) {
    // Verificar que se proporcionen los argumentos necesarios
    if (args.length < 3) {
      message.channel.send("Debes proporcionar la cantidad, la moneda de origen y la moneda de destino.");
      return;
    }

    const amount = parseFloat(args[0]);
    const fromCurrency = args[1].toUpperCase();
    const toCurrency = args[2].toUpperCase();

    // Realizar la solicitud a la API de Exchange Rates para obtener las tasas de conversión
    try {
      const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      const rates = response.data.rates;

      if (rates.hasOwnProperty(toCurrency)) {
        const convertedAmount = amount * rates[toCurrency];

        const embed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Conversión de Moneda')
          .addField('Cantidad', amount.toFixed(2) + ' ' + fromCurrency)
          .addField('Resultado', convertedAmount.toFixed(2) + ' ' + toCurrency);

        message.channel.send(embed);
      } else {
        message.channel.send(`No se encontró la moneda "${toCurrency}".`);
      }
    } catch (error) {
      console.error('Error al obtener las tasas de conversión: ', error);
      message.channel.send('Ocurrió un error al realizar la conversión de moneda.');
    }
      message.delete();
  }
  
};
