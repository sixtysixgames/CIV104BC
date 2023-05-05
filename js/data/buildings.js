"use strict";
import {
    Building, buildingType, subTypes, civData, updateNote, getGranaryBonus, getWarehouseBonus, getStorehouseBonus, getStoreroomBonus, getPietyLimitBonus, adjustMorale,
    population, digGraves, deityDomains
} from "../index.js";
// lines 293 => 200 .  size 12509 => 11313
function getBuildingData() {
    //console.log("getBuildingData");
    let buildData = [
        new Building({
            id: buildingType.freeLand, name: "free land", plural: "free land", subType: subTypes.land,
            prereqs: undefined,  // Cannot be purchased.
            require: undefined,  // Cannot be purchased.
            vulnerable: false, // Cannot be stolen by looting
            initOwned: 100, // used to be 1000, let's make it more difficult
            effectText: "Conquer more from your neighbors"
        }),
        new Building({
            id: buildingType.tent, singular: "tent", plural: "tents", subType: subTypes.dwelling,
            require: { wood: 2, skins: 2 },
            limit: 1,
            effectText: "+1 citizen"
        }),
        new Building({
            id: buildingType.hut, singular: "wooden hut", plural: "wooden huts",subType: subTypes.dwelling,
            prereqs: { toolmaking: true }, require: { wood: 20, skins: 1 },
            effectText: "+3 citizens", limit: 3
        }),
        new Building({
            id: buildingType.cottage, singular: "cottage", plural: "cottages",subType: subTypes.dwelling,
            prereqs: { buildings: true }, require: { wood: 10, stone: 30 },
            effectText: "+7 citizens", limit: 7
        }),
        new Building({
            id: buildingType.house, singular: "house", plural: "houses", subType: subTypes.dwelling,
            prereqs: { construction: true }, require: { wood: 30, stone: 50, lime: 10 },
            effectText: "+15 citizens", limit: 15 
        }),
        new Building({
            id: buildingType.tenement, singular: "tenement", plural: "tenements", subType: subTypes.dwelling,
            prereqs: { construction: true, civSize: "lgVillage" }, require: { wood: 200, stone: 500, leather: 50, metal: 50, lime: 50 },
            get effectText() {
                let maxPop = this.limit;
                return "+" + maxPop + " citizens";
            },
            set effectText(value) { return this.require; }, // Only here for JSLint.
            get limit() { return 30 + (4 * civData.slums.owned); },
            update: function () { updateNote(this.id, this.effectText); }
        }),
        new Building({
            id: buildingType.mansion, singular: "mansion", plural: "mansions", subType: subTypes.dwelling,
            prereqs: { engineering: true }, require: { wood: 500, stone: 2000, lime: 500, iron: 25, copper: 10, lead: 5 },
            effectText: "+75 citizens", limit: 75
        }),
        new Building({
            id: buildingType.palace, singular: "palace", plural: "palaces", subType: subTypes.dwelling,
            prereqs: { architecture: true }, require: { wood: 2000, stone: 5000, lime: 1500, iron: 100, copper: 50, lead: 25 },
            effectText: "+200 citizens", limit: 200
        }),
        new Building({
            id: buildingType.barn, singular: "barn", plural: "barns", subType: subTypes.storage,
            prereqs: { domestication: true }, require: { wood: 100, stone: 10 },
            get effectText() {
                //let fbonus = ((civData.granaries.owned ? 2 : 1) * 200);
                let fbonus = getGranaryBonus();
                //let sbonus = ((civData.storehouses.owned ? 2 : 1) * 100);
                //return "+" + fbonus + " food storage; +" + sbonus + " skin storage";
                return "+" + fbonus + " food storage";
            },
            set effectText(value) { return this.effectText; },
            update: function () { updateNote(this.id, this.effectText); }
        }),
        new Building({
            id: buildingType.woodstock, singular: "wood stockpile", plural: "wood stockpiles", subType: subTypes.storage,
            prereqs: { felling: true }, require: { wood: 100, stone: 10 },
            get effectText() {
                let wbonus = getWarehouseBonus();
                //let hbonus = getStorehouseBonus();
                //return "+" + wbonus + " wood storage; +" + hbonus + " herb storage";
                return "+" + wbonus + " wood storage";
            },
            set effectText(value) { return this.effectText; },
            update: function () { updateNote(this.id, this.effectText); }
        }),
        new Building({
            id: buildingType.stonestock, singular: "stone stockpile", plural: "stone stockpiles", subType: subTypes.storage,
            prereqs: { quarrying: true }, require: { wood: 100, stone: 10 },
            get effectText() {
                let sbonus = getWarehouseBonus();
                //let obonus = getStorehouseBonus();
                return "+" + sbonus + " stone storage";
            },
            set effectText(value) { return this.effectText; },
            update: function () { updateNote(this.id, this.effectText); }
        }),
        new Building({
            id: buildingType.skinShed, singular: "skins shed", plural: "skins sheds", subType: subTypes.storage,
            prereqs: { domestication: true }, require: { wood: 50, stone: 5 },
            get effectText() {
                let sbonus = getStorehouseBonus();
                return "+" + sbonus + " skin storage";
            },
            set effectText(value) { return this.effectText; },
            update: function () { updateNote(this.id, this.effectText); }
        }),
        new Building({
            id: buildingType.herbShed, singular: "herbs shed", plural: "herbs sheds", subType: subTypes.storage,
            prereqs: { felling: true }, require: { wood: 50, stone: 5 },
            get effectText() {
                let hbonus = getStorehouseBonus();
                return "+" + hbonus + " herb storage";
            },
            set effectText(value) { return this.effectText; },
            update: function () { updateNote(this.id, this.effectText); }
        }),
        new Building({
            id: buildingType.oreShed, singular: "ore shed", plural: "ore sheds", subType: subTypes.storage,
            prereqs: { quarrying: true }, require: { wood: 50, stone: 5 },
            get effectText() {
                let obonus = getStorehouseBonus();
                return "+" + obonus + " ore storage";
            },
            set effectText(value) { return this.effectText; },
            update: function () { updateNote(this.id, this.effectText); }
        }),
        new Building({
            id: buildingType.temple, singular: "temple", plural: "temples", prereqs: { buildings: true }, require: { wood: 30, stone: 120, herbs: 10 },
            get effectText() {
                let bonus = 50 + getPietyLimitBonus();
                return "allows 1 cleric; +" + bonus + " piety limit";
            },
            set effectText(value) { return this.effectText; },
            update: function () { updateNote(this.id, this.effectText); },
            // If purchase was a temple and aesthetics has been activated, increase morale
            // If population is large, temples have less effect.
            onGain: function (num) {
                if (civData.aesthetics && civData.aesthetics.owned && num && population.living > 1) {
                    adjustMorale(num * 25 / population.living);
                }
            }
        }),
        new Building({
            id: buildingType.barracks, name: "barracks", prereqs: { buildings: true, civSize: "smVillage" }, require: { food: 20, wood: 60, stone: 120, metal: 10 },
            effectText: "allows 10 soldiers"
        }),
        new Building({
            id: buildingType.stable, singular: "stable", plural: "stables", prereqs: { buildings: true, horseback: true, civSize: "smVillage" }, require: { food: 60, wood: 60, stone: 120, leather: 10 },
            effectText: "allows 10 cavalry"
        }),
        new Building({
            id: buildingType.apothecary, singular: "apothecary", plural: "apothecaries", prereqs: { buildings: true }, require: { wood: 30, stone: 70, herbs: 5 },
            get effectText() {
                let bonus = getStoreroomBonus();
                return "allows 1 healer; +" + bonus + " potion storage";
            },
            set effectText(value) { return this.effectText; },
            update: function () { updateNote(this.id, this.effectText); }
        }),
        new Building({
            id: buildingType.tannery, singular: "tannery", plural: "tanneries", prereqs: { buildings: true, civSize: "smVillage" }, require: { wood: 30, stone: 70, skins: 5 },
            get effectText() {
                let bonus = getStoreroomBonus();
                return "allows 1 tanner; +" + bonus + " leather storage";
            },
            set effectText(value) { return this.effectText; },
            update: function () { updateNote(this.id, this.effectText); }
        }),
        new Building({
            id: buildingType.smithy, singular: "smithy", plural: "smithies", prereqs: { buildings: true, civSize: "smVillage"  }, require: { wood: 30, stone: 70, ore: 5 },
            get effectText() {
                let bonus = getStoreroomBonus();
                return "allows 1 blacksmith; +" + bonus + " metal storage";
            },
            set effectText(value) { return this.effectText; },
            update: function () { updateNote(this.id, this.effectText); }
        }),
        new Building({
            id: buildingType.charKiln, singular: "charcoal kiln", plural: "charcoal kilns", prereqs: { buildings: true, civSize: "smVillage"  }, require: { wood: 50, stone: 100 },
            get effectText() {
                let bonus = getStoreroomBonus();
                return "allows 1 charcoal burner; +" + bonus + " charcoal storage";
            },
            set effectText(value) { return this.effectText; },
            update: function () { updateNote(this.id, this.effectText); }
        }),
        new Building({
            id: buildingType.limeKiln, singular: "lime kiln", plural: "lime kilns", prereqs: { buildings: true, civSize: "smVillage"  }, require: { wood: 100, stone: 100 },
            get effectText() {
                let bonus = getStoreroomBonus();
                return "allows 1 lime burner; +" + bonus + " lime storage";
            },
            set effectText(value) { return this.effectText; },
            update: function () { updateNote(this.id, this.effectText); }
        }),
        new Building({
            id: buildingType.ironWorks, singular: "iron works", plural: "iron works", prereqs: { ironAlloy: true, civSize: "smVillage" }, require: { wood: 80, stone: 140, ore: 5 },
            get effectText() {
                let bonus = getStoreroomBonus();
                return "allows 1 ironsmith; +" + bonus + " iron storage";
            },
            set effectText(value) { return this.effectText; },
            update: function () { updateNote(this.id, this.effectText); }
        }),
        new Building({
            id: buildingType.coppWorks, singular: "copper works", plural: "copper works", prereqs: { coppAlloy: true, civSize: "smVillage" }, require: { wood: 120, stone: 180, ore: 10 },
            get effectText() {
                let bonus = getStoreroomBonus();
                return "allows 1 coppersmith; +" + bonus + " copper storage";
            },
            set effectText(value) { return this.effectText; },
            update: function () { updateNote(this.id, this.effectText); }
        }),
        new Building({
            id: buildingType.leadWorks, singular: "lead works", plural: "lead works", prereqs: { leadAlloy: true, civSize: "smVillage" }, require: { wood: 150, stone: 200, ore: 15 },
            get effectText() {
                let bonus = getStoreroomBonus();
                return "allows 1 leadsmith; +" + bonus + " lead storage";
            },
            set effectText(value) { return this.effectText; },
            update: function () { updateNote(this.id, this.effectText); }
        }),
        new Building({
            id: buildingType.tinWorks, singular: "tin works", plural: "tin works", prereqs: { tinAlloy: true, civSize: "smVillage" }, require: { wood: 200, stone: 300, ore: 20 },
            get effectText() {
                let bonus = getStoreroomBonus();
                return "allows 1 tinsmith; +" + bonus + " tin storage";
            },
            set effectText(value) { return this.effectText; },
            update: function () { updateNote(this.id, this.effectText); }
        }),
        new Building({
            id: buildingType.silvWorks, singular: "silver works", plural: "silver works", prereqs: { silvAlloy: true, civSize: "smVillage" }, require: { wood: 500, stone: 800, ore: 50 },
            get effectText() {
                let bonus = getStoreroomBonus();
                return "allows 1 silversmith; +" + bonus + " silver storage";
            },
            set effectText(value) { return this.effectText; },
            update: function () { updateNote(this.id, this.effectText); }
        }),
        new Building({
            id: buildingType.mercWorks, singular: "mercury works", plural: "mercury works", prereqs: { mercAlloy: true, civSize: "smVillage" }, require: { wood: 1000, stone: 1500, ore: 100 },
            get effectText() {
                let bonus = getStoreroomBonus();
                return "allows 1 mercurysmith; +" + bonus + " mercury storage";
            },
            set effectText(value) { return this.effectText; },
            update: function () { updateNote(this.id, this.effectText); }
        }),
        new Building({
            id: buildingType.goldWorks, singular: "gold works", plural: "gold works", prereqs: { goldAlloy: true, civSize: "smVillage" }, require: { wood: 2000, stone: 3000, ore: 500 },
            get effectText() {
                let bonus = getStoreroomBonus();
                return "allows 1 goldsmith; +" + bonus + " gold storage";
            },
            set effectText(value) { return this.effectText; },
            update: function () { updateNote(this.id, this.effectText); }
        }),
        new Building({
            id: buildingType.graveyard, singular: "graveyard", plural: "graveyards", prereqs: { buildings: true }, require: { wood: 100, stone: 250 },
            vulnerable: false, // Graveyards can't be sacked, but they can be desecrated
            effectText: "contains 100 graves",
            onGain: function (num) { if (num === undefined) { num = 1; } digGraves(num); }
        }),
        new Building({
            id: buildingType.mill, singular: "mill", plural: "mills", prereqs: { wheel: true },
            get require() {
                return {
                    wood: 100 * (this.owned + 1) * Math.pow(1.05, this.owned),
                    stone: 100 * (this.owned + 1) * Math.pow(1.05, this.owned)
                };
            },
            set require(value) { return this.require; }, // Only here for JSLint.
            effectText: "improves farmers"
        }),
        new Building({
            id: buildingType.fortification, singular: "fortification", plural: "fortifications", efficiency: 0.01, prereqs: { engineering: true },
            //xxx This is testing a new technique that allows a function for the cost items.
            // Eventually, this will take a qty parameter
            get require() {
                return {
                    stone: function () { return 100 * (this.owned + 1) * Math.pow(1.05, this.owned); }.bind(this)
                };
            },
            set require(value) { return this.require; }, // Only here for JSLint.
            effectText: "helps protect against attack"
        }),
        // Altars
        // The 'name' on the altars is really the label on the button to make them.
        //xxx This should probably change.
        new Building({
            id: buildingType.battleAltar, name: "Build Altar", singular: "battle altar", plural: "battle altars",
            subType: subTypes.altar, devotion: 1, prereqs: { deity: deityDomains.battle },
            vulnerable: false, // Altars can't be sacked, but they can be desecrated
            get require() { return { stone: 200, piety: 200 + (this.owned * this.owned), metal: 50 + (50 * this.owned) }; },
            set require(value) { return this.require; }, // Only here for JSLint.
            effectText: "+1 Devotion"
        }),
        new Building({
            id: buildingType.fieldsAltar, name: "Build Altar", singular: "fields altar", plural: "fields altars",
            subType: subTypes.altar, devotion: 1, prereqs: { deity: deityDomains.fields },
            vulnerable: false, // Altars can't be sacked, but they can be desecrated
            get require() { return { stone: 200, piety: 200 + (this.owned * this.owned), food: 500 + (250 * this.owned), wood: 500 + (250 * this.owned) }; },
            set require(value) { return this.require; }, // Only here for JSLint.
            effectText: "+1 Devotion"
        }),
        new Building({
            id: buildingType.underworldAltar, name: "Build Altar", singular: "underworld altar", plural: "underworld altars",
            subType: subTypes.altar, devotion: 1, prereqs: { deity: deityDomains.underworld },
            vulnerable: false, // Altars can't be sacked, but they can be desecrated
            get require() { return { stone: 200, piety: 200 + (this.owned * this.owned), corpses: 1 + this.owned }; },
            set require(value) { return this.require; }, // Only here for JSLint.
            effectText: "+1 Devotion"
        }),
        new Building({
            id: buildingType.catAltar, name: "Build Altar", singular: "cat altar", plural: "cat altars",
            subType: subTypes.altar, devotion: 1, prereqs: { deity: deityDomains.cats },
            vulnerable: false, // Altars can't be sacked, but they can be desecrated
            get require() { return { stone: 200, piety: 200 + (this.owned * this.owned), herbs: 100 + (50 * this.owned) }; },
            set require(value) { return this.require; }, // Only here for JSLint.
            effectText: "+1 Devotion"
        })
    ];
    return buildData;
}

export { getBuildingData };