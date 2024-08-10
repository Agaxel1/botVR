module.exports = {
	name: 'pacman',
	alias: [],

	async execute(client, message, args) {
		const pacman = require('pacman-djs');
		let pts = ['🍓', '🍇', '🍒', '🛖', '🪙'];
		let randomPts = pts[Math.floor(Math.random() * pts.length)];
		let mapa = [
			'▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣',
			'▣▩▩▩▩▩▩▩▩▩▩▩▩▩▩▩▩▩▩▩▩▩▣',
			'▣▣▩▩◇◇◇▩▩▩▩ᗣ▩▩▩▩◇◇◇▩▩▩▣',
			'▣▩▩▩▣▣▣▣▩▩▣▩▩▣▩▣▣▣▩▩▩▩▣',
			'▣▩▩▩▣▩▩◇▩▣▣▣▩▩▩▩▣ᗣ▩▩▩▩▣',
			'▣▩▩▩▩▩▣▣▩▩▣▩▩▣▣▩▩▩▩▩▩▩▣',
			'▣▣▩▩▩▩ᗣ▩▩▩▩▩▩▩ᗣ▩▩▩▩▩◇▩▣',
			'▣◇▩▩▩▩▩▩▩▩▩▩▩▩▩▩▩▩▩▩◇▩▣',
			'▣◇▩▩▩▩▣▣▩▩▣▩▩▣▣▩▩▩▩▩▩▩▣',
			'▣▩▩▩▣▩▩▩▩▣▣▣▩▩▩▩▣▩▩▩▩▩▣',
			'▣▩▩▩▣▣◇▩▩▩▣▩▩▩▩▩◇▣▣▩▩▩▣',
			'▣▣▩▩◇◇◇▣▩▩ᗧ▩▩▩▩▣◇◇◇▩▩▩▣',
			'▣▩▩▩▩▩▩▩▩▩▩▩▩▩▩▩▩▩▩▩▩▩▣',
			'▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣▣'
		];
		let juego = new pacman.PacGame(mapa, 3, {
			win_text: `Ganaste ${message.member.nickname || message.author.username} felicitaciones.`,
			to_lose_text:
				`Has perdido ${message.member.nickname || message.author.username}, más suerte para la próxima`,
			time_out_text:
				`Tardaste mucho ${message.member.nickname || message.author.username}, ponte pilas.`,
			coin_points: 164,
			coin_text: randomPts,
			time_text: '⌛'
		});
		juego.start_game(message);
		juego.on('end', (type, monedas, tiempo) => {
			if (type == 'player') {
				message.channel.send(
					`Aplaudan a **${
						message.author.username
					}** el cual ganó con \'${monedas} ${randomPts}\'`
				);
			}
			if (type == 'error') {
				message.channel.send(`Hubo un error, usa el comando de nuevo.`);
			}
		});
	}
};
