import {
  Location, Region, centroid,
  squaredDistance, distanceMoreThan,
} from "./locations";


/** Organizes locations into quadrants in s tree structure */
export type LocationTree =
  | {readonly kind: "empty"}
  | {readonly kind: "single", readonly loc: Location}
  | {readonly kind: "split", readonly at: Location,
      readonly nw: LocationTree, readonly ne: LocationTree,
      readonly sw: LocationTree, readonly se: LocationTree};

/**
 * Returns a tree containing exactly the given locations. Some effort is made to
 * try to split the locations evenly so that the resulting tree has low height.
 * 
 * @param locs to put in the tree
 * @returns LocationTree produced by taking the centroid of all points, m,
 *    which divides the locations into 4 quadrants: nw, nw, sw, sw based on 
 *    where they fall in space relative to m, and then splitting up all
 *    quadrants until every leaf of the tree conatins a single location
 *    ** If a point falls on the border lines created by the centroid, 
 *      it will belong to the region to the right/left of the centroid
 */
export const buildTree = (locs: Array<Location>): LocationTree => {
  if (locs.length === 0) {
    return {kind: "empty"};
  } else if (locs.length === 1) {
    return {kind: "single", loc: locs[0]};
  } else {
    // We must be careful to include each point in *exactly* one subtree. The
    // Regions created below touch on the boundary, so we exlude them from the
    // lower side of each boundary.
    const c: Location = centroid(locs);
    return {kind: "split", at: c,
        // excludes bottom & right boundaries
        nw: buildTree(listLocationsInQuadrant(locs,
            {x1: -Infinity, x2: c.x, y1: -Infinity, y2: c.y})), 
        // excludes right boundary
        ne: buildTree(listLocationsInQuadrant(locs,
            {x1: c.x, x2: Infinity, y1: -Infinity, y2: c.y})),
        // excludes bottom boundary
        sw: buildTree(listLocationsInQuadrant(locs,
            {x1: -Infinity, x2: c.x, y1: c.y, y2: Infinity})),
        se: buildTree(listLocationsInQuadrant(locs,
            {x1: c.x, x2: Infinity, y1: c.y, y2: Infinity})),
      };
  }
}

/** 
 * Returns the subset of the given locations inside the given quadrant. 
 * @returns a list of all locations, l, in locs such that 
 *  region.x1 <= l.x < region.x2 and region.y1 <= l.y < region.y2
 */
const listLocationsInQuadrant =
    (locs: Array<Location>, region: Region): Array<Location> => {
  const inLocs: Array<Location> = [];

  // Inv: inLocs = locationsInQuadrant(locs[0 .. i-1], region)
  for (const loc of locs) {
    if (region.x1 <= loc.x && loc.x < region.x2 &&
      region.y1 <= loc.y && loc.y < region.y2)
      inLocs.push(loc);
  }

  return inLocs;
};


/** Bounds that include the entire plane. */
export const EVERYWHERE: Region = {x1: -Infinity, x2: Infinity, y1: -Infinity, y2: Infinity};

/**
 * Returns closest of any locations in the tree to any of the given location.
 * @param tree A tree containing locations to compare to
 * @param loc The location to which to compare them
 * @returns the closest point in the tree to that location, paired with its
 *     distance to the closest location in locs
 */
export const findClosestInTree =
    (tree: LocationTree, locs: Array<Location>): [Location, number] => {
  if (locs.length === 0)
    throw new Error('no locations passed in');
  if (tree.kind === "empty")
    throw new Error('no locations in the tree passed in');

  let closest = NO_INFO;
  for (const loc of locs) {
    const cl = closestInTree(tree, loc, EVERYWHERE, NO_INFO);
    if (cl.dist < closest.dist)
      closest = cl;
  }
  if (closest.loc === undefined)
    throw new Error('impossible: no closest found');
  return [closest.loc, closest.dist];
};

/**
 * A record containing the closest point found in the tree to reference point
 * (or undefined if the tree is empty), the distance of that point to the
 * reference point (or infinity if the tree is empty)
 */
type ClosestInfo = {loc: Location | undefined, dist: number};

