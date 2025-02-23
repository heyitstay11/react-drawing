import { useState } from "react";

export const useHistory = <T extends object>(initialState: T) => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([initialState]);

  const setState = (action: T | ((arg: T) => T), overWrite = false) => {
    const newState =
      typeof action === "function" ? action(history[index]) : action;

    if (overWrite) {
      const _history = [...history];
      _history[index] = newState;
      setHistory(_history);
    } else {
      const updatedHistory = [...history].slice(0, index + 1);
      setHistory([...updatedHistory, newState]);
      setIndex((prev) => prev + 1);
    }
  };

  const undo = () => {
    if (index > 0) {
      setIndex((prev) => prev - 1);
    }
  };
  const redo = () => {
    if (index < history.length - 1) {
      setIndex((prev) => prev + 1);
    }
  };

  return [history[index], setState, undo, redo] as const;
};
