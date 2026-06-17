import { readData } from '../dataaccess/player-data.js';
import { skillsWeights } from '../skills.js';

const checkstats = async (interaction) => {
    const player = interaction.options.get("player");

    const map = interaction.options.get("map").value;

    let playerData = readData();

    let xeroPlayer = playerData.find((p) => p.id === player?.user?.id);

    if (!xeroPlayer) {
        await interaction.reply({
        content: `No existe registro para este jugador`
        })
        return;
    }

    let skill = xeroPlayer.skills.find((s) => s.map === map);

    if (!skill) {
        await interaction.reply({
        content: `Este jugador no tiene registro para este mapa`
        })
        return;
    }

    let playerWeight = (skill.attack * skillsWeights.attack) + (skill.defense * skillsWeights.defense) + (skill.dm * skillsWeights.dm) + (skill.teamplay * skillsWeights.teamplay) + (skill.positioning * skillsWeights.positioning);

    await interaction.reply({
        content: `Estos son los stats de <@${player.user.id}> para el mapa *${map}*:\n\nAttack: ${skill.attack} -> *${skillsWeights.attack * 100}%*\nDefense: ${skill.defense} -> *${skillsWeights.defense * 100}%*\nDM: ${skill.dm} -> *${skillsWeights.dm * 100}%*\nTeamplay: ${skill.teamplay} -> *${skillsWeights.teamplay * 100}%*\nPositioning: ${skill.positioning} -> *${skillsWeights.positioning * 100}%*\n\nPlayer rating: ${playerWeight.toFixed(2)}\n${fraseMotivadora(playerWeight)}`
    });
}

const fraseMotivadora = (playerWeight) => {
    switch(true) {
        case playerWeight >= 0 && playerWeight < 40:
            return "Tier D, aun te falta mucha cancha";
        case playerWeight >= 40 && playerWeight < 60:
            return "Tier C, malardo de epoca";
        case playerWeight >= 60 && playerWeight < 80:
            return "Tier B, espabila joder";
        case playerWeight >= 80 && playerWeight < 90:
            return "Tier A, locura o que?";
        case playerWeight >= 90 && playerWeight <= 100:
            return "Tier S, goat of goats";
    }
}

export default checkstats;