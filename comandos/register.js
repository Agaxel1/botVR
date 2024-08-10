
const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');
const ms = require('ms')
const db = require("megadb")
const erol = new db.crearDB("erol")
const erol1 = new db.crearDB("erol1")
const cosa = new db.crearDB("canalr")

module.exports = {
  name: "registrar",
  alias: ["register"],
async execute (client, message, args){

  if(message.channel.id !== "930577635787018270") return; 

  if(!message.guild.me.hasPermission('MANAGE_NICKNAMES')) return message.channel.send("No tengo el permiso para gestionar apodos!")


let persona = message.member
let apodo = args.slice(0).join(" ")
let mensaje = args[1]
  if(!mensaje) return message.channel.send("Nombre no permitido, solo se permiten nombres con formato Nombre Apellido, ejemplo: Juan Mendoza")
 

persona.setNickname(apodo)

  
  
  
  let usuario = message.member
  

  let rol = await erol.obtener(message.guild.id)
let rol1 = await erol1.obtener(message.guild.id)


  if(usuario.roles.cache.has(rol)) return message.channel.send("Ya estás registrado.")
if(usuario.roles.cache.has(rol1)) return message.channel.send("Ya estás registrado.")


usuario.roles.add("929954227097337917")
usuario.roles.add("935030427687714816")
message.channel.send(`**Registro completado.** `)




}
}