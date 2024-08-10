const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');
const ms = require('ms');
const db = require('megadb');
const muterol = new db.crearDB('muterol');

module.exports = {
	name: "unmute",
	alias: ["um"],

	async execute(client, message, args) {
		if (!message.member.hasPermission('MANAGE_CHANNELS'))
			return message.channel.send(
				'No tienes permisospara ejecutar este comando nesecitas el permiso `MANAGE_CHANNELS`'
			); //si el miembro no tiene permisos retorna

		if (!message.guild.me.hasPermission('MANAGE_ROLES'))
			return message.channel.send(
				'No tengo permisos para ejecutar este comando nesecito los permisos `MANAGE_ROLES`'
			); //si el bot no tiene permisos retorna

		//si no se ah establecido el rol retorna
		let mencionado = message.mentions.members.first();
		if (!mencionado)return message.channel.send(
				'Menciona al usuario.'
			);

	 //si  no menciona la razon retorna

		  let rol = await muterol.obtener(message.guild.id)

		if(!mencionado.roles.cache.has("930201316188377139"))return message.channel.send("Este miembro no esta muteado")//revisamos si el miembro tiene 

	mencionado.roles.remove("930201316188377139")
	
	const embed = new Discord.MessageEmbed()
	.setTitle("hola", "hola")

  message.channel.send(
			`El miembro ${mencionado} fue desmuteado.`
		); //mandamos mensaje de confirmacion
message.delete()
	}
}; //cerramos
//ultima parte de los otros 2 codigos en mi perfil
