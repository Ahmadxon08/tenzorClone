// src/contexts/widgetContextCore.ts
import { createContext, useContext } from "react";
import type { WidgetConfig } from "../types/widget";

export type WidgetContextValue = {
  config?: WidgetConfig;
};

export const WidgetContext = createContext<WidgetContextValue>({});
export const useWidgetConfig = (): WidgetContextValue => useContext(WidgetContext);
