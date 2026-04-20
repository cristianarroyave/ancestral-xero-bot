const tierWeights = {
  S: 5,
  A: 4,
  B: 3,
  C: 2,
  D: 1
}

export function balanceTeams(playerList) {
  const players = flattenPlayers(playerList);

  // Ordenar de mayor peso → menor peso
  players.sort((a, b) => b.weight - a.weight);

  const team1 = [];
  const team2 = [];

  let weight1 = 0;
  let weight2 = 0;

  for (const player of players) {
    // Meter al equipo más ligero
    if (weight1 <= weight2) {
      team1.push(player);
      weight1 += player.weight;
    } else {
      team2.push(player);
      weight2 += player.weight;
    }
  }

  return {
    team1,
    team2,
    totalWeightTeam1: weight1,
    totalWeightTeam2: weight2
  };
}

function flattenPlayers(playerList) {
  const players = [];

  for (const player of playerList) {
    const weight = tierWeights[player.tier];
    const id = player.id;
    const tier = player.tier;


    players.push({
    id,
    tier,
    weight
    });
    
  }

  return players;
}