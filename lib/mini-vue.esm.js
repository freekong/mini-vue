const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        key: props && props.key,
        el: null
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // type为组件且children为object类型，children为Solts
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVnode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (typeof slot === 'function') {
        return createVNode(Fragment, {}, slot(props));
    }
}

const extend = Object.assign;
const EMPTY_OBJ = {};
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const hasChange = (value, newValue) => {
    return !Object.is(value, newValue);
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandlerKey = (str) => {
    return str ? 'on' + capitalize(str) : '';
};

let currentEffect;
let shouldTrack = false;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        currentEffect = this;
        const resoult = this._fn();
        shouldTrack = false;
        return resoult;
    }
    stop() {
        if (this.active) {
            clearupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function clearupEffect(effect) {
    effect.deps.forEach((eff) => {
        eff.delete(effect);
    });
    effect.deps.length = 0;
}
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    if (dep.has(currentEffect))
        return;
    dep.add(currentEffect);
    currentEffect.deps.push(dep);
}
function isTracking() {
    return shouldTrack && currentEffect !== undefined;
}
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const eff of dep) {
        if (eff.scheduler) {
            eff.scheduler();
        }
        else {
            eff.run();
        }
    }
}
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // _effect.onStop = options.onStop
    extend(_effect, options);
    _effect.run();
    // 两种方式都可以
    const runner = _effect.run.bind(_effect);
    // return _effect.run.bind(currentEffect)
    runner.effect = _effect;
    // console.log("runner========>", runner)
    return runner;
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        if (!isReadonly) {
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`set失败，${target}为只读属性`, target);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function reactive(obj) {
    return createActiveObject(obj, mutableHandlers);
}
function readonly(obj) {
    return createActiveObject(obj, readonlyHandlers);
}
function shallowReadonly(obj) {
    return createActiveObject(obj, shallowReadonlyHandlers);
}
function createActiveObject(obj, baseHandler) {
    if (!isObject(obj)) {
        console.warn(`${obj}不是一个对象`);
        return obj;
    }
    return new Proxy(obj, baseHandler);
}

class refImpl {
    constructor(val) {
        this.__v_isRef = true;
        this._rawValue = val;
        this._value = convert(val);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        if (hasChange(newValue, this._rawValue)) {
            this._value = convert(newValue);
            this._rawValue = newValue;
            triggerEffects(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new refImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            // 如果是ref -> 返回.value
            // 如果不是ref -> 直接放回本身
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                // 如果原先的值是ref, 设置的值不是ref。 要将原来的ref.value 设置为 value
                target[key].value = value;
                return true;
            }
            else {
                // 其他情况直接替换就ok了
                return Reflect.set(target, key, value);
            }
        }
    });
}

