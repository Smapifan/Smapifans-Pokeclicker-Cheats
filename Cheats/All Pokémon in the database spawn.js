(() => {
    console.log("🌟 Starte ShinySpawn: Alle Pokémon direkt shiny hinzufügen...");

    const party = App.game.party;
    if (!party) return console.warn("❌ Party-System nicht gefunden!");

    const pokemonSources = [window.DataPokemon, window.pokemonList, window.pokemonMap];

    if (Array.isArray(party.partyPokemon)) party.partyPokemon.splice(0);
    if (Array.isArray(party.caughtPokemon)) party.caughtPokemon.splice(0);
    console.log("🧹 Party geleert.");

    const addedSet = new Set();
    const allNewPokemon = [];

    pokemonSources.forEach(src => {
        if (!src) return;
        Object.values(src).forEach(pData => {
            if (!pData?.id || addedSet.has(pData.id)) return;
            try {
                // true = shiny direkt
                const newPoke = party.gainPokemonById(pData.id, true);
                if (!newPoke) return;
                allNewPokemon.push(newPoke);
                addedSet.add(pData.id);
            } catch (e) {
                console.warn(`⚠️ Fehler bei ${pData.name || pData.id}:`, e);
            }
        });
    });
    
    const fixPokemonStats = (pokemon) => {
        pokemon.level = 100;
        pokemon.attackBonusAmount = 5e9;
    };

    App.game.party.caughtPokemon.forEach(p => fixPokemonStats(p));

    const oldLoad = App.game.party.fromJSON.bind(App.game.party);
    App.game.party.fromJSON = function (json) {
        oldLoad(json);
        App.game.party.caughtPokemon.forEach(p => fixPokemonStats(p));
    };

    const oldGain = App.game.party.gainPokemonById.bind(App.game.party);
    App.game.party.gainPokemonById = function (id, ...args) {
        const result = oldGain(id, ...args);
        const caught = App.game.party.caughtPokemon;
        fixPokemonStats(caught[caught.length - 1]); // letztes = neu gefangen
        return result;
    };

    console.log(`✅ ${allNewPokemon.length} Pokémon wurden gespawnt und auf levwl 100 mit 5 Milliarden schaden gepatcht`);
    
})();
