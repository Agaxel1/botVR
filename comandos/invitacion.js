const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');

module.exports = {
  name: "invitacion",
  alias: ["inv", "invitación", "discord"],

execute (client, message, args){

  message.channel.send("https://discord.gg/d8fuGQ7xY5")

message.delete() 
 }

}