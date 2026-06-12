import { readData, writeData } from '../dataaccess/player-data.js';
import { maps } from '../maps.js';

export const registertier = async (interaction) => {
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

    let playerData = await readData();

    let xeroPlayer = playerData.find(p => p.id === interaction.user.id);

    if(!xeroPlayer) {
        let playerSkill = {
            id: interaction.user.id,
            username: interaction.user.username,
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
    
    await writeData(playerData);

    await interaction.reply({
        content: `Tier registrado para <@${interaction.user.id}> en el mapa ${map}`
    });
}

function validSkillValue(value) {
  return value > 0 && value <= 100;
}

export default registertier;