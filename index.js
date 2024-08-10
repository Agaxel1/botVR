const Discord = require('discord.js');
const client = new Discord.Client();
const { MessageEmbed, Collection, Guild } = require('discord.js');
const AsciiTable = require('ascii-table');
const gamedig = require("gamedig");
const mysql = require('mysql');
const moment = require('moment-timezone');
const hostHost = 'mc.papu.host';
const userHost = 'u1275_oX32qKGkak';
const passHost = 'SBrSI7!EdIr1@oz=!vtLjiKX';
const bdHost = 's1275_vida_roleplay';
const axios = require('axios');

// Registrar eventos de eliminación de mensajes
client.on('messageDelete', async deletedMessage => {
  // Verificar si el mensaje eliminado no es de un bot
  if (deletedMessage.author.bot) return;

  // Verificar si el mensaje eliminado es un comando, excepto el comando "!ayuda"
  if (deletedMessage.content.startsWith('!') && deletedMessage.content !== '!ayuda') {
    const commandLogEmbed = new Discord.MessageEmbed()
      .setTitle('Comando Eliminado')
      .setColor('#ff0000')
      .setDescription(`El siguiente mensaje fue eliminado porque parece ser un comando:\n\n${deletedMessage.content}`)
      .addField('Autor', `${deletedMessage.author.tag} (${deletedMessage.author.username})`, true)
      .addField('Canal', deletedMessage.channel.toString(), true)
      .addField('ID de Usuario', deletedMessage.author.id)
      .addField('ID del Mensaje', deletedMessage.id)
      .setFooter(`Registrado por ${client.user.tag}`);

    const commandLogChannel = client.channels.cache.get('1237594556266975303'); // ID del canal para comandos
    if (commandLogChannel) {
      commandLogChannel.send(commandLogEmbed);
    } else {
      console.error(`El canal de registro para comandos con ID 1237594556266975303 no fue encontrado.`);
    }
    return;
  }

  // Formatear el nombre de usuario y su discriminador
  const authorTag = `${deletedMessage.author.tag} (${deletedMessage.author.username})`;

  // Formatear el nombre del canal
  const channelLink = deletedMessage.channel.toString();

  // Obtener la URL de la foto del usuario
  const userAvatarURL = deletedMessage.author.displayAvatarURL({ format: 'png', dynamic: true, size: 256 });

  // Crear el mensaje de registro
  const logEmbed = new Discord.MessageEmbed()
    .setTitle('Mensaje Eliminado')
    .setColor('#ff0000')
    .setAuthor(authorTag, userAvatarURL)
    .addField('Canal', channelLink, true)
    .addField('Contenido del Mensaje', deletedMessage.content || 'No hay contenido del mensaje')
    .addField('ID de Usuario', deletedMessage.author.id)
    .addField('ID del Mensaje', deletedMessage.id)
    .setFooter(`Registrado por ${client.user.tag}`);

  // Verificar si el mensaje eliminado tiene archivos adjuntos
  if (deletedMessage.attachments.size > 0) {
    const attachment = deletedMessage.attachments.first();
    logEmbed.addField('Archivo Adjunto', attachment.url);
  }

  // Enviar el mensaje al canal de registro correspondiente
  let logChannelId;
  if (deletedMessage.guild.id === '929898747155054683') { // Servidor 1
    logChannelId = '1244265472111804416'; // Canal de registro para el servidor 1
  } else if (deletedMessage.guild.id === '1055804678857826304') { // Servidor 2
    logChannelId = '1244274968519376907'; // Canal de registro para el servidor 2
  } else {
    console.error(`No se encontró un canal de registro para el servidor con ID ${deletedMessage.guild.id}`);
    return;
  }

  const logChannel = client.channels.cache.get(logChannelId);
  if (logChannel) {
    logChannel.send(logEmbed);
  } else {
    console.error(`El canal de registro con ID ${logChannelId} no fue encontrado.`);
  }
});


// Registrar eventos de edición de mensajes
client.on('messageUpdate', async (oldMessage, newMessage) => {
  // Verificar si el mensaje editado no es de un bot
  if (newMessage.author.bot) return;

  // Formatear el nombre de usuario y su discriminador
  const authorTag = `${newMessage.author.tag} (${newMessage.author.username})`;

  // Formatear el nombre del canal con el enlace directo al canal
  const channelLink = newMessage.channel.toString();

  // Obtener la URL de la foto del usuario
  const userAvatarURL = newMessage.author.displayAvatarURL({ format: 'png', dynamic: true, size: 256 });

  // Crear el mensaje de registro
  const logEmbed = new Discord.MessageEmbed()
    .setTitle('Mensaje Editado')
    .setColor('#ffff00')
    .setAuthor(authorTag, userAvatarURL)
    .addField('Canal', channelLink, true)
    .addField('Contenido Antes', oldMessage.content || 'No hay contenido anterior del mensaje')
    .addField('Contenido Después', newMessage.content || 'No hay contenido del mensaje')
    .addField('ID de Usuario', newMessage.author.id)
    .addField('ID del Mensaje', newMessage.id)
    .setFooter(`Registrado por ${client.user.tag}`);

  // Verificar si el mensaje editado tiene archivos adjuntos
  if (newMessage.attachments.size > 0) {
    const attachment = newMessage.attachments.first();
    logEmbed.addField('Archivo Adjunto', attachment.url);
  }

  // Enviar el mensaje al canal de registro correspondiente
  let logChannelId;
  if (newMessage.guild.id === '929898747155054683') { // Servidor 1
    logChannelId = '1244265472111804416'; // Canal de registro para el servidor 1
  } else if (newMessage.guild.id === '1055804678857826304') { // Servidor 2
    logChannelId = '1244274968519376907'; // Canal de registro para el servidor 2
  } else {
    console.error(`No se encontró un canal de registro para el servidor con ID ${newMessage.guild.id}`);
    return;
  }

  const logChannel = newMessage.guild.channels.cache.get(logChannelId);
  if (logChannel) {
    logChannel.send(logEmbed);
  } else {
    console.error(`El canal de registro con ID ${logChannelId} no fue encontrado.`);
  }
});

