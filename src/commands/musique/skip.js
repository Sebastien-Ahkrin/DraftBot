const Discord = require('discord.js')

const MusicPlayer = require('../../plugin/MusicPlayer');
    
module.exports = ({ 
	message
}) => {
  if (!message.guild.available) return;

  if (!guilds[message.guild.id]) guilds[message.guild.id] = new MusicPlayer();

  let musicPlayer = guilds[message.guild.id];

  musicPlayer.skipSong(message);
}