// Importar Discord.js
const Discord = require('discord.js');
const connection = require('./database');
async function executeQuery(query, params) {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}
// Crear el comando
module.exports = {
  name: 'informacion',
  description: 'Muestra información y enlaces útiles.',
  async execute(client, message, args) {

    const sqlGetBoss = "SELECT Discord FROM PlayaRP WHERE Admin = '8'";
    const resultGetBoss = await executeQuery(sqlGetBoss);
    const boss = resultGetBoss.map((row) => row.ID_user);
    const usuariosPermitidos = boss;

    if (message.author.bot) return;

    if (!usuariosPermitidos.includes(message.author.id)) {
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }
    // Emojis reales para los logos de las redes sociales
    const youtubeEmoji = '<:YouTube:1135622058672398416> ';
    const instagramEmoji = '<:8635_instagram:1135622229976170538>';
    const tiktokEmoji = '<:1255squaretiktok:1135622226545225809>';
    // Enlaces a los canales de Discord
    const registroChannel = '930577635787018270';
    const soporteChannel = '929920360554573834';
    const repararErroresChannel = '934292355345940530';

    // Crear el Embed de información general
    const infoEmbed = new Discord.MessageEmbed()
      .setTitle('¡Bienvenido a Vida Rol!')
      .setColor('#00ff00')
      .setDescription('Vida rol es uno de los juegos de simulación más completos, funciona mediante la plataforma de San Andreas Multiplayer, la mejor manera de ingresar es ejecutando su launcher, el cuál contiene: chat de voz, sonidos realistas, skins (personaje/armas/vehículos), huds, detalles realistas y optimización. Todo este conjunto de mods, más sus incontables sistemas hace que este servidor adquiera un ambiente completamente realista.')
      .addField('Invertimos una gran cantidad de tiempo y esfuerzo en el desarrollo de este proyecto.', '¡Las personas que están con nosotros no están de acuerdo con la mediocridad y aprecian este proyecto en su máximo esplendor!')
      .addField('Ahora en más información:', 'Puedes unirte a grupos de crimen organizados, a la policía, a los servicios de sanidad, trabajar como un simple civil, ser solo un chofer de bus, ser mototaxista, ser Uber, bombero, todo lo que te puedas imaginar. Estate atento a las convocatorias IC, discord o vía foro.\n\nEn caso de querer ser líder de alguna facción míralo en nuestro foro, mediante la web.')
      .addField('Si te quedas con nosotros, entonces muchas gracias', '[Disponible solo para PC]')
      .addField('¿CÓMO INGRESAR?', '1. Regístrate escribiendo "!registrar Nombre_Apellido" de tu personaje en el canal <#930577635787018270>\n2. Descarga nuestro launcher en: [Descargar launcher](https://www.vida-roleplay.com/)\n Y si tienes algún problema: [Video tutorial de instalación](https://www.youtube.com/watch?v=V6G_cWkz3rw)\n3. Una vez tengas todo instalado, ve a la carpeta de Vida Rol, abre SAMP y verifica que este tenga la ruta de instalación en Vida Rol.\n4. Ejecuta Vida Rol y listo, estarás jugando, si tienes problemas con el chat de voz al no contar con los paquetes Visual C++ necesarios puedes instalar AioRuntimes (Mira un video de Youtube) o solicita ayuda en los canales <#929920360554573834> y <#934292355345940530>.')
      .addField(
        'Siguenos en nuestras redes sociales',
        `${youtubeEmoji} [Canal de YouTube](https://www.youtube.com/channel/UC0pqtAs2MvqSx9dlM7dtylg) - Siguenos en YouTube\n${instagramEmoji} [Instagram](https://www.instagram.com/vidaroloficial/) - Siguenos en Instagram\n${tiktokEmoji} [TikTok](https://www.tiktok.com/@vidarol_oficial?lang=km-KH) - Siguenos en TikTok`
      );

    // Enviar el embed de información general
    message.channel.send(infoEmbed);
  },
};








