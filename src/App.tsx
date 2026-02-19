import { Layout } from "@/components/Layout";
import { ContextMenuProvider } from "@/components/GlobalContextMenu";

const App = () => (
  <ContextMenuProvider>
    <Layout />
  </ContextMenuProvider>
);

export default App;
