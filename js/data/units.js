
import { Unit, alignmentType, civData, combatTypes, doBandits, doBarbarians, doInvaders, doWolves, farmerMods, getPlayerCombatMods, minerMods, 
 placeType, population, speciesType, subTypes, unitType, woodcutterMods } from "../index.js";
// size 15579 => 14334. lines 374 => 276
function getUnitData() {
    let data = [
        new Unit({
            id: unitType.unemployed, singular: "idle citizen", plural: "idle citizens",
            require: undefined,  // Cannot be purchased (through normal controls) xxx Maybe change this?
            defence: 0.03, // default is 0.05 same as wolf efficiency
            salable: false,  // Cannot be sold.
            customQtyId: "spawnCustomQty",
            effectText: "Playing idle games"
        }),
        new Unit({
            id: unitType.farmer, singular: "farmer", plural: "farmers", source: unitType.unemployed,
            efficiency_base: 0.2, defence: 0.06, // default is 0.05 
            get efficiency() { return farmerMods(this.efficiency_base); },
            set efficiency(value) { this.efficiency_base = value; },
            effectText: "Automatically harvest food"
        }),
        new Unit({
            id: unitType.woodcutter, singular: "woodcutter", plural: "woodcutters", source: unitType.unemployed,
            //efficiency_base: 0.49,
            efficiency: 0.49,
            defence: 0.055, 
            //get efficiency() { return woodcutterMods(this.efficiency_base); },
            //set efficiency(value) { this.efficiency_base = value; },
            effectText: "Automatically cut wood"
        }),
        new Unit({
            id: unitType.miner, singular: "miner", plural: "miners", source: unitType.unemployed,
            //efficiency_base: 0.19,
            efficiency: 0.19,
            defence: 0.055, 
            //get efficiency() { return minerMods(this.efficiency_base); },
            //set efficiency(value) { this.efficiency_base = value; },
            effectText: "Automatically mine stone"
        }),
        new Unit({
            id: unitType.cleric, singular: "cleric", plural: "clerics", source: unitType.unemployed,
            prereqs: { temple: 1 }, require: { herbs: 4 },
            efficiency: 0.05, defence: 0.01, 
            get limit() { return civData.temple.owned; },
            set limit(value) { return this.limit; }, // Only here for JSLint.
            effectText: "Generate piety, bury corpses"
        }),
        new Unit({
            id: unitType.healer, singular: "healer", plural: "healers", source: unitType.unemployed,
            prereqs: { apothecary: 1 }, require: { herbs: 2 },
            efficiency: 0.42, // the lower the efficiency, the longer it takes to make 1
            defence: 0.01, 
            init: function (fullInit) { Unit.prototype.init.call(this, fullInit); this.cureCount = 0; },
            get limit() { return civData.apothecary.owned; },
            set limit(value) { return this.limit; }, 
            get cureCount() { return this.data.cureCount; }, // Carry over fractional healing
            set cureCount(value) { this.data.cureCount = value; }, 
            effectText: "Make potions from herbs. Cure sick workers"
        }),
        new Unit({
            id: unitType.tanner, singular: "tanner", plural: "tanners", source: unitType.unemployed,
            efficiency: 0.44, defence: 0.04, 
            prereqs: { tannery: 1 }, require: { skins: 2 },
            get limit() { return civData.tannery.owned; },
            set limit(value) { return this.limit; }, 
            effectText: "Convert skins to leather"
        }),
        new Unit({
            id: unitType.blacksmith, singular: "blacksmith", plural: "blacksmiths", source: unitType.unemployed,
            efficiency: 0.43, defence: 0.04, 
            prereqs: { smithy: 1 }, require: { ore: 2 },
            get limit() { return civData.smithy.owned; },
            set limit(value) { return this.limit; }, 
            effectText: "Convert ore to metal"
        }),
        new Unit({
            id: unitType.limeBurner, singular: "lime burner", plural: "lime burners", source: unitType.unemployed,
            efficiency: 0.5, defence: 0.04, 
            prereqs: { limeKiln: 1 }, require: { wood: 2, stone: 2 },
            get limit() { return civData.limeKiln.owned; },
            set limit(value) { return this.limit; }, 
            effectText: "Use wood and stone to make lime"
        }),
        new Unit({
            id: unitType.charBurner, singular: "charcoal burner", plural: "charcoal burners", source: unitType.unemployed,
            efficiency: 0.5, defence: 0.04, 
            prereqs: { charKiln: 1 }, require: { wood: 2 },
            get limit() { return civData.charKiln.owned; },
            set limit(value) { return this.limit; }, 
            effectText: "Use wood to make charcoal"
        }),
        new Unit({
            id: unitType.ironsmith, singular: "ironsmith", plural: "ironsmiths", source: unitType.unemployed,
            efficiency: 0.2, defence: 0.04, 
            prereqs: { ironWorks: 1 }, require: { ore: 5, charcoal: 2 },
            get limit() { return civData.ironWorks.owned; },
            set limit(value) { return this.limit; }, 
            effectText: "Use ore and charcoal to make iron"
        }),
        new Unit({
            id: unitType.coppsmith, singular: "coppersmith", plural: "coppersmiths", source: unitType.unemployed,
            efficiency: 0.038, defence: 0.04, 
            prereqs: { coppWorks: 1 }, require: { ore: 10, charcoal: 5 },
            get limit() { return civData.coppWorks.owned; },
            set limit(value) { return this.limit; }, 
            effectText: "Use ore and charcoal to make copper"
        }),
        new Unit({
            id: unitType.leadsmith, singular: "leadsmith", plural: "leadsmiths", source: unitType.unemployed,
            efficiency: 0.027, defence: 0.04, 
            prereqs: { leadWorks: 1 }, require: { ore: 25, charcoal: 10 },
            get limit() { return civData.leadWorks.owned; },
            set limit(value) { return this.limit; }, 
            effectText: "Use ore and charcoal to make lead"
        }),
        new Unit({
            id: unitType.tinsmith, singular: "tinsmith", plural: "tinsmiths", source: unitType.unemployed,
            efficiency: 0.02, defence: 0.04, 
            prereqs: { tinWorks: 1 }, require: { ore: 50, charcoal: 25 },
            get limit() { return civData.tinWorks.owned; },
            set limit(value) { return this.limit; }, 
            effectText: "Use ore and charcoal to make tin"
        }),
        new Unit({
            id: unitType.silvsmith, singular: "silversmith", plural: "silversmiths", source: unitType.unemployed,
            efficiency: 0.015, defence: 0.04, 
            prereqs: { silvWorks: 1 }, require: { ore: 100, charcoal: 50 },
            get limit() { return civData.silvWorks.owned; },
            set limit(value) { return this.limit; }, 
            effectText: "Use ore and charcoal to make silver"
        }),
        new Unit({
            id: unitType.labourer, singular: "labourer", plural: "labourers", source: unitType.unemployed,
            prereqs: { wonderStage: 1 }, //xxx This is a hack
            efficiency: 1.0, defence: 0.025, 
            effectText: "Use resources to build wonder"
        }),
        new Unit({
            id: unitType.soldier, singular: "soldier", plural: "soldiers", source: unitType.unemployed,
            prereqs: { barracks: 1 }, require: { leather: 10, metal: 10 },
            combatType: combatTypes.infantry, efficiency_base: 0.05,
            get efficiency() { return this.efficiency_base + getPlayerCombatMods(); },
            set efficiency(value) { this.efficiency_base = value; },
            get limit() { return 10 * civData.barracks.owned; },
            set limit(value) { return this.limit; }, 
            effectText: "Protect from attack"
        }),
        new Unit({
            id: unitType.cavalry, singular: "cavalry", plural: "cavalry", source: unitType.unemployed,
            prereqs: { stable: 1 }, require: { food: 20, leather: 20, metal: 4 },
            combatType: combatTypes.cavalry, efficiency_base: 0.08,
            get efficiency() { return this.efficiency_base + getPlayerCombatMods(); },
            set efficiency(value) { this.efficiency_base = value; },
            get limit() { return 10 * civData.stable.owned; },
            set limit(value) { return this.limit; }, 
            effectText: "Protect from attack"
        }),
        new Unit({
            id: unitType.totalSick, singular: "sick citizen", plural: "sick citizens",
            prereqs: undefined,  // Hide until we get one.
            require: undefined,  // Cannot be purchased.
            salable: false,  // Cannot be sold.
            defence: 0.001, 
            //xxx This (alternate data location) could probably be cleaner.
            get owned() { return population[this.id]; },
            set owned(value) { population[this.id] = value; },
            init: function () { this.owned = this.initOwned; }, //xxx Verify this override is needed.
            effectText: "Use healers and herbs to cure them"
        }),
        new Unit({
            id: unitType.cat, singular: "cat", plural: "cats", subType: subTypes.special,
            require: undefined,  // Cannot be purchased (through normal controls)
            prereqs: { cat: 1 }, // Only visible if you have one.
            prestige: true, // Not lost on reset.
            salable: false,  // Cannot be sold.
            species: speciesType.animal,
            effectText: "Our feline companions"
        }),
        new Unit({
            id: unitType.shade, singular: "shade", plural: "shades", subType: subTypes.special,
            prereqs: undefined,  // Cannot be purchased (through normal controls) xxx Maybe change this?
            require: undefined, 
            salable: false,
            species: speciesType.undead,
            effectText: "Insubstantial spirits"
        }),
        new Unit({
            id: unitType.wolf, singular: "wolf", plural: "wolves",
            alignment: alignmentType.enemy, combatType: combatTypes.animal,
            prereqs: undefined,
            efficiency: 0.04,
            onWin: function () { doWolves(this); },
            // see invader for definitions
            killFatigue: (0.99), 
            killStop: (1.0), 
            killMax: (0.99), 
            species: speciesType.animal,
            effectText: "Eat your workers"
        }),
        new Unit({
            id: unitType.bandit, singular: "bandit", plural: "bandits",
            alignment: alignmentType.enemy, combatType: combatTypes.infantry,
            prereqs: undefined, 
            efficiency: 0.06,
            onWin: function () { doBandits(this); },
            // see invader for definitions
            lootFatigue: (0.1),  
            lootStop: (0.9), 
            lootMax: (0.7), 
            sackFatigue: (0.25),  
            sackStop: (0.95), 
            sackMax: (0.2), 
            killFatigue: (0.5),  
            killStop: (0.99), 
            killMax: (0.1), 
            effectText: "Steal your resources"
        }),
        new Unit({
            id: unitType.barbarian, singular: "barbarian", plural: "barbarians",
            alignment: alignmentType.enemy, combatType: combatTypes.infantry,
            prereqs: undefined, 
            efficiency: 0.11,
            onWin: function () { doBarbarians(this); },
            // see invader for definitions
            lootFatigue: (0.1), 
            lootStop: (0.75), 
            lootMax: (0.3), 
            sackFatigue: (0.1), 
            sackStop: (0.75), 
            sackMax: (0.3), 
            killFatigue: (0.1), 
            killStop: (0.95), 
            killMax: (0.3), 
            conquerFatigue: (0.1), 
            conquerStop: (0.99), 
            conquerMax: (0.1), 
            effectText: "Slaughter, plunder, and burn"
        }),
        new Unit({
            id: unitType.invader, singular: "invader", plural: "invaders",
            alignment: alignmentType.enemy, combatType: combatTypes.infantry,
            prereqs: undefined, // Cannot be purchased.
            efficiency: 0.19, // must be less than soldiers plus mods see combat.getPlayerCombatMods()
            onWin: function () { doInvaders(this); },
            lootFatigue: (0.05), // Max fraction that leave after cleaning out a resource
            lootStop: (0.85), // Chance of an attacker leaving after looting a resource
            lootMax: (0.25), // Max fraction that will loot
            sackFatigue: (0.05), // Max fraction that leave after destroying a building type
            sackStop: (0.85), // Chance of an attacker leaving after sacking a building
            sackMax: (0.25), // Max fraction that will sack
            killFatigue: (0.05), // Max fraction that leave after killing the last person
            killStop: (0.85), // Chance of an attacker leaving after killing a person
            killMax: (0.25), // Max fraction that will kill
            conquerFatigue: (0.05), // Max fraction that leave after conquering the last freeland
            conquerStop: (0.75), // Chance of an attacker leaving after conquering freeland
            conquerMax: (0.75), // Max fraction that will take freeland
            effectText: "Conquer your lands"
        }),
        new Unit({
            id: unitType.esiege, singular: "siege engine", plural: "siege engines",
            alignment: alignmentType.enemy,
            prereqs: undefined, 
            efficiency: 0.1,  // 10% chance to hit
            species: speciesType.mechanical,
            effectText: "Destroy your fortifications"
        }),
        new Unit({
            id: unitType.soldierParty, singular: "soldier", plural: "soldiers", source: unitType.soldier,
            prereqs: { standard: true, barracks: 1 }, require: { food: 2 },
            combatType: combatTypes.infantry, efficiency_base: 0.05,
            get efficiency() { return this.efficiency_base + getPlayerCombatMods(); },
            set efficiency(value) { this.efficiency_base = value; },
            place: placeType.party,
            effectText: "Your raiding party"
        }),
        new Unit({
            id: unitType.cavalryParty, singular: "cavalry", plural: "cavalry", source: unitType.cavalry,
            prereqs: { standard: true, stable: 1 }, require: { food: 5 },
            combatType: combatTypes.cavalry, efficiency_base: 0.08,
            get efficiency() { return this.efficiency_base + getPlayerCombatMods(); },
            set efficiency(value) { this.efficiency_base = value; },
            place: placeType.party,
            effectText: "Your mounted raiders"
        }),
        new Unit({
            id: unitType.siege, singular: "siege engine", plural: "siege engines",
            prereqs: { standard: true, wheel: true }, require: { wood: 250, leather: 50, metal: 50 },
            efficiency: 0.1, // 10% chance to hit
            species: speciesType.mechanical,
            place: placeType.party,
            salable: false,
            effectText: "Destroy enemy fortifications"
        }),
        // TODO: mercenaries only on conquest
        //new Unit({
        //    id: unitType.mercenary, 
        //    singular: "mercenary", 
        //    plural: "mercenaries",
        //    efficiency: 0.05, // 
        //    prereqs: { standard: true, wheel: true },
        //    require: { food: 20, gold: 1 },
        //    species: speciesType.human,
        //    place: placeType.party,
        //    salable: false,
        //    effectText: "Destroy enemy fortifications"
        //}),
        new Unit({
            id: unitType.esoldier, singular: "soldier", plural: "soldiers", alignment: alignmentType.enemy, combatType: combatTypes.infantry,
            prereqs: undefined, // Cannot be purchased.
            efficiency_base: 0.05, efficiency: 0.05,
            place: placeType.party,
            effectText: "Defending enemy troops"
        }),
        /* Not currently used.
         * 66G TODO: use them
        new Unit({ id:unitType.ecavalry, name:"cavalry",
            alignment:alignmentType.enemy,
            combatType:combatTypes.cavalry, 
            prereqs: undefined, // Cannot be purchased.
            efficiency: 0.08,
            place: placeType.party,
            effectText:"Mounted enemy troops" }),
        */
        new Unit({
            id: unitType.efort, singular: "fortification", plural: "fortifications", alignment: alignmentType.enemy,
            prereqs: undefined, 
            efficiency: 0.01, // -1% damage
            species: speciesType.mechanical,
            place: placeType.party,
            effectText: "Reduce enemy casualties"
        })
    ];

    return data;
}

export { getUnitData };