map.locs = [
  new Location(0, startCastle)
];
map.areas = [
  new Area("Castle", function() {
    setLocationGeneration(0);

    startCastleInside();
    
    makeCeilingCastle(40, 11, 3);
    pushPreFloor(40, 24, 11);
    pushPreThing(Podoboo, 128, -32);
    makeCeilingCastle(128, 112);
    
    pushPreFloor(144, 24, 3);
    pushPreThing(CastleBlock, 152, 16, 6);
    pushPreFloor(184, 24, 3);
    pushPreThing(CastleBlock, 192, 16, 6);
    pushPreThing(Podoboo, 208, -32);
    pushPreFloor(224, 24, 3);
    pushPreThing(CastleBlock, 232, 16, 6);
    
    pushPreFloor(264, 0, 13);
    pushPreThing(GenericStone, 264, 24, 2, 3);
    pushPreThing(GenericStone, 280, 80, 11, 2);
    pushPreThing(Block, 336, jumplev1);
    pushPreThing(Block, 344, jumplev1, Mushroom);
    pushPreThing(Block, 352, jumplev1);
    
    pushPreFloor(384, 0, 40);
    pushPreThing(GenericStone, 424, 8, 3, 1);
    pushPreThing(GenericStone, 424, 80, 3, 2);
    pushPreThing(CastleBlock, 432, 16, 6, -1);
    pushPreThing(CastleBlock, 432, 64, 6);
    pushPreThing(GenericStone, 504, 8, 3, 1);
    pushPreThing(GenericStone, 504, 80, 3, 2);
    pushPreThing(CastleBlock, 512, 16, 6, -1);
    pushPreThing(CastleBlock, 512, 64, 6);
    pushPreThing(GenericStone, 632, 8, 3, 1);
    pushPreThing(GenericStone, 632, 80, 3, 2);
    pushPreThing(CastleBlock, 640, 16, 6, -1);
    pushPreThing(CastleBlock, 640, 64, 6);
    pushPreThing(Podoboo, 704, -32);
    fillPreWater(704, 0, 4);
    
    pushPreFloor(720, 24, 6);
    pushPreThing(GenericStone, 720, 80, 6, 2);
    fillPreWater(768, 0, 6);
    pushPreThing(Podoboo, 776, -32);
    pushPreFloor(792, 24, 3);
    fillPreWater(816, 0, 6);
    pushPreThing(Podoboo, 824, -32);
    pushPreFloor(840, 24, 3);
    fillPreWater(864, 0, 6);
    pushPreThing(Podoboo, 872, -32);
    pushPreFloor(888, 0, 17);
    pushPreThing(GenericStone, 888, 24, 5, 3);
    pushPreThing(GenericStone, 888, 80, 17, 2);
    pushPreThing(GenericStone, 944, 24, 10, 3);
    
    endCastleInside(1024, 0);
    fillPreThing(Brick, 1056, 64, 2, 3, 8, 8);
  })
];