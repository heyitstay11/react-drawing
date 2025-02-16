import { TOOLS_ENUM } from "./constants";
import { DrawingElement, Point2d } from "./types";

export const distance = (a: Point2d, b: Point2d) => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

export const isWithinElement = (
  x: number,
  y: number,
  element: DrawingElement
) => {
  const { type, x1, x2, y1, y2 } = element;
  if (type === TOOLS_ENUM.RECTANGLE) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  } else {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x: x, y: y };

    const offset = distance(a, b) - (distance(a, c) + distance(b, c));
    return Math.abs(offset) < 1;
  }
};

export const getElementAtPosition = (
  x: number,
  y: number,
  elements: DrawingElement[]
) => {
  return elements.find((element) => isWithinElement(x, y, element));
};
