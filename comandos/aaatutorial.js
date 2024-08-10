const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');

module.exports = {
	name: 'ta',
	alias: [],

	execute(client, message, args) {


		const embed = new Discord.MessageEmbed()

			.setTitle("Tutoriales")
			.setDescription("• Sistema fotos: [Ver](https://www.youtube.com/watch?v=5triKijp5SQ)\n\n• Sistema de inventario: [Ver](https://www.youtube.com/watch?v=yXokaxolOLY)\n\n• Sistema de salud: [Ver](https://youtu.be/8ItJbYXrpHw)\n\n• Sistema de mochila: [Ver](https://youtu.be/0u9-F0YaTxc)\n\n• Tutorial mecanico: [Ver](https://youtu.be/j8DnnzKKhuM)\n\n• Sistema de accesorios: [Ver](https://youtu.be/V7wfKWJ_X3Q)\n\n• Tutorial de telefonos: [Ver](https://youtu.be/35mLryxfqsw)\n\n• Sistema de amoblado en casas: [Ver](https://www.youtube.com/watch?v=bkKYAiQemI8)\n\n• Sitema de necesidades: [Ver](https://youtu.be/ACm_sBdS3Vs)\n\n• Sistema de impuestos: [Ver](https://www.youtube.com/watch?v=o6ucUU8cbbQ)\n\n• Como rolear: [Ver](https://www.youtube.com/watch?v=-MKei4bt-5I&t=356s)\n\n• Tutorial para colocar música: [Ver](https://youtu.be/bWPL87lzsdc?si=zj3URjEnyFc0E1ys)\n\n• Como llevar necesidades: [Ver](https://www.youtube.com/watch?v=5Ksm10PvtsA&list=PLK-HiJNITCdSElBfSExM2oT60gam9P_g_)\n\n• Como verificarse: [Ver](https://youtu.be/Ja1ZPS4Eg_M?si=-vCS8I3Zw0X7y9lP)\n\n• Cómo ganar puntos rol: [Ver](https://youtu.be/sFce5fhXtgc?si=vkv6HwPIhwcDkuWN)")

			.setFooter('Vida rol - La mejor calidad de rol.', 'https://images-ext-1.discordapp.net/external/wewASGFopiIhqT1c4w5S8BHmwQfOj04tekEhMMobeFA/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/1195425558151045140/54c57ccfe0c3fee1f896d86c310b043b.webp?format=webp&width=662&height=662')
			.setThumbnail('https://media.discordapp.net/attachments/1045881026385293353/1195133150402191400/VidaRolLarge.png?ex=65b2e17b&is=65a06c7b&hm=27d1adf025cdbd8dd4f84e768dd30a9cacbf1cc30f1d6ccf481c2bc070416c65&=&format=webp&quality=lossless&width=211&height=68')
			.setColor("#00FFF5")

			.setImage("https://media1.tenor.com/images/d84a50cd18054ffdde14a442b12126ed/tenor.gif?itemid=26395380")
.setFooter('Vida Rol - Compras', 'https://i.postimg.cc/pXHF5Mbp/Logo-Oficial-1.png')
              .setThumbnail('https://i.postimg.cc/BZm1Rvf8/Vida-Rol-Large.png');
		message.channel.send(embed);
	}
};