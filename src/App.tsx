import MarketStats from "./components/MarketStats";
import type { FilterRenderStatItem } from "./global";

function App({ item }: { item: FilterRenderStatItem }) {
  return <MarketStats item={item} />;
}

export default App;
