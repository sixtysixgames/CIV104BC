// Civ size category minimums
// efficiency: used to increase efficiency of defending enemy troops
const civSizes = [
    { min_pop: 0, name: "Tribe", id: "tribe", efficiency: 0.005 },
    { min_pop: 10, name: "Thorp", id: "thorp", efficiency: 0.006 },
    { min_pop: 50, name: "Hamlet", id: "hamlet", efficiency: 0.008 },
    { min_pop: 100, name: "Village", id: "village", efficiency: 0.011 },
    { min_pop: 500, name: "Small Town", id: "smallTown", efficiency: 0.015 },
    { min_pop: 1000, name: "Town", id: "town", efficiency: 0.021 },
    { min_pop: 2500, name: "Large Town", id: "largeTown", efficiency: 0.028 },
    { min_pop: 5000, name: "Small City", id: "smallCity", efficiency: 0.036 },
    { min_pop: 10000, name: "City", id: "city", efficiency: 0.045 },
    { min_pop: 25000, name: "Large City", id: "largeCity", efficiency: 0.055 },
    { min_pop: 50000, name: "City State", id: "metropolis", efficiency: 0.066 },
    { min_pop: 100000, name: "Small Nation", id: "smallNation", efficiency: 0.078 },
    { min_pop: 250000, name: "Nation", id: "nation", efficiency: 0.091 },
    { min_pop: 500000, name: "Large Nation", id: "largeNation", efficiency: 0.105 },
    { min_pop: 1000000, name: "Empire", id: "empire", efficiency: 0.12 }
];

export { civSizes };