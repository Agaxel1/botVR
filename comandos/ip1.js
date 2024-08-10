const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');

module.exports = {
  name: "ip",
  alias: ["pi"],

execute (client, message, args){

  message.channel.send("Hola, no contamos con IP, contamos con un launcher propio para poder jugar lo tienes que descargar en https://vida-roleplay.com/")

message.delete() 
 }

}