function emit(instance, event, ...args) {
    console.log('%c [ event ]-2', 'font-size:13px; background:pink; color:#bf2c9f;', event);
    // instance.props -> event
    const { props } = instance;
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        // if (key in setupState) {
        //   return setupState[key]
        // }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSolts(instance, children) {
    // instance.slots = Array.isArray(children) ? children : [children]
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObjectSlots(instance.slots, children);
    }
}
function normalizeObjectSlots(slots, children) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        isMounted: false,
        parent,
        provides: parent ? parent.provides : {},
        subTree: {},
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSolts(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResoult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        handleSetupResoult(instance, setupResoult);
    }
}
function handleSetupResoult(instance, setupResoult) {
    // function
    // object
    if (typeof setupResoult === 'object') {
        instance.setupState = proxyRefs(setupResoult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 转换成 vNode
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

// import { createVNode } from "./vnode";
function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options;
    function render(vnode, container) {
        // 调用patch, 为了后面的递归处理
        patch(null, vnode, container, null, null);
    }
    /**
     * @description:
     * @param {*} n1 老的虚拟节点
     * @param {*} n2 新的虚拟节点
     * @param {*} container
     * @param {*} parentComponent
     * @return {*}
     */
    function patch(n1, n2, container, parentComponent, anchor) {
        // debugger
        // console.log('%c [ vnode ]-9', 'font-size:13px; background:pink; color:#bf2c9f;', vnode)
        // 判断vnode.type的类型是 component 还是 element
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    // element
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    // stateful_component
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            // 更新
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log('[ patchElement ] >');
        console.log('[ n1 ] >', n1);
        console.log('[ n2 ] >', n2);
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parentComponent, anchor);
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const prevShapeFlag = n1.shapeFlag;
        const { shapeFlag } = n2;
        const c1 = n1.children;
        const c2 = n2.children;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            // 新的是text
            if (prevShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
                // 老的是children
                // 1.先把老的array清空
                unmountChildren(n1.children);
            }
            if (c1 !== c2) {
                // 2.设置新的text
                hostSetElementText(container, c2);
            }
        }
        else {
            // 新的是array
            if (prevShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                // 老的是Text
                // 先清空老的text，再渲染新的array
                hostSetElementText(container, '');
                mountChildren(c2, container, parentComponent, anchor);
            }
            else {
                // 老的是Array
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    /**
     * @description: 比较新老两个虚拟节点是否相同
     * @param {*} n1 老的children内的虚拟节点
     * @param {*} n2 新的children内的虚拟节点
     * @return {*}
     */
    function isSomeVNodeType(n1, n2) {
        // 根据 type 和 key 来判断
        return n1.type === n2.type && n1.key === n2.key;
    }
    /**
     * @description: 对比新老children都为数组
     * @param {*} c1 老的children
     * @param {*} c2 新的children
     * @return {*}
     */
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        let i = 0;
        const l1 = c1.length;
        const l2 = c2.length;
        let e1 = l1 - 1;
        let e2 = l2 - 1;
        while (i <= e1 && i <= e2) {
            let n1 = c1[i];
            let n2 = c2[i];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            i++;
        }
        while (i <= e1 && i <= e2) {
            let n1 = c1[e1];
            let n2 = c2[e2];
            if (isSomeVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        if (i > e1) {
            // 新的比老的多 创建
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = e2 + 1 < l2 ? c2[nextPos].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            // 老的比新的多 删除
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            // 中间对比
            let s1 = i;
            let s2 = i;
            const toBePatched = e2 - s2 + 1; // 新的diff长度
            let patched = 0;
            let moved = false;
            let maxNewIndexSoFar = 0;
            const keyToNewIndexMap = new Map();
            const newIndexToOldIndexMap = new Array(toBePatched); // 老的child的index对应在新的child的index的映射表
            // 初始化映射表
            for (let i = 0; i < toBePatched; i++) {
                newIndexToOldIndexMap[i] = 0;
            }
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }
            let newIndex;
            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                if (patched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }
                if (prevChild.key != null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    for (let j = s2; j <= e2; j++) {
                        const nextChild = c2[j];
                        if (isSomeVNodeType(prevChild, nextChild)) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    // 老的在新的里面一定存在，newIndex为老的在新的里面的索引
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                    patched++;
                }
            }
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
            let j = increasingNewIndexSequence.length - 1;
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                else if (moved) {
                    if (j < 0 || i != increasingNewIndexSequence[j]) {
                        console.log('==============>  需要移动');
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
        console.log('[ i ] >', i);
        console.log('[ e1 ] >', e1);
        console.log('[ e2 ] >', e2);
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function mountElement(vnode, container, parentComponent, anchor) {
        const el = (vnode.el = hostCreateElement(vnode.type));
        const { props, children, shapeFlag } = vnode;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            // text_children
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            // array_children
            mountChildren(children, el, parentComponent, anchor);
        }
        for (const key in props) {
            const val = props[key];
            // const isOn = (key: string) => /^on[A-Z]/.test(key);
            // if (isOn(key)) {
            //   const event = key.slice(2).toLowerCase()
            //   el.addEventListener(event, val)
            // } else {
            //   el.setAttribute(key, val);
            // }
            hostPatchProp(el, key, null, val);
        }
        // container.append(el)
        hostInsert(el, container, anchor);
    }
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach(v => {
            patch(null, v, container, parentComponent, anchor);
        });
    }
    function processComponent(n1, n2, container, parentComponent, anchor) {
        mountComponent(n2, container, parentComponent, anchor);
    }
    function mountComponent(initialVnode, container, parentComponent, anchor) {
        const instance = createComponentInstance(initialVnode, parentComponent); // {vnode, type: vnode.type}
        console.log('%c [ 实例instance ]-74', 'font-size:13px; background:pink; color:#bf2c9f;', instance);
        setupComponent(instance);
        setupRenderEffect(instance, initialVnode, container, anchor);
    }
    function setupRenderEffect(instance, initialVnode, container, anchor) {
        effect(() => {
            // debugger
            if (!instance.isMounted) {
                console.log('[ init ] >');
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                // console.log('%c [ subTree ]-121', 'font-size:13px; background:pink; color:#bf2c9f;', subTree)
                patch(null, subTree, container, instance, anchor);
                initialVnode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log('[ update ] >');
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        });
    }
    return {
        createApp: createAppAPI(render)
    };
}
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, oldVal, newVal) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, newVal);
    }
    else {
        if (newVal === undefined || newVal === null) {
            el.removeAttribute(key, newVal);
        }
        else {
            el.setAttribute(key, newVal);
        }
    }
}
function insert(child, parent, anchor) {
    // parent.append(el)
    parent.insertBefore(child, anchor || null);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
});
function createApp(...arg) {
    return renderer.createApp(...arg);
}

export { createApp, createRenderer, createTextVnode, getCurrentInstance, h, inject, provide, proxyRefs, ref, renderSlots };
