/// <reference types="vite/client" />
declare module "*.css";

// Pyodide добавляет загрузчик в window после подключения pyodide.js.
interface Window {
  loadPyodide?: (options: { indexURL: string }) => Promise<any>;
}
