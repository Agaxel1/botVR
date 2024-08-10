const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');

module.exports = {
	name: 'normativastaff',
	alias: [],

	execute(client, message, args) {


		const embed = new Discord.MessageEmbed()

			.setTitle("**Normativa para miembros de la administración**")
			.setDescription("1. Deben ser conscientes que la prioridad es siempre el orden, bienestar y equilibrio del server así como de los jugadores que están en el.\n2. Deben conocer de memoria todas las reglas y normas del servidor sin excepción.\n3. No pueden bajo ningún motivo ignorar reportes o hechos que estén a su alcance o vista por comodidad.\n4. Los comandos son únicamente para ayudar a los jugadores, realizar eventos, disciplinar infractores de reglas.\n5. No se le puede faltar al respeto a un jugador. No importa si el jugador se lo ha faltado a él, no es razón suficiente para no ser educado. Siempre ante todo ser educado y pedir las cosas con calma y paciencia. Pretender obediencia sin respeto es algo a lo que no se puede aspirar fácilmente. **Ejemplo:** Un staff tiene un mal día y es atacado frecuentemente por los jugadores que tratan de irritarlo. El administrador no puede insultar ni tomar medidas pero en el caso de darse una infracción al reglamento deberá ser completamente imparcial ante la situación y hacer a un lado su estado de ánimo, pues verán la gente se conecta a jugar y a pasar un buen momento, si tienes problemas personales es mejor que los olvides mientras estés dentro del server. En casos graves sería recomendable no conectarse puesto que un estado emocional fuertemente desequilibrado puede desencadenar consecuencias imprevistas.\n6. El estar o participar de la administración, otorga el derecho de hacer cumplir las reglas del server, esto no quiere decir que usted posea una forma de ver la vida y de entender la realidad mayor a la del resto de la humanidad, en este caso, bajo ningúna circunstancia pueden dar _lecciones de vida_ a los jugadores ni tampoco usar los comandos para imponer sus ideas u opiniones.**Ejemplo:** Un miembro de la administración se siente frustrado porque un jugador con más habilidad lo mata en cada oportunidad. Este miembro cansado de la situación expresa su descontento argumentando que el otro sujeto no sabe como lo hace sentir y lo desarma e inmoviliza para poder cobrar venganza. \n7. En el caso de que un staff haga un uso incorrecto sucesiva y excesivamente de los comandos o abuse de su condición para sacar ventaja, sea para su facción o sus amigos; **TODO** staff sin importar el nivel, amistad o cualquier cosa que los relacione, está obligado a reportar el abuso a los miembros de mayor rango del staff (Dueños, Encargado de la administración). En caso contrario se considerará que el silencio representa complicidad entre el abusador y la persona que no reporta.**Ejemplo:** Dos miembros de la administración comparten facción, amistad y recuerdos. Uno de ellos abusa de sus comandos, el otro por el contrario no, sin embargo no reporta este abuso por lo cual se puede deducir que forma parte de una asociación ilícita entre ambos.")

			.setFooter('Vida Roleplay - Administración.', 'https://i.postimg.cc/02qLcC28/Logo-Oficial-1.webp')
			
			.setColor("#00FFF5")

		message.channel.send(embed);
        
        const embed1 = new Discord.MessageEmbed()

			.setTitle("**Normativa para miembros de la administración**")
			.setDescription("8. Esta prohibido la entrega de salud/blindaje/armas/dinero/vehículos/teleports a los jugadores así como removerlos, siempre y cuando no sea parte de un evento. Puesto que provocaríamos un desequilibrio con el resto de los jugadores.**Ejemplo:** Se da el caso de un jugador amigo de staff esta siendo atacado y le pide un chaleco para poder sacar ventaja en la pelea. Esto esta prohibido ya que los otros jugadores podrían considerarlo un cheat y ni hablar de lo que desencadenaría un repudio hacia la conveniencia de una amistad.\n9. No esta permitido bajo ningún motivo el uso de razones con lenguaje ofensivo al usar un comando.**Ejemplo:** /kick razón: hijo de puta\n10.  Un staff sin importar el nivel o la situación no puede bajo ningún motivo mutear/encarcelar/kickear/banear a otro. No solo por quedar poco profesional sino porque los comandos no son un juguete. Si un miembro del staff comete un abuso o rompe una regla se deberá hacer un reporte al cual se juzgara en base a pruebas y razonamientos válidos.**Ejemplo:** Un staff destruye el vehículo de un jugador para su beneficio, en este caso otro staff presente solo deberá tomar fotos/videos de los hechos y reportarlos a la persona debida. No se puede hacer justicia con mano propia porque nadie puede asegurar que tu forma de juzgar los hechos sea suficiente como para tomar medidas. Además que se pone en manifiesto la poca seriedad del server al ser los jugadores testigos de como entre los staff se castigan entre ellos al tener juicios antagónicos defendiendo sus convicciones.\n11. Esta prohibido hacer justicia con mano propia. Para eso están los comandos que son más que suficientes para disciplinar a cualquier infractor.\n12. Se deberá de respetar cada toma de decisiones que los dueños hagan. (Claramente se puede opinar frente a estas, sin embargo siempre con respeto) \n13. Por ninguna motivo se deberá de hostigar a los demás con pedidas de ascensos, su momento llegará, persona que se vea haciendo ésto se le dará 1 warn administrativo y posteriormente se le quitarán los permisos por 2 días.\n14. Siempre se deberá de mantener el respeto y la dignidad intacta de los demás staff en caso de presenciar algún caso polémico.\n15. No se permitirán las recochas o juegos pesados en los diferentes canales de staff.\n16. Evitar dar una confianza exagerada a los usuarios ya que ésto podrá generar problemas entre el mismo staff y los usuarios.\n17. Se valorará mucho más el trabajo por voluntad propia, ya que ésto da conocer el interés que se tiene hacía el proyecto.\n18. Si algún staff incumple con alguna norma de rol, será advertido, a las 3 advertencias se le quitara el rango de staff")

			.setFooter('Vida Roleplay - Administración.', 'https://i.postimg.cc/02qLcC28/Logo-Oficial-1.webp')
			
			.setColor("#00FFF5")

		message.channel.send(embed1);
        
	}
	};