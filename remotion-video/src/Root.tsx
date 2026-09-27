import "./index.css";
import { MyComposition } from "./Composition";
import { GuangRenCompositions } from "./guangren/Compositions";
import { CosmicTruthsCompositions } from "./cosmos/Compositions";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <CosmicTruthsCompositions />
      <GuangRenCompositions />
      <MyComposition />
    </>
  );
};
