import { MacBookScene } from "./MacBookScene";
import "./paper-homepage.css";

export default function PlayPage({ onReady, onError }: { onReady?: () => void; onError?: () => void }) {
  return <div className="play-page">
    <MacBookScene onReady={onReady} onError={onError} />
  </div>;
}
