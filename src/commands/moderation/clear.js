const Discord = require('discord.js')

module.exports = ({ 
	message, args: [number]
}) => {
	if (message.member.hasPermission("MANAGE_MESSAGES")) {
		return message.channel.send(":no_entry_sign: | Vous n'avez pas la permission de supprimer des messages")
	}
	if(isNaN(number)){
		return message.channel.send(":no_entry_sign: | /clear <nombre de messages")
	}
			
    message.channel.fetchMessages({ limit: number })
       .then(function(list){
            message.channel.bulkDelete(list);
            const embed = new Discord.RichEmbed()
			.setTitle(`Félicitation : \`${number}\` Messages `+(number == 1 ? "supprimé" : "supprimés"))
			.setColor(0xcd6e57);
            message.channel.send({ embed }).then(msg => {msg.delete(5000)});
    }, function(err){message.channel.send(":no_entry_sign: | Je n'ai pas réussi a supprimer les messages")})
}
