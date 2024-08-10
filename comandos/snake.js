const Discord = require('discord.js');
const client = new Discord.Client();
const disbut = require('discord-buttons');
const { Snake } = require('weky');


module.exports = {
  name: "snake",
  alias: ["snk"],
  
 async execute(client, message, args){
const { Snake } = require('weky');
  
  await Snake({
    message: message,
    embed: {
      title: 'Snake',
      description: 'Hiciste **{{score}}** puntos',
      color: '#7289da',
      footer: "Diviertete un rato.",
    },
    emojis: {
      empty: '⬛',
      snakeBody: '🟩',
      food: '🍎',
      up: '⬆️',
      right: '⬅️',
      down: '⬇️',
      left: '➡️',
    },
    othersMessage: 'Solo <@{{author}}> puede usar los botones!',
    buttonText: 'Cancelar',
  })
}
}
