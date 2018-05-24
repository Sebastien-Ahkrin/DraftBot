const Discord = require('discord.js')

module.exports = ({ 
	message
}) => {
  const start = Date.now();
  message.channel.send("pong").then(sendedMessage => {
      const stop = Date.now();
      const diff = (stop - start);
      sendedMessage.edit(`pong \`${diff}ms\``);
  });
}
