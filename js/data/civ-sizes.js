// Civ size category minimums
// efficiency: used to increase efficiency of defending enemy troops
const civSizes = [
    { min_pop: 0, name: "Tribe", id: "tribe", efficiency: 0.001 },
    { min_pop: 15, name: "Thorp", id: "thorp", efficiency: 0.002 }, // +1
    { min_pop: 50, name: "Hamlet", id: "hamlet", efficiency: 0.004 }, // +2
    { min_pop: 100, name: "Small Village", id: "smallVillage", efficiency: 0.007 }, // +3
    { min_pop: 250, name: "Village", id: "village", efficiency: 0.011 }, // +4
    { min_pop: 500, name: "Large Village", id: "largeVillage", efficiency: 0.016 }, // +5
    { min_pop: 1000, name: "Small Town", id: "smallTown", efficiency: 0.022 }, // +6
    { min_pop: 2000, name: "Town", id: "town", efficiency: 0.029 }, // +7
    { min_pop: 4000, name: "Large Town", id: "largeTown", efficiency: 0.037 }, // +8
    { min_pop: 8000, name: "Small City", id: "smallCity", efficiency: 0.046 }, // +9
    { min_pop: 15000, name: "City", id: "city", efficiency: 0.056 }, // +10
    { min_pop: 30000, name: "Large City", id: "largeCity", efficiency: 0.067 }, // +11
    { min_pop: 60000, name: "City State", id: "metropolis", efficiency: 0.079 }, // +12
    { min_pop: 125000, name: "Small Nation", id: "smallNation", efficiency: 0.092 }, // +13
    { min_pop: 250000, name: "Nation", id: "nation", efficiency: 0.106 }, // +14
    { min_pop: 500000, name: "Large Nation", id: "largeNation", efficiency: 0.121 }, // +15
    { min_pop: 1000000, name: "Empire", id: "empire", efficiency: 0.137 } // +16
];

export { civSizes };
