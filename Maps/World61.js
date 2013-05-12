map.locs = [
  new Location(0, true)
];
map.areas = [
  new Area("Overworld Night", function() {
    setLocationGeneration(0);

    pushPreScenery("Castle", -16, 0);
    pushPrePattern("backreg", 0, 0, 4);
    pushPreFloor(0, 0, 20);
    pushPreThing(Lakitu, 184, 84);
    fillPreThing(Block, 128, jumplev1, 2, 1, 8);
    
    pushPreFloor(176, 0, 9);
    pushPreThing(GenericStone, 208, 8, 6);
    pushPreThing(GenericStone, 232, 16, 5);
    pushPreThing(GenericStone, 256, 24, 4);
    pushPreThing(GenericStone, 280, 32, 3);
    pushPreThing(Brick, 288, jumplev2, Mushroom);
    pushPreFloor(296, 0, 2);
    pushPreThing(Brick, 296, jumplev2);
    
    pushPreFloor(328, 0, 16);
    fillPreThing(Brick, 328, jumplev1, 2, 1, 8);
    pushPreThing(Brick, 344, jumplev1, Coin);
    
    pushPreFloor(472, 0, 15);
    fillPreThing(Coin, 497, jumplev1-1, 3, 1, 8);
    pushPreThing(GenericStone, 552, 8);
    pushPreThing(GenericStone, 560, 16, 1, 2);
    pushPreThing(GenericStone, 568, 24, 1, 3);
    pushPreThing(GenericStone, 576, 32, 2, 4);
    
    fillPreThing(Coin, 609, 47, 2, 1, 8);
    pushPreFloor(616, 0, 16);
    pushPreThing(GenericStone, 672, 16);
    pushPreThing(GenericStone, 680, 24, 1, 2);
    pushPreThing(GenericStone, 696, 40, 1, 5);
    pushPreThing(GenericStone, 704, 48, 1, 6);
    pushPreThing(GenericStone, 712, 56, 1, 7);
    pushPreThing(Block, 720, 40, [Mushroom, 1], true);
    fillPreThing(Brick, 720, 56, 3, 1, 8);
    fillPreThing(Brick, 736, 24, 3, 1, 8);
    
    pushPreFloor(768, 0, 31);
    pushPrePipe(816, 0, 24, true);
    fillPreThing(Coin, 841, 39, 3, 1, 8);
    fillPreThing(Block, 904, jumplev1, 1, 2, 0, 32, Coin, true);
    pushPreThing(GenericStone, 976, 8);
    pushPreThing(GenericStone, 984, 16, 1, 2);
    pushPreThing(GenericStone, 992, 24, 1, 3);
    pushPreThing(GenericStone, 1000, 32, 1, 4);
    pushPreThing(GenericStone, 1008, 40, 1, 5);
    fillPreThing(Brick, 1016, 40, 2, 1, 8);
    fillPreThing(Brick, 1040, 8, 5, 1, 8);
    pushPreThing(Block, 1040, 40, Mushroom);
    pushPreThing(Block, 1048, 40);
    pushPreFloor(1072, 0, 2);
    
    pushPreFloor(1096, 0, 12);
    pushPreThing(GenericStone, 1144, 8);
    pushPreThing(GenericStone, 1152, 16, 1, 2);
    pushPreThing(GenericStone, 1160, 24, 1, 3);
    pushPreThing(GenericStone, 1168, 32, 1, 4);
    pushPreThing(GenericStone, 1176, 40, 1, 5);
    pushPreThing(GenericStone, 1184, 48, 1, 6);
    fillPreThing(Brick, 1192, 48, 2, 1, 8);
    pushPreThing(Brick, 1208, 32);
    fillPreThing(Brick, 1216, 16, 3, 1, 8);
    pushPreThing(Brick, 1216, 32, Coin);
    pushPreFloor(1240, 0, 9);
    
    pushPreFloor(1336, 0, 7);
    pushPreThing(GenericStone, 1352, 8);
    pushPreThing(GenericStone, 1360, 16, 1, 2);
    pushPreThing(GenericStone, 1368, 24, 1, 3);
    pushPreThing(GenericStone, 1376, 32, 1, 4);
    pushPreThing(GenericStone, 1384, 40, 1, 5);
    
    pushPreFloor(1408, 0, 30);
    pushPreFuncCollider(1408, zoneDisableLakitu);
    pushPreThing(GenericStone, 1408, 64, 2, 8);
    endCastleOutside(1484, 0, castlev);
  })
];