// Registrar eventos de cambio de estado de voz
client.on('voiceStateUpdate', (oldState, newState) => {
  // Obtener el miembro involucrado
  const member = newState.member;
  if (!member) return; // Si no se encuentra el miembro, no hacer nada

  // Obtener el canal de voz anterior y el nuevo canal de voz
  const oldChannel = oldState.channel;
  const newChannel = newState.channel;

  // Verificar si el miembro entró a un nuevo canal de voz
  if (newChannel && (!oldChannel || oldChannel.id !== newChannel.id)) {
    // Crear el mensaje de registro
    const logEmbed = new Discord.MessageEmbed()
      .setTitle('Usuario entró al canal de voz')
      .setColor('#00ff00')
      .setDescription(`${member.user.tag} (${member.user.username}) ha entrado al canal de voz ${newChannel.name}`)
      .setFooter(`Registrado por ${client.user.tag}`);

    // Enviar el mensaje al canal de registro correspondiente
    let logChannelId;
    if (newState.guild.id === '929898747155054683') { // Servidor 1
      logChannelId = '1244265472111804416'; // Canal de registro para el servidor 1
    } else if (newState.guild.id === '1055804678857826304') { // Servidor 2
      logChannelId = '1244274968519376907'; // Canal de registro para el servidor 2
    } else {
      console.error(`No se encontró un canal de registro para el servidor con ID ${newState.guild.id}`);
      return;
    }

    const logChannel = client.channels.cache.get(logChannelId);
    if (logChannel) {
      logChannel.send(logEmbed);
    } else {
      console.error(`El canal de registro con ID ${logChannelId} no fue encontrado.`);
    }
  }
});

// Manejar eventos de edición de roles
// Registrar cambios de nombre de usuario
client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const oldNickname = oldMember.nickname;
  const newNickname = newMember.nickname;

  // Verificar si ha cambiado el apodo del miembro
  if (oldNickname !== newNickname) {
    const guild = newMember.guild;
    const userAvatarURL = newMember.user.displayAvatarURL({ format: 'png', dynamic: true, size: 256 });
    const authorTag = `${newMember.user.tag} (${newMember.user.username})`;

    // Obtener la entrada del registro de auditoría relacionada con el cambio de apodo
    const auditLogs = await guild.fetchAuditLogs({ type: 'MEMBER_UPDATE' });
    const nicknameUpdateLog = auditLogs.entries.first();

    // Obtener el moderador que realizó el cambio de apodo
    const moderator = nicknameUpdateLog ? nicknameUpdateLog.executor : null;

    // Crear un mensaje de registro para el cambio de apodo
    const logEmbed = new Discord.MessageEmbed()
      .setAuthor(authorTag, userAvatarURL)
      .setColor('#ffff00') // Cambio de color a amarillo para indicar cambio de apodo
      .setDescription(`${newMember.user.tag} (${newMember.user.username}) (${newMember.user.id}) ha cambiado su apodo.`)
      .addField('Apodo anterior', oldNickname ? oldNickname : 'Ninguno')
      .addField('Nuevo apodo', newNickname ? newNickname : 'Ninguno');

    // Mostrar quién editó el apodo
    if (moderator) {
      logEmbed.setFooter(`Editado por ${moderator.tag}`);
    } else {
      logEmbed.setFooter(`Registrado por ${client.user.tag}`);
    }
  
    let logChannelId;
    if (guild.id === '929898747155054683') { // Servidor 1
      logChannelId = '1244265472111804416'; // Canal de registro para el servidor 1
    } else if (guild.id === '1055804678857826304') { // Servidor 2
      logChannelId = '1244274968519376907'; // Canal de registro para el servidor 2
    } else {
      console.error(`No se encontró un canal de registro para el servidor con ID ${guild.id}`);
      return;
    }
  
    const logChannel = client.channels.cache.get(logChannelId);
    if (logChannel) {
      logChannel.send(logEmbed);
    } else {
      console.error(`El canal de registro con ID ${logChannelId} no fue encontrado.`);
    }
  }
});

// Registrar cambios de roles
client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const oldRoles = oldMember.roles.cache;
  const newRoles = newMember.roles.cache;

  const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));
  const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));

  if (removedRoles.size > 0 || addedRoles.size > 0) {
    const guild = newMember.guild;
    const userAvatarURL = newMember.user.displayAvatarURL({ format: 'png', dynamic: true, size: 256 });
    const authorTag = `${newMember.user.tag} (${newMember.user.username})`;
  
    const auditLogs = await guild.fetchAuditLogs({ type: 'MEMBER_ROLE_UPDATE' });
    const roleUpdateLog = auditLogs.entries.first();
  
    const moderator = roleUpdateLog ? roleUpdateLog.executor : null;
  
    const logEmbed = new Discord.MessageEmbed()
      .setAuthor(authorTag, userAvatarURL)
      .setColor('#00ff00')
      .setDescription(`${newMember.user.tag} (${newMember.user.username}) (${newMember.user.id}) ha sido modificados.`);
  
    if (addedRoles.size > 0) {
      logEmbed.addField('Cambios', addedRoles.map(role => `:green_circle: ${role.name}`).join('\n'));
    }
  
    if (removedRoles.size > 0) {
      logEmbed.addField('Cambios', removedRoles.map(role => `:red_circle: ${role.name}`).join('\n'));
    }
  
    if (moderator) {
      logEmbed.setFooter(`Editado por ${moderator.tag}`);
    } else {
      logEmbed.setFooter(`Registrado por ${client.user.tag}`);
    }
  
    let logChannelId;
    if (guild.id === '929898747155054683') { // Servidor 1
      logChannelId = '1244265472111804416'; // Canal de registro para el servidor 1
    } else if (guild.id === '1055804678857826304') { // Servidor 2
      logChannelId = '1244274968519376907'; // Canal de registro para el servidor 2
    } else {
      console.error(`No se encontró un canal de registro para el servidor con ID ${guild.id}`);
      return;
    }
  
    const logChannel = client.channels.cache.get(logChannelId);
    if (logChannel) {
      logChannel.send(logEmbed);
    } else {
      console.error(`El canal de registro con ID ${logChannelId} no fue encontrado.`);
    }
  }
});



require('dotenv').config();

const fs = require('fs');
let { readdirSync } = require('fs');

let prefix = '!';
const disbut = require('discord-buttons');
disbut(client);

/////////////////HANDLER////////////////

client.commands = new Discord.Collection();
const commands = fs
  .readdirSync('./comandos')
  .filter(file => file.endsWith('.js'));

for (const file of commands) {
  const command = require(`./comandos/${file}`);
  client.commands.set(command.name, command);
}

////////////////Presencia///////////////

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  updateServerStatus();
});

async function updateServerStatus() {
  try {
    const serverInfo = await gamedig.query({
      type: 'samp',
      host: '45.126.208.53',
      port: 7777, // Puerto del servidor de SAMP
    });

    const playerCount = serverInfo.players.length;
    client.user.setStatus('idle');
    client.user.setActivity(`${playerCount} jugadores en VR.`, { type: 'WATCHING' });
  } catch (error) {
    console.error('Error al obtener la información del servidor:', error);
  }

  setTimeout(updateServerStatus, 30000); // Actualizar el estado cada 60 segundos (ajusta el intervalo según tus necesidades)
}

