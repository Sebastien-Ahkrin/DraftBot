const Event = require('events')
const Discord = require('discord.js')

const config = require('./config/prod.json')

const CommandManager = require('./src/command')
const TwitterPlugin = require('./src/plugin/twitter')

const embeds = require('./src/embeds')

const cmds = require('./src/commands')

const CM = CommandManager.init();

CM.addCommands([
    { name: 'doc', callback: cmds.docCmd },
    { name: 'help', callback: cmds.helpCmd },
    { name: 'fortnite', callback: cmds.fortniteCmd },
    { name: 'clear', callback: cmds.clearCmd },
    { name: 'google', callback: cmds.googleCmd },
    { name: 'say', callback: cmds.sayCmd },
    { name: 'commande', callback: cmds.commandeCmd },
    { name: 'ping', callback: cmds.pingCmd },
    { name: 'quote', callback: cmds.quoteCmd },
    { name: 'infos', callback: cmds.infosCmd },
    { name: 'play', callback: cmds.playCmd },
    { name: 'skip', callback: cmds.skipCmd },
    { name: 'musique', callback: cmds.musiqueCmd },
    { name: 'volume', callback: cmds.playCmd },
    { name: 'pause', callback: cmds.pauseCmd },
    { name: 'resume', callback: cmds.resumeCmd },
    { name: 'queue', callback: cmds.queueCmd },
    { name: 'purge', callback: cmds.purgeCmd },
    { name: 'stop', callback: cmds.stopCmd },
    { name: 'join', callback: cmds.joinCmd },
    { name: 'leave', callback: cmds.leaveCmd }
])

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
});

DraftBot.on('messageUpdate', message => {
  CM.messageHandler(message)
  RM.emit(message.channel.name, message)
});

DraftBot.login(config.token)

process.on('SIGINT', () => {
  DraftBot.destroy()
});
