import { Composition } from "remotion"
import { PartingSea } from "./PartingSea"

/**
 * The Remotion root — `bun run splash:studio` opens the timeline,
 * `bun run splash:render` writes the MP4 used by app stores.
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="PartingSea" component={PartingSea} durationInFrames={225} fps={30} width={1080} height={1920} />
  </>
)
