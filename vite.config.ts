import { defineConfig, PluginOption } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import svgr from "@svgr/rollup";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(), svgr() as PluginOption],
  define: {
    global: "window",
  },
});
