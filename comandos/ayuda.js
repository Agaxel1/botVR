const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');
const db = require('megadb');
const disbut = require('discord-buttons');

module.exports = {
	name: 'ayuda', //Aquí ponemos el nombre del comando
	alias: ['help'], //Aquí un alias, esto será como un segundo nombre del comando, si no quieren ponerle alias tenéis que quitarle las " " y dejarlo así: alias: [],

	async execute(client, message, args) {
		let prefix = '!'; //Constamos el prefijo

		if (!message.content.startsWith(prefix)) return; //Si no hay prefijo que no haga nada

		let btn = new disbut.MessageButton(); //Definimos MessageButton como lo dice en los docs

		let principal = new disbut.MessageButton() //Creamos los botones
			.setLabel('Principal') //Nombre que saldrá en el boton
			.setID('principal') //Id con la que identificaremos el botón
			.setStyle('blurple') //Color del botón
			.setEmoji('🌟'); //El emoji que querais, si no quereis emoji eliminais el setEmoji

		let moderacion = new disbut.MessageButton()
			.setLabel('Moderación')
			.setID('moderacion')
			.setStyle('blurple')
			.setEmoji('⚡');

		let config = new disbut.MessageButton()
			.setLabel('Utilidad')
			.setID('config')
			.setStyle('blurple')
			.setEmoji('🌙');

		let economia = new disbut.MessageButton()
			.setLabel('Estado')
			.setID('economia')
			.setStyle('blurple')
			.setEmoji('🌠');

		let random = new disbut.MessageButton()
			.setLabel('Diversión')
			.setID('random')
			.setStyle('blurple')
			.setEmoji('🎰');

		let row = new disbut.MessageActionRow() //Hacemos los action row de cada embed
			.addComponent(principal)
			.addComponent(moderacion)
			.addComponent(config)
			.addComponent(economia)
			.addComponent(random);

		let prin = new disbut.MessageActionRow()
			.addComponent(moderacion)
			.addComponent(config)
			.addComponent(economia)
			.addComponent(random);

		let mod = new disbut.MessageActionRow()
			.addComponent(principal)
			.addComponent(config)
			.addComponent(economia)
			.addComponent(random);

		let conf = new disbut.MessageActionRow()
			.addComponent(principal)
			.addComponent(moderacion)
			.addComponent(economia)
			.addComponent(random);

		let eco = new disbut.MessageActionRow()
			.addComponent(principal)
			.addComponent(moderacion)
			.addComponent(config)
			.addComponent(random);

		let ran = new disbut.MessageActionRow()
			.addComponent(principal)
			.addComponent(moderacion)
			.addComponent(config)
			.addComponent(economia);

		const embedprincipal = new Discord.MessageEmbed() //Aqui hacemos los embeds de ayuda, como los queráis vosotros

			.setTitle('Bienvenido al apartado de ayuda!')
			.setDescription(
				`Pulsa el botón **Principal** para volver a la página principal.\n\nPulsa el botón **Moderación**  para ir al apartado de moderación.\n\nPulsa el botón **Utilidad** para ir al apartado de utilidad.\n\nPulsa el botón **Diversión** para ir al apartado de diversión.`)
			.setFooter('Espero que te sirva de ayuda!')
			.setColor('RED')
			.setFooter(`\n\nEste bot ha sido creado por @Juan Rincón#3008`)
			.setTimestamp()
			.setImage("https://media1.tenor.com/images/340b7c0a114f0827b8eeffc610944431/tenor.gif?itemid=26497201");

		const embedmoderacion = new Discord.MessageEmbed()

			.setTitle('Apartado de moderación')
			.setDescription(
				'**!apodo**\nCon este comando podras cambiar el apodo de alguien del servidor..\n\n**!ban**\nEs para banear un usuario.\n\n**!clear**\nSirve para borrar mensajes.\n\n**!kick**\nEs para expulsar un usuario.\n\n**!nuke**\nEste comando elimina un todos los mensajes del canal.\n\n**!muterol**\nEste comando sirve para colocar  el rol de muteado.\n\n**!mute**\nSirve para silenciar a un usuario, su uso es [Nombre del usuario] [Duracion del mute] [Razón del mute]\n\n**!hackban**\n Sirve para banear un usuario por ID.\n\n**!slowmode !time**\nEs para establecer el modo lento en un canal.\n\n**!canals**\nPara establecer el canal de sugerencias.\n\n**!unmute**\nSirve para desmutear a un usuario.\n\n**!rename (Nombre)**\nCambias el nombre de un ticket/canal.\n\n**!close**\nCierras un ticket/canal.\n\n**!ls (Usuario)**\nMandas a ls a un usuario.\n\n**!coins (Coins)**\nConvierte dinero en coins y viceversa.\n\n**!unjail (Usuario)**\nBuscas la moneda de un país.'
			)
			.setColor('BLUE')
			.setTimestamp()
			.setImage("https://media1.tenor.com/images/340b7c0a114f0827b8eeffc610944431/tenor.gif?itemid=26497201");

		const embedeconomia = new Discord.MessageEmbed()

			.setTitle('Apartado de Estado del servidor')
			.setDescription(
				'**!invitacion**\nPara ver la invitación del servidor de discord.\n\n**!web**\nPuedes ver la web del servidor\n\n**!estado**\nPuedes ver los jugadores conectados en el servidor.\n\n**!stats (Usuario) **\nPuedes ver las estadisticas del usuario.\n\n**!darpuntosrol (Usuario) (Cantidad)**\nPuedes darle puntos de rol a un usuario.\n\n**!darcoins (Usuario) (Cantidad)**\nPuedes darle coins a un usuario.\n\n**!dardinero (Usuario) (Cantidad)**\nPuedes darle dinero a un usuario.\n\n**!addcar (Usuario) (ID del coche) (Matricula) (Precio) **\nPuedes darle un coche a un usuario.\n\n**!tban (Usuario) (Tiempo) (Nombre del que lo hace) (Razón)**\nPuedes banear a un usuario.\n\n**!jail (Usuario) (Tiempo)**\nPuedes jailear a un usuario.\n\n**!unjail (Usuario) **\nPuedes unjailear a un usuario.\n\n**!warn (Usuario) (Cantidad)**\nPuedes advertirle a un usuario.\n\n**!daradmin (Usuario) (Nivel) (Contraseña)**\nPuedes darle admin a un usuario.\n\n**!inventario (mostrar/eliminar) (Usuario)**\nPuedes ver el inventario y eliminar un objeto de el.\n\n**!cambiarcontraseña (Usuario) (Nueva contraseña)**\nPuedes cambiar la contraseña de un usuario.\n\n**!vehiculo (Vehiculo))**\nPuedes buscar un vehículo por su nombre y te dará el ID.\n\n**!ID (ID)**\nPuedes ver el nombre de un usuario por su ID.\n\n**!givecasco (Usuario)**\nLe dropeas un casco a un usuario.\n\n**!comprobarinfo (Usuario)**\nComprueba la información de un usuario.\n\n**!facciones**\nSe ven todas las facciones del servidor.\n\n**!lmenu (ID)**\nSe ve la información de una facción en particular (Integrantes / Warn).\n\n**!demote (Usuario)**\nExpulsas a un usuario de la facción a la que pertenece.\n\n**!makeleader (Usuario) (ID Facción)**\nLe das líder de una facción a un usuario.\n\n**!admins **\nSe ven los administradores online.\n\n**!giveowner (Tipo de negocio) (Usuario) (Negocio)**\nSe pueden dar negocios a los usuarios.\n\n**!negocios (Tipo de negocio)**\nSe ven los negocios, los propietarios y los impuestos.\n\n**!bhouse (ID casa)**\nSe ve las casas en caso de tener propietario e impuestos.\n\n**!house (Usuario)**\nSe ve las casas del usuario con impuestos.\n\n**!carros (Usuario)**\nSe ve los carros del usuario con impuestos.\n\n**!adminbot (ID)**\nAgregar un administrador al bot.\n\n**!viewadminbot**\nVer los administradores permitidos en el bot.\n\n**!impuestos (Usuario) (Tipo de negocio) (Nùmero de negocio) (Día)**\nPuedes pagar con coins los impuestos de un usuario.\n\n**!bimpuestos (Usuario)**\nPuedes visualizar las propiedades perdidas por impuestos o vendidas al estado.\n\n**!restaurarcar (Nombre_Apellido) (ID_Modelo) (Dias Restantes) (Placa)**\nPuedes restaurar un auto eliminado.\n\n**!bitemid (ID)**\nPuedes buscar un item por ID.\n\n**!bitemname (Nombre)**\nBuscas in item por su nombre.\n\n**!spenal (Usuario)**\nSacas a un usuario que este en el penal.\n\n**!convert (Valor) (Moneda inicial) (Moneda a convertir)**\nFunciona como conversor de moneda, ejemplo: !convert 5 USD COP.\n\n**!moneda (País)**\nBuscas la moneda de un país.\n\n**!bcorreo (Correo)**\nBuscas el correo de un usuario.\n\n**!buser (Usuario)**\nBuscas a los usuarios con un nombre en la DB.\n\n**!bip (IP)**\nBuscas la ip de un usuario.\n\n**!avip (Dinero)**\nSe ve el precio para poner de un auto.\n\n**!sigla (Sigla)**\nTe da la definición de un concepto de rol.\n\n**!ls (Usuario)**\nMandas a un usuario a los Santos.\n\n**!coins (Coins/$USD)**\nConviertes coins en dinero o viceversa.\n\n**!unjail (Usuario)**\nSacas de jail a un usuario.\n\n**!parmas**\nSe ve el precio de armas en coins del servidor.\n\n**!csancion**\nCalcula el tiempo de sanción con su tipo, 1, 2 o 3.\n\n**!sancion**\nMira el tiempo de cada sigla aparte, iguales tipos.\n\n**!waradmin (Usuario) (Cantidad)**\nSe da un warn administrativo a un admin.\n\n**!warnfacc (ID FACC) (Cantidad)**\nSe da un warn faccionario.\n\n**!pkf Nombre_Apellido**\nSe da pkf a un usuario.\n\n**!unpkf Nombre_Apellido**\nSe quita el PKF a un usuario..\n\n**!encender/!on**\nPrende el servidor.\n\n**!apagar/!off**\nApaga el servidor.\n\n**!reset/!reiniciar**\nReinicia el servidor.\n\n**!viewwarnfacc**\nSe ven los warns faccionarios.'
			)
			.setColor('GREEN')
			.setTimestamp()
			.setImage("https://media1.tenor.com/images/340b7c0a114f0827b8eeffc610944431/tenor.gif?itemid=26497201");

		const embedrandom = new Discord.MessageEmbed()

			.setTitle('Apartado Diversión')
			.setDescription(
				'**!magik**\nSirve para ver una persona con magik.\n\n**!buscaminas**\nJuega buscaminas.\n\n**!tictactoe**\nJuega tres en ralla, contra la maquina o contra un usuario.\n\n**!pacman**\nJuega pacman.\n\n**!snake**\nJuega a snake.\n\n**!ahorcado**\nJuega ahorcado con otra persona\n\n**!youtube**\nBusca videos en Youtube.'
			)
			.setColor('PURPLE')
			.setTimestamp()
			.setImage("https://media1.tenor.com/images/340b7c0a114f0827b8eeffc610944431/tenor.gif?itemid=26497201");

		const embedconfig = new Discord.MessageEmbed()

			.setTitle('Apartado Utilidad')
			.setDescription(
				'**!avatar**\nUsuario al que deseas ver su avatar\n\n**!userinfo**\nUsuario al que deseas ver su información\n\n**!say**\nPuedes escribir cualquier cosa y el bot lo repetira\n\n**!serverinfo**\nAqui popdrás ver una pequeña informacion del servidor\n\n!**rbot**\nCon este comando le podras enviar un reporte del bot.\n\n**!sugerencia**\ncolocalo para enviar una sugerencia al servidor.\n\n**!embed**\nPara enviar un embed, para separar argumentos pon >>.\n\n**!servericon**\nPara visualizar el logo del servidor.\n\n**!botinfo**\nPara ver la información del bot.\n\n**!clima**\nSirve para ver el clima de determinada ubicación.\n\n**!ping**\nPara pedir el ping del servidor.\n\n**!calculadora**\nPara abrir una calculadora y realizar operaciones.\n\n**!play**\nPara escuchar una canción.\n\n**!stop**\nPara parar la lista de reproduccion.\n\n**!nowplaying**\nVisualiza lo que se está reporduciendo actualmente.\n\n**!skip**\nPara saltar la canción que se está reporduciendo.\n\n**!queue**\nVisualiza la lista de reproducción completa.\n\n** +volumen**\nCambia el volumen del sonido, de 1 a 100.\n\n**!pause**\nPara pausar la canción que está sonando.\n\n**!resume**\nPara resumir la canción pausada.\n\n**!remove**\nPara quitar una canción de la lista de reproducción.\n\n**!lyrics**\nPara visualizar la letra de la canción.\n\n**!decir**\nSirve para decir algo con el bot en un chat de voz.'
			)
			.setColor('ROSE')
			.setTimestamp()
			.setImage("https://media1.tenor.com/images/340b7c0a114f0827b8eeffc610944431/tenor.gif?itemid=26497201");
			

		const sendMenu = await message.channel.send(embedprincipal, prin); //Constamos el msj, en mi caso lo definí como sendMenu, podeis definirlo como querais, es igual que exportar el msg pero esto se usa para el collector

		const filter = button => button.clicker.user.id === message.author.id; //Constamos el filtro, quiere decir que solo de respuesta al autor del mensaje
		let collector = sendMenu.createButtonCollector(filter, { time: 60000 }); //Ponemos el tiempo que durará el msj (60 segundos) en mi caso

		collector.on('collect', b => {
			//Empezamos el collector

			if (b.id === 'principal') {
				sendMenu.edit(embedprincipal, prin); //Aqui decimos que si se ha dado click al boton (x) edite el embed primerizo por (embed x, component)
			}
			if (b.id === 'moderacion') {
				sendMenu.edit(embedmoderacion, mod);
			}
			if (b.id === 'config') {
				sendMenu.edit(embedconfig, conf);
			}
			if (b.id === 'economia') {
				sendMenu.edit(embedeconomia, eco);
			}
			if (b.id === 'random') {
				sendMenu.edit({ embed: embedrandom, component: ran });
			}
			b.reply.defer();
		});

		collector.on('end', b => {
			sendMenu.edit(
				'El comando de ayuda ha expirado, para volver a ver los comandos pidelo de nuevo'
			); //Aqui hacemos que cuando se acabe el tiempo, edite el msj original para avisar al usuario de que el tiempo terminó
			b.delete(random, economia, config, principal, moderacion);
		});
	}
};