////////////////////////////////

client.snipes = new Map();


////////////////Evento Message

client.on('message', message => {
  if (message.author.bot) return;

  // Verificar si el mensaje proviene de un servidor (guild)
  if (!message.guild) {
    // Si el mensaje no proviene de un servidor, ignorarlo y enviar un mensaje de alerta al usuario
    const alertMessage = new Discord.MessageEmbed()
      .setTitle('Alerta')
      .setDescription('Los comandos no pueden ser ejecutados en mensajes privados. Utiliza los comandos en un servidor.')
      .setColor('YELLOW')
      .setFooter(`Estás usando a ${client.user.tag}`)
      .setTimestamp();
    message.author.send(alertMessage);

    return;
  }

  if (!message.content.startsWith(prefix)) return;

  let usuario = message.mentions.members.first() || message.member;
  const args = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();

  let cmd = client.commands.find(
    c => c.name === command || (c.alias && c.alias.includes(command))
  );

  if (cmd) {
    cmd.execute(client, message, args);
  } else {
    const embednoexiste = new Discord.MessageEmbed()
      .setTitle('Comando no encontrado')
      .setDescription(`El comando **${command}** no existe o lo has escrito mal. Si quieres saber los comandos, intenta con ${prefix}ayuda`)
      .setColor('RANDOM')
      .setFooter(`Estás usando a ${client.user.tag}`)
      .setTimestamp();
    message.channel.send(embednoexiste);
  }
});

///////24/7 bot////////


///////////////////
client.on("guildMemberAdd", (member) => { //cada que el bot registre que hay un nuevo mienbro realizara la sigiente funcion

  if (member.guild.id === '929898747155054683') {

    const embed = new Discord.MessageEmbed()
      .setTitle('Bienvenido a Vida rol')
      .setDescription(`**${member.user.username}** Se ha unido`)
      .setFooter("Gracias por unirte")
      .setTimestamp()
      .setImage("https://media1.tenor.com/images/340b7c0a114f0827b8eeffc610944431/tenor.gif?itemid=26497201")
      .setColor("RANDOM")
    client.channels.cache.get('930577635787018270').send(embed)
  }
})

///////////////BIENVENIDAS AL MD (AXEL NO LAS CAGUES OTRA VEZ POR FAVOR)///////////////////////

client.on("guildMemberAdd", (member) => {
  if (member.guild.id === '929898747155054683') {
    const welcomeEmbed = new Discord.MessageEmbed()
      .setTitle('¡Bienvenido a Vida rol!')
      .setDescription(`**${member.user.username}**, bienvenido a Vida rol, es un placer poder contar contigo en está gran comunidad, a continuación encontras información relevante para el ingreso al servidor.\n\n1. ¿Tiene problemas con el launcher? Puede sacar un ticket en https://discord.com/channels/929898747155054683/1244213835380949083 y cong gusto lo atenderemos.\n\n2. Para descargar el launcher en nuestra pagina web: https://vida-roleplay.com/ a parte en ella encontrará algunas cosas relevantes para jugar.\n\n3. Si necesita aprender a jugar/rolear ofrecemos clases de rol completamente gratiutas en https://discord.com/channels/929898747155054683/1244213835380949083\n\n4. Para verificarse en nuestro discord deberá seguir una serie de pasos explicados en https://discord.com/channels/929898747155054683/1244206504895057960, si necesita ayuda adicional puede ver este video: [VER](https://youtu.be/Ja1ZPS4Eg_M?si=-vCS8I3Zw0X7y9lP)\n\n5. Si desea contribuir/apoyar el servidor puede comprar coins mediante el discord oficial en este canal https://discord.com/channels/929898747155054683/1244208519197102112 cualquier duda será atendida por ahí.\n\n6. Para dudas generales del servidor puede encontrar nuestros tutoriales en https://discord.com/channels/929898747155054683/1244209767598002177\n\n7. Gracias por unirte a uno de los mejores servidores en SAMP, recuerda que tambien puedes contactar con nosotros mediante /ask o /duda dentro del servidor.`)
      .setFooter('Vida rol - La mejor calidad de rol.', 'https://images-ext-1.discordapp.net/external/wewASGFopiIhqT1c4w5S8BHmwQfOj04tekEhMMobeFA/%3Fsize%3D1024/https/cdn.discordapp.com/avatars/1195425558151045140/54c57ccfe0c3fee1f896d86c310b043b.webp?format=webp&width=662&height=662')
      .setTimestamp()
      .setThumbnail('https://media.discordapp.net/attachments/1045881026385293353/1195133150402191400/VidaRolLarge.png?ex=65b2e17b&is=65a06c7b&hm=27d1adf025cdbd8dd4f84e768dd30a9cacbf1cc30f1d6ccf481c2bc070416c65&=&format=webp&quality=lossless&width=211&height=68')
      .setImage("https://media1.tenor.com/images/340b7c0a114f0827b8eeffc610944431/tenor.gif?itemid=26497201")
      .setColor("RANDOM");

    member.send(welcomeEmbed)
      .then(() => console.log(`Mensaje de bienvenida enviado a ${member.user.username}`))
      .catch(error => console.error(`Error al enviar mensaje de bienvenida a ${member.user.username}:`, error));
  }
});

///////////////////
const channelId = '1244320117026717767'; // Reemplaza ID_DEL_CANAL_DE_VOZ con el ID del canal de voz
const onlineEmoji = '🟢';
const offlineEmoji = '🔴';

let previousStatus = '';

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  connectToServer();
});

async function connectToServer() {
  try {
    const serverInfo = await gamedig.query({
      type: 'samp',
      host: '45.126.208.53',
      port: 7777, // Puerto del servidor de SAMP
    });

    const playerCount = serverInfo.players.length;
    const statusEmoji = serverInfo.players.length > 0 ? onlineEmoji : offlineEmoji;
    const currentStatus = `${playerCount} ${statusEmoji}`;

    if (currentStatus !== previousStatus) {
      const guild = client.guilds.cache.get('929898747155054683'); // Reemplaza ID_DEL_SERVIDOR con el ID de tu servidor
      if (!guild) {
        console.error('No se encontró el servidor. Verifica el ID del servidor.');
        return;
      }

      const channel = guild.channels.cache.get(channelId);
      if (!channel || !(channel instanceof Discord.VoiceChannel)) {
        console.error(`No se encontró el canal de voz con el ID ${channelId}`);
        return;
      }

      const newName = `Jugando ahora: ${currentStatus}`;
      await channel.setName(newName, 'Actualización del servidor SAMP');
      console.log('Conexión al servidor exitosa. Canal actualizado.');

      previousStatus = currentStatus;
    } else {
      console.log('No hay cambios en la información del servidor. No se realizarán actualizaciones.');
    }

  } catch (error) {
    console.error('Error al obtener la información del servidor:', error);
  } finally {
    setTimeout(connectToServer, 10000); // Realizar la conexión cada 30 segundos
  }
}

