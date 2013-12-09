map.locs = [
  new Location(0, walkToPipe),
  new Location(1),
  new Location(2, exitPipeVert)
];
map.areas = [
  new Area("Overworld", function() {
    setLocationGeneration(0);

    pushPreCastle();
    pushPrePattern("backcloud", 0, 4, 2);
    pushPreFloor(0, 0, 24);
    pushPreThing(PipeSide, 80, 16, 1);
    pushPrePipe(96, 0, 32);
  }),
  new Area("Underwater", function() {
    setLocationGeneration(1);
    goUnderWater();
    
    pushPreFloor(0, 0, 67);
    pushPreThing(Coral, 96, 24, 3);
    fillPreThing(Coin, 120, 7, 2, 1, 8);
    pushPreThing(Stone, 152, jumplev1, 3, 1);
    pushPreThing(Blooper, 184, 16);
    fillPreThing(Coin, 224, jumplev2, 3, 1, 8);
    pushPreThing(Coral, 272, 40, 5);
    fillPreThing(Coin, 296, 7, 3, 1, 8);
    pushPreThing(Stone, 344, jumplev1, 2, 1);
    pushPreThing(Coral, 344, jumplev1 + 16, 2);
    pushPreThing(Blooper, 376, jumplev1);
    pushPreThing(Coral, 408, 32, 4);
    pushPreThing(Blooper, 448, 24);
    pushPreThing(Stone, 520, 24, 1, 3);
    pushPreThing(Stone, 528, 40, 1, 5);
    fillPreThing(Coin, 546, 23, 3, 1, 8);
    
    pushPreFloor(576, 0, 60);
    pushPreThing(Stone, 576, 40, 1, 5);
    pushPreThing(Stone, 584, 24, 1, 3);
    pushPreThing(CheepCheep, 616, 24, false, false);
    pushPreThing(Stone, 632, 24, 2, 3);
    pushPreThing(Stone, 632, 88, 2, 3);
    pushPreThing(CheepCheep, 640, 48, false, false);
    pushPreThing(CheepCheep, 656, 16, false, false);
    pushPreThing(Stone, 664, 64, 3, 1);
    pushPreThing(Blooper, 672, 40, false, false);
    pushPreThing(Coral, 672, 80, 2);
    pushPreThing(Coral, 720, 24, 3);
    pushPreThing(Blooper, 760, 80);
    pushPreThing(CheepCheep, 760, 56, false, false);
    pushPreThing(CheepCheep, 784, 80, true, false);
    fillPreThing(Coin, 816, 15, 3, 1, 8);
    pushPreThing(CheepCheep, 816, 24, false, false);
    pushPreThing(Stone, 824, 32, 2, 1);
    pushPreThing(Coral, 824, 64, 4);
    pushPreThing(Blooper, 848, 16);
    fillPreThing(Coin, 912, 55, 3, 1, 8, 8);
    pushPreThing(Stone, 928, 40, 2, 1);
    pushPreThing(CheepCheep, 944, 72, false, false);
    pushPreThing(Coral, 968, 32, 4);
    pushPreThing(CheepCheep, 1032, 24, true, false);
    pushPreThing(Stone, 1040, 32, 1, 4);
    pushPreThing(Stone, 1048, 16, 1, 2);
    pushPreThing(CheepCheep, 1056, 16, false, false);
    pushPreThing(Stone, 1056, 88, 1, 3);
    pushPreThing(Stone, 1064, 72, 8, 1);
    pushPreThing(Coin, 1072, 15);
    fillPreThing(Coin, 1080, 7, 3, 1, 8);
    pushPreThing(Coin, 1104, 15);
    pushPreThing(CheepCheep, 1100, 40, false, false);
    pushPreFloor(1128, 0, 17);
    pushPreThing(Stone, 1128, 16, 1, 2);
    pushPreThing(Stone, 1136, 32, 1, 4);
    pushPreThing(CheepCheep, 1160, 32, false, false);
    pushPreThing(Coral, 1184, 16, 2);
    pushPreThing(Coral, 1200, 24, 3);
    pushPreThing(CheepCheep, 1206, 56, true, false);
    pushPreThing(Stone, 1256, 64, 1, 8);
    pushPreThing(Stone, 1264, 64, 2, 1);
    fillPreThing(Coin, 1281, 32, 3, 2, 8, -24);
    pushPreThing(Stone, 1304, 64, 2, 1);
    pushPreFloor(1320, 0, 40);
    pushPreThing(Stone, 1320, 64, 1, 8);
    pushPreThing(CheepCheep, 1320, 80, false, false);
    pushPreThing(CheepCheep, 1344, 16, true, false);
    fillPreThing(Stone, 1384, 32, 1, 2, 0, 32, 5, 1);
    pushPreThing(Coral, 1392, 80, 2);
    pushPreThing(CheepCheep, 1408, 40, false, false);
    fillPreThing(Stone, 1448, 32, 1, 2, 0, 32, 4, 1);
    pushPreThing(CheepCheep, 1472, 72, true, false);
    pushPreThing(CheepCheep, 1496, 48, true, false);
    
    pushPreThing(Stone, 1488, 8, 5, 1);
    pushPreThing(Stone, 1496, 16, 4, 1);
    pushPreThing(Stone, 1504, 24, 3, 1);
    pushPreThing(Stone, 1512, 32, 2, 1);
    pushPreThing(Stone, 1512, 88, 2, 4);
    pushPreThing(PipeSide, 1520, 48, 2, true);
    pushPreThing(Stone, 1528, 88, 14, 11);
  }),
  new Area("Overworld", function() {
    setLocationGeneration(2);
  
    pushPrePattern("backreg", 104, 0, 1);
    pushPreFloor(0, 0, 42);
    pushPrePipe(0, 0, 16, true, false, 2);
    pushPreThing(Stone, 16, 8, 1, 1);
    pushPreThing(Stone, 24, 16, 1, 2);
    pushPreThing(Stone, 32, 24, 1, 3);
    pushPreThing(Stone, 40, 32, 1, 4);
    pushPreThing(Stone, 48, 40, 1, 5);
    pushPreThing(Stone, 56, 48, 1, 6);
    pushPreThing(Stone, 64, 56, 1, 7);
    pushPreThing(Stone, 72, 64, 2, 8);
    endCastleOutside(148);
  })
];
