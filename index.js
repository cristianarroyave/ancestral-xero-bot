import dotenv from 'dotenv';
import { Client as RestClient } from 'node-rest-client'
import { balanceTeams } from './balancer.js';
import { maps } from './maps.js';
import fs from 'fs';

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

  const userOption = new SlashCommandUserOption().setName("player").setRequired(true).setDescription("Jugador a registrar el tier");
  const registerTierOption = new SlashCommandStringOption().setName("map").setRequired(true).setDescription("Mapa a registrar");
  const attackOption = new SlashCommandStringOption().setName("attack").setRequired(true).setDescription("Habilidad de ataque del jugador");
  const defenseOption = new SlashCommandStringOption().setName("defense").setRequired(true).setDescription("Habilidad de defensa del jugador");
  const dmOption = new SlashCommandStringOption().setName("dm").setRequired(true).setDescription("Habilidad de DM del jugador");
  const teamplayOption = new SlashCommandStringOption().setName("teamplay").setRequired(true).setDescription("Habilidad de teamplay del jugador");
  const positioningOption = new SlashCommandStringOption().setName("positioning").setRequired(true).setDescription("Habilidad de posicionamiento del jugador");

  const registerTier = new SlashCommandBuilder()
  .setName("registertier")
  .setDescription("Registra un tier para un jugador")
  .addUserOption(userOption)
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
  .addStringOption(checkMapOption)
  .setDefaultMemberPermissions(ApplicationCommandOptionType.GuildMembers)


  client.application.commands.set([registerTier, checkStats])
})

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if(interaction.commandName === 'checkstats') {
    console.log('polla');

    return;
  }

  if(interaction.commandName === 'registertier') {
    const player = interaction.options.get("player");
    const map = interaction.options.get("map").value;

    if(!maps.includes(map)) {
      await interaction.reply({
        content: `Mapa no válido. Por favor, selecciona uno de los siguientes: ${maps.join(", ")}`
      });
      return;
    }
    
    const attack = parseFloat(interaction.options.get("attack").value);
    const defense = parseFloat(interaction.options.get("defense").value);
    const dm = parseFloat(interaction.options.get("dm").value);
    const teamplay = parseFloat(interaction.options.get("teamplay").value);
    const positioning = parseFloat(interaction.options.get("positioning").value);

    if(!validSkillValue(attack) || !validSkillValue(defense) || !validSkillValue(dm) || !validSkillValue(teamplay) || !validSkillValue(positioning)) {
      await interaction.reply({
        content: `Valores de habilidades no válidos. Por favor, ingresa valores entre 1 y 5 para cada habilidad.`
      });
      return;
    }

    let playerData = JSON.parse(fs.readFileSync('player-data.json', 'utf-8'));

    let xeroPlayer = playerData.find(p => p.id === player.user.id);

    if(!xeroPlayer) {
      let playerSkill = {
         id: player.user.id,
         username: player.user.username,
         skills : [
          {
            map: map,
            attack: attack,
            defense: defense,
            dm: dm,
            teamplay: teamplay,
            positioning: positioning
          }
         ]
      }
      playerData.push(playerSkill);
    } else {
      

      let skill = xeroPlayer.skills.find(s => s.map === map);

      if(skill) {
        skill.attack = attack;
        skill.defense = defense;
        skill.dm = dm;
        skill.teamplay = teamplay;
        skill.positioning = positioning;
      } else {
        xeroPlayer.skills.push({
          map: map,
          attack: attack,
          defense: defense,
          dm: dm,
          teamplay: teamplay,
          positioning: positioning
        });
      }
    }
    
    fs.writeFileSync('player-data.json', JSON.stringify(playerData, null, 2));

    await interaction.reply({
      content: `Tier registrado para ${player.user.username} en el mapa ${map}`
    });
  }

});

function validSkillValue(value) {
  return value > 0 && value <= 5;
}

client.login(process.env.DISCORD_TOKEN);
