map.locs = [
  new Location(0, startCastle)
];
map.areas = [
  new Area("Castle", function() {
    setLocationGeneration(0);
    startCastleInside();

    makeCeilingCastle(40, 11, 3);
    pushPreFloor(40, 24, 11);
    fillPreWater(128, 0, 22);
    makeCeilingCastle(128, 16);
    pushPreThing(Platform, 144, 48, 4, moveFalling); // falling
    pushPreThing(Podoboo, 160, -32);
    pushPreThing(Platform, 176, 40, 4, moveFalling); // falling
    
    pushPreThing(Stone, 216, 24, 5, DtB(24, 8));
    pushPreThing(Stone, 224, 80, 4, 2)
    
    this.sections = {
      start: 256,
      0: function(xloc) {
        pushPreFloor(xloc, 0, bstretch * 3 + 31);
        makeCeilingCastle(xloc, bstretch * 3 + 31);
        
        pushPreThing(Stone, xloc + 16, 32, 5);
        pushPreThing(Stone, xloc + 32, 40, 3);
        pushPreThing(Stone, xloc + 40, 48, 2);
        pushPreThing(Stone, xloc + 48, 56, 1);
        pushPreThing(Stone, xloc + 56, 56, bstretch, 4);
        
        pushPreSectionPass(xloc + (bstretch + 1) * 8, 24, 40, 24);
        pushPreSectionFail(xloc + (bstretch + 1) * 8, 80, 40, 24);

        pushPreThing(Stone, xloc + (bstretch + 11) * 8, 24, bstretch + 2);
        pushPreThing(Stone, xloc + (bstretch + 12) * 8, 56, bstretch);
        pushPreSectionFail(xloc + (bstretch * 2 + 6) * 8, 16, 40, 16);
        pushPreSectionPass(xloc + (bstretch * 2 + 6) * 8, 48, 40, 24);
        pushPreSectionFail(xloc + (bstretch * 2 + 6) * 8, 80, 40, 24);
        
        pushPreThing(Stone, xloc + (bstretch * 2 + 16) * 8, 56, bstretch + 7, 4);
        pushPreSectionFail(xloc + (bstretch * 2 + 17) * 8, 24, 40, 24);
        pushPreSectionPass(xloc + (bstretch * 2 + 17) * 8, 80, 40, 24);
        pushPreThing(Stone, xloc + (bstretch * 3 + 23) * 8, 40, 1);
        pushPreThing(Stone, xloc + (bstretch * 3 + 23) * 8, 48, 2);
        pushPreThing(Stone, xloc + (bstretch * 3 + 23) * 8, 56, 4);
        
        pushPreThing(Stone, xloc + (bstretch * 3 + 28) * 8, 24, 3, 3);
        pushCastleDecider(xloc + (bstretch * 3 + 31) * 8, 0);
      },
      1: function(xloc) {
        pushPreFloor(xloc, 24, 3);
        makeCeilingCastle(xloc, 17);
        pushPreFloor(xloc + 24, 0, 4);
        pushPreThing(Stone, xloc + 48, 56, 2);
        fillPreWater(xloc + 56, 0, 6);
        pushPreThing(Stone, xloc + 72, 56, 3);
        pushPreFloor(xloc + 80, 0);
        pushPreThing(CastleBlock, xloc + 80, 48, 6, true);
        fillPreWater(xloc + 88, 0, 6);
        pushPreThing(Stone, xloc + 104, 56, 4, 1);
        pushPreFloor(xloc + 112, 0, 3);
        
        pushPreSectionFail(xloc + 96 + (bstretch - 6) * 8, 24, 40, 24);
        pushPreSectionPass(xloc + 96 + (bstretch - 6) * 8, 80, 40, 24);
        pushPreFloor(xloc + 136, 0, bstretch - 5);
        pushPreThing(Stone, xloc + 136, 56, bstretch - 5, 4);
        makeCeilingCastle(xloc + 136, bstretch - 5);
        
        pushPreSectionFail(xloc + (bstretch * 2 + 9) * 8, 80, 40, 24);
        pushPreSectionPass(xloc + (bstretch * 2 + 10) * 8, 48, 32, 24);
        pushPreSectionFail(xloc + (bstretch * 2 + 10) * 8, 16, 40, 16);
        pushPreFloor(xloc + (bstretch + 12) * 8, 0, bstretch + 10);
        makeCeilingCastle(xloc + (bstretch + 12) * 8, bstretch + 10);
        pushPreThing(Stone, xloc + (bstretch + 14) * 8, 56, 3);
        pushPreThing(Stone, xloc + (bstretch + 15) * 8, 24, 3);
        pushPreThing(Stone, xloc + (bstretch + 19) * 8, 56, bstretch - 4);
        pushPreThing(Stone, xloc + (bstretch + 20) * 8, 24, bstretch - 4);
        pushPreThing(Stone, xloc + (bstretch * 2 + 17) * 8, 56, 3);
        pushPreThing(Stone, xloc + (bstretch * 2 + 18) * 8, 24, 3);
        
        pushPreFloor(xloc + (bstretch * 2 + 22) * 8, 0, bstretch + 12);
        makeCeilingCastle(xloc + (bstretch * 2 + 22) * 8, bstretch + 12);
        pushPreThing(Stone, xloc + (bstretch * 2 + 22) * 8, 48, 1, 3);
        pushPreThing(Stone, xloc + (bstretch * 2 + 22) * 8, 56, bstretch + 5);
        pushPreThing(Stone, xloc + (bstretch * 2 + 24) * 8, 8, bstretch + 10);
        pushPreThing(Stone, xloc + (bstretch * 2 + 25) * 8, 16, bstretch + 9);
        pushPreThing(Stone, xloc + (bstretch * 2 + 26) * 8, 24, bstretch + 8);
        pushPreSectionFail(xloc + (bstretch * 2 + 28) * 8, 48, 40, 24);
        pushPreSectionPass(xloc + (bstretch * 2 + 28) * 8, 80, 40, 24);
        pushCastleDecider(xloc + (bstretch * 3 + 34) * 8, 1);
      },
      2: function(xloc) {
        pushPreFloor(xloc, 0, 3);
        makeCeilingCastle(xloc, 32);
        pushPreFloor(xloc + 24, 24, 3);
        pushPreFloor(xloc + 48, 0, 2);
        pushPreFloor(xloc + 64, 24, 8);
        pushPreFloor(xloc + 128, 0, 2);
        pushPreFloor(xloc + 144, 24, 2);
        pushPreFloor(xloc + 160, 0, 2);
        pushPreFloor(xloc + 176, 24, 2);
        pushPreFloor(xloc + 192, 0, 2);
        pushPreFloor(xloc + 208, 24, 6);
        endCastleInside(xloc + 256);
      }
    }
  })
];