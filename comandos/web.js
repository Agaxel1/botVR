const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');

module.exports = {
  name: "web",
  alias: ["wb"],

execute (client, message, args){

  message.channel.send("https://vida-roleplay.com/")

message.delete() 
 }

}