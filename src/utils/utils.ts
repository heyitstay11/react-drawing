import {
  NEARPOINT_OFFSET,
  POSITION_ENUM,
  SELECTION_OFFSET,
  TOOLS_ENUM,
} from "./constants";
import {
  DrawingElement,
  Point2d,
  PositionType,
  SelectionElement,
} from "./types";

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
    const topLeft = nearPoint(x, y, x1, y1, POSITION_ENUM.TOP_LEFT);
    const topRight = nearPoint(x, y, x2, y1, POSITION_ENUM.TOP_RIGHT);
    const bottomLeft = nearPoint(x, y, x1, y2, POSITION_ENUM.BOTTOM_LEFT);
    const bottomRight = nearPoint(x, y, x2, y2, POSITION_ENUM.BOTTOM_RIGHT);
    const inside =
      x >= x1 && x <= x2 && y >= y1 && y <= y2 ? POSITION_ENUM.INSIDE : null;

    return topLeft || topRight || bottomLeft || bottomRight || inside;
  } else {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x: x, y: y };

    const offset = distance(a, b) - (distance(a, c) + distance(b, c));
    const start = nearPoint(x, y, x1, y1, POSITION_ENUM.START);
    const end = nearPoint(x, y, x2, y2, POSITION_ENUM.END);
    const inside =
      Math.abs(offset) < SELECTION_OFFSET ? POSITION_ENUM.INSIDE : null;

    return start || end || inside;
  }
};

export const getElementAtPosition = (
  x: number,
  y: number,
  elements: DrawingElement[]
): (DrawingElement & { position: PositionType | null }) | undefined => {
  return elements
    .map((element) => ({
      ...element,
      position: isWithinElement(x, y, element),
    }))
    .find((element) => element.position != null);
};

export const adjustElementCoordinates = (element: DrawingElement) => {
  const { x1, y1, x2, y2, type } = element;
  if (type === TOOLS_ENUM.RECTANGLE) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  } else {
    if (x1 < x2 || (x1 === x2 && y1 < y2)) {
      return { x1, y1, x2, y2 };
    } else {
      return { x1: x2, y1: y2, x2: x1, y2: y1 };
    }
  }
};

export const nearPoint = (
  x: number,
  y: number,
  x1: number,
  y1: number,
  output: PositionType
) => {
  return Math.abs(x - x1) < NEARPOINT_OFFSET &&
    Math.abs(y - y1) < NEARPOINT_OFFSET
    ? output
    : null;
};

export const cursorForPosition = (position: PositionType | null) => {
  switch (position) {
    case POSITION_ENUM.TOP_LEFT:
    case POSITION_ENUM.BOTTOM_RIGHT:
    case POSITION_ENUM.START:
    case POSITION_ENUM.END:
      return "nwse-resize";
    case POSITION_ENUM.TOP_RIGHT:
    case POSITION_ENUM.BOTTOM_LEFT:
      return "nesw-resize";
    default:
      return "move";
  }
};

export const resizedCoordinates = (
  clientX: number,
  clientY: number,
  position: PositionType | null,
  coordinates: Pick<SelectionElement, "x1" | "x2" | "y1" | "y2">
) => {
  const { x1, y1, x2, y2 } = coordinates;
  switch (position) {
    case POSITION_ENUM.TOP_LEFT:
    case POSITION_ENUM.START:
      return { x1: clientX, y1: clientY, x2, y2 };
    case POSITION_ENUM.TOP_RIGHT:
      return { x1, y1: clientY, x2: clientX, y2 };
    case POSITION_ENUM.BOTTOM_LEFT:
      return { x1: clientX, y1, x2, y2: clientY };
    case POSITION_ENUM.BOTTOM_RIGHT:
    case POSITION_ENUM.END:
      return { x1, y1, x2: clientX, y2: clientY };
    default:
      throw `position value: ${position} not supported`;
  }
};
