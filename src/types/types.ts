import { Drawable } from "roughjs/bin/core";
import { ELEMENT_TYPES_ENUM } from "./constants";

export interface DrawingElement {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  roughtElement: Drawable;
}

export type DrawingElementType =
  (typeof ELEMENT_TYPES_ENUM)[keyof typeof ELEMENT_TYPES_ENUM];
