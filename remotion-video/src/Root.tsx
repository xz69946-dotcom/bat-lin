import "./index.css";
import { MyComposition } from "./Composition";
import { GuangRenCompositions } from "./guangren/Compositions";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <GuangRenCompositions />
      <MyComposition />
    </>
  );
};
