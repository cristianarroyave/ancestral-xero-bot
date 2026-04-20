import dotenv from 'dotenv';
import { Client as RestClient } from 'node-rest-client'
import { balanceTeams } from './balancer.js';

var restClient = new RestClient();

var playerList = [];

dotenv.config();

import { ApplicationCommandOptionType, Client, GatewayIntentBits, Events, SlashCommandBuilder, SlashCommandStringOption, PermissionsBitField, AttachmentBuilder, SlashCommandUserOption } from 'discord.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
    ]
})

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);

  const stringoption = new SlashCommandStringOption().setName("player").setRequired(true).setDescription("Cositas..");

  const lastplayer = new SlashCommandBuilder()
  .setName("lastmatch")
  .setDescription("Cositas..")
  .addStringOption(stringoption)
  .setDefaultMemberPermissions(ApplicationCommandOptionType.GuildMembers)

  const userOption = new SlashCommandUserOption().setName("player").setRequired(true).setDescription("Jugador a registrar el tier");
  const registerTierOption = new SlashCommandStringOption().setName("tier").setRequired(true).setDescription("Tier a registrar");

  const registerTier = new SlashCommandBuilder()
  .setName("registertier")
  .setDescription("Registra un tier para un jugador")
  .addUserOption(userOption)
  .addStringOption(registerTierOption)
  .setDefaultMemberPermissions(ApplicationCommandOptionType.GuildMembers)

  const balanceTeams = new SlashCommandStringOption().setName("players").setRequired(true).setDescription("Balancea los equipos de los jugadores registrados");

  const balanceTeamsCommand = new SlashCommandBuilder()
  .setName("balanceteams")
  .setDescription("Balancea los equipos de los jugadores registrados")
  .addStringOption(balanceTeams)
  .setDefaultMemberPermissions(ApplicationCommandOptionType.GuildMembers)

  client.application.commands.set([lastplayer, registerTier, balanceTeamsCommand])
})

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'lastmatch') {

    const player = interaction.options.get("player").value

    let request = await fetch(`https://xero.gg/api/match/player/${player}?limit=1&players=12`, {
      method: 'GET',
      headers: {
        "x-api-access-key-id": process.env.KEY_ID, "x-api-secret-access-key" : process.env.ACCESS_KEY, 'Content-Type' : 'application/json'
      }
    })

    if(!request.ok) {
      interaction.reply({
        content: `Bro...`
      })
    }

    const match = await request.json();

    let players = match.matches[0].players.sort((player1, player2) => {
      return player1.stats.totalScore - player2.stats.totalScore;
    })

    request = await fetch(`https://xero.gg/api/player/${players[players.length - 1].name}`, {
          method: 'GET',
          headers: {
            "x-api-access-key-id": process.env.PLAYER1_KEY_ID, "x-api-secret-access-key" : process.env.PLAYER1_ACCESS_KEY, 'Content-Type' : 'application/json'
          }
        }).then(response => response.json());

    let requestbadplayer = await fetch(`https://xero.gg/api/player/${players[0].name}`, {
          method: 'GET',
          headers: {
            "x-api-access-key-id": process.env.PLAYER2_KEY_ID, "x-api-secret-access-key" : process.env.PLAYER2_ACCESS_KEY, 'Content-Type' : 'application/json'
          }
        }).then(response => response.json());

    const mapImage = new AttachmentBuilder(match.matches[0].map.image, {name : 'image.png'})

    await interaction.reply({
      content: `Mapa: ${match.matches[0].map.name}\nScore: Alpha ${match.matches[0].score.alpha} - Beta ${match.matches[0].score.beta}`, files : [mapImage]
    })

    const imagenGoodPlayer = new AttachmentBuilder(request.player.avatar.image, {name: 'image.png'})

    await interaction.followUp({
      content: `Premios:\nEl mas buenardo: ${players[players.length - 1].name} => ${players[players.length - 1].stats.totalScore} pts\n`, files : [imagenGoodPlayer]
    })

    const imagenBadPlayer = new AttachmentBuilder(requestbadplayer.player.avatar.image, {name: 'image.png'})

    await interaction.followUp({
      content: `El mas malardo: ${players[0].name} => ${players[0].stats.totalScore} pts\n`, files: [imagenBadPlayer]
    })

    await interaction.followUp({
      content: `Mariconada histórica: ${players[Math.floor(Math.random() * players.length)].name}\nDasheada histórica: ${players[Math.floor(Math.random() * players.length)].name}`
    })

  }


  if(interaction.commandName === 'registertier') {
    const player = interaction.options.get("player");
    const tier = interaction.options.get("tier").value;

    const playerToRegister = {
      id: player.value,
      name: player.user.username,
      tier: tier
    }

    playerList.push(playerToRegister);

    const sentMessage = await interaction.reply({
      content: `Jugadores registrados ${playerList.map(player => player.name).join(", ")}`
    })

    setTimeout(async () => {
      sentMessage.delete().catch(console.error);
    }, 5000)
  }

  if(interaction.commandName === 'balanceteams') {
    const balanced = balanceTeams(playerList);

    await interaction.reply({
      content: `Team 1: ${balanced.team1.map(player => `<@${player.id}>`).join(" ")}\nTeam 2: ${balanced.team2.map(player => `<@${player.id}>`).join(" ")}`
    })
  }

});

client.login(process.env.DISCORD_TOKEN);
