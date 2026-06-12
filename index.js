import dotenv from 'dotenv';
import { Client as RestClient } from 'node-rest-client'
import { balanceTeams } from './balancer.js';
import { maps } from './maps.js';
import fs from 'fs';
import checkstats from './actions/checkstats.js';
import registertier from './actions/registertier.js';
import balanceActions from './actions/balancematch.js';

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

  const registerTierOption = new SlashCommandStringOption().setName("map").setRequired(true).setDescription("Mapa a registrar");
  const attackOption = new SlashCommandStringOption().setName("attack").setRequired(true).setDescription("Habilidad de ataque del jugador");
  const defenseOption = new SlashCommandStringOption().setName("defense").setRequired(true).setDescription("Habilidad de defensa del jugador");
  const dmOption = new SlashCommandStringOption().setName("dm").setRequired(true).setDescription("Habilidad de DM del jugador");
  const teamplayOption = new SlashCommandStringOption().setName("teamplay").setRequired(true).setDescription("Habilidad de teamplay del jugador");
  const positioningOption = new SlashCommandStringOption().setName("positioning").setRequired(true).setDescription("Habilidad de posicionamiento del jugador");

  const registerTier = new SlashCommandBuilder()
  .setName("registertier")
  .setDescription("Registra un tier para un jugador")
  .addStringOption(registerTierOption)
  .addStringOption(attackOption)
  .addStringOption(defenseOption)
  .addStringOption(dmOption)
  .addStringOption(teamplayOption)
  .addStringOption(positioningOption)
  .setDefaultMemberPermissions(ApplicationCommandOptionType.GuildMembers)

  const checkUserOption = new SlashCommandUserOption().setName("player").setRequired(true).setDescription("Jugador a consultar");
  const checkMapOption = new SlashCommandStringOption().setName("map").setRequired(true).setDescription("Mapa a consultar");

  const checkStats = new SlashCommandBuilder()
  .setName("checkstats")
  .setDescription("Consulta las estadísticas de un jugador")
  .addUserOption(checkUserOption)
  .addStringOption(checkMapOption);
  
  const startBalanceOption = new SlashCommandStringOption().setName("map").setRequired(true).setDescription("Mapa para el partido a balancear");

  const startBalance = new SlashCommandBuilder()
  .setName("startbalance")
  .setDescription("Crea un partido a balancear en el mapa seleccionado")
  .addStringOption(startBalanceOption);

  const addPlayerOption = new SlashCommandUserOption().setName("player").setRequired(true).setDescription("Jugador a agregar al partido");

  const addPlayer = new SlashCommandBuilder()
  .setName("addplayer")
  .setDescription("Agrega un jugador al partido a balancear")
  .addUserOption(addPlayerOption);

  const balanceGame = new SlashCommandBuilder()
  .setName("balancegame")
  .setDescription("Balancea el juego");

  client.application.commands.set([registerTier, checkStats, startBalance, addPlayer, balanceGame]);
})

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if(interaction.commandName === 'checkstats') {
    await checkstats(interaction);
  }

  if(interaction.commandName === 'registertier') {
    await registertier(interaction);
  }

  if(interaction.commandName === 'startbalance') {
    await balanceActions.startbalance(interaction);
  }

  if(interaction.commandName === 'addplayer') {
    await balanceActions.addPlayer(interaction);
  }

  if(interaction.commandName === 'balancegame') {
    await balanceActions.balanceGame(interaction);
  }

});

client.login(process.env.DISCORD_TOKEN);
