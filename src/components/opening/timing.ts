/**
 * PLACEHOLDER timing (seconds). All opening motion reads from here so it can be
 * tuned in one place once the final reference is agreed.
 */
export const T = {
  enter: {
    bgFade: 0.7,
    threadsDelay: 0.35,
    threadsDraw: 2.1, // threads travel from the edges and tie the knot
    glow: 0.7,
    label: 0.5,
    pulse: 1.6, // gentle glow breathing while waiting for the tap
  },
  open: {
    squeeze: 0.32, // knot responds to the tap
    retract: 0.95, // threads pull apart toward the edges
    seam: 0.7, // golden light from the centre seam
    doors: 1.35, // entrance panels part
    names: 0.9,
    tilt: 1.7, // camera tilts down: gopuram rises into view
    hold: 0.45,
    dive: 1.9, // camera pushes through the gopuram doorway
    light: 0.6,
    fadeOut: 0.75,
  },
  skipFade: 0.45,
  reducedFade: 0.5,
} as const;