client.on('message', message => {
  if (message.author.bot) return;

  // Expresión regular para buscar patrones relacionados con métodos de pago
  const regex = /(métodos|metodos)?\s*de\s*pago(?:\s*tienen)?|(dónde|donde)\s*puedo\spagar/i;

  if (regex.test(message.content)) {
    // Mensaje con información sobre métodos de pago
    const infoMetodosPago = new Discord.MessageEmbed()
      .setTitle('Métodos de Pago')
      .addField('**Ecuador**', 'Pichincha: 2205091503')
      .addField('**Colombia**', 'Nequi/Daviplata')
      .addField('**Chile**', 'RUT 22.693.159-7')
      .addField('**Paypal**', 'vida.rol.oficial@gmail.com')
      .addField('**Binance**', 'aroman_@outlook.com')
      .addField('**Argentina**', '(Uala-MercadoPago)\nCVU 0000003100074241139490')
      .addField('**Perú**', 'Yape o Plin Plin');

    message.channel.send(infoMetodosPago);
  }
});

client.on('message', message => {
  if (message.author.bot) return;

  // Expresión regular para buscar patrones relacionados con la pregunta o intención de comprar autos VIP
  const regexAutosVIP = /(?:\b(comprar|compran)\b.*\b(autos|coches)\b.*\b(VIP)\b)/i;
  const matchAutosVIP = message.content.match(regexAutosVIP);

  if (matchAutosVIP) {
    // Respuesta específica para la pregunta sobre autos VIP
    message.channel.send('Los coches VIP están en el canal https://discord.com/channels/929898747155054683/1054949161331597354 y se pueden comprar abriendo un ticket en https://discord.com/channels/929898747155054683/1195809895140835459');
    return; // No procesar enlaces si se trata de una pregunta sobre autos VIP
  }

  // Verificar si el autor del mensaje es un administrador
  if (message.member && message.member.hasPermission('ADMINISTRATOR')) {
    // Si es un administrador, no borrar enlaces
    return;
  }

  // Eliminar todos los enlaces excepto los de YouTube
  const regexLinks = /(https?:\/\/[^\s]+)/gi;
  const links = message.content.match(regexLinks);


  if (links) {

    const noAllowedLinks = [
      'telegra.ph',
      'needgirls',
      'hottestnudes',
      'onlyfans',
      'e-womans'
      // Agrega más enlaces no permitidos según sea necesario
    ];

    const allowedLinks = links.filter(link =>
      link.includes('youtube.com') ||
      link.includes('youtu.be') ||
      link.includes('https://vida-roleplay.com/') ||
      link.includes('discord.com/channels/') ||
      link.includes('discordapp.com/channels/') ||
      link.includes('https://tenor.com/view') ||
      link.includes('https://streamable.com') ||
      link.includes('twitch.tv') ||
      link.includes('trovo.live')
    );

    // Filtrar enlaces no permitidos
    const noAllowed = links.filter(link =>
      !allowedLinks.includes(link) && noAllowedLinks.some(noAllowedLink => link.includes(noAllowedLink))
    );

    // Borrar todos los enlaces en el mensaje

    // Si hay enlaces permitidos, puedes hacer algo con ellos aquí
    // Resto del código
    if (allowedLinks.length > 0 && noAllowed.length === 0) {
      // Haz algo con los enlaces permitidos aquí si es necesario
    } else {
      message.delete();
      message.channel.send(`${message.author}, no se permiten enlaces externos o sospechosos.`);
    }
  }
});




client.on('message', message => {
  if (message.author.bot) return;

  // Expresión regular para buscar patrones relacionados con la pregunta o intención de comprar coins
  const regex = /(?:cuánto\s*(es|valen)?\s*(el)?\s*(precio|valor)?\s*(de|de (los|las)?)?\s*(\d+)\s*coins)|(?:cuánto\s*(sería)?\s*(\d+)\s*coins)|(?:precio\s*(de)?\s*(\d+)\s*coins)|(?:valor\s*(de)?\s*(\d+)\s*coins)|(?:comprar\s*(\d+)\s*coins)|(?:quiero\s*comprar\s*coins)|(?:a\s*cuánto\s*equivaldría\s*(en)?\s*dólares\s*(\d+)\s*coins)|(?:cuánto\s*(valen)?\s*(los|las)?\s*coins)|(?:cuanto\s*(valen)?\s*(los|las)?\s*coins)|(?:\s*(\d+)\s*coins\s*cuánto\s*(me)?\s*sale)|(?:\s*(\d+)\s*coins\s*cuanto\s*(me)?\s*sale)/i;
  const match = message.content.match(regex);

  if (match) {
    if (match[14] || match[15] || match[18] || match[19] || match[20]) {
      // Respuesta específica para la pregunta "quiero comprar coins"
      const cantidadCoins = 100; // Ajusta la cantidad según tus necesidades
      const precioTotal = cantidadCoins * 0.03; // Suponiendo que cada coin tiene un valor de $0.03

      message.channel.send(`Puedes comprar ${cantidadCoins} coins por $${precioTotal.toFixed(2)} dólares.`);
    } else if (match[22] || match[23] || match[26] || match[27]) {
      // Respuesta específica para la pregunta "cuánto sería 100 coins"
      const cantidadCoins = parseInt(match[27], 10) || 1; // Utilizamos la posición correcta del número de coins

      // Verificar si la cantidad de coins es un número válido
      if (!isNaN(cantidadCoins)) {
        // Calcular el precio basado en la cantidad de coins
        const precioTotal = cantidadCoins * 0.03; // Suponiendo que cada coin tiene un valor de $0.03

        // Responder con el precio calculado
        message.channel.send(`El valor de ${cantidadCoins} coin${cantidadCoins !== 1 ? 's' : ''} es $${precioTotal.toFixed(2)} dólares`);
      } else {
        // Manejar el caso en que la cantidad de coins no sea un número válido
        message.channel.send('No se proporcionó una cantidad válida de coins.');
      }
    } else {
      const cantidadCoins = parseInt(match[6] || match[8] || match[10] || match[11] || match[13], 10) || 1; // Si no se especifica la cantidad, asumimos 1 coin

      // Verificar si la cantidad de coins es un número válido
      if (!isNaN(cantidadCoins)) {
        // Calcular el precio basado en la cantidad de coins
        const precioTotal = cantidadCoins * 0.03; // Suponiendo que cada coin tiene un valor de $0.03

        // Responder con el precio calculado
        message.channel.send(`El valor de ${cantidadCoins} coin${cantidadCoins !== 1 ? 's' : ''} es $${precioTotal.toFixed(2)} dólares`);
      } else {
        // Manejar el caso en que la cantidad de coins no sea un número válido
        message.channel.send('No se proporcionó una cantidad válida de coins.');
      }
    }
  }
});














