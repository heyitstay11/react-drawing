import { useEffect, useLayoutEffect, useState } from "react";
import rough from "roughjs";
import "./App.css";
import { ACTIONS_ENUM, TOOLS_ENUM } from "./utils/constants";
import {
  ActionType,
  DrawingElement,
  SelectionElement,
  ToolType,
} from "./utils/types";
import {
  adjustElementCoordinates,
  cursorForPosition,
  drawElement,
  getElementAtPosition,
  resizedCoordinates,
} from "./utils/utils";
import { useHistory } from "./hooks/useHistory";

const generator = rough.generator();

const createElement = (
  id: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  type: ToolType
): DrawingElement => {
  let roughtElement;

  switch (type) {
    case TOOLS_ENUM.LINE:
      roughtElement = generator.line(x1, y1, x2, y2);
      return { id, x1, y1, x2, y2, roughtElement, type };
    case TOOLS_ENUM.RECTANGLE:
      roughtElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
      return { id, x1, y1, x2, y2, roughtElement, type };
    case TOOLS_ENUM.PENCIL:
      return {
        id,
        x1,
        y1,
        x2,
        y2,
        roughtElement,
        type,
        points: [{ x: x1, y: y1 }],
      };
    default:
      throw new Error(`tool type: ${type} not supported`);
  }
};

function App() {
  const [elements, setElements, undo, redo] = useHistory<DrawingElement[]>([]);
  const [tool, setTool] = useState<ToolType>(TOOLS_ENUM.PENCIL);
  const [selectedElement, setSelectedElements] =
    useState<SelectionElement | null>(null);
  const [action, setAction] = useState<ActionType>(ACTIONS_ENUM.NONE);

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
    const context = canvas.getContext("2d")!;
    context.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);

    elements.forEach((element) => drawElement(roughCanvas, context, element));
  }, [elements]);

  useEffect(() => {
    const undoRedoKeyHandler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    document.addEventListener("keydown", undoRedoKeyHandler);
    return () => document.removeEventListener("keydown", undoRedoKeyHandler);
  }, [undo, redo]);

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
    setElements(_elements, true);
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
        setSelectedElements({ ...element, offsetX, offsetY });
        setElements((prev) => prev);
        if (element.position === "inside") {
          setAction(ACTIONS_ENUM.MOVING);
        } else {
          setAction(ACTIONS_ENUM.RESIZING);
        }
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
      setSelectedElements(element);
      setElements((prev) => [...prev, element]);
    }
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const { clientX, clientY } = e;

    if (tool === TOOLS_ENUM.SELECTION) {
      const element = getElementAtPosition(clientX, clientY, elements);

      e.currentTarget.style.cursor = element
        ? cursorForPosition(element.position)
        : "default";
    }

    if (action === ACTIONS_ENUM.DRAWING) {
      const { id, x1, y1 } = elements[elements.length - 1];

      updateElement(id, x1, y1, clientX, clientY, tool);
    } else if (action === ACTIONS_ENUM.MOVING) {
      if (selectedElement) {
        const {
          id,
          x1,
          y1,
          x2,
          y2,
          type,
          offsetX = 0,
          offsetY = 0,
        } = selectedElement;
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
    } else if (action === ACTIONS_ENUM.RESIZING) {
      if (selectedElement) {
        const { id, type, position = null, ...coordinates } = selectedElement;
        const { x1, y1, x2, y2 } = resizedCoordinates(
          clientX,
          clientY,
          position,
          coordinates
        );
        updateElement(id, x1, y1, x2, y2, type);
      }
    }
  };

  const handleMouseUp = () => {
    if (action === ACTIONS_ENUM.DRAWING || action === ACTIONS_ENUM.RESIZING) {
      if (selectedElement) {
        const index = selectedElement?.id;
        const { id, type } = elements[index];
        const { x1, x2, y1, y2 } = adjustElementCoordinates(elements[index]);
        updateElement(id, x1, y1, x2, y2, type);
      }
    }
    setAction(ACTIONS_ENUM.NONE);
    setSelectedElements(null);
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
        <input
          type="radio"
          id="pencil"
          radioGroup="shape"
          checked={tool === TOOLS_ENUM.PENCIL}
          onChange={() => setTool(TOOLS_ENUM.PENCIL)}
        />
        <label htmlFor="pencil">Pencil</label>
      </div>
      <div style={{ position: "fixed", bottom: 0, padding: 10 }}>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
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
