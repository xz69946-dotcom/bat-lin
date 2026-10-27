import "./index.css";
import { MyComposition } from "./Composition";
import { GuangRenCompositions } from "./guangren/Compositions";
import { CosmicTruthsCompositions } from "./cosmos/Compositions";
import { LiuBaiCompositions } from "./liubai/Compositions";
import { AzelaicCompositions } from "./azelaic/Compositions";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <AzelaicCompositions />
      <LiuBaiCompositions />
      <CosmicTruthsCompositions />
      <GuangRenCompositions />
      <MyComposition />
    </>
  );
};
