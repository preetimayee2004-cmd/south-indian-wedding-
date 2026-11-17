import { createContext, useContext } from "react";

/** True once the opening has handed over to the page (or was skipped/disabled). */
export const IntroContext = createContext(true);
export const useRevealed = () => useContext(IntroContext);
