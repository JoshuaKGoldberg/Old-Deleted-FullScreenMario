map.locs = [
  new Location(0, startCastle)
];
map.areas = [
  new Area("Castle", function() {
    setLocationGeneration(0);
    
    startCastleInside();
    
    pushPreFloor(40, 24, 2);
    makeCeilingCastle(40, 11);
    fillPreWater(56, 0, 4);
    pushPreFloor(72, 24, 2);
    fillPreWater(88, 0, 4);
    pushPreFloor(104, 24, 3);
    
    this.sections = {
      start: 128,
      0: function(xloc) {
        pushPreFloor(xloc, 0, bstretch + 50);
        makeCeilingCastle(xloc, bstretch + 50);
        pushPreThing(GenericStone, xloc + 16, 56, 6, 4);
        fillPreThing(GenericStone, xloc + 72, 56, 5, 1, 16, 0, 1, 4);
        pushPreThing(GenericStone, xloc + 152, 56, 3, 4);
        pushPreThing(GenericStone, xloc + 176, 56, 6, 1);
        pushPrePipe(xloc + 192, 0, 24, true);
        pushPreThing(GenericStone, xloc + 224, 56, 17, 4);
        pushPreThing(CastleBlock, xloc + 296, 56, [6, 1], true);
        pushPreSectionFail(xloc + 384, 24, 40, 24);
        pushPreSectionPass(xloc + 384, 80, 40, 24);
        pushPreThing(CastleBlock, xloc + 352, 32, [6, 1], true);
        pushPreThing(GenericStone, xloc + 360, 56, bstretch, 4);
        pushPreThing(GenericStone, xloc + 376 + bstretch * 8, 24, 3, 3);
        pushPreThing(GenericStone, xloc + 376 + bstretch * 8, 80, 3, 3);
        pushCastleDecider(xloc + 400 + bstretch * 8, 0);
      },
      1: function(xloc) {
        pushPreFloor(xloc, 0, 8);
        makeCeilingCastle(xloc, bstretch + 42);
        pushPreThing(GenericStone, xloc + 48, 24, 2);
        fillPreWater(xloc + 64, 0, 4);
        pushPreThing(GenericStone, xloc + 72, 40, 2);
        fillPreWater(xloc + 80, 0, 10);
        
        pushPreFloor(xloc + 80, 16);
        pushPreThing(GenericStone, xloc + 80, 24, 5);
        pushPreThing(GenericStone, xloc + 104, 48);
        pushPreThing(GenericStone, xloc + 112, 40, 1, 2);
        pushPreFloor(xloc + 120, 0, 27);
        pushPreThing(GenericStone, xloc + 120, 56, 1, 2);
        pushPreThing(GenericStone, xloc + 128, 24, 26);
        pushPreThing(GenericStone, xloc + 128, 56, 2);
        pushPreThing(GenericStone, xloc + 160, 56, 4);
        pushPreThing(GenericStone, xloc + 200, 48, 1, 3);
        pushPreThing(GenericStone, xloc + 200, 56, 3);
        pushPreThing(GenericStone, xloc + 240, 56, 12);
        pushPreThing(CastleBlock, xloc + 280, 56, [6, 1], true);
        pushPreThing(CastleBlock, xloc + 328, 24, [6, 1], true);
        
        pushPreFloor(xloc + 336, 0, bstretch);
        pushPreThing(GenericStone, xloc + 336, 24, bstretch);
        pushPreThing(GenericStone, xloc + 336, 56, bstretch);
        pushPreSectionPass(xloc + 360, 16, 40, 16);
        pushPreSectionFail(xloc + 360, 48, 40, 24);
        pushPreSectionFail(xloc + 360, 80, 40, 24);
        pushCastleDecider(xloc + 336 + bstretch * 8, 1);
      },
      2: function(xloc) {
        pushPreThing(GenericStone, xloc, 64, 1, 5);
        makeCeilingCastle(xloc, 33, 3);
        pushPreThing(GenericStone, xloc + 8, 80, 2, 2);
        pushPreFloor(xloc, 0, 10);
        pushPreFloor(xloc + 72, 24, 4);
        makeCeilingCastle(xloc + 72, 8);
        pushPreFloor(xloc + 96, 0, 4);
        pushPreFloor(xloc + 120, 24, 2);
        endCastleInside(xloc + 136);
      }
    };
  })
];