import { RoughCanvas } from "roughjs/bin/canvas";
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
import getStroke from "perfect-freehand";

export const distance = (a: Point2d, b: Point2d) => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

export const isOnLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x: number,
  y: number,
  distanceOffset = SELECTION_OFFSET
) => {
  const a = { x: x1, y: y1 };
  const b = { x: x2, y: y2 };
  const c = { x: x, y: y };

  const offset = distance(a, b) - (distance(a, c) + distance(b, c));

  return Math.abs(offset) < distanceOffset ? POSITION_ENUM.INSIDE : null;
};

export const isWithinElement = (
  x: number,
  y: number,
  element: DrawingElement
) => {
  const { type, x1, x2, y1, y2 } = element;
  switch (type) {
    case TOOLS_ENUM.LINE: {
      const start = nearPoint(x, y, x1, y1, POSITION_ENUM.START);
      const end = nearPoint(x, y, x2, y2, POSITION_ENUM.END);
      const on = isOnLine(x1, y1, x2, y2, x, y);

      return start || end || on;
    }

    case TOOLS_ENUM.RECTANGLE: {
      const topLeft = nearPoint(x, y, x1, y1, POSITION_ENUM.TOP_LEFT);
      const topRight = nearPoint(x, y, x2, y1, POSITION_ENUM.TOP_RIGHT);
      const bottomLeft = nearPoint(x, y, x1, y2, POSITION_ENUM.BOTTOM_LEFT);
      const bottomRight = nearPoint(x, y, x2, y2, POSITION_ENUM.BOTTOM_RIGHT);
      const inside =
        x >= x1 && x <= x2 && y >= y1 && y <= y2 ? POSITION_ENUM.INSIDE : null;

      return topLeft || topRight || bottomLeft || bottomRight || inside;
    }

    case TOOLS_ENUM.PENCIL: {
      if (element.points) {
        const betweenAnyPoint = element.points?.some((point, index) => {
          const nextPoint = element.points?.[index + 1];
          if (!nextPoint) return false;
          return (
            isOnLine(point.x, point.y, nextPoint.x, nextPoint.y, x, y, 5) !==
            null
          );
        });
        return betweenAnyPoint ? POSITION_ENUM.INSIDE : null;
      }
      return null;
    }
    default:
      throw new Error(`tool type: ${type} not supported`);
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
const average = (a: number, b: number) => (a + b) / 2;

export const getSvgPathFromStroke = (points: number[][], closed = true) => {
  const len = points.length;

  if (len < 4) {
    return ``;
  }

  let a = points[0];
  let b = points[1];
  const c = points[2];

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
    2
  )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
    b[1],
    c[1]
  ).toFixed(2)} T`;

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i];
    b = points[i + 1];
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(
      2
    )} `;
  }

  if (closed) {
    result += "Z";
  }

  return result;
};

export const drawElement = (
  roughCanvas: RoughCanvas,
  context: CanvasRenderingContext2D,
  element: DrawingElement
) => {
  const { type, points, roughtElement } = element;
  switch (type) {
    case TOOLS_ENUM.LINE:
    case TOOLS_ENUM.RECTANGLE:
      if (roughtElement) {
        roughCanvas.draw(roughtElement);
      }
      break;
    case TOOLS_ENUM.PENCIL:
      if (points) {
        const _stroke = getStroke(points);
        const _pathData = getSvgPathFromStroke(_stroke);
        const _path = new Path2D(_pathData);
        context.fill(_path);
      }
      break;
    default:
      throw new Error(`tool type: ${type} not supported`);
  }
};
