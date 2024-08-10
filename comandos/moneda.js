const Discord = require('discord.js');
const axios = require('axios');

// Diccionario de nombres de moneda a códigos de moneda
const currencyCodes = {
  'United States dollar': 'USD',
  'Euro': 'EUR',
  'Mexican peso': 'MXN',
  'Colombian peso': 'COP',
  'Argentine peso': 'ARS',
  'Chilean peso': 'CLP',
  'Peruvian sol': 'PEN',
  'Brazilian real': 'BRL',
  'Uruguayan peso': 'UYU',
  'Bolivian boliviano': 'BOB',
  'Paraguayan guaraní': 'PYG',
  'Costa Rican colón': 'CRC',
  'Dominican peso': 'DOP',
  'Honduran lempira': 'HNL',
  'Guatemalan quetzal': 'GTQ',
  'Salvadoran colón': 'SVC',
  'Nicaraguan córdoba': 'NIO',
  'Panamanian balboa': 'PAB',
  'Cuban peso': 'CUP',
  'Puerto Rican peso': 'USD', // Puerto Rico uses the US dollar
  'British pound': 'GBP',
  'Swiss franc': 'CHF',
  'Swedish krona': 'SEK',
  'Norwegian krone': 'NOK',
  'Danish krone': 'DKK',
  'Polish złoty': 'PLN',
  'Czech koruna': 'CZK',
  'Hungarian forint': 'HUF',
  'Romanian leu': 'RON',
  'Bulgarian lev': 'BGN',
  'Croatian kuna': 'HRK',
  'Turkish lira': 'TRY',
  'Venezuelan bolívar soberano': 'VES',
};

module.exports = {
  name: "moneda",
  aliases: [],
  async execute(client, message, args) {
    // Verificar que se proporcionen los argumentos necesarios
    if (args.length < 1) {
      message.channel.send("Debes proporcionar el nombre de un país.");
      return;
    }

    const country = args.join(' ');

    // Realizar la solicitud a la API de Rest Countries para obtener el tipo de moneda del país
    try {
      const response = await axios.get(`https://restcountries.com/v3/name/${country}`);
      const data = response.data[0];

      if (data.currencies) {
        const currencies = data.currencies;
        const currencyNames = Object.values(currencies).map(currency => currency.name || '');
        const currencySymbols = Object.values(currencies).map(currency => currency.symbol || '');

        // Reemplazar nombres de moneda por códigos de moneda utilizando el diccionario
        const currencyCodesReplaced = currencyNames.map(name => currencyCodes[name] || name);

        const embed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Tipo de Moneda')
          .addField('País', country)
          .addField('Código', currencyCodesReplaced.join('\n'))
          .addField('Moneda', currencyNames.join('\n'))
          .addField('Símbolo', currencySymbols.join('\n'));

        message.channel.send(embed);
      } else {
        message.channel.send(`No se encontró información de moneda para el país "${country}".`);
      }
    } catch (error) {
      console.error('Error al obtener la información de moneda: ', error);
      message.channel.send('Ocurrió un error al obtener la información de moneda.');
    }
  }
};
