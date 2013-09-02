map.locs = [
  new Location(0, startCastle),
  new Location(0, exitPipeVert), // Pipe 1
  new Location(1, exitPipeVert), // Past B
  new Location(2, exitPipeVert), // Past D
  new Location(3, exitPipeVert, 24), // Underwater
  new Location(4, exitPipeVert)  // Pipe 2
];
map.areas = [
  new Area("Castle", function() { // Area 0
    setLocationGeneration(0);
    
    startCastleInside();
    pushPreThing(Stone, 40, 24, 1, DtB(24, 8));
    makeCeilingCastle(40, 32);
    fillPreWater(48, 0, 10);
    pushPreThing(Stone, 88, 0, 8, DtB(0, 8));
    pushPrePipe(152, 16, Infinity, true, false, 1); // Pipe 1
    pushPreFloor(168, 0, 11);
    
    this.sections = {
      start: 256,
      0: function(xloc) {
        pushPreFloor(xloc, 0, bstretch);
        makeCeilingCastle(xloc, bstretch + 53);
        pushPreSectionFail(xloc, 80, 40, 80);
        pushPrePipe(xloc + bstretch * 8, 16, Infinity, true, 1); // Back to Pipe 1
        pushPreFloor(xloc + bstretch * 8 + 16, 0, 9);
        fillPreThing(Goomba, xloc + bstretch * 8 + 36, 8, 3, 1, 12);
        pushPreFloor(xloc + bstretch * 8 + 88, 24, 4);
        fillPreWater(xloc + bstretch * 8 + 120, 0, 34);
        // To do: make sure this is correct
        pushPreThing(Platform, xloc + bstretch * 8 + 152, 0, 4, [moveSliding, xloc + bstretch * 8 + 140, xloc + bstretch * 8 + 232, 2]);
        pushPreFloor(xloc + bstretch * 8 + 256, 24, 6);
        pushPreThing(Stone, xloc + bstretch * 8 + 264, 56, 4);
        pushPrePipe(xloc + bstretch * 8 + 304, 40, Infinity, true, 2); // Goes to Past B
        pushPreFloor(xloc + bstretch * 8 + 320, 24, 7);
        pushPrePipe(xloc + bstretch * 8 + 376, 48, Infinity, true);
        pushPreFloor(xloc + bstretch * 8 + 392, 24, 4);
        pushCastleDecider(xloc + bstretch * 8 + 424, 0);
      }
    }
  }),
  new Area("Castle", function() { // Area 1
    setLocationGeneration(2);
    
    setBStretch();
    pushPreFloor(0, 0, bstretch);
    makeCeilingCastle(0, bstretch);
    this.sections = {
      start: bstretch * 8,
      0: function(xloc) {
        pushPreSectionFail(xloc, 80, 40, 80);
        pushPrePipe(xloc, 16, Infinity, true, false, 2); // Past B
        makeCeilingCastle(xloc, bstretch + 45);
        pushPreFloor(xloc + 16, 0, 5);
        pushPrePipe(xloc + 56, 24, Infinity, true);
        pushPreFloor(xloc + 72, 0, 8);
        fillPreThing(Beetle, xloc + 104, 8.5, 2, 1, 16);
        pushPrePipe(xloc + 136, 16, Infinity, true, 1); // Back to Pipe 1
        pushPreFloor(xloc + 152, 0, 8);
        pushPreThing(Koopa, xloc + 192, 32, false, true);
        pushPreThing(Koopa, xloc + 208, 24, false, true);
        pushPrePipe(xloc + 216, 24, Infinity, true);
        fillPreWater(xloc + 232, 0, 6);
        pushPreFloor(xloc + 256, 0, 13 + bstretch);
        pushPreThing(Block, xloc + 280, jumplev1, Coin, true);
        pushPreThing(Stone, xloc + 296, jumplev1, 2);
        pushPrePipe(xloc + 296, jumplev1, 24, true, 3); // Goes Past C
        pushPreThing(Koopa, xloc + 320, 20, false, true);
        pushPreThing(Koopa, xloc + 336, 24, false, true);
        pushCastleDecider(xloc + 360 + bstretch * 8, 0);
      }
    }
  }),
  new Area("Castle", function() {  // Area 2
    setLocationGeneration(3);
    
    pushPreFloor(0, 0, 3);
    makeCeilingCastle(0, 3);
    this.sections = {
      start: 24,
      0: function(xloc) {
        pushPreSectionFail(xloc, 80, 40, 80);
        pushPrePipe(xloc, 16, Infinity, true, false, 3);
        makeCeilingCastle(xloc, bstretch + 38);
        pushPreFloor(xloc + 16, 0);
        pushPreFloor(xloc + 24, 24, 6);
        pushPrePipe(xloc + 72, 40, Infinity, true);
        // start cheeps here
        pushPreFloor(xloc + 88, 24, 6);
        pushPrePipe(xloc + 136, 48, Infinity, true, 1); // Back to Pipe 1
        pushPreFloor(xloc + 152, 24, 6);
        // end cheeps here
        fillPreWater(xloc + 200, 0, 8);
        pushPreFloor(xloc + 232, 24, 4);
        pushPrePipe(xloc + 264, 40, Infinity, true, 4); // To Underwater (Area 3)
        pushPreFloor(xloc + 280, 24, bstretch);
        pushPreFloor(xloc + 280 + bstretch * 8, 0, 3);
        pushCastleDecider(xloc + 304 + bstretch * 8, 0);
      }
    }
  }),
  new Area("Underwater Castle", function() { // Area 3 (Underwater)
    setLocationGeneration(4);
    
    goUnderWater();
    pushPreThing(Stone, 0, 88, 2, DtB(88, 8));
    pushPreFloor(16, 0, 1, 62);
    pushPrePipe(24, -200, 216, false, false, 4);
    pushPreFloor(40, 0, 67);
    pushPreThing(Stone, 48, 24, 5, 3);
    pushPreThing(Stone, 48, 80, 5, 2);
    pushPreThing(Stone, 48, 88, 66, 1);
    pushPreThing(Stone, 88, 32, 7, 4);
    pushPreThing(Stone, 88, 80, 7, 3);
    pushPreThing(CastleBlock, 160, 46, [6, 1], true);
    pushPreThing(Blooper, 224, 16);
    pushPreThing(CastleBlock, 248, 22, [6, 1], true);
    pushPreThing(Stone, 312, 24, 3, 3);
    pushPreThing(Stone, 312, 80, 3, 3);
    pushPreThing(CastleBlock, 320, 54, [6, 1], true);
    pushPreThing(Blooper, 408, 24);
    pushPreThing(Blooper, 424, 56);
    pushPreThing(CastleBlock, 446, 38, [6, 1], true);
    pushPreThing(CastleBlock, 512, 44, [6, 1], true);
    pushPreThing(Stone, 536, 32, 5, 4);
    pushPreThing(Stone, 536, 80, 5, 3);
    pushPreThing(PipeSide, 544, 48, 5);
    pushPreThing(Stone, 552, 56, 3, 3);
  }),
  new Area("Castle", function() { // Area 4
    setLocationGeneration(5);
    
    pushPrePipe(0, 16, Infinity, true, false, 5);
    makeCeilingCastle(0, 29);
    pushPreFloor(16, 0, 5);
    pushPrePipe(56, 16, Infinity, true);
    pushPreFloor(72, 0, 9);
    pushPreThing(HammerBro, 112, 12);
    fillPreWater(128, 0, 14);
    pushPreThing(Podoboo, 160, -32);
    pushPreFloor(184, 24, 6);
    pushPreThing(Stone, 184, 80, 6, 2);
    endCastleInside(232, 0)
  }),
];