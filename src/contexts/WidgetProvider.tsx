// src/contexts/WidgetProvider.tsx
import React, { useMemo } from "react";
import { WidgetContext } from "./widgetContextCore";
import type { WidgetConfig } from "../types/widget";

interface Props {
  children: React.ReactNode;
  config?: WidgetConfig;
}

const WidgetProvider: React.FC<Props> = ({ children, config }) => {
  const value = useMemo(() => ({ config }), [config]);
  return <WidgetContext.Provider value={value}>{children}</WidgetContext.Provider>;
};

export default WidgetProvider;
