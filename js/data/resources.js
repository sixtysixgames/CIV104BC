import { Resource, civData, getPietyLimitBonus, getGranaryBonus, getStorehouseBonus, getStoreroomBonus, getWarehouseBonus, resourceType, subTypes } from "../index.js";

function getResourceData() {
    let resData = [
        // Resources
        new Resource({
            id: resourceType.food, name: "food", increment: 1, specialChance: 0.1, subType: subTypes.basic,
            specialMaterial: resourceType.skins, verb: "harvest", activity: "harvesting",
            initTradeAmount: 5000, // how much to offer on Trade for 100 coins
            baseTradeAmount: 1000, // the least on offer
            get limit() {
                let barnBonus = getGranaryBonus();
                return 200 + (civData.barn.owned * barnBonus);
            },
            set limit(value) { return this.limit; } // Only here for JSLint.
        }),
        new Resource({
            id: resourceType.wood, name: "wood", increment: 1, specialChance: 0.1, subType: subTypes.basic,
            specialMaterial: resourceType.herbs, verb: "cut", activity: "woodcutting",
            initTradeAmount: 5000, baseTradeAmount: 1000,
            get limit() {
                let bonus = getWarehouseBonus();
                return 200 + (civData.woodstock.owned * bonus) + (civData.treeFarm.owned * getWarehouseBonus());
            },
            set limit(value) { return this.limit; } // Only here for JSLint.
        }),
        new Resource({
            id: resourceType.stone, name: "stone", increment: 1, specialChance: 0.1, subType: subTypes.basic,
            specialMaterial: resourceType.ore, verb: "mine", activity: "mining",
            initTradeAmount: 5000, baseTradeAmount: 1000,
            get limit() {
                let bonus = getWarehouseBonus();
                return 200 + (civData.stonestock.owned * bonus) + (civData.quarry.owned * getWarehouseBonus());
            },
            set limit(value) { return this.limit; }
        }),
        new Resource({
            id: resourceType.skins, singular: "skin", plural: "skins", subType: subTypes.special,
            initTradeAmount: 500, baseTradeAmount: 100,
            get limit() {
                let bonus = getStorehouseBonus();
                return 100 + (civData.skinShed.owned * bonus);
            },
            set limit(value) { return this.limit; } 
        }),
        new Resource({
            id: resourceType.herbs, singular: "herb", plural: "herbs", subType: subTypes.special,
            initTradeAmount: 500, baseTradeAmount: 100,
            get limit() {
                let bonus = getStorehouseBonus();
                return 100 + (civData.herbShed.owned * bonus) + (civData.herbGarden.owned * getStoreroomBonus());
            },
            set limit(value) { return this.limit; } 
        }),
        new Resource({
            id: resourceType.ore, name: "ore", subType: subTypes.special,
            initTradeAmount: 500, baseTradeAmount: 100,
            get limit() {
                let bonus = getStorehouseBonus();
                return 100 + (civData.oreShed.owned * bonus) + (civData.oreMine.owned * getWarehouseBonus());
            },
            set limit(value) { return this.limit; }
        }),
        new Resource({
            id: resourceType.leather, name: "leather", subType: subTypes.special,
            require: { skins: 2 }, // how much other resource required to make
            initTradeAmount: 250, baseTradeAmount: 50,
            get limit() {
                let bonus = getStoreroomBonus();
                return 50 + (civData.tannery.owned * bonus);
            },
            set limit(value) { return this.limit; } 
        }),
        new Resource({
            id: resourceType.potions, singular: "potion", plural: "potions", subType: subTypes.special,
            require: { herbs: 2 }, initTradeAmount: 250, baseTradeAmount: 50,
            get limit() {
                let bonus = getStoreroomBonus();
                return 50 + (civData.apothecary.owned * bonus);
            },
            set limit(value) { return this.limit; }
        }),
        new Resource({
            id: resourceType.metal, name: "metal", subType: subTypes.special,
            require: { ore: 2 }, initTradeAmount: 250, baseTradeAmount: 50,
            get limit() {
                let bonus = getStoreroomBonus();
                return 50 + (civData.smithy.owned * bonus);
            },
            set limit(value) { return this.limit; }
        }),
        new Resource({
            id: resourceType.charcoal, name: "charcoal", subType: subTypes.special,
            require: { wood: 2 }, initTradeAmount: 500, baseTradeAmount: 100,
            get limit() {
                let bonus = getStoreroomBonus();
                return 50 + (civData.charKiln.owned * bonus);
            },
            set limit(value) { return this.limit; }
        }),
        new Resource({
            id: resourceType.lime, name: "lime", subType: subTypes.special,
            require: { wood: 2, stone: 2 }, initTradeAmount: 500, baseTradeAmount: 100,
            get limit() {
                let bonus = getStoreroomBonus();
                return 50 + (civData.limeKiln.owned * bonus);
            },
            set limit(value) { return this.limit; }
        }),
        new Resource({
            id: resourceType.iron, name: "iron", subType: subTypes.special,
            require: { ore: 5, charcoal: 2 }, initTradeAmount: 200, baseTradeAmount: 40,
            get limit() {
                let bonus = getStoreroomBonus();
                return 50 + (civData.ironWorks.owned * bonus);
            },
            set limit(value) { return this.limit; }
        }),
        new Resource({
            id: resourceType.copper, name: "copper", subType: subTypes.special,
            require: { ore: 10, charcoal: 5 }, initTradeAmount: 150, baseTradeAmount: 30,
            get limit() {
                let bonus = getStoreroomBonus();
                return 50 + (civData.coppWorks.owned * bonus);
            },
            set limit(value) { return this.limit; }
        }),
        new Resource({
            id: resourceType.lead, name: "lead", subType: subTypes.special,
            require: { ore: 25, charcoal: 10 }, initTradeAmount: 100, baseTradeAmount: 20,
            get limit() {
                let bonus = getStoreroomBonus();
                return 50 + (civData.leadWorks.owned * bonus);
            },
            set limit(value) { return this.limit; }
        }),
        new Resource({
            id: resourceType.tin, name: "tin", subType: subTypes.special,
            require: { ore: 50, charcoal: 25 }, initTradeAmount: 50, baseTradeAmount: 10,
            get limit() {
                let bonus = getStoreroomBonus();
                return 50 + (civData.tinWorks.owned * bonus);
            },
            set limit(value) { return this.limit; }
        }),
        new Resource({
            id: resourceType.silver, name: "silver", subType: subTypes.special,
            require: { ore: 100, charcoal: 50 }, initTradeAmount: 25, baseTradeAmount: 5,
            get limit() {
                let bonus = getStoreroomBonus();
                return 50 + (civData.silvWorks.owned * bonus);
            },
            set limit(value) { return this.limit; }
        }),
        new Resource({
            id: resourceType.mercury, name: "mercury", subType: subTypes.special,
            require: { ore: 150, charcoal: 75 }, initTradeAmount: 10, baseTradeAmount: 2,
            get limit() {
                let bonus = getStoreroomBonus();
                return 50 + (civData.mercWorks.owned * bonus);
            },
            set limit(value) { return this.limit; }
        }),
        new Resource({
            id: resourceType.gold, name: "gold", subType: subTypes.special,
            require: { ore: 5000, mercury: 50 }, initTradeAmount: 5, baseTradeAmount: 1,
            get limit() {
                let bonus = getStoreroomBonus();
                return 50 + (civData.goldWorks.owned * bonus);
            },
            set limit(value) { return this.limit; }
        }),

        new Resource({
            id: resourceType.piety, name: "piety",
            vulnerable: false, // Can't be stolen
            get limit() {
                let bonus = getPietyLimitBonus();
                return (civData.temple.owned * 50) + (civData.temple.owned * bonus);
            },
            set limit(value) { return this.limit; }
        }),
        new Resource({ id: resourceType.coins, name: "coins", vulnerable: false }),
        new Resource({ id: resourceType.corpses, singular: "corpse", plural: "corpses", vulnerable: false }),
        new Resource({ id: resourceType.devotion, name: "devotion", vulnerable: false })
    ];
    return resData;
}

export { getResourceData };