///////////////////evento log armas/////////////////////////

/* 
** INDICACIONES **

• A partir de la línea 417, se colocarán los nombres de las facciones que se quiere tener log armas

• A apartir de la línea 489, se colocarán los if de los registros de la facc, en su respectivo canal y foto.

• Se creará una función Ej. enviarMensajeAlCanalPolicia, dependiendo de la facc, dentro de esta se sacará el ID_canal con el ID_facc

• En la tabla Mensual se coloca el ID facc normal de la faccion.

*/

////////////// MENSUALIDAD /////////////////////////

const actualizationIntervalMes = 3540;

function ObtenerFechaYUpdate() {
  try {
    // Obtener la fecha actual desde la base de datos
    db.query('SELECT fecha_ahora() AS fecha_actual', (err, rows) => {
      if (err) {
        console.error('Error al obtener la fecha actual desde la base de datos:', err);
        return; // Detener ejecución si hay un error
      }

      // Verificar si se obtuvo una fila de resultado
      if (rows.length === 0) {
        console.error('No se recibió ninguna fila de la base de datos');
        return;
      }

      // Verificar si son las 4 horas
      const horaActual = new Date(rows[0].fecha_actual).getHours();
      if (horaActual === 4) {
        const updateQuery = `UPDATE Mensual SET Fecha = Fecha - 1 WHERE NOT Fecha <= 0`;
        db.query(updateQuery, (updateError, updateResults) => {
          if (updateError) {
            console.error('Error al realizar el UPDATE:', updateError);
          } else {
            console.log('Operación UPDATE exitosa.');
          }
        });
      } else {
        console.log('Hora actual:', horaActual);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

/*const canalID = '1131409134013644861';
const canalUDRI = '1141521042351865886';
const canalPolicia = '942538669582065674';*/

async function consultarLogArmas() {
  try {
    // Consultar el último registro de log_arma
    const rows = await queryAsync(db, 'SELECT ID, id_user, Name, id_facc, facc, Arma, actual, fecha FROM log_arma ORDER BY ID DESC LIMIT 1');

    if (rows.length === 0) {
      return;
    }

    // Filtrar registros de armas tomadas
    const registrosDeArmas = rows.filter((row) => row.Arma !== null);

    if (registrosDeArmas.length === 0) {
      return;
    }

    // Obtener el último registro de UltimoRegistro
    const ultimosRegistros = await queryAsync(db, 'SELECT id FROM UltimoRegistro ORDER BY id DESC LIMIT 1');
    const id_reg = registrosDeArmas[0].ID;
    const id_reg2 = ultimosRegistros.length > 0 ? ultimosRegistros[0].id : null;

    if (id_reg === id_reg2) {

      return;
    }

    // Emitir el evento con los nuevos registros
    client.emit('armasTomadas', registrosDeArmas, db);

    // Guardar el último registro en la tabla 'UltimoRegistro'
    const ultimoRegistro = registrosDeArmas[0];
    await queryAsync(db, 'INSERT INTO UltimoRegistro (id, id_user, arma) VALUES (?, ?, ?)', [ultimoRegistro.ID, ultimoRegistro.id_user, ultimoRegistro.Arma]);

    console.log('Se ha guardado el último registro en la tabla UltimoRegistro.');
  } catch (error) {
    
  }
}

// Función auxiliar para consultar la base de datos
function queryAsync(db, sql, values = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

const actualizationInterval = 1;
const db = mysql.createConnection({
  host: hostHost,
  user: userHost,
  password: passHost,
  database: bdHost,
});

// Manejar el evento 'ready' del cliente Discord
client.once('ready', () => {
  console.log(`Bot listo como ${client.user.tag}!`);

  // Ejecutar la función consultarLogArmas con intervalo
  setInterval(consultarLogArmas, actualizationInterval * 1000);
  // Ejecutar la función consultarLogArmas con intervalo
  setInterval(ObtenerFechaYUpdate, actualizationIntervalMes * 1000);
});

// Manejar el cierre de la conexión cuando la aplicación se detiene
process.on('SIGINT', () => {
  db.end((err) => {
    if (err) {
      console.error('Error al cerrar la conexión a la base de datos:', err);
      process.exit(1);
    }
    console.log('El bot se ha desconectado de la base de datos.');
    process.exit(0);
  });
});


function enviarMensajeAlCanal(canal, mensaje) {
  const canalObjeto = client.channels.cache.get(canal);
  if (canalObjeto && canalObjeto.type === 'text') {
    canalObjeto.send(mensaje);
  }
}


function enviarMensajeAlCanalPolicia(mensaje, db) {
  const query = `SELECT ID_canal FROM Mensual WHERE ID_facc = 20 AND Paga = 1`;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error al realizar la consulta:', error);
    } else {
      if (results.length > 0) {
        const ID_canal = results[0].ID_canal;
        enviarMensajeAlCanal(ID_canal, mensaje);
      }
    }
  });
}

function enviarMensajeAlCanalSF(mensaje, db) {
  const query = `SELECT ID_canal FROM Mensual WHERE ID_facc = 26 AND Paga = 1`;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error al realizar la consulta:', error);
    } else {
      if (results.length > 0) {
        const ID_canal = results[0].ID_canal;
        enviarMensajeAlCanal(ID_canal, mensaje);
      }
    }
  });
}

function enviarMensajeAlCanalUDRI(mensaje, db) {
  const query = `SELECT ID_canal FROM Mensual WHERE ID_facc = 21 AND Paga = 1`;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error al realizar la consulta:', error);
    } else {
      if (results.length > 0) {
        const ID_canal = results[0].ID_canal;
        enviarMensajeAlCanal(ID_canal, mensaje);
      }
    }
  });
}
function enviarMensajeAlCanalSAEM(mensaje, db) {
  const query = `SELECT ID_canal FROM Mensual WHERE ID_facc = 25 AND Paga = 1`;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error al realizar la consulta:', error);
    } else {
      if (results.length > 0) {
        const ID_canal = results[0].ID_canal;
        enviarMensajeAlCanal(ID_canal, mensaje);
      }
    }
  });
}

// Manejo del evento "armasTomadas"
client.on('armasTomadas', (registrosDeArmas, db) => {
  // Filtrar los registros que pertenecen a la facción "Policia"
  const registrosPolicia = registrosDeArmas.filter((row) => row.id_facc === 20);

  // Filtrar los registros que pertenecen a la facción "UDRI"
  const registrosUDRI = registrosDeArmas.filter((row) => row.id_facc === 21);

  const registrosSAEM = registrosDeArmas.filter((row) => row.id_facc === 25);

  const registrosSF = registrosDeArmas.filter((row) => row.id_facc === 36);

  // Construir el mensaje Embed solo si hay registros de cualquier facción
  if (registrosDeArmas.length > 0) {
    const embed = new Discord.MessageEmbed()
      .setTitle('Registro de armas tomadas')
      .setColor('#0099ff')
      .setDescription('Se han tomado las siguientes armas:');

    registrosDeArmas.forEach((rows) => {
      embed.addField('Usuario', `${rows.Name} (${rows.id_user})`, true);
      embed.addField('Faccción', rows.facc, true);
      embed.addField('Arma', rows.Arma, true);
      embed.addField('Fecha', rows.fecha, true);
      embed.addFields({ name: '\u200B', value: '\u200B' });
      embed.setThumbnail('https://images-ext-1.discordapp.net/external/wFfIv9h3_n3ikDMKRLgwUBCRsZeRYyB1E5ya5hAuOXs/%3Fsize%3D1024/https/cdn.discordapp.com/icons/1055804678857826304/20f86695c366b79fedb181e8f0a52036.webp?format=webp&width=664&height=664');
      embed.addField('**Almacen** ahora', rows.actual, true);

      // Enviar el mensaje al canal principal
      const query = `SELECT ID_canal FROM Mensual WHERE ID_facc = '101'`;

      db.query(query, (error, results) => {
        if (error) {
          console.error('Error al realizar la consulta:', error);
        } else {
          if (results.length > 0) {
            const ID_canal = results[0].ID_canal;
            enviarMensajeAlCanal(ID_canal, embed);
          }
        }
      });

      // Enviar el mensaje al canal específico para la facción "Policia"
      if (registrosPolicia.length > 0) {
        const row = registrosPolicia[0];

        const embedPolicia = new Discord.MessageEmbed()
          .setTitle('Registro de armas tomadas')
          .setColor('#0099ff')
          .setDescription('Se han tomado las siguientes armas:');

        embedPolicia.addField('Usuario', `${row.Name} (${row.id_user})`, true);
        embedPolicia.addField('Facción', row.facc, true);
        embedPolicia.addField('Arma', row.Arma, true);
        embedPolicia.addField('Fecha', row.fecha, true);
        embedPolicia.addFields({ name: '\u200B', value: '\u200B' });
        embedPolicia.addField('**Almacen** Ahora', row.actual, true);
        embedPolicia.setThumbnail('https://media.discordapp.net/attachments/1167078958546817054/1167170715573817517/image.png?ex=654d276f&is=653ab26f&hm=a2136bf149e4fe4bb8bc8505fb0d7bea142b898eb171154e4e7a2b36f45900fc&=');

        // Consultar la fecha
        const fechaQuery = 'SELECT Fecha FROM Mensual WHERE id_facc = ?';
        db.query(fechaQuery, [row.id_facc], (error, fechaResult) => {
          if (!error && fechaResult.length > 0 && fechaResult[0].Fecha < 4 && fechaResult[0].Fecha > 0) {
            embedPolicia.addField('\u200B', `**Mensualidad**\nTiene ${fechaResult[0].Fecha} días restantes, renueve o se acaba el sistema.`);
          }

          enviarMensajeAlCanalPolicia(embedPolicia, db);
        });
      }



      // Enviar el mensaje al canal específico para la facción "UDRI"
      if (registrosUDRI.length > 0) {
        const row = registrosUDRI[0];

        const embedUDRI = new Discord.MessageEmbed()
          .setTitle('Registro de armas tomadas')
          .setColor('#0099ff')
          .setDescription('Se han tomado las siguientes armas:');

        embedUDRI.addField('Usuario', `${row.Name} (${row.id_user})`, true);
        embedUDRI.addField('Facción', row.facc, true);
        embedUDRI.addField('Arma', row.Arma, true);
        embedUDRI.addField('Fecha', row.fecha, true);
        embedUDRI.addFields({ name: '\u200B', value: '\u200B' });
        embedUDRI.addField('**Almacen** Ahora', row.actual, true);
        embedUDRI.setThumbnail('https://images-ext-1.discordapp.net/external/EpHUqqjM2EqUuYoIo1NZ6G5wm3if7jrOTlTy_e1WPo8/%3Fsize%3D1024/https/cdn.discordapp.com/icons/1065296917753503744/e1e963ccb62db9e4329ee9d552f0d290.webp');

        // Consultar la fecha
        const fechaQuery = 'SELECT Fecha FROM Mensual WHERE id_facc = ?';
        db.query(fechaQuery, [row.id_facc], (error, fechaResult) => {
          if (!error && fechaResult.length > 0 && fechaResult[0].Fecha < 4 && fechaResult[0].Fecha > 0) {
            embedUDRI.addField('\u200B', `**Mensualidad**\nTiene ${fechaResult[0].Fecha} días restantes, renueve o se acaba el sistema.`);
          }

          enviarMensajeAlCanalUDRI(embedUDRI, db);
        });
      }

      // Enviar el mensaje al canal específico para la facción "SAEM"
      if (registrosSAEM.length > 0) {
        const row = registrosSAEM[0];

        const embedSAEM = new Discord.MessageEmbed()
          .setTitle('Registro de armas tomadas')
          .setColor('#0099ff')
          .setDescription('Se han tomado las siguientes armas:');

        embedSAEM.addField('Usuario', `${row.Name} (${row.id_user})`, true);
        embedSAEM.addField('Facción', row.facc, true);
        embedSAEM.addField('Arma', row.Arma, true);
        embedSAEM.addField('Fecha', row.fecha, true);
        embedSAEM.addFields({ name: '\u200B', value: '\u200B' });
        embedSAEM.addField('**Almacen** Ahora', row.actual, true);
        embedSAEM.setThumbnail('https://images-ext-2.discordapp.net/external/pz8g429ToHH5MNtjuq_QgGiFWN0bO_4sGB_NnNQznVc/%3Fsize%3D1024/https/cdn.discordapp.com/icons/1061136494582042744/40a665b67ba8c0d20508872feec77399.webp?width=664&height=664');

        // Consultar la fecha
        const fechaQuery = 'SELECT Fecha FROM Mensual WHERE id_facc = ?';
        db.query(fechaQuery, [row.id_facc], (error, fechaResult) => {
          if (!error && fechaResult.length > 0 && fechaResult[0].Fecha < 4 && fechaResult[0].Fecha > 0) {
            embedSAEM.addField('\u200B', `**Mensualidad**\nTiene ${fechaResult[0].Fecha} días restantes, renueve o se acaba el sistema.`);
          }

          enviarMensajeAlCanalSAEM(embedSAEM, db);
        });
      }

      // Enviar el mensaje al canal específico para la facción "SAEM"
      if (registrosSF.length > 0) {
        const row = registrosSF[0];

        const embedSAEM = new Discord.MessageEmbed()
          .setTitle('Registro de armas tomadas')
          .setColor('#0099ff')
          .setDescription('Se han tomado las siguientes armas:');

        embedSAEM.addField('Usuario', `${row.Name} (${row.id_user})`, true);
        embedSAEM.addField('Facción', row.facc, true);
        embedSAEM.addField('Arma', row.Arma, true);
        embedSAEM.addField('Fecha', row.fecha, true);
        embedSAEM.addFields({ name: '\u200B', value: '\u200B' });
        embedSAEM.addField('**Almacen** Ahora', row.actual, true);
        embedSAEM.setThumbnail('https://images-ext-1.discordapp.net/external/E9AcQYkkS-MMx6p9AGjexbJhfNybXW6lB6mDVy-oPB0/%3Fsize%3D1024/https/cdn.discordapp.com/icons/1207377911150280714/1ae7fdc975772a319dda901b9cf42eb2.webp?format=webp&width=368&height=368');

        // Consultar la fecha
        const fechaQuery = 'SELECT Fecha FROM Mensual WHERE id_facc = ?';
        db.query(fechaQuery, [row.id_facc], (error, fechaResult) => {
          if (!error && fechaResult.length > 0 && fechaResult[0].Fecha < 4 && fechaResult[0].Fecha > 0) {
            embedSAEM.addField('\u200B', `**Mensualidad**\nTiene ${fechaResult[0].Fecha} días restantes, renueve o se acaba el sistema.`);
          }

          enviarMensajeAlCanalSF(embedSAEM, db);
        });
      }
    });
  }
});


