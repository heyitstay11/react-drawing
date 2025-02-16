import { useLayoutEffect, useState } from "react";
import rough from "roughjs";
import "./App.css";
import { ACTIONS_ENUM, TOOLS_ENUM } from "./utils/constants";
import {
  ActionType,
  DrawingElement,
  SelectionElement,
  ToolType,
} from "./utils/types";
import { getElementAtPosition } from "./utils/utils";

const generator = rough.generator();

const createElement = (
  id: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  type: ToolType
): DrawingElement => {
  const roughtElement =
    type === TOOLS_ENUM.LINE
      ? generator.line(x1, y1, x2, y2)
      : generator.rectangle(x1, y1, x2 - x1, y2 - y1);
  return { id, x1, y1, x2, y2, roughtElement, type };
};

function App() {
  const [tool, setTool] = useState<ToolType>(TOOLS_ENUM.LINE);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [selectedElement, setSelectedElements] =
    useState<SelectionElement | null>(null);
  const [action, setAction] = useState<ActionType>(ACTIONS_ENUM.NONE);

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
    const context = canvas.getContext("2d")!;
    context.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);

    elements.forEach(({ roughtElement }) => roughCanvas.draw(roughtElement));
  }, [elements]);

  const updateElement = (
    id: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    type: ToolType
  ) => {
    const updatedElement = createElement(id, x1, y1, x2, y2, type);

    const _elements = [...elements];
    _elements[id] = updatedElement;
    setElements(_elements);
  };

  const handleMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const { clientX, clientY } = e;
    if (tool === TOOLS_ENUM.SELECTION) {
      const element = getElementAtPosition(clientX, clientY, elements);

      if (element) {
        const offsetX = clientX - element.x1;
        const offsetY = clientY - element.y1;
        setAction(ACTIONS_ENUM.MOVING);
        setSelectedElements({ ...element, offsetX, offsetY });
      }
    } else {
      setAction(ACTIONS_ENUM.DRAWING);
      const id = elements.length;
      const element = createElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        tool
      );
      setElements((prev) => [...prev, element]);
    }
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const { clientX, clientY } = e;

    if (tool === TOOLS_ENUM.SELECTION) {
      e.currentTarget.style.cursor = getElementAtPosition(
        clientX,
        clientY,
        elements
      )
        ? "move"
        : "default";
    }

    if (action === ACTIONS_ENUM.DRAWING) {
      const { id, x1, y1 } = elements[elements.length - 1];

      updateElement(id, x1, y1, clientX, clientY, tool);
    } else if (action === ACTIONS_ENUM.MOVING) {
      if (selectedElement) {
        const { id, x1, y1, x2, y2, type, offsetX, offsetY } = selectedElement;
        const width = x2 - x1;
        const height = y2 - y1;
        const nextX1 = clientX - offsetX;
        const nextY1 = clientY - offsetY;
        updateElement(
          id,
          nextX1,
          nextY1,
          nextX1 + width,
          nextY1 + height,
          type
        );
      }
    }
  };

  const handleMouseUp = () => {
    setAction(ACTIONS_ENUM.NONE);
  };

  return (
    <main>
      <div style={{ position: "fixed" }}>
        <input
          type="radio"
          id="selection"
          radioGroup="shape"
          checked={tool === TOOLS_ENUM.SELECTION}
          onChange={() => setTool(TOOLS_ENUM.SELECTION)}
        />
        <label htmlFor="selection">Selection</label>
        <input
          type="radio"
          id="line"
          radioGroup="shape"
          checked={tool === TOOLS_ENUM.LINE}
          onChange={() => setTool(TOOLS_ENUM.LINE)}
        />
        <label htmlFor="line">Line</label>
        <input
          type="radio"
          id="rectangle"
          radioGroup="shape"
          checked={tool === TOOLS_ENUM.RECTANGLE}
          onChange={() => setTool(TOOLS_ENUM.RECTANGLE)}
        />
        <label htmlFor="rectangle">Rectangle</label>
      </div>
      <canvas
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        Canvas
      </canvas>
    </main>
  );
}

export default App;
