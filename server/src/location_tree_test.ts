import * as assert from 'assert';
import { buildTree, findClosestInTree } from './location_tree';
import { closestInTree, NO_INFO, EVERYWHERE} from './location_tree';


describe('location_tree', function() {

  it('buildTree', function() {
    assert.deepStrictEqual(buildTree([]), {kind: "empty"});

    assert.deepStrictEqual(buildTree([{x: 1, y: 1}]),
        {kind: "single", loc: {x: 1, y: 1}});
    assert.deepStrictEqual(buildTree([{x: 2, y: 2}]),
        {kind: "single", loc: {x: 2, y: 2}});

    assert.deepStrictEqual(buildTree([{x: 1, y: 1}, {x: 3, y: 3}]),
        {kind: "split", at: {x: 2, y: 2},
         nw: {kind: "single", loc: {x: 1, y: 1}},
         ne: {kind: "empty"},
         sw: {kind: "empty"},
         se: {kind: "single", loc: {x: 3, y: 3}}});
    assert.deepStrictEqual(buildTree([{x: 1, y: 3}, {x: 3, y: 1}]),
        {kind: "split", at: {x: 2, y: 2},
         nw: {kind: "empty"},
         ne: {kind: "single", loc: {x: 3, y: 1}},
         sw: {kind: "single", loc: {x: 1, y: 3}},
         se: {kind: "empty"}});

    assert.deepStrictEqual(buildTree(
        [{x: 1, y: 1}, {x: 3, y: 3}, {x: 5, y: 5}, {x: 7, y: 7}]),
        {kind: "split", at: {x: 4, y: 4},
         nw: {kind: "split", at: {x: 2, y: 2},
              nw: {kind: "single", loc: {x: 1, y: 1}},
              ne: {kind: "empty"},
              sw: {kind: "empty"},
              se: {kind: "single", loc: {x: 3, y: 3}}},
         ne: {kind: "empty"},
         sw: {kind: "empty"},
         se: {kind: "split", at: {x: 6, y: 6},
              nw: {kind: "single", loc: {x: 5, y: 5}},
              ne: {kind: "empty"},
              sw: {kind: "empty"},
              se: {kind: "single", loc: {x: 7, y: 7}}}});
    assert.deepStrictEqual(buildTree(
        [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}, {x: 4, y: 4}]),
        {kind: "split", at: {x: 2, y: 2},
          nw: {kind: "split", at: {x: 0.5, y: 0.5},
            nw: {kind: "single", loc: {x: 0, y: 0}},
            ne: {kind: "empty"},
            sw: {kind: "empty"},
            se: {kind: "single", loc: {x: 1, y: 1}}},
          ne: {kind: "empty"},
          sw: {kind: "empty"},
          se: {kind: "split", at: {x: 3, y: 3},
              nw: {kind: "single", loc: {x: 2, y: 2}},
              ne: {kind: "empty"},
              sw: {kind: "empty"},
              se: {kind: "split", at: {x: 3.5, y: 3.5},
                nw: {kind: "single", loc: {x: 3, y: 3}},
                ne: {kind: "empty"},
                sw: {kind: "empty"},
                se: {kind: "single", loc: {x: 4, y: 4}}}}});
    assert.deepStrictEqual(buildTree(
        [{x: 1, y: 1}, {x: 3, y: 3}, {x: 5, y: 3}, {x: 7, y: 1},
         {x: 1, y: 7}, {x: 3, y: 5}, {x: 5, y: 5}, {x: 7, y: 7}]),
        {kind: "split", at: {x: 4, y: 4},
         nw: {kind: "split", at: {x: 2, y: 2},
              nw: {kind: "single", loc: {x: 1, y: 1}},
              ne: {kind: "empty"},
              sw: {kind: "empty"},
              se: {kind: "single", loc: {x: 3, y: 3}}},
         ne: {kind: "split", at: {x: 6, y: 2},
              nw: {kind: "empty"},
              sw: {kind: "single", loc: {x: 5, y: 3}},
              ne: {kind: "single", loc: {x: 7, y: 1}},
              se: {kind: "empty"}},
         sw: {kind: "split", at: {x: 2, y: 6},
              nw: {kind: "empty"},
              ne: {kind: "single", loc: {x: 3, y: 5}},
              sw: {kind: "single", loc: {x: 1, y: 7}},
              se: {kind: "empty"}},
         se: {kind: "split", at: {x: 6, y: 6},
              nw: {kind: "single", loc: {x: 5, y: 5}},
              ne: {kind: "empty"},
              sw: {kind: "empty"},
              se: {kind: "single", loc: {x: 7, y: 7}}}});
  });

  it('closestInTree', function() {
    
    // Empty tree test (Statement Coverage)
    assert.deepStrictEqual(closestInTree({ kind: "empty" }, { x: 2, y: 2 }, EVERYWHERE, NO_INFO), NO_INFO);

    // Single-node tree test (Statement and Branch Coverage)
    assert.deepStrictEqual(closestInTree(buildTree([{ x: 3, y: 3 }]), { x: 2, y: 2 }, EVERYWHERE, NO_INFO), { loc: { x: 3, y: 3 }, dist: Math.sqrt(2) });

    // Multiple locations test (Branch and Recursion Coverage)
    const tree = buildTree([{ x: 1, y: 1 }, { x: 5, y: 5 }, { x: 3, y: 3 }]);
    assert.deepStrictEqual(closestInTree(tree, { x: 4, y: 4 }, EVERYWHERE, NO_INFO), { loc: { x: 5, y: 5 }, dist: Math.sqrt(2) });

    // Boundary conditions (x or y is exactly on the centroid split line)
    const treeBoundary = buildTree([{ x: 2, y: 2 }, { x: 4, y: 4 }]);
    assert.deepStrictEqual(closestInTree(treeBoundary, { x: 3, y: 3 }, EVERYWHERE, NO_INFO), { loc: { x:4, y: 4 }, dist: Math.sqrt(2) });
    assert.deepStrictEqual(closestInTree(treeBoundary, { x: 4, y: 4 }, EVERYWHERE, NO_INFO), { loc: { x: 4, y: 4 }, dist: 0 });

    // Quadrant-based testing (ensures correct traversal)
    const quadrantTree = buildTree([{ x: 1, y: 1 }, { x: 5, y: 5 }, { x: 3, y: 3 }, { x: 7, y: 7 }]);
    assert.deepStrictEqual(closestInTree(quadrantTree, { x: 0, y: 0 }, EVERYWHERE, NO_INFO), { loc: { x: 1, y: 1 }, dist: Math.sqrt(2) }); // NW quadrant
    assert.deepStrictEqual(closestInTree(quadrantTree, { x: 6, y: 6 }, EVERYWHERE, NO_INFO), { loc: { x: 7, y: 7 }, dist: Math.sqrt(2) }); // SE quadrant
    assert.deepStrictEqual(closestInTree(quadrantTree, { x: 8, y: 8 }, EVERYWHERE, NO_INFO), { loc: { x: 7, y: 7 }, dist: Math.sqrt(2) }); // NE quadrant
    assert.deepStrictEqual(closestInTree(quadrantTree, { x: 2, y: 2 }, EVERYWHERE, NO_INFO), { loc: { x: 3, y: 3 }, dist: Math.sqrt(2) }); // SW quadrant

    // Equidistant points test (ensures one correct selection)
    const treeEquidistant = buildTree([{ x: 2, y: 2 }, { x: 4, y: 2 }]);
    assert.deepStrictEqual(closestInTree(treeEquidistant, { x: 3, y: 2 }, EVERYWHERE, NO_INFO), { loc: { x: 4, y: 2 }, dist: 1 });

    // Complex tree structure (ensures multiple recursion steps)
    const treeComplex = buildTree([{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 6 }, { x: 7, y: 7 }]);
    assert.deepStrictEqual(closestInTree(treeComplex, { x: 2.5, y: 2.5 }, EVERYWHERE, NO_INFO), { loc: { x: 3, y: 3 }, dist: Math.sqrt(0.5) });

    


  });

  it("find closestInTree", function(){
    assert.deepStrictEqual(findClosestinTree(
      buildTree(({x : 2, y: 1}));

      assertDeepStrictEqual
    ))
  }
  it('findClosestInTree', function() {
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 2, y: 1}]),
        [{x: 1, y: 1}]),
      [{x: 2, y: 1}, 1]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 3, y: 1}, {x: 2, y: 1}, {x: 1, y: 3}]),
        [{x: 1, y: 1}]),
      [{x: 2, y: 1}, 1]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 1, y: 1}, {x: 1, y: 5}, {x: 5, y: 1}, {x: 5, y: 5}]),
        [{x: 2, y: 1}]),
      [{x: 1, y: 1}, 1]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 1, y: 1}, {x: 1, y: 5}, {x: 5, y: 1}, {x: 5, y: 5}]),
        [{x: 2, y: 1}, {x: 4.9, y: 4.9}]),
      [{x: 5, y: 5}, Math.sqrt((5-4.9)**2 + (5-4.9)**2)]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 1, y: 1}, {x: 1, y: 5}, {x: 5, y: 1}, {x: 5, y: 5}]),
        [{x: 2, y: 1}, {x: -1, y: -1}]),
      [{x: 1, y: 1}, 1]);
    assert.deepStrictEqual(findClosestInTree(
        buildTree([{x: 1, y: 1}, {x: 1, y: 5}, {x: 5, y: 1}, {x: 5, y: 5}]),
        [{x: 4, y: 1}, {x: -1, y: -1}, {x: 10, y: 10}]),
      [{x: 5, y: 1}, 1]);
  });


});
