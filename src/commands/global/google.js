const Discord = require('discord.js')

module.exports = ({ 
	message, args
}) => {
	const question = args.join("+");

	message.channel.send(`Hey celà pourrais t'aider !\nhttps://www.lmgtfy.com/?q=${question}`);
}
