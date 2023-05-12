"use strict";
import { Upgrade, deityDomains, renameDeity, subTypes, updatePopulation, updateResourceTotals, updateUpgrades } from "../index.js";

function getUpgradeData() {
    let data = [
        // Upgrades start:size 28,282 => 24373. line: 695 => 403
        // 35k => 32k
        new Upgrade({
            id: "domestication", name: "Domestication", require: { food: 20 },
            effectText: "Unlock more upgrades"
        }),
        new Upgrade({
            id: "skinning", name: "Skinning", prereqs: { domestication: true }, require: { skins: 10 },
            effectText: "Farmers can collect skins"
        }),
        new Upgrade({
            id: "farming", name: "Farming", prereqs: { domestication: true }, require: { food: 100, wood: 100 },
            effectText: "Increase farmer food output. Unlock more upgrades"
        }),
        new Upgrade({
            id: "agriculture", name: "Agriculture", prereqs: { farming: true }, require: { food: 1000, skins: 100 },
            effectText: "Increase farmer food output. Unlock more upgrades"
        }),
        new Upgrade({
            id: "croprotation", name: "Crop Rotation", prereqs: { agriculture: true }, require: { skins: 250, herbs: 250 },
            effectText: "Increase farmer food output. Find herbs more frequently"
        }),
        new Upgrade({
            id: "selectivebreeding", name: "Selective Breeding", prereqs: { agriculture: true }, require: { herbs: 250, ore: 250 },
            effectText: "Increase farmer food output. Find skins more frequently"
        }),
        new Upgrade({
            id: "fertilisers", name: "Fertilisers", prereqs: { agriculture: true }, require: { skins: 250, ore: 250 },
            effectText: "Increase farmer food output. Unlock more upgrades"
        }),
        new Upgrade({
            id: "toolmaking", name: "Tool Making", require: { wood: 20, stone: 20 },
            effectText: "Workers can make tools"
        }),
        new Upgrade({
            id: "felling", name: "Felling", prereqs: { toolmaking: true }, require: { wood: 20 },
            effectText: "Unlock more buildings and upgrades"
        }),
        new Upgrade({
            id: "harvesting", name: "Harvesting", prereqs: { felling: true }, require: { herbs: 10 },
            effectText: "Woodcutters can collect herbs"
        }),
        new Upgrade({
            id: "carpentry", name: "Carpentry", prereqs: { felling: true }, require: { wood: 100, stone: 100 },
            effectText: "Increase woodcutter wood output. Unlock more upgrades"
        }),
        new Upgrade({
            id: "wheel", name: "The Wheel", prereqs: { carpentry: true }, require: { wood: 500, stone: 500 },
            effectText: "Increase basic worker output. Unlock more buildings"
        }),
        new Upgrade({
            id: "quarrying", name: "Quarrying", prereqs: { toolmaking: true }, require: { stone: 20 },
            effectText: "Unlock more buildings and upgrades"
        }),
        new Upgrade({
            id: "prospecting", name: "Prospecting", prereqs: { quarrying: true }, require: { ore: 10 },
            effectText: "Miners can collect ore"
        }),
        new Upgrade({
            id: "mining", name: "Mining", prereqs: { quarrying: true }, require: { food: 100, stone: 100  },
            effectText: "Increase miner stone output. Unlock more upgrades"
        }),
        new Upgrade({
            id: "metalwork", name: "Metalwork", prereqs: { mining: true }, require: { wood: 200, stone: 200, ore: 50 },
            effectText: "Unlock more buildings and upgrades"
        }),
        new Upgrade({
            id: "ploughshares", name: "Ploughshares", prereqs: { farming: true, metalwork: true, civSize: "smVillage" }, require: { wood: 400, metal: 200 },
            effectText: "Increase farmer food output"
        }),
        new Upgrade({
            id: "weaponry", name: "Basic Weaponry", prereqs: { metalwork: true, barracks: 1 }, require: { wood: 500, metal: 200 },
            effectText: "Improve soldiers"
        }),
        new Upgrade({
            id: "shields", name: "Basic Shields", prereqs: { metalwork: true, barracks: 1 }, require: { wood: 500, leather: 200 },
            effectText: "Improve soldiers"
        }),
        new Upgrade({
            id: "armour", name: "Basic Armour", prereqs: { metalwork: true, barracks: 1 }, require: { metal: 250, leather: 250 },
            effectText: "Improve soldiers"
        }),
        new Upgrade({
            id: "smelting", name: "Smelting", prereqs: { metalwork: true, civSize: "smVillage" }, require: { wood: 1000, stone: 500, ore: 100 },
            effectText: "Unlock more buildings and upgrades"
        }),

        new Upgrade({
            id: "masonry", name: "Masonry", prereqs: { quarrying: true }, require: { wood: 200, stone: 200 },
            effectText: "Unlock more upgrades"
        }),
        new Upgrade({
            id: "buildings", name: "Buildings", prereqs: { carpentry: true, masonry: true, civSize: "thorp" }, require: { wood: 500, stone: 500 },
            effectText: "Unlock more buildings and upgrades"
        }),
        new Upgrade({
            id: "coppicing", name: "Coppicing", prereqs: { felling: true, buildings: true, civSize: "smVillage" }, require: { wood: 1000, charcoal: 500 },
            effectText: "Increase wood and charcoal production"
        }),
        new Upgrade({
            id: "butchering", name: "Butchering", prereqs: { skinning: true, buildings: true, civSize: "smVillage" }, require: { leather: 40 },
            effectText: "Farmers collect more skins"
        }),
        new Upgrade({
            id: "gardening", name: "Gardening", prereqs: { harvesting: true, buildings: true, civSize: "smVillage" }, require: { potions: 40 },
            effectText: "Woodcutters collect more herbs"
        }),
        new Upgrade({
            id: "extraction", name: "Extraction", prereqs: { prospecting: true, buildings: true, civSize: "smVillage" }, require: { metal: 40 },
            effectText: "Miners collect more ore"
        }),
        new Upgrade({
            id: "irrigation", name: "Irrigation", prereqs: { farming: true, buildings: true }, require: { wood: 500, stone: 250 },
            effectText: "Increase farmer food output"
        }),
        new Upgrade({
            id: "horseback", name: "Horseback Riding", prereqs: { domestication: true, buildings: true, civSize: "smVillage" }, require: { food: 500, wood: 500 },
            effectText: "Build stables for cavalry"
        }),
        // construction
        new Upgrade({
            id: "construction", name: "Construction", prereqs: { buildings: true, civSize: "smVillage" }, require: { wood: 1000, stone: 1000 },
            effectText: "Unlock more buildings and upgrades"
        }),
        new Upgrade({
            id: "flensing", name: "Flensing", prereqs: { butchering: true, construction: true, civSize: "smTown" }, require: { food: 1200, leather: 300 },
            effectText: "Collect skins more frequently"
        }),
        new Upgrade({
            id: "reaping", name: "Reaping", prereqs: { gardening: true, construction: true, civSize: "smTown" }, require: { wood: 1200, potions: 300 },
            effectText: "Collect herbs more frequently"
        }),
        new Upgrade({
            id: "macerating", name: "Macerating", prereqs: { extraction: true, construction: true, civSize: "smTown" }, require: {  stone: 1200, metal: 300 },
            effectText: "Collect ore more frequently"
        }),
        new Upgrade({
            id: "rampart", name: "Ramparts", prereqs: { construction: true }, require: { wood: 500, stone: 1000 },
            efficiency: 0.005, // Subtracted from attacker efficiency
            effectText: "Enemies do less damage"
        }),
        new Upgrade({
            id: "limestone", name: "Limestone", prereqs: { construction: true }, require: { wood: 1000, stone: 1000 },
            effectText: "Increase lime production"
        }),
        // storage
        new Upgrade({
            id: "granaries", name: "Granaries", prereqs: { construction: true }, require: { wood: 1200, stone: 1200 },
            effectText: "Barns store double the amount of food",
            onGain: function () { updateResourceTotals(); }
        }),
        new Upgrade({
            id: "granaries2", name: "Large Granaries", prereqs: { granaries: true, engineering: true }, require: { wood: 12000, stone: 12000 },
            effectText: "Increase barns storage of food",
            onGain: function () { updateResourceTotals(); }
        }),
        new Upgrade({
            id: "granaries3", name: "Vast Granaries", prereqs: { granaries2: true, architecture: true }, require: { wood: 120000, stone: 120000 },
            effectText: "Increase barns storage of food",
            onGain: function () { updateResourceTotals(); }
        }),
        new Upgrade({
            id: "warehouses", name: "Warehouses", prereqs: { construction: true }, require: { wood: 1200, stone: 1200 },
            effectText: "Stockpiles store double the amount of wood and stone",
            onGain: function () { updateResourceTotals(); }
        }),
        new Upgrade({
            id: "warehouses2", name: "Large Warehouses", prereqs: { warehouses: true, engineering: true }, require: { wood: 12000, stone: 12000 },
            effectText: "Increase stockpiles storage amount",
            onGain: function () { updateResourceTotals(); }
        }),
        new Upgrade({
            id: "warehouses3", name: "Vast Warehouses", prereqs: { warehouses2: true, architecture: true }, require: { wood: 120000, stone: 120000 },
            effectText: "Increase stockpiles storage amount",
            onGain: function () { updateResourceTotals(); }
        }),
        new Upgrade({
            id: "storehouses", name: "Storehouses", prereqs: { construction: true }, require: { wood: 1400, stone: 1400 },
            effectText: "Store double the amount of found resources (skins, herbs, ore etc)",
            onGain: function () { updateResourceTotals(); }
        }),
        new Upgrade({
            id: "storehouses2", name: "Large Storehouses", prereqs: { storehouses: true, engineering: true }, require: { wood: 14000, stone: 14000 },
            effectText: "Increase storage amount of found resources (skins, herbs, ore etc)",
            onGain: function () { updateResourceTotals(); }
        }),
        new Upgrade({
            id: "storehouses3", name: "Vast Storehouses", prereqs: { storehouses2: true, architecture: true }, require: { wood: 140000, stone: 140000 },
            effectText: "Increase storage amount of found resources (skins, herbs, ore etc)",
            onGain: function () { updateResourceTotals(); }
        }),
        new Upgrade({
            id: "storerooms", name: "Storerooms", prereqs: { construction: true }, require: { wood: 1600, stone: 1600 },
            effectText: "Store double the amount of made resources (leather, potions, metal etc)",
            onGain: function () { updateResourceTotals(); }
        }),
        new Upgrade({
            id: "storerooms2", name: "Large Storerooms", prereqs: { storerooms: true, engineering: true }, require: { wood: 16000, stone: 16000 },
            effectText: "Increase storage amount of made resources (leather, potions, metal etc)",
            onGain: function () { updateResourceTotals(); }
        }),
        new Upgrade({
            id: "storerooms3", name: "Vast Storerooms", prereqs: { storerooms2: true, architecture: true }, require: { wood: 160000, stone: 160000 },
            effectText: "Increase storage amount of made resources (leather, potions, metal etc)",
            onGain: function () { updateResourceTotals(); }
        }),
        // engineering
        new Upgrade({
            id: "engineering", name: "Engineering", prereqs: { construction: true, civSize: "smTown" }, require: { wood: 5000, stone: 5000 },
            effectText: "Unlock more buildings and upgrades"
        }),
        new Upgrade({
            id: "slums", name: "Slums", prereqs: { engineering: true }, require: { food: 4000, wood: 4000, stone: 4000 },
            effectText: "Tenements support +4 workers",
            onGain: function () { updatePopulation(); }
        }),
        new Upgrade({
            id: "palisade", name: "Palisades", prereqs: { engineering: true, rampart: true }, require: { wood: 10000, stone: 10000 },
            efficiency: 0.01, // see rampart
            effectText: "Enemies do less damage"
        }),
        new Upgrade({
            id: "stdweaponry", name: "Standard Weaponry", prereqs: { weaponry: true, engineering: true }, require: { wood: 2500, metal: 2500 },
            effectText: "Improve soldiers"
        }),
        new Upgrade({
            id: "stdshields", name: "Standard Shields", prereqs: { shields: true, engineering: true }, require: { wood: 2500, leather: 2500 },
            effectText: "Improve soldiers"
        }),
        new Upgrade({
            id: "stdarmour", name: "Standard Armour", prereqs: { armour: true, engineering: true }, require: { metal: 2500, leather: 2500 },
            effectText: "Improve soldiers"
        }),

        new Upgrade({
            id: "architecture", name: "Architecture", prereqs: { engineering: true, civSize: "smCity" }, require: { wood: 50000, stone: 50000 },
            effectText: "Unlock more buildings and upgrades"
        }),
        new Upgrade({
            id: "battlement", name: "Battlements", prereqs: { architecture: true, palisade: true }, require: { wood: 25000, stone: 50000 },
            efficiency: 0.02, // see rampart
            effectText: "Enemies do less damage"
        }),
        new Upgrade({
            id: "advweaponry", name: "Advanced Weaponry", prereqs: { stdweaponry: true, architecture: true },
            require: { metal: 10000, iron: 5000, copper: 500, tin: 50 },
            effectText: "Improve soldiers"
        }),
        new Upgrade({
            id: "advshields", name: "Advanced Shields", prereqs: { stdshields: true, architecture: true },
            require: { wood: 20000, iron: 2000, copper: 500, tin: 50 },
            effectText: "Improve soldiers"
        }),
        new Upgrade({
            id: "advarmour", name: "Advanced Armour", prereqs: { stdarmour: true, architecture: true },
            require: { leather: 10000, iron: 5000, copper: 1000, tin: 100 },
            effectText: "Improve soldiers"
        }),

        // metals and ores
        new Upgrade({
            id: "ironAlloy", name: "Iron Alloy", prereqs: { construction: true }, require: { ore: 1000 },
            effectText: "Smelt iron from alloys"
        }),
        new Upgrade({
            id: "ironOre", name: "Iron Ore", prereqs: { ironAlloy: true, engineering: true }, require: { ore: 500, charcoal: 250, iron: 65 },
            effectText: "Low grade ore. Increase ore and iron production"
        }),
        new Upgrade({
            id: "ironOre2", name: "Magnetite", prereqs: { ironOre: true, architecture: true }, require: { ore: 5000, charcoal: 2500, iron: 650 },
            effectText: "High grade iron ore. Increase ore and iron production"
        }),
        new Upgrade({
            id: "coppAlloy", name: "Copper Alloy", prereqs: { construction: true }, require: { ore: 2000 },
            effectText: "Smelt copper from alloys"
        }),
        new Upgrade({
            id: "coppOre", name: "Copper Ore", prereqs: { coppAlloy: true, engineering: true }, require: { ore: 1000, charcoal: 500, copper: 55 },
            effectText: "Low grade ore. Increase ore and copper production"
        }),
        new Upgrade({
            id: "coppOre2", name: "Malachite", prereqs: { coppOre: true, architecture: true }, require: { ore: 10000, charcoal: 5000, copper: 550 },
            effectText: "High grade copper ore. Increase ore and copper production"
        }),
        new Upgrade({
            id: "leadAlloy", name: "Lead Alloy", prereqs: { construction: true }, require: { ore: 3200 },
            effectText: "Smelt lead from alloys"
        }),
        new Upgrade({
            id: "leadOre", name: "Lead Ore", prereqs: { leadAlloy: true, engineering: true }, require: { ore: 1600, charcoal: 800, lead: 45 },
            effectText: "Low grade ore. Increase ore and lead production"
        }),
        new Upgrade({
            id: "leadOre2", name: "Galena", prereqs: { leadOre: true, architecture: true }, require: { ore: 16000, charcoal: 8000, lead: 450 },
            effectText: "High grade lead ore. Increase ore and lead production"
        }),
        new Upgrade({
            id: "tinAlloy", name: "Tin Alloy", prereqs: { construction: true }, require: { ore: 4000 },
            effectText: "Smelt tin from alloys"
        }),
        new Upgrade({
            id: "tinOre", name: "Tin Ore", prereqs: { tinAlloy: true, engineering: true }, require: { ore: 2000, charcoal: 1000, tin: 35 },
            effectText: "Low grade ore. Increase ore and tin production"
        }),
        new Upgrade({
            id: "tinOre2", name: "Cassiterite", prereqs: { tinOre: true, architecture: true }, require: { ore: 24000, charcoal: 12000, tin: 350 },
            effectText: "High grade tin ore. Increase ore and tin production"
        }),
        new Upgrade({
            id: "silvAlloy", name: "Silver Alloy", prereqs: { construction: true }, require: { ore: 8000 },
            effectText: "Smelt tin from alloys"
        }),
        new Upgrade({
            id: "silvOre", name: "Silver Ore", prereqs: { silvAlloy: true, engineering: true }, require: { ore: 4000, charcoal: 2000, silver: 25 },
            effectText: "Low grade ore. Increase ore and silver production"
        }),
        new Upgrade({
            id: "silvOre2", name: "Argentite", prereqs: { silvOre: true, architecture: true }, require: { ore: 60000, charcoal: 30000, silver: 250 },
            effectText: "High grade silver ore. Increase ore and silver production"
        }),
        new Upgrade({
            id: "mercAlloy", name: "Mercury Alloy", prereqs: { construction: true }, require: { ore: 16000 },
            effectText: "Smelt mercury from alloys"
        }),
        new Upgrade({
            id: "mercOre", name: "Mercury Ore", prereqs: { mercAlloy: true, engineering: true }, require: { ore: 8000, charcoal: 4000, mercury: 15 },
            effectText: "Low grade ore. Increase ore and mercury production"
        }),
        new Upgrade({
            id: "mercOre2", name: "Cinnabar", prereqs: { mercOre: true, engineering: true }, require: { ore: 120000, charcoal: 60000, mercury: 150 },
            effectText: "High grade mercury ore. Increase ore and mercury production"
        }),
        new Upgrade({
            id: "goldAlloy", name: "Gold Alloy", prereqs: { construction: true }, require: { ore: 30000 },
            effectText: "Extract gold from alloys"
        }),
        new Upgrade({
            id: "goldOre", name: "Gold Ore", prereqs: { goldAlloy: true, engineering: true }, require: { ore: 15000, charcoal: 10000, gold: 5 },
            effectText: "Low grade ore. Increase ore and gold production"
        }),
        new Upgrade({
            id: "goldOre2", name: "Electrum", prereqs: { goldOre: true, engineering: true }, require: { ore: 240000, charcoal: 120000, gold: 50 },
            effectText: "High grade gold alloy. Increase ore and gold production"
        }),
        // piety related
        new Upgrade({
            id: "theism", name: "Theism", prereqs: { buildings: true, temple: 1 }, require: { piety: 150 },
            effectText: "Increase cleric piety generation. Increase piety limit"
        }),
        new Upgrade({
            id: "polytheism", name: "Polytheism", prereqs: { theism: true, civSize: "smTown" }, require: { piety: 800 },
            effectText: "Increase cleric piety generation. Increase piety limit"
        }),
        new Upgrade({
            id: "monotheism", name: "Monotheism", prereqs: { polytheism: true, civSize: "smCity" }, require: { piety: 2000 },
            effectText: "Increase cleric piety generation. Increase piety limit"
        }),
        new Upgrade({
            id: "feudalism", name: "Feudalism", prereqs: { polytheism: true }, require: { piety: 5000 },
            effectText: "Further increase basic resources from clicking. Increase labourer efficiency"
        }),
        new Upgrade({
            id: "serfs", name: "Serfs", prereqs: { polytheism: true }, require: { piety: 5000 },
            effectText: "Idle workers increase resources from clicking. Increase labourer efficiency"
        }),
        new Upgrade({
            id: "writing", name: "Writing", prereqs: { polytheism: true }, require: { skins: 1000, piety: 2000 },
            effectText: "Increase cleric piety generation. Unlock more upgrades"
        }),
        new Upgrade({
            id: "mathematics", name: "Mathematics", prereqs: { writing: true }, require: { metal: 2000, piety: 2000 },
            effectText: "Increase metal production"
        }),
        new Upgrade({
            id: "astronomy", name: "Astronomy", prereqs: { writing: true }, require: { leather: 2000, piety: 2000 },
            effectText: "Increase leather production"
        }),
        new Upgrade({
            id: "medicine", name: "Medicine", prereqs: { writing: true }, require: { potions: 2000, piety: 2000 },
            effectText: "Increase potion production"
        }),
        new Upgrade({
            id: "administration", name: "Administration", prereqs: { writing: true, civSize: "cityState" }, require: { stone: 25000, herbs: 25000 },
            effectText: "Increase land gained from raiding"
        }),
        new Upgrade({
            id: "codeoflaws", name: "Code of Laws", prereqs: { administration: true }, require: { wood: 25000, ore: 25000 },
            effectText: "Reduce unhappiness caused by overcrowding. Unlock upgrades"
        }),
        new Upgrade({
            id: "aesthetics", name: "Aesthetics", prereqs: { polytheism: true }, require: { piety: 3000 },
            effectText: "Building temples increases morale"
        }),
        new Upgrade({
            id: "civilservice", name: "Civil Service", prereqs: { codeoflaws: true }, require: { piety: 40000 },
            effectText: "Increase basic resources from clicking. Increase labourer efficiency. Unlock upgrades"
        }),
        new Upgrade({
            id: "guilds", name: "Guilds", prereqs: { astronomy: true, mathematics: true, medicine: true }, require: { piety: 8000 },
            effectText: "Increase special resources from clicking. Increase labourer efficiency."
        }),
        new Upgrade({
            id: "nationalism", name: "Nationalism", prereqs: { civilservice: true, civSize: "smNation" }, require: { piety: 100000 },
            effectText: "Soldiers increase basic resources from clicking. Increase labourer efficiency"
        }),
        // deity
        new Upgrade({
            id: "worship", name: "Worship", subType: subTypes.deity, prereqs: { temple: 1 }, require: { piety: 1000 },
            effectText: "Begin worshipping a deity (requires temple)",
            onGain: function () {
                updateUpgrades();
                renameDeity(); //Need to add in some handling for when this returns NULL.
            }
        }),
        // Pantheon Upgrades
        new Upgrade({
            id: "lure", name: "Lure of Civilisation", subType: subTypes.pantheon,
            prereqs: { deity: deityDomains.cats, devotion: 10 }, require: { piety: 1000 },
            effectText: "Increase chance to get cats"
        }),
        new Upgrade({
            id: "companion", name: "Warmth of the Companion", subType: subTypes.pantheon,
            prereqs: { deity: deityDomains.cats, devotion: 30 }, require: { piety: 1000 },
            effectText: "Cats help heal the sick"
        }),
        new Upgrade({
            id: "comfort", name: "Comfort of the Hearthfires", subType: subTypes.pantheon,
            prereqs: { deity: deityDomains.cats, devotion: 50 }, require: { piety: 5000 },
            effectText: "Traders marginally more frequent"
        }),
        new Upgrade({
            id: "blessing", name: "Blessing of Abundance", subType: subTypes.pantheon,
            prereqs: { deity: deityDomains.fields, devotion: 10 }, require: { piety: 1000 },
            effectText: "Increase farmer food output"
        }),
        new Upgrade({
            id: "waste", name: "Abide No Waste", subType: subTypes.pantheon,
            prereqs: { deity: deityDomains.fields, devotion: 30 }, require: { piety: 1000 },
            effectText: "Workers will eat corpses if there is no food left"
        }),
        new Upgrade({
            id: "stay", name: "Stay With Us", subType: subTypes.pantheon,
            prereqs: { deity: deityDomains.fields, devotion: 50 }, require: { piety: 5000 },
            effectText: "Traders stay longer"
        }),
        new Upgrade({
            id: "riddle", name: "Riddle of Steel", subType: subTypes.pantheon,
            prereqs: { deity: deityDomains.battle, devotion: 10 }, require: { piety: 1000 },
            effectText: "Improve soldiers"
        }),
        new Upgrade({
            id: "throne", name: "Throne of Skulls", subType: subTypes.pantheon,
            prereqs: { deity: deityDomains.battle, devotion: 30 }, require: { piety: 1000 },
            init: function (fullInit) { Upgrade.prototype.init.call(this, fullInit); this.count = 0; },
            get count() { return this.data.count; }, // Partial temples from Throne
            set count(value) { this.data.count = value; },
            effectText: "Slaying enemies creates temples"
        }),
        new Upgrade({
            id: "lament", name: "Lament of the Defeated", subType: subTypes.pantheon,
            prereqs: { deity: deityDomains.battle, devotion: 50 }, require: { piety: 5000 },
            effectText: "Successful raids delay future invasions"
        }),
        new Upgrade({
            id: "book", name: "The Book of the Dead", subType: subTypes.pantheon,
            prereqs: { deity: deityDomains.underworld, devotion: 10 }, require: { piety: 1000 },
            effectText: "Gain piety with deaths"
        }),
        new Upgrade({
            id: "feast", name: "A Feast for Crows", subType: subTypes.pantheon,
            prereqs: { deity: deityDomains.underworld, devotion: 30 }, require: { piety: 1000 },
            effectText: "Corpses are less likely to cause illness"
        }),
        new Upgrade({
            id: "secrets", name: "Secrets of the Tombs", subType: subTypes.pantheon,
            prereqs: { deity: deityDomains.underworld, devotion: 50 }, require: { piety: 5000 },
            effectText: "Graveyards increase cleric piety generation"
        }),
        // Special Upgrades
        new Upgrade({
            id: "standard", name: "Battle Standard", subType: subTypes.conquest, prereqs: { barracks: 1 }, require: { leather: 1000, metal: 1000 },
            effectText: "Lets you build an army (requires barracks)"
        }),
        new Upgrade({
            id: "trade", name: "Trade", subType: subTypes.trade, prereqs: { coins: 100 }, require: { coins: 100 },
            effectText: "Open the trading post"
        }),
        new Upgrade({
            id: "currency", name: "Currency", subType: subTypes.trade, prereqs: { trade: true }, require: { coins: 1000 },
            effectText: "Traders arrive more frequently, stay longer"
        }),
        new Upgrade({
            id: "commerce", name: "Commerce", subType: subTypes.trade, prereqs: { currency: true }, require: { coins: 5000 },
            effectText: "Traders arrive even more frequently, stay even longer"
        }),
        new Upgrade({
            id: "cornexchange", name: "Corn Exchange", subType: subTypes.trade, prereqs: { commerce: true }, require: { coins: 10000 },
            effectText: "Traders may change the trade amount of resources"
        }),
        // Prayers
        new Upgrade({
            id: "smite", name: "Smite Invaders", subType: subTypes.prayer, prereqs: { deity: deityDomains.battle, devotion: 20 }, require: { piety: 100 },
            effectText: "(per invader killed)"
        }),
        new Upgrade({
            id: "glory", name: "For Glory!", subType: subTypes.prayer, prereqs: { deity: deityDomains.battle, devotion: 40 }, require: { piety: 1000 },
            init: function (fullInit) { Upgrade.prototype.init.call(this, fullInit); this.data.timer = 0; },
            get timer() { return this.data.timer; }, // Glory time left (sec)
            set timer(value) { this.data.timer = value; },
            effectText: "Temporarily makes raids more difficult, increases rewards"
        }),
        new Upgrade({
            id: "wickerman", name: "Burn Wicker Man", subType: subTypes.prayer, prereqs: { deity: deityDomains.fields, devotion: 20 }, require: { wood: 500 },
            effectText: "Sacrifice 1 worker to gain a random bonus to a resource"
        }),
        new Upgrade({
            id: "walk", name: "Walk Behind the Rows", subType: subTypes.prayer, prereqs: { deity: deityDomains.fields, devotion: 40 },
            require: {}, //xxx 1 Worker/sec
            init: function (fullInit) { Upgrade.prototype.init.call(this, fullInit); this.rate = 0; },
            get rate() { return this.data.rate; }, // Sacrifice rate
            set rate(value) { this.data.rate = value; },
            effectText: "Boost food production by sacrificing 1 worker/sec",
            extraText: "<br /><button id='ceaseWalk' disabled='disabled'>Cease Walking</button>"
        }),
        new Upgrade({
            id: "raiseDead", name: "Raise Dead", subType: subTypes.prayer, prereqs: { deity: deityDomains.underworld, devotion: 20 },
            require: { corpses: 1, piety: 4 }, //xxx Nonlinear cost
            effectText: "Piety to raise the next zombie",
            extraText: "<button id='raiseDead100' class='x100'      disabled='disabled'>+100</button>"
                     + "<button id='raiseDeadMax' class='xInfinity' disabled='disabled'>+&infin;</button>"
        }),
        new Upgrade({
            id: "summonShade", name: "Summon Shades", subType: subTypes.prayer, prereqs: { deity: deityDomains.underworld, devotion: 40 },
            require: { piety: 1000 },  //xxx Also need slainEnemies
            effectText: "Souls of your defeated enemies rise to fight for you"
        }),
        new Upgrade({
            id: "pestControl", name: "Pest Control", subType: subTypes.prayer, prereqs: { deity: deityDomains.cats, devotion: 20 }, require: { piety: 100 },
            init: function (fullInit) { Upgrade.prototype.init.call(this, fullInit); this.timer = 0; },
            get timer() { return this.data.timer; }, // Pest hunting time left
            set timer(value) { this.data.timer = value; },
            effectText: "Give temporary boost to food production"
        }),
        new Upgrade({
            id: "grace", name: "Grace", subType: subTypes.prayer, prereqs: { deity: deityDomains.cats, devotion: 40 },
            require: { piety: 1000 }, //xxx This is not fixed; see curCiv.graceCost
            init: function (fullInit) { Upgrade.prototype.init.call(this, fullInit); this.cost = 1000; },
            get cost() { return this.data.cost; }, // Increasing cost to use Grace to increase morale.
            set cost(value) { this.data.cost = value; },
            effectText: "Increase Morale"
        })
    ];

    return data;
}

export { getUpgradeData };