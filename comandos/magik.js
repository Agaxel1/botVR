const fetch = require('node-fetch');
const dc = require('discord.js');
require('discord-reply');


module.exports = {
	name: 'magik',
async execute(client, message, args) {
		let useio = message.mentions.users.first() || message.author;
		let imgo = useio.displayAvatarURL({ size: 2048, format: 'jpg' });
		console.log(imgo);
		message.lineReplyNoMention('Espera unos segundos');

		fetch(
			`https://nekobot.xyz/api/imagegen?type=magik&image=${imgo}&intensity=2`
		)
			.then(res => res.json())
			.then(data => {
				let emb = new dc.MessageEmbed()
					.setColor('RANDOM')
					.setImage(`${data.message}`)
					.setFooter(`Consultado por: ${message.author.tag} Magik`);
				message.channel.send(emb);
			});
	}
};
