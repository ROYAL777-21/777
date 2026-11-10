/* bun scripts/engine-train.ts — run the nightly self-improvement loop */
import { train } from "../src/lib/engine/train"

async function main() {
  const report = await train("user_1")
  console.log(JSON.stringify(report, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
