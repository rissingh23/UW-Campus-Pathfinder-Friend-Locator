import * as assert from 'assert';
import {
     centroid, distance, sameLocation, squaredDistance, distanceMoreThan
  } from './locations';


  

describe('locations', function() {

  it('sameLocations', function() {
    assert.strictEqual(sameLocation({x: 0, y: 0}, {x: 0, y: 0}), true);
    assert.strictEqual(sameLocation({x: 0, y: 1}, {x: 0, y: 1}), true);
    assert.strictEqual(sameLocation({x: 1, y: 0}, {x: 1, y: 0}), true);
    assert.strictEqual(sameLocation({x: 1, y: 1}, {x: 1, y: 1}), true);

    assert.strictEqual(sameLocation({x: 0, y: 0}, {x: 0, y: 1}), false);
    assert.strictEqual(sameLocation({x: 0, y: 0}, {x: 1, y: 0}), false);
    assert.strictEqual(sameLocation({x: 0, y: 0}, {x: 1, y: 1}), false);

    assert.strictEqual(sameLocation({x: 0, y: 1}, {x: 0, y: 0}), false);
    assert.strictEqual(sameLocation({x: 0, y: 1}, {x: 1, y: 0}), false);
    assert.strictEqual(sameLocation({x: 0, y: 1}, {x: 1, y: 1}), false);

    assert.strictEqual(sameLocation({x: 1, y: 0}, {x: 0, y: 0}), false);
    assert.strictEqual(sameLocation({x: 1, y: 0}, {x: 0, y: 1}), false);
    assert.strictEqual(sameLocation({x: 1, y: 0}, {x: 1, y: 1}), false);

    assert.strictEqual(sameLocation({x: 1, y: 1}, {x: 0, y: 0}), false);
    assert.strictEqual(sameLocation({x: 1, y: 1}, {x: 0, y: 1}), false);
    assert.strictEqual(sameLocation({x: 1, y: 1}, {x: 1, y: 0}), false);
  });

  it('squaredDistance', function() {
    assert.strictEqual(squaredDistance({x: 0, y: 0}, {x: 1, y: 1}), 2);
    assert.strictEqual(squaredDistance({x: 0, y: 0}, {x: 0, y: 1}), 1);
    assert.strictEqual(squaredDistance({x: 0, y: 0}, {x: 1, y: 0}), 1);
    assert.strictEqual(squaredDistance({x: 0, y: 0}, {x: 2, y: 0}), 4);
    assert.strictEqual(squaredDistance({x: 0, y: 0}, {x: 0, y: 2}), 4);
    assert.strictEqual(squaredDistance({x: 0, y: 0}, {x: 2, y: 2}), 8);
  });

  it('distance', function() {
    assert.ok(Math.abs(distance({x: 0, y: 0}, {x: 1, y: 1}) - Math.sqrt(2)) < 1e-3);
    assert.ok(Math.abs(distance({x: 0, y: 0}, {x: 0, y: 1}) - 1) < 1e-3);
    assert.ok(Math.abs(distance({x: 0, y: 0}, {x: 1, y: 0}) - 1) < 1e-3);
    assert.ok(Math.abs(distance({x: 0, y: 0}, {x: 2, y: 0}) - 2) < 1e-3);
    assert.ok(Math.abs(distance({x: 0, y: 0}, {x: 0, y: 2}) - 2) < 1e-3);
    assert.ok(Math.abs(distance({x: 0, y: 0}, {x: 2, y: 2}) - Math.sqrt(8)) < 1e-3);
  });

  it('centroid', function() {
    assert.deepStrictEqual(centroid([{x: 0, y: 1}]), {x: 0, y: 1});
    assert.deepStrictEqual(centroid([{x: 1, y: 2}]), {x: 1, y: 2});

    assert.deepStrictEqual(centroid([{x: 0, y: 0}, {x: 1, y: 2}]), {x: 0.5, y: 1});
    assert.deepStrictEqual(centroid([{x: 0, y: 0}, {x: 1, y: 2}]), {x: 0.5, y: 1});
    assert.deepStrictEqual(centroid([{x: 0, y: 1}, {x: 1, y: 2}]), {x: 0.5, y: 1.5});
    assert.deepStrictEqual(
        centroid([{x: 0, y: 1}, {x: 1, y: 2}, {x: 2, y: 3}]), {x: 1, y: 2});
  });

  it('distanceMoreThan', function() {
    // Statement coverage: Ensure all statements execute at least once
    assert.deepStrictEqual(distanceMoreThan({ x: 3, y: 3 }, { x1: 1, x2: 5, y1: 1, y2: 5 }, 0), false);
    assert.deepStrictEqual(distanceMoreThan({ x: 3, y: 3 }, { x1: 1, x2: 5, y1: 1, y2: 5 }, 2), false);
    
    // Branch coverage: Cover all possible conditional branches
    assert.deepStrictEqual(distanceMoreThan({ x: 10, y: 10 }, { x1: 1, x2: 5, y1: 1, y2: 5 }, 6), true);
    assert.deepStrictEqual(distanceMoreThan({ x: 1, y: 3 }, { x1: 1, x2: 5, y1: 1, y2: 5 }, 0), false);
    
    // Edge case where closest point is a corner
    assert.deepStrictEqual(distanceMoreThan({ x: 0, y: 0 }, { x1: 2, x2: 4, y1: 2, y2: 4 }, 3), false);
    
    // Edge case where distance is barely over the limit
    assert.deepStrictEqual(distanceMoreThan({ x: -1, y: -1 }, { x1: 0, x2: 2, y1: 0, y2: 2 }, 1), true);
    
    // Case where loc is near the region but within the distance limit
    assert.deepStrictEqual(distanceMoreThan({ x: 6, y: 3 }, { x1: 1, x2: 5, y1: 1, y2: 5 }, 2), false);
    
    // Case where loc is diagonally farther than dist
    assert.deepStrictEqual(distanceMoreThan({ x: 10, y: 10 }, { x1: 3, x2: 4, y1: 3, y2: 4 }, 8), true);
    
    // Boundary case where loc is just at the threshold
    assert.deepStrictEqual(distanceMoreThan({ x: 6, y: 3 }, { x1: 1, x2: 5, y1: 1, y2: 5 }, Math.sqrt(1)), false);
    
    // Special values: zero distance check
    assert.deepStrictEqual(distanceMoreThan({ x: 3, y: 3 }, { x1: 1, x2: 5, y1: 1, y2: 5 }, 0), false);
});
});