///////////////////

//////////// LOG DE BIZWAR ///////////////////////

/* 
** INDICACIONES **

• Cambiar el ID_facc de const roles de la linea 709 según las facciones, 100 para arriba es para log general

• En la línea 656 se colocará el ID_canal nuevamente segun la facción, esto para que verifique el sistema de que si tiene pagado.

• Con el punto 1, se coloca en ID_facc el ID_facc normal, pero sumandole 1, esto para diferenciar en la tabla, después si hay más facc que compren el sistema, se pondrá otro + número.

*/



/*const CanalBrat = '1143689936109850766';
const rolIdBrat = '1056299752003735693';
const CanalCJ= '1143689916979613827';
const rolIdCJ = '1056299375430737920';*/

// ID del rol que deseas mencionar
//const rolId = '1056299752003735693';
/*  Linea 709 */

const actualizationIntervalBiz = 480;

const roles = [
  { ID_facc: 100 }

];

client.once('ready', () => {
  console.log(`Bot listo como ${client.user.tag}, para bizwar!`);

  // Obtener ID_canal e ID_rol de la base de datos y luego llamar a LogBizwar
  roles.forEach(role => {
    const query = `SELECT ID_canal, ID_rol FROM Mensual WHERE ID_facc = '${role.ID_facc}'`;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error al realizar la consulta:', error);
      } else {
        if (results.length > 0) {
          const ID_canal = results[0].ID_canal;
          const ID_rol = results[0].ID_rol;

          // Ejecutar LogBizwar con los valores obtenidos de la base de datos
          setInterval(() => LogBizwar(ID_canal, ID_rol, role.ID_facc), actualizationIntervalBiz * 1000);
        } else {
          console.error(`No se encontró un registro para ID_facc: ${role.ID_facc}`);
        }
      }
    });
  });
});

// Manejar el cierre de la conexión cuando la aplicación se detiene
process.on('SIGINT', () => {
  db.end((err) => {
    if (err) {
      console.error('Error al cerrar la conexión a la base de datos:', err);
      process.exit(1);
    }
    console.log('El bot se ha desconectado de la base de datos.');
    process.exit(0);
  });
});

async function obtenerCountNegocios(tableName) {
  return new Promise((resolve, reject) => {
    db.query(`SELECT COUNT(*) as count FROM ${tableName}`, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const count = rows[0].count;
        resolve(count);
      }
    });
  });
}

async function obtenerNombreMafia(mafiaID) {
  return new Promise((resolve, reject) => {
    const query = `SELECT Name FROM LeaderInfo WHERE Leader = ?`;
    const queryParams = [mafiaID];

    db.query(query, queryParams, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const nombreMafia = rows.length > 0 ? rows[0].Name : '';
        resolve(nombreMafia);
      }
    });
  });
}


async function obtenerNegociosPromises(count, tableName) {
  const obtenerNegociosPromises = [];

  const idField = tableName === 'GasStations' ? 'ID' : 'Number';
  const selectFields = tableName === 'GlobalInfo' ? 'NoWar, Info' : 'NoWar';

  for (let i = 1; i <= count; i++) {
    obtenerNegociosPromises.push(new Promise((resolve, reject) => {
      db.query(`SELECT Leader, ${selectFields} FROM ${tableName} WHERE ${idField} = ${i}`, async (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const nowarTimestamp = rows[0].NoWar;
          const mafiaID = rows[0].Leader;

          const formattedNoWarDate = moment.unix(nowarTimestamp).tz('Chile/Continental').add(7, 'hours');
          const info = rows[0].Info || '';

          const nombreMafia = await obtenerNombreMafia(mafiaID);
          const resultObject = { fecha: formattedNoWarDate, info, mafia: nombreMafia };

          resolve(resultObject);
        }
      });
    }));
  }

  return Promise.all(obtenerNegociosPromises);
}



const CHUNK_SIZE = 15;  // Número de negocios por página

