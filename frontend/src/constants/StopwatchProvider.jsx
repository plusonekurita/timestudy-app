import { createContext, useContext } from "react";

import { useStopwatch } from "../hooks/useStopwatch";

const StopwatchContext = createContext(null);

export const StopwatchProvider = ({ children }) => {
  const stopwatch = useStopwatch(); // ← カスタムフックを1回だけ使う

  return (
    <StopwatchContext.Provider value={stopwatch}>
      {children}
    </StopwatchContext.Provider>
  );
};

export const useStopwatchContext = () => useContext(StopwatchContext);
