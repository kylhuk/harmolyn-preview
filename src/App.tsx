import { Layout } from "@/components/Layout";
import { ContextMenuProvider } from "@/components/GlobalContextMenu";
import { XoreinAppProviders } from "@/lib/xoreinClientProvider";

const App = () => (
  <XoreinAppProviders>
    <ContextMenuProvider>
      <Layout />
    </ContextMenuProvider>
  </XoreinAppProviders>
);

export default App;