async function obtenerMensajeYDescripcion(horaActual, canalId, faccID) {
  let mensaje, descripcion, estadoNegocios;
  try {
    if (horaActual.hours() === 19 && horaActual.minutes() >= 50 && horaActual.hours() < 20) {

      const count = await obtenerCountNegocios('GlobalInfo');
      const obtenerNegocios = await obtenerNegociosPromises(count, 'GlobalInfo');

      estadoNegocios = obtenerNegocios.map((negocio, index) => {
        const nombreNeg = negocio.info;
        const fechaNeg = horaActual.isBefore(negocio.fecha)
          ? negocio.fecha.format('YYYY-MM-DD HH:mm:ss')
          : '¡Conquistalo!';
        const nombreMafia = negocio.mafia;

        // Acortar el contenido de info si es mayor a 14 caracteres
        const infoAcortada = nombreNeg.length > 14 ? nombreNeg.substring(0, 14) : nombreNeg;

        const MafiaAcortada = nombreMafia.length > 11 ? nombreMafia.substring(0, 11) : nombreMafia;

        return { index: index + 1, nombreNeg: infoAcortada, fechaNeg, nombreMafia: MafiaAcortada };
      });

      descripcion = `Faltan ${60 - horaActual.minutes()} minutos para poder conquistar los negocios generales.\n`;
      mensaje = 'Negocios generales';

    } else if (horaActual.hours() === 17 && horaActual.minutes() >= 50 && horaActual.hours() < 18) {

      const count = await obtenerCountNegocios('Salon');
      const obtenerNegocios = await obtenerNegociosPromises(count, 'Salon');

      estadoNegocios = obtenerNegocios.map((negocio, index) => {
        const nombreNeg = `Conce`;
        const fechaNeg = horaActual.isBefore(negocio.fecha)
          ? negocio.fecha.format('YYYY-MM-DD HH:mm:ss')
          : '¡Conquistalo!';
        const nombreMafia = negocio.mafia;
        return { index: index + 1, nombreNeg, fechaNeg, nombreMafia };
      });

      descripcion = `Faltan ${60 - horaActual.minutes()} minutos para poder conquistar los Concesionarios.\n`;
      mensaje = 'Concesionarios';


    } else if (horaActual.hours() === 15 && horaActual.minutes() >= 50 && horaActual.hours() < 16) {

      const count = await obtenerCountNegocios('Shop24');
      const obtenerNegocios = await obtenerNegociosPromises(count, 'Shop24');

      estadoNegocios = obtenerNegocios.map((negocio, index) => {
        const nombreNeg = `24/7`;
        const fechaNeg = horaActual.isBefore(negocio.fecha)
          ? negocio.fecha.format('YYYY-MM-DD HH:mm:ss')
          : '¡Conquistalo!';
        const nombreMafia = negocio.mafia;
        return { index: index + 1, nombreNeg, fechaNeg, nombreMafia };
      });

      descripcion = `Faltan ${60 - horaActual.minutes()} minutos para poder conquistar los 24/7.\n`;
      mensaje = '24/7';


    } else if (horaActual.hours() === 13 && horaActual.minutes() >= 50 && horaActual.hours() < 14) {

      const count = await obtenerCountNegocios('GasStations');
      const obtenerNegocios = await obtenerNegociosPromises(count, 'GasStations');

      estadoNegocios = obtenerNegocios.map((negocio, index) => {
        const nombreNeg = `Gasolinera`;
        const fechaNeg = horaActual.isBefore(negocio.fecha)
          ? negocio.fecha.format('YYYY-MM-DD HH:mm:ss')
          : '¡Conquistalo!';
        const nombreMafia = negocio.mafia;
        return { index: index + 1, nombreNeg, fechaNeg, nombreMafia };
      });

      descripcion = `Faltan ${60 - horaActual.minutes()} minutos para poder conquistar las Gasolineras.\n`;
      mensaje = 'Gasolineras';


    } else {
      mensaje = null;
      descripcion = null;
    }
    const chunks = [];
    if (mensaje !== null && descripcion !== null) {

      if (estadoNegocios) {
        for (let i = 0; i < estadoNegocios.length; i += CHUNK_SIZE) {
          chunks.push(estadoNegocios.slice(i, i + CHUNK_SIZE));
        }
      } else {
        console.error('estadoNegocios es undefined.');
        return; // Salir de la función en caso de error
      }
    } else {
      console.error('No dio nada.');
      return; // Salir de la función en caso de error
    }
    return { mensaje, descripcion, chunks };
  } catch (error) {
    console.log('Error:', error);
  }
}


async function LogBizwar(canalId, rolId, faccID) {
  try {
    const rows = await new Promise((resolve, reject) => {
      db.query('SELECT fecha_ahora() AS fecha_actual', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    const fechaActual = moment(rows[0].fecha_actual);
    const result = await obtenerMensajeYDescripcion(fechaActual, canalId, faccID);

    if (result) {
      let { mensaje, descripcion, chunks } = result;

      if (!mensaje || !descripcion || !chunks) {
        // Si alguna propiedad está vacía, asignar valores por defecto
        console.log(mensaje);
        console.log('No es hora del bizwar');
        descripcion = '';
        chunks = [[]];
      }
      for (const chunk of chunks) {
        const table = new AsciiTable()
          .setHeading('#', 'Nombre', 'Estado/Fecha', 'Mafia')
          .setAlign(0, AsciiTable.CENTER)
          .setAlign(1, AsciiTable.LEFT)
          .setAlign(2, AsciiTable.RIGHT);

        for (const negocio of chunk) {
          table.addRow(negocio.index, negocio.nombreNeg, negocio.fechaNeg, negocio.nombreMafia);
        }

        const tableString = '```' + table.toString() + '```';

        // Resto de tu código para crear y enviar el mensaje embed
        const embed = new MessageEmbed()
          .setTitle(mensaje)
          .setColor('#0099ff')
          .setDescription(`${descripcion}\n${tableString}`);

        // Enviar el mensaje al canal, mencionando el rol antes del Embed
        enviarMensajeAlCanalBiz(canalId, rolId, `El Bizwar está por comenzar:`, embed);
      }
    } else {
      console.error('La función obtenerMensajeYDescripcion devolvió undefined.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}


function enviarMensajeAlCanalBiz(canalId, rolId, mensaje, embed) {
  const canal = client.channels.cache.get(canalId);
  if (canal) {
    const rolMencion = `¡<@&${rolId}>!`;
    canal.send(`${rolMencion} ${mensaje}`, embed);
  } else {
    console.log('Canal no encontrado');
  }
}

/////////////////////////////////////////////////






//////////////////////////////////////////////IA INTEGRACIÓN//////////////////////////



/////////Música//////////



//////////////////

client.login(process.env.DISCORD_TOKEN);

