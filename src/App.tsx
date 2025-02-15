import { useLayoutEffect, useState } from "react";
import rough from "roughjs";
import "./App.css";
import { ELEMENT_TYPES_ENUM } from "./types/constants";
import { DrawingElement, DrawingElementType } from "./types/types";

const generator = rough.generator();

const createElement = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  type: DrawingElementType
): DrawingElement => {
  const roughtElement =
    type === ELEMENT_TYPES_ENUM.LINE
      ? generator.line(x1, y1, x2, y2)
      : generator.rectangle(x1, y1, x2 - x1, y2 - y1);
  return { x1, y1, x2, y2, roughtElement };
};

function App() {
  const [elementType, setElementType] = useState<DrawingElementType>(
    ELEMENT_TYPES_ENUM.LINE
  );
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [drawing, setDrawing] = useState(false);

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
    const context = canvas.getContext("2d")!;
    context.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);

    elements.forEach(({ roughtElement }) => roughCanvas.draw(roughtElement));
  }, [elements]);

  const handleMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    setDrawing(true);
    const { clientX, clientY } = e;

    const element = createElement(
      clientX,
      clientY,
      clientX,
      clientY,
      elementType
    );
    setElements((prev) => [...prev, element]);
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (!drawing) return;

    const { clientX, clientY } = e;
    const { x1, y1 } = elements[elements.length - 1];
    const element = createElement(x1, y1, clientX, clientY, elementType);

    setElements((prev) => {
      const _prev = [...prev];
      _prev[_prev.length - 1] = element;
      return _prev;
    });
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  return (
    <main>
      <div style={{ position: "fixed" }}>
        <input
          type="radio"
          id="line"
          radioGroup="shape"
          checked={elementType === ELEMENT_TYPES_ENUM.LINE}
          onChange={() => setElementType(ELEMENT_TYPES_ENUM.LINE)}
        />
        <label htmlFor="line">Line</label>
        <input
          type="radio"
          id="rectangle"
          radioGroup="shape"
          checked={elementType === ELEMENT_TYPES_ENUM.RECTANGLE}
          onChange={() => setElementType(ELEMENT_TYPES_ENUM.RECTANGLE)}
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
