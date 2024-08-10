const Discord = require('discord.js');
require('@weky/inlinereply');
const client = new Discord.Client();
const disbut = require('discord-buttons');
const { Calculator } = require('weky');


module.exports = {
  name: "calculadora",
  alias: ["cal"],
  
  async execute (client, message, args, utils, data){
  const { Calculator } = require('weky')
  
  await Calculator({
    message: message,
    embed: {
      title: 'Calculadora',
      color: '#7289da',
      timestamp: true,
      footer: "Realiza todas tus operaciones",
      
    },
    disabledQuery: 'Calculadora deshabilitada',
    invalidQuery: 'La ecuación es invalida.',
    othersMessage: 'Solo <@{{author}}> puede usar los botones.!'
  });
}

}