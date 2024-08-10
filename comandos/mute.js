const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');
const ms = require('ms')
const db = require("megadb")
const muterol = new db.crearDB("muterol")

module.exports = {
  name: "mute",
  alias: ["m"],

 async execute (client, message, args){

const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
if(member == 823923578084130886) return message.reply("No puedo mutearme.")

  var perms = message.member.hasPermission("MANAGE_ROLES")
  if(!perms) return message.channel.send("No tienes permisos!")

  let mencionado = message.mentions.members.first()
  if(!mencionado) return message.channel.send("Debes mencionar a alguien!")
  
  let time = args[1]
  if(!time) return message.channel.send("Debes decir un tiempo!")
  let timer = ms(time)

  var razon = args[2]
  if(!razon){
    razon = 'no especificado'
  }

  

  let rol = await muterol.obtener(message.guild.id)

  if(mencionado.roles.cache.has("930201316188377139")) return message.channel.send("Este usuario ya esta muteado!")

  mencionado.roles.add("930201316188377139")

 const embed = new Discord.MessageEmbed()

 .setTitle("hola", "hola")

  message.channel.send(`El usuario **${mencionado}** ha sido muteado durante **${time}**`)

  await setTimeout(async function() {
await mencionado.roles.remove("930201316188377139")
},timer)
message.delete() 


}

}