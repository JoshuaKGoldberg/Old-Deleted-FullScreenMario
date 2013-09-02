map.time = 300;
map.locs = [
  new Location(0, true)
];
map.areas = [
  new Area("Overworld", function() {
    setLocationGeneration(0);
    
    pushPreCastle();
    pushPrePattern("backcloud", 0, 4, 5);
    
    pushPreFloor(0, 0, 7);
    zoneStartCheeps(64);
    pushPreTree(64, 0, 8);
    pushPreThing(Stone, 80, 8);
    pushPreThing(Stone, 88, 16, 1, 2);
    pushPreThing(Stone, 96, 24, 1, 3);
    pushPreThing(Stone, 104, 24, 1, 3);
    pushPreThing(Stone, 112, 24, 1, 3);
    pushPreBridge(120, 24, 16);
    pushPreThing(Stone, 248, 24, 1, DtB(24, 8));
    pushPreBridge(256, 24, 15);
    fillPreThing(Coin, 290, 63, 4, 1, 8, 8);
    pushPreThing(Koopa, 312, 36);
    pushPreThing(Stone, 376, 24, 1, DtB(24, 8));
    pushPreBridge(384, 24, 16);
    pushPreThing(Koopa, 416, 44, false, true);
    fillPreThing(Coin, 441, 63, 3, 1, 16);
    fillPreThing(Coin, 449, 55, 2, 1, 16);
    pushPreThing(Stone, 504, 24, 1, DtB(24, 8));

    
    pushPreThing(Stone, 544, 24, 1, DtB(24, 8));
    pushPreBridge(552, 24, 10);
    fillPreThing(Coin, 578, 63, 2, 1, 24);
    fillPreThing(Coin, 586, 71, 2, 1, 8);
    pushPreThing(Stone, 632, 24, 1, DtB(24, 8));
    pushPreThing(Koopa, 632, 36, true, false);
    
    
    pushPreThing(Stone, 672, 24, 1, DtB(24, 8));
    pushPreBridge(680, 24, 10);
    pushPreThing(Stone, 760, 24, 1, DtB(24, 8));
    pushPreThing(Koopa, 760, 36, true, false);
    
    fillPreThing(Coin, 777, 63, 3, 1, 8);
    pushPreThing(Stone, 792, 32, 1, DtB(24, 8));
    pushPreBridge(800, 32, 5, [true, true]);
    pushPreThing(Block, 816, 64, Mushroom);
    
    fillPreThing(Coin, 865, 63, 3, 1, 8);
    pushPreTree(896, 0, 8);
    pushPreThing(Koopa, 952, 12, true);
    pushPreBridge(976, 24, 3);
    
    pushPreBridge(1024, 24, 15, [true, true]);
    fillPreThing(Coin, 1065, 63, 6, 1, 8);
    pushPreThing(Koopa, 1120, 52, false, true);
    
    pushPreBridge(1176, 8, 8, [true, true]);
    fillPreThing(Coin, 1193, 39, 4, 1, 8);
    pushPreThing(Koopa, 1248, 36, false, true);
    
    pushPreBridge(1280, 24, 8, [true, true]);
    
    pushPreBridge(1368, 24, 2);
    fillPreThing(Coin, 1385, 55, 6, 1, 8);
    pushPreBridge(1400, 24, 2);
    pushPreBridge(1432, 24, 2);
    pushPreBridge(1472, 24, 9, [true]);
    pushPreTree(1536, 0, 13);
    pushPreThing(Stone, 1544, 24, 1, 3);
    pushPreThing(Stone, 1552, 24, 1, 3);
    pushPreThing(Stone, 1560, 16, 1, 2);
    pushPreThing(Stone, 1568, 8);
    zoneStopCheeps(1600);
    
    pushPreFloor(1656, 0, 35);
    pushPreThing(Stone, 1664, 8);
    pushPreThing(Stone, 1672, 16, 1, 2);
    pushPreThing(Stone, 1680, 24, 1, 3);
    pushPreThing(Stone, 1688, 32, 1, 4);
    pushPreThing(Stone, 1696, 40, 1, 5);
    pushPreThing(Stone, 1704, 48, 1, 6);
    pushPreThing(Stone, 1712, 56, 1, 7);
    pushPreThing(Stone, 1720, 64, 1, 8);
    pushPreThing(Stone, 1728, 64, 1, 8);
    
    endCastleOutside(1796, 0, true, 6);
  })
];