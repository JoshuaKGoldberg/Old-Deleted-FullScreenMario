map.time = 300;
map.locs = [
  new Location(0, true)
];
map.areas = [
  new Area("Overworld", function() {
    setLocationGeneration(0);
    
    pushPreCastle();
    pushPrePattern("backcloud", 0, 4, 3);
    pushPreFloor(0, 0, 15);
    
    pushPreShroom(128, 0, 5);
    pushPreShroom(152, 64, 5);
    fillPreThing(Coin, 161, 71, 3, 1, 8);
    pushPreShroom(184, 32, 7);
    fillPreThing(Coin, 193, 39, 4, 1, 8);
    fillPreThing(Koopa, 224, 44, 2, 1, 8, 8, true);
    
    pushPreShroom(256, 72, 3);
    pushPreShroom(288, 8, 7);
    pushPreThing(Koopa, 288, 84, true, [32, 88]);
    pushPreThing(Coin, 305, 15);
    pushPreThing(Koopa, 312, 20, true);
    pushPreShroom(312, 64, 5);
    pushPreThing(Coin, 321, 15);
    pushPreThing(Block, 344, 88, Mushroom);
    pushPreShroom(352, 32, 3);
    
    pushPreThing(Coin, 385, 47);
    pushPreScale(396, 86, 14, [6, 4, 10]);
    pushPreShroom(408, 40, 3);
    pushPreThing(Platform, 464, 20, 6, [moveFloating, 32, 88, 2]);
    pushPreThing(Platform, 496, 66, 6, [moveFloating, 32, 88, 2]);
    
    pushPreShroom(520, 0, 5);
    pushPreShroom(536, 48, 3);
    fillPreThing(Coin, 537, 55, 3, 1, 8);
    pushPreThing(Koopa, 544, 12, true);
    pushPreShroom(560, 80, 3);
    fillPreThing(Coin, 561, 87, 3, 1, 8);
    pushPreShroom(576, 32, 3);
    pushPreThing(Coin, 585, 39);
    pushPreShroom(592, 64, 5);
    pushPreThing(Koopa, 624, 76, true);
    
    pushPreScale(652, 86, 16, [6, 4, 12]);
    pushPreScale(740, 86, 10, [6, 4, 12]);
    pushPreThing(Coin, 770, 47);
    pushPreShroom(792, 16, 3);
    pushPreScale(828, 86, 12, [6, 4, 12]);
    
    pushPreShroom(904, 32, 5);
    fillPreThing(Coin, 905, 39, 5, 1, 8);
    pushPreShroom(936, 56, 3);
    pushPreShroom(968, 0, 7);
    pushPreShroom(1040, 24, 5);
    pushPreThing(Platform, 1088, 67, 6, [moveFloating, 8, 88, 2]);
    
    pushPreFloor(1128, 0, 19);
    endCastleOutside(1172, 0, true, 1);
  })
];