/** A record that stores no closest point and no calculations performed. */
export const NO_INFO: ClosestInfo = {loc: undefined, dist: Infinity};

/**
 * Helper function to findClosestInTree, exported for testing only
 * 
 * Returns the closest point of all locations in the tree and the given closest
 * point to the given loc, as well as the distance from that point to the loc
 */
export const closestInTree =
    (tree: LocationTree, loc: Location, bounds: Region, closest: ClosestInfo): ClosestInfo => {
  // TODO: implement in Task 4
  if (distanceMoreThan(loc, bounds, closest.dist)) {
    return closest;
  }
  if (tree.kind === "empty") {
    return closest;
  }
  if (tree.kind === "single") {
    const d = squaredDistance(loc, tree.loc);
    return d < (closest.dist**2) ? { loc: tree.loc, dist: Math.sqrt(d) } : closest;
  }
  
  let newClosest = closest;
  let splitAt = tree.at;
  let nw = tree.nw;
  let ne = tree.ne;
  let sw = tree.sw;
  let se = tree.se;
  
  
  if (loc.x < splitAt.x && loc.y < splitAt.y) { // SW first
    newClosest = closestInTree(sw, loc, { x1: bounds.x1, x2: splitAt.x, y1: splitAt.y, y2: bounds.y2 }, newClosest);
    newClosest = closestInTree(se, loc, { x1: splitAt.x, x2: bounds.x2, y1: splitAt.y, y2: bounds.y2 }, newClosest);
    newClosest = closestInTree(nw, loc, { x1: bounds.x1, x2: splitAt.x, y1: bounds.y1, y2: splitAt.y }, newClosest);
    newClosest = closestInTree(ne, loc, { x1: splitAt.x, x2: bounds.x2, y1: bounds.y1, y2: splitAt.y }, newClosest);
  } else if (loc.x >= splitAt.x && loc.y < splitAt.y ) { // SE first
    newClosest = closestInTree(se, loc, { x1: splitAt.x, x2: bounds.x2, y1: splitAt.y, y2: bounds.y2 }, newClosest);
    newClosest = closestInTree(sw, loc, { x1: bounds.x1, x2: splitAt.x, y1: splitAt.y, y2: bounds.y2 }, newClosest);
    newClosest = closestInTree(ne, loc, { x1: splitAt.x, x2: bounds.x2, y1: bounds.y1, y2: splitAt.y }, newClosest);
    newClosest = closestInTree(nw, loc, { x1: bounds.x1, x2: splitAt.x, y1: bounds.y1, y2: splitAt.y }, newClosest);
  } else if (loc.x < splitAt.x && loc.y >= splitAt.y) { // NW first
    newClosest = closestInTree(nw, loc, { x1: bounds.x1, x2: splitAt.x, y1: bounds.y1, y2: splitAt.y }, newClosest);
    newClosest = closestInTree(ne, loc, { x1: splitAt.x, x2: bounds.x2, y1: bounds.y1, y2: splitAt.y }, newClosest);
    newClosest = closestInTree(sw, loc, { x1: bounds.x1, x2: splitAt.x, y1: splitAt.y, y2: bounds.y2 }, newClosest);
    newClosest = closestInTree(se, loc, { x1: splitAt.x, x2: bounds.x2, y1: splitAt.y, y2: bounds.y2 }, newClosest);
  } else { // NE first
    newClosest = closestInTree(ne, loc, { x1: splitAt.x, x2: bounds.x2, y1: bounds.y1, y2: splitAt.y }, newClosest);
    newClosest = closestInTree(nw, loc, { x1: bounds.x1, x2: splitAt.x, y1: bounds.y1, y2: splitAt.y }, newClosest);
    newClosest = closestInTree(se, loc, { x1: splitAt.x, x2: bounds.x2, y1: splitAt.y, y2: bounds.y2 }, newClosest);
    newClosest = closestInTree(sw, loc, { x1: bounds.x1, x2: splitAt.x, y1: splitAt.y, y2: bounds.y2 }, newClosest);
  }
  
  return newClosest;
};