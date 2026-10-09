import "./index.css";
import { MyComposition } from "./Composition";
import { GuangRenCompositions } from "./guangren/Compositions";
import { CosmicTruthsCompositions } from "./cosmos/Compositions";
import { LiuBaiCompositions } from "./liubai/Compositions";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <LiuBaiCompositions />
      <CosmicTruthsCompositions />
      <GuangRenCompositions />
      <MyComposition />
    </>
  );
};
