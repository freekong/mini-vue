

import { extend } from "../shared";

class ReactiveEffect{
  private _fn: any;
  deps = [];
  active = true;
  onStop?: () => void;
  constructor(fn, public scheduler?) {
    this._fn = fn
  }

  run() {
    currentEffect = this
    return this._fn()
  }

  stop() {
    if (this.active) {
      clearupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

function clearupEffect(effect) {
  effect.deps.forEach((eff : any) => {
    eff.delete(effect)
  })
}

let targetMap = new Map();
let currentEffect;

export function track(target, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  if (!currentEffect) return;
  dep.add(currentEffect)
  currentEffect.deps.push(dep)
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target)

  let dep = depsMap.get(key)

  dep.forEach(eff => {
    if (eff.scheduler) {
      eff.scheduler()
    } else {
      eff.run()
    }
  })
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  // _effect.onStop = options.onStop
  extend(_effect, options)
  _effect.run()

  // 两种方式都可以
  const runner: any = _effect.run.bind(_effect)
  // return _effect.run.bind(currentEffect)
  runner.effect = _effect
  // console.log("runner========>", runner)
  return runner
}

export function stop(runner) {
  runner.effect.stop()
}