export const SELECTION_OFFSET = 1;
export const NEARPOINT_OFFSET = 5;

export const TOOLS_ENUM = {
  LINE: "line",
  RECTANGLE: "rectangle",
  SELECTION: "selection",
  PENCIL: "pencil",
} as const;

export const ACTIONS_ENUM = {
  DRAWING: "drawing",
  MOVING: "moving",
  RESIZING: "resizing",
  NONE: "none",
} as const;

export const POSITION_ENUM = {
  INSIDE: "inside",
  START: "start",
  END: "end",
  TOP_LEFT: "tl",
  TOP_RIGHT: "tr",
  BOTTOM_LEFT: "bl",
  BOTTOM_RIGHT: "br",
} as const;
