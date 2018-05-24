const Event = require('events')
const Discord = require('discord.js')

const config = require('./config/prod.json')

const CommandManager = require('./src/command')
//const TwitterPlugin = require('./src/plugin/twitter')
const docCmd = require('./src/commands/global/doc')
const helpCmd = require('./src/commands/global/help')
const fortniteCmd = require('./src/commands/fun/fortnite')
const clearCmd = require('./src/commands/moderation/clear')
const googleCmd = require('./src/commands/global/google')
const sayCmd = require('./src/commands/moderation/say')
const pingCmd = require('./src/commands/global/ping')
const commandeCmd = require('./src/commands/global/commande')
const quoteCmd = require('./src/commands/global/quote')
const infosCmd = require('./src/commands/global/infos')
const playCmd = require('./src/commands/musique/play')
const skipCmd = require('./src/commands/musique/skip')
const musiqueCmd = require('./src/commands/musique/musique')
const pauseCmd = require('./src/commands/musique/pause')
const resumeCmd = require('./src/commands/musique/resume')
const stopCmd = require('./src/commands/musique/stop')
const volumeCmd = require('./src/commands/musique/volume')
const purgeCmd = require('./src/commands/musique/purge')
const queueCmd = require('./src/commands/musique/queue')
const joinCmd = require('./src/commands/musique/join')
const leaveCmd = require('./src/commands/musique/leave')
const embeds = require('./src/embeds')

const CM = CommandManager.init();
CM.addCommand('doc', docCmd)
CM.addCommand('help', helpCmd)
CM.addCommand('fortnite', fortniteCmd)
CM.addCommand('clear', clearCmd)
CM.addCommand('google', googleCmd)
CM.addCommand('say', sayCmd)
CM.addCommand('ping', pingCmd)
CM.addCommand('commande', commandeCmd)
CM.addCommand('quote', quoteCmd)
CM.addCommand('infos', infosCmd)
CM.addCommand('play', playCmd)
CM.addCommand('skip', skipCmd)
CM.addCommand('musique', musiqueCmd)
CM.addCommand('volume', playCmd)
CM.addCommand('pause', pauseCmd)
CM.addCommand('resume', resumeCmd)
CM.addCommand('queue', queueCmd)
CM.addCommand('purge', purgeCmd)
CM.addCommand('stop', stopCmd)
CM.addCommand('join', joinCmd)
CM.addCommand('leave', leaveCmd)

const RM = new Event()

const DraftBot = new Discord.Client()

DraftBot.on('ready', () => {
  console.log("DraftBot connecté !")
  DraftBot.user.setActivity('Fortnite', { type: 'PLAYING' })
});

DraftBot.on('guildMemberAdd', member => {
  member.addRole(member.guild.roles.find("name","Membre"));
    member.createDM().then(channel => {
      channel.send(embeds.welcome(member.user))
    }).catch(()=>member.guild.channels.find("name","général").send("Hé "+member.author+", tu as désactivé tes messages privés !\nDommage !\nJe voulais t'envoyer un message de bienvenue et pourquoi pas prévoir un rendez-vous chez moi 😉"));

  DraftBot.channels.find('name', 'logs').send(embeds.join(member.user));
});

DraftBot.on('guildMemberRemove', member => {
  DraftBot.channels.find('name', 'logs').send(embeds.left(member.user));
});

DraftBot.on('message', message => {
  CM.messageHandler(message)
  RM.emit(message.channel.name, message)
  if (message.channel === DraftBot.channels.find('name', 'créations')) {
    if(message.attachments.filename !== undefined || message.content.includes("http")){
      message.react("❤");
      message.pin();
    }
    if (message.type == 'PINS_ADD'){
      message.delete();
    }
  }
});

DraftBot.on('messageReactionAdd', (messageReaction, user) => {
  const member = messageReaction.message.guild.member(user);
  const channel = messageReaction.message.channel;
  if (messageReaction.message.channel === DraftBot.channels.find('name', 'créations')) {
      member.createDM().then(chan => {
        chan.send("🗒 | "+user.username+" viens d'ajouter un emoji a votre création !")
      }).catch(()=>messageReaction.message.channel.send("Hé "+member.author+", tu as désactivé tes messages privés !\nDommage !\nJe voulais t'envoyer un message de bienvenue et pourquoi pas prévoir un rendez-vous chez moi 😉"));
  }
  if(messageReaction.message.embeds[0].description.startWith('Ajoutez une réaction à la musique de votre choix')){
    const id = messageReaction.message.embeds[0].title.substring(32,1);
    const emoji = messageReaction.emoji.name;
    console.log(emoji);
    if(playCmd.musics.get(id).has(emoji)){
      if(member.voiceChannel){
        member.voiceChannel.join().then(connexion => {
          const info = playCmd.musics.get(id).get(emoji).split("§");
          const musicPlayer = guilds[messageReaction.message.guild.id];
          // title§url§author§image
          musicPlayer.queueSong(new Song(info[0], info[1], 'youtube',  info[2], info[3]));
          msg.channel.send(":musical_note: | La piste `"+info[0]+"` viens d'être ajouté par `"+info[2]+"`");

          if (musicPlayer.status != 'playing') musicPlayer.playSong(msg, guild);
        });
      };
    }
  }
};

DraftBot.on('messageUpdate', message => {
  CM.messageHandler(message)
  RM.emit(message.channel.name, message)
});

DraftBot.login(config.token)

process.on('SIGINT', () => {
  DraftBot.destroy()
});