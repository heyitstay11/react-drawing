import { Drawable } from "roughjs/bin/core";
import { ACTIONS_ENUM, POSITION_ENUM, TOOLS_ENUM } from "./constants";

export type Values<T> = T[keyof T];

export interface DrawingElement {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  roughtElement?: Drawable;
  type: ToolType;
  points?: { x: number; y: number }[];
}

export interface SelectionElement extends DrawingElement {
  position?: PositionType | null;
  offsetX?: number;
  offsetY?: number;
  xOffsets?: number[];
  yOffsets?: number[];
}

export interface Point2d {
  x: number;
  y: number;
}

export type ToolType = Values<typeof TOOLS_ENUM>;
export type ActionType = Values<typeof ACTIONS_ENUM>;
export type DrawingElementType = Exclude<
  Values<typeof TOOLS_ENUM>,
  typeof TOOLS_ENUM.SELECTION
>;
export type PositionType = Values<typeof POSITION_ENUM>;
