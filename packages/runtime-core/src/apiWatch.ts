import { ReactiveEffect } from "@djh-mini-vue/reactivity";
import { queuePreFlushCb } from "./scheduler";

export function watchEffect(source) {
  
  let cleanup;

  function onCleanup(fn) {
    cleanup = effect.onStop = fn
  }

  function getter() {
    if (cleanup) cleanup()
    source(onCleanup)
  }

  const effect = new ReactiveEffect(getter, () => {
    queuePreFlushCb(job)
  })

  function job() {
    effect.run()
  }

  effect.run()

  return () => {
    effect.stop()
  }
}