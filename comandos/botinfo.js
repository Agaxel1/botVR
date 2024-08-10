const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');
const moment = require("moment") //Definimos moment
require("moment-duration-format") 

module.exports = {
  name: "botinfo",
  alias: ["ibot"],

execute (client, message, args){


const actividad = moment
      .duration(client.uptime)
      .format(" D [dias], H [hrs], m [mins], s [secs]")
// De esta manera le daremos formato a el tiempo que tu bot esta prendido


const botinfo = new Discord.MessageEmbed()
  .setAuthor(`Información del bot`, client.user.avatarURL())
//El author
  .setThumbnail(client.user.avatarURL({ size: 2048 }))
//El logo del servidor
  .setDescription("**Creado por: **`Juan Rincón#3008`")
//Una hermosa descripcion :D
  .addField(
    "Servidores: ",
    "```diff\n " + client.guilds.cache.size + "\n```",
    true
  )
//Cantidad de servidores en el que esta unido el BOT
  .addField("Uptime: ", "```\n" + actividad + "\n```", true)
//Tiempo de actividad del BOT
  .addField(
    "RAM: ",
    "```fix\n" +
      (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) +
      "MB\n```",
    true
  )
//Memoria RAM utilizada por el BOT
  .addField("Lenguaje: ", '```json\nJavaScript\n```', true)
//Lenguage en el que esta programado
  .addField("Libreria: ", "```ini\nDiscord.js v12.2.0\n```", true)
//La libreria de discord.js 
  .setFooter(`Informacion del bot solicitada por ${message.author.username}`)
//Un footer que nos mande la info de quien solicito la info
  .setColor("RANDOM"); //Un color random

message.channel.send(botinfo);
//Mandamos el mensage
}
}