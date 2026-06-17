import { maps } from '../maps.js';
import { readData } from '../dataaccess/player-data.js';
import { skillsWeights } from '../skills.js';

let games = {}

export const balanceActions = {
    startbalance: async (interaction) => {
        const map = interaction.options.get("map").value;

        if(!maps.includes(map)) {
            await interaction.reply({
            content: `Mapa no válido. Por favor, selecciona uno de los siguientes: ${maps.join(", ")}`
            });
            return;
        }

        games[interaction.user.id] = {
            map: map,
            players: []
        }

        await interaction.reply({
            content: `Partido creado para el mapa ${map}. Usa el comando /addplayer para agregar jugadores a este partido.`
        });
    },
    addPlayer: async (interaction) => {
        let playerId = interaction.options.get("player").user.id;

        const game = games[interaction.user.id];
        if (game) {
            let playerData = await readData();

            let xeroPlayer = playerData.find(p => p.id === playerId);

            if(!xeroPlayer) {
                await interaction.reply({
                    content: `El jugador con ID ${playerId} no existe en la base de datos.`
                });
                return;
            }

            let skill = xeroPlayer.skills.find(s => s.map === game.map);

            if(!skill) {
                await interaction.reply({
                    content: `El jugador con ID ${playerId} no tiene registro para el mapa ${game.map}. Pídele que registre su tier para este mapa usando el comando /registertier.`
                });
                return;
            }

            game.players.push({ playerId: xeroPlayer.id, username: xeroPlayer.username });
        
            await interaction.reply({
                content: `Jugador agregado para el mapa ${game.map} jugadores actuales en el partido: ${game.players.map(p => p.username).join(", ")}`
            });

        } else {
            await interaction.reply({
                content: `No hay un partido activo para este usuario. Usa el comando /startbalance para crear uno.`
            });
        }
    },
    balanceGame : async (interaction) => {
        const game = games[interaction.user.id];

        if (!game) {
            await interaction.reply({
                content: `No hay un partido activo para este usuario. Usa el comando /startbalance para crear uno.`
            });
            return;
        }

        let playerData = await readData();

        playerData = playerData.filter(p => game.players.some(gp => gp.playerId === p.id));

        let playersWithSkills = playerData.map(p => {
            let skill = p.skills.find(s => s.map === game.map);
            let playerWeight = (skill.attack * skillsWeights.attack) + (skill.defense * skillsWeights.defense) + (skill.dm * skillsWeights.dm) + (skill.teamplay * skillsWeights.teamplay) + (skill.positioning * skillsWeights.positioning);
            return { id: p.id, username: p.username, weight: playerWeight };
        });

        let teamA = [];
        let teamB = [];

        playersWithSkills.sort((a, b) => b.weight - a.weight).forEach((p, index) => {
            p.team = index % 2 === 0 ? teamA.push(p) : teamB.push(p);
        });

        await interaction.reply({
            content: `Partido balanceado para el mapa ${game.map}:\n\nEquipo A: ${teamA.map(p => `<@${p.id}>, valor del jugador: ${p.weight.toFixed(2)}`).join(", ")}\nEquipo B: ${teamB.map(p => `<@${p.id}>, valor del jugador: ${p.weight.toFixed(2)}`).join(", ")}\nMedia equipo A: ${(teamA.reduce((acc, p) => acc + p.weight, 0) / teamA.length).toFixed(2)}\nMedia equipo B: ${(teamB.reduce((acc, p) => acc + p.weight, 0) / teamB.length).toFixed(2)}`
        });

        games[interaction.user.id] = null; // Limpiar el partido después de balancear
    }
}

export default balanceActions;