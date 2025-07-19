//
//  A universal wrapper around Anime.js that checks
//  the `targets` argument before delegating to Anime.
//  If the target set is empty (or null/undefined) we simply
//  return a no-op stub, preventing the "hasOwnProperty" crash.
//
import * as AnimeNS from "animejs"

/* the real Anime function lives on the default export; fall back to the namespace itself */
const animeCore: any = (AnimeNS as any).default ?? (AnimeNS as any)

type AnimeParams = Parameters<typeof animeCore>[0]

function isEmptyTarget(targets: AnimeParams["targets"]) {
  if (!targets) return true
  if (targets instanceof NodeList || targets instanceof HTMLCollection) return targets.length === 0
  if (Array.isArray(targets)) return targets.length === 0
  return false
}

function noopTimeline() {
  /* minimal stub so calls like `.restart()` don’t explode */
  return {
    restart() {},
    pause() {},
    play() {},
    seek() {},
  }
}

const safeAnime = (params: AnimeParams) => {
  if (!params || isEmptyTarget(params.targets)) return noopTimeline()
  return animeCore(params)
}

/* copy static helpers (timeline, stagger, …) */
Object.assign(safeAnime, animeCore)

export default safeAnime
