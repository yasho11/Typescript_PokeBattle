import { Pokemon } from "./classes/Pokemon.js";

export interface IPokemon {
  name: string;
  hp: number;
  ap: number;
  type: string;
  dp: number;
  abilities: string[];
  level: number;
  sprites: string;
}

document.addEventListener("DOMContentLoaded", () => {
  let commaSeparatedPokemonName = document.getElementById(
    "CommaSpName"
  ) as HTMLInputElement;
  let register = document.getElementById("RegisterBTN") as HTMLButtonElement;
  let battleLog = document.getElementById("battleLog") as HTMLElement;
  let player1Card = document.getElementById("player1Card") as HTMLElement;
  let player2Card = document.getElementById("player2Card") as HTMLElement;

  register.addEventListener("click", passName);

  let ListofPokemon: Pokemon[] = [];

  async function passName() {
    console.log("Dividing Names into each Pokémon");

    if (!commaSeparatedPokemonName || !commaSeparatedPokemonName.value) {
      console.error("Pokemon names input field not found or empty.");
      alert("Please enter Pokémon names separated by commas.");
      return;
    }

    const PokemonNames: string[] = commaSeparatedPokemonName.value
      .split(",")
      .map((name) => name.trim().toLowerCase());

    for (const PokemonName of PokemonNames) {
      console.log(`Sending Pokémon name to fetch data: ${PokemonName}`);
      try {
        await delay(3000);
        await fetchPokemon(PokemonName);
      } catch (error) {
        console.error(`Error fetching data for ${PokemonName}:`, error);
      }
    }
  }

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function fetchPokemon(pokemonname: string): Promise<IPokemon[]> {
    try {
      let pokemonDataList: IPokemon[] = [];
      const url = `https://pokeapi.co/api/v2/pokemon/${pokemonname}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        alert(
          `Failed to fetch data for ${pokemonname}. Please check the name and try again.`
        );
        return [];
      }

      const data = await response.json();
      const hpStat = data.stats.find((stat: any) => stat.stat.name === "hp");
      const apStat = data.stats.find(
        (stat: any) => stat.stat.name === "attack"
      );
      const dpStat = data.stats.find(
        (stat: any) => stat.stat.name === "defense"
      );

      const pokemonData: IPokemon[] = [
        {
          name: data.name,
          hp: hpStat ? hpStat.base_stat : 0,
          ap: apStat ? apStat.base_stat : 0,
          dp: dpStat ? dpStat.base_stat : 0,
          type: data.types[0]?.type.name || "unknown",
          level: data.base_experience,
          abilities: data.abilities.map((ability: any) => ability.ability.name),
          sprites: data.sprites.front_default,
        },
      ];

      const isDuplicate = ListofPokemon.some(
        (p) => p.name === pokemonData[0].name
      );
      if (isDuplicate) {
        console.log("Duplicate Name");
      } else {
        const pokemon1 = new Pokemon(
          pokemonData[0].name,
          pokemonData[0].hp,
          pokemonData[0].ap,
          pokemonData[0].type,
          pokemonData[0].dp,
          pokemonData[0].abilities,
          pokemonData[0].level,
          pokemonData[0].sprites
        );

        const isChecked = checkPokemon(
          pokemonData[0].level,
          pokemonData[0].hp,
          pokemonData[0].ap
        );
        if (isChecked) {
          ListofPokemon.push(pokemon1);
        }
      }

      if (ListofPokemon.length >= 2) {
        BattleSimulation();
      }

      return pokemonData;
    } catch (error) {
      console.error("Error fetching Pokémon data:", error);
      return [];
    }
  }

  function checkPokemon(
    PokemonLvl: number,
    PokemonHp: number,
    PokemonAp: number
  ) {
    const ExpToLvl = PokemonLvl / 10;
    if (ExpToLvl < 1 || (ExpToLvl > 100 && PokemonAp < 0) || PokemonHp < 0) {
      return false;
    } else {
      return true;
    }
  }

  function PlayerSelection(): { player1: number; player2: number } | null {
    const maxLength = ListofPokemon.length - 1;
    if (maxLength < 1) {
      return null;
    }

    let player1: number;
    let player2: number;

    do {
      player1 = Math.floor(Math.random() * (maxLength + 1));
      player2 = Math.floor(Math.random() * (maxLength + 1));
    } while (player1 === player2);

    return { player1, player2 };
  }

  async function BattleSimulation() {
    const selectedPlayer = PlayerSelection();
    if (!selectedPlayer) {
      return;
    }

    const player1 = ListofPokemon[selectedPlayer.player1];
    const player2 = ListofPokemon[selectedPlayer.player2];

    displayCards(selectedPlayer.player1, selectedPlayer.player2);

    let Player1turn = true;
    let p1_dp = player1.dp * 0.05;
    let p2_dp = player2.dp * 0.05;
    let p1_Hp = player1.hp + p1_dp;
    let p2_Hp = player2.hp + p2_dp;
    let p1_a = player1.ap * 0.2;
    let p2_a = player2.ap * 0.2;
    let Winner;
    let maxIterations = 100;

    do {
      if (--maxIterations <= 0) break;

      if (Player1turn) {
        p2_Hp -= p1_a;
        battleLog.innerHTML += `${player1.name} used ${player1.abilities.join(
          ", "
        )} to damage ${player2.name}: ${p1_a.toFixed(1)}<br>`;
        updatePlayerCard(p1_Hp, p2_Hp);
        if (p2_Hp < 0) {
          p2_Hp = 0;
          Winner = checkWinner(
            p1_Hp,
            p2_Hp,
            selectedPlayer.player1,
            selectedPlayer.player2
          );
        }
      } else {
        p1_Hp -= p2_a;
        battleLog.innerHTML += `${player2.name} used ${player2.abilities.join(
          ", "
        )} to damage ${player1.name}: ${p2_a.toFixed(1)}<br>`;
        updatePlayerCard(p1_Hp, p2_Hp);
        if (p1_Hp < 0) {
          p1_Hp = 0;
          Winner = checkWinner(
            p1_Hp,
            p2_Hp,
            selectedPlayer.player1,
            selectedPlayer.player2
          );
        }
      }

      battleLog.innerHTML += `Player1 HP: ${p1_Hp.toFixed(
        1
      )} | Player2 HP: ${p2_Hp.toFixed(1)}<br>`;
      Player1turn = !Player1turn;

      await delay(2000); // 2 seconds delay between attacks
    } while (p1_Hp > 0.1 && p2_Hp > 0.1);

    if (Winner === selectedPlayer.player1) {
      MoveWinner(Winner, selectedPlayer.player2);
    } else if (Winner === selectedPlayer.player2) {
      MoveWinner(Winner, selectedPlayer.player1);
    }
  }

  function checkWinner(
    p1_Hp: number,
    p2_Hp: number,
    player1: number,
    player2: number
  ) {
    if (p1_Hp > 0) {
      return player1;
    } else if (p2_Hp > 0) {
      return player2;
    }
    return 0; // Draw
  }

  function MoveWinner(Winner: any, Loser: any) {
    ListofPokemon.splice(Loser, 1);
    if (ListofPokemon.length === 1) {
      console.log(`Grand Champion: ${ListofPokemon[0].name}`);
    } else {
      BattleSimulation();
    }
  }

  let p2Health = document.getElementById("player2Health") as HTMLSpanElement;
  let p1Health = document.getElementById("player1Health") as HTMLSpanElement;

  function displayCards(player1: number, player2: number) {
    let cardhold = document.getElementById("cardhold") as HTMLDivElement;

    cardhold.style.display = "flex";
    // for player1
    let img1 = document.getElementById("img1") as HTMLImageElement;
    let p1Name = document.getElementById("player1Name") as HTMLSpanElement;
    let p1Attack = document.getElementById("player1Attack") as HTMLSpanElement;
    let p1Defence = document.getElementById(
      "player1Defence"
    ) as HTMLSpanElement;
    let p1type = document.getElementById("player1Type") as HTMLSpanElement;

    // for player2
    let img2 = document.getElementById("img2") as HTMLImageElement;
    let p2Name = document.getElementById("player2Name") as HTMLSpanElement;
    let p2Attack = document.getElementById("player2Attack") as HTMLSpanElement;
    let p2Defence = document.getElementById(
      "player2Defence"
    ) as HTMLSpanElement;
    let p2Type = document.getElementById("player2Type") as HTMLSpanElement;

    // Retrieve data from ListofPokemon
    const Li1 = ListofPokemon[player1];
    const Li2 = ListofPokemon[player2];

    // Set player1 attributes
    img1.src = Li1.sprites;
    p1Name.innerHTML = Li1.name;
    p1Health.innerHTML = Li1.hp.toString();
    p1Attack.innerHTML = Li1.ap.toString();
    p1Defence.innerHTML = Li1.dp.toString();
    p1type.innerHTML = Li1.type;

    // Set player2 attributes
    img2.src = Li2.sprites;
    p2Name.innerHTML = Li2.name;
    p2Health.innerHTML = Li2.hp.toString();
    p2Attack.innerHTML = Li2.ap.toString();
    p2Defence.innerHTML = Li2.dp.toString();
    p2Type.innerHTML = Li2.type;
  }

  function updatePlayerCard(p1_Hp: number, p2_Hp: number): void {
    // Ensure health values are not negative
    if (p1_Hp < 0) {
      p1_Hp = 0;
    }
    if (p2_Hp < 0) {
      p2_Hp = 0;
    }

    // Format health values to one decimal place
    const p1H: string = p1_Hp.toFixed(1);
    const p2H: string = p2_Hp.toFixed(1);

    p1Health.innerHTML = p1H;
    p2Health.innerHTML = p2H;
  }
});
