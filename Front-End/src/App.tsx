import { useRoutes } from "react-router";
import { ThemeProvider } from "./components/theme-provider";
import { routes } from "./routes";
import "./index.css";

function App() {
  const element = useRoutes(routes);

  return (
    <ThemeProvider defaultTheme="light" storageKey="attendance-theme">
      {element}
    </ThemeProvider>
  );
}

export default App;
