import { QuickJSFFI, JSContextPointer, JSValuePointer, JSRuntimePointer, JSValueConstPointer } from './ffi';
import { LowLevelJavascriptVm, VmPropertyDescriptor, VmCallResult, VmFunctionImplementation, SuccessOrFail } from './vm-interface';
import { QuickJSEmscriptenModule } from './emscripten-types';
import { Lifetime, WeakLifetime, StaticLifetime, Scope, Disposable } from './lifetime';
export { Lifetime, WeakLifetime, StaticLifetime, Scope, Disposable };
/**
 * @throws if not ready
 */
declare function getQuickJSEmscriptenModule(): QuickJSEmscriptenModule;
declare type CToHostCallbackFunctionImplementation = (ctx: JSContextPointer, this_ptr: JSValueConstPointer, argc: number, argv: JSValueConstPointer, fn_data_ptr: JSValueConstPointer) => JSValuePointer;
declare type CToHostInterruptImplementation = (rt: JSRuntimePointer) => 0 | 1;
/**
 * Callback called regularly while the VM executes code.
 * Determines if a VM's execution should be interrupted.
 *
 * @returns `true` to interrupt JS execution inside the VM.
 * @returns `false` or `undefined` to continue JS execution inside the VM.
 */
export declare type InterruptHandler = (vm: QuickJSVm) => boolean | undefined;
export declare type QuickJSPropertyKey = number | string | QuickJSHandle;
/**
 * QuickJSDeferredPromise wraps a QuickJS promise [[handle]] and allows
 * [[resolve]]ing or [[reject]]ing that promise. Use it to bridge asynchronous
 * code on the host to APIs inside a QuickJSVm.
 *
 * Managing the lifetime of promises is tricky. There are three
 * [[QuickJSHandle]]s inside of each deferred promise object: (1) the promise
 * itself, (2) the `resolve` callback, and (3) the `reject` callback.
 *
 * - If the promise will be fufilled before the end of it's [[owner]]'s lifetime,
 *   the only cleanup necessary is `deferred.handle.dispose()`, because
 *   calling [[resolve]] or [[reject]] will dispose of both callbacks automatically.
 *
 * - As the return value of a [[VmFunctionImplementation]], return [[handle]],
 *   and ensure that either [[resolve]] or [[reject]] will be called. No other
 *   clean-up is necessary.
 *
 * - In other cases, call [[dispose]], which will dispose [[handle]] as well as the
 *   QuickJS handles that back [[resolve]] and [[reject]]. For this object,
 *   [[dispose]] is idempotent.
 */
export declare class QuickJSDeferredPromise implements Disposable {
    /**
     * The QuickJSVm this promise was created by.
     */
    owner: QuickJSVm;
    /**
     * A handle of the Promise instance inside the QuickJSVm.
     * You must dispose [[handle]] or the entire QuickJSDeferredPromise once you
     * are finished with it.
     */
    handle: QuickJSHandle;
    /**
     * A native promise that will resolve once this deferred is settled.
     */
    settled: Promise<void>;
    private resolveHandle;
    private rejectHandle;
    private onSettled;
    /**
     * Use [[QuickJSVm.newPromise]] to create a new promise instead of calling
     * this constructor directly.
     * @unstable
     */
    constructor(args: {
        owner: QuickJSVm;
        promiseHandle: QuickJSHandle;
        resolveHandle: QuickJSHandle;
        rejectHandle: QuickJSHandle;
    });
    /**
     * Resolve [[handle]] with the given value, if any.
     * Calling this method after calling [[dispose]] is a no-op.
     *
     * Note that after resolving a promise, you may need to call
     * [[QuickJSVm.executePendingJobs]] to propagate the result to the promise's
     * callbacks.
     */
    resolve: (value?: StaticJSValue | JSValue | JSValueConst | undefined) => void;
    /**
     * Reject [[handle]] with the given value, if any.
     * Calling this method after calling [[dispose]] is a no-op.
     *
     * Note that after rejecting a promise, you may need to call
     * [[QuickJSVm.executePendingJobs]] to propagate the result to the promise's
     * callbacks.
     */
    reject: (value?: StaticJSValue | JSValue | JSValueConst | undefined) => void;
    get alive(): boolean;
    dispose: () => void;
    private disposeResolvers;
}
/**
 * Used as an optional for the results of executing pendingJobs.
 * On success, `value` contains the number of async jobs executed
 * by the runtime.
 * `{ value: number } | { error: QuickJSHandle }`.
 */
export declare type ExecutePendingJobsResult = SuccessOrFail<number, QuickJSHandle>;
/**
 * QuickJSVm wraps a QuickJS Javascript runtime (JSRuntime*) and context (JSContext*).
 * This class's methods return {@link QuickJSHandle}, which wrap C pointers (JSValue*).
 * It's the caller's responsibility to call `.dispose()` on any
 * handles you create to free memory once you're done with the handle.
 *
 * Each QuickJSVm instance is isolated. You cannot share handles between different
 * QuickJSVm instances. You should create separate QuickJSVm instances for
 * untrusted code from different souces for isolation.
 *
 * Use [[QuickJS.createVm]] to create a new QuickJSVm.
 *
 * Create QuickJS values inside the interpreter with methods like
 * [[newNumber]], [[newString]], [[newArray]], [[newObject]], and
 * [[newFunction]].
 *
 * Call [[setProp]] or [[defineProp]] to customize objects. Use those methods
 * with [[global]] to expose the values you create to the interior of the
 * interpreter, so they can be used in [[evalCode]].
 *
 * Use [[evalCode]] or [[callFunction]] to execute Javascript inside the VM. If
 * you're using asynchronous code inside the QuickJSVm, you may need to also
 * call [[executePendingJobs]].
 *
 * Implement memory and CPU constraints with [[setInterruptHandler]]
 * (called regularly while the interpreter runs) and [[setMemoryLimit]].
 * Use [[computeMemoryUsage]] or [[dumpMemoryUsage]] to guide memory limit
 * tuning.
 */
export declare class QuickJSVm implements LowLevelJavascriptVm<QuickJSHandle>, Disposable {
    private readonly ctx;
    private readonly rt;
    private readonly module;
    private readonly ffi;
    private _undefined;
    private _null;
    private _false;
    private _true;
    private _global;
    private _scope;
    /**
     * Use {@link QuickJS.createVm} to create a QuickJSVm instance.
     */
    constructor(args: {
        module: ReturnType<typeof getQuickJSEmscriptenModule>;
        ffi: QuickJSFFI;
        ctx: Lifetime<JSContextPointer>;
        rt: Lifetime<JSRuntimePointer>;
    });
    /**
     * [`undefined`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined).
     */
    get undefined(): QuickJSHandle;
    /**
     * [`null`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null).
     */
    get null(): QuickJSHandle;
    /**
     * [`true`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/true).
     */
    get true(): QuickJSHandle;
    /**
     * [`false`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/false).
     */
    get false(): QuickJSHandle;
    /**
     * [`global`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects).
     * A handle to the global object inside the interpreter.
     * You can set properties to create global variables.
     */
    get global(): QuickJSHandle;
    /**
     * `typeof` operator. **Not** [standards compliant](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof).
     *
     * @remarks
     * Does not support BigInt values correctly.
     */
    typeof(handle: QuickJSHandle): string;
    /**
     * Converts a Javascript number into a QuckJS value.
     */
    newNumber(num: number): QuickJSHandle;
    /**
     * Converts `handle` into a Javascript number.
     * @returns `NaN` on error, othewise a `number`.
     */
    getNumber(handle: QuickJSHandle): number;
    /**
     * Create a QuickJS [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) value.
     */
    newString(str: string): QuickJSHandle;
    /**
     * Converts `handle` to a Javascript string.
     */
    getString(handle: QuickJSHandle): string;
    /**
     * `{}`.
     * Create a new QuickJS [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer).
     *
     * @param prototype - Like [`Object.create`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create).
     */
    newObject(prototype?: QuickJSHandle): QuickJSHandle;
    /**
     * `[]`.
     * Create a new QuickJS [array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).
     */
    newArray(): QuickJSHandle;
    /**
     * Convert a Javascript function into a QuickJS function value.
     * See [[VmFunctionImplementation]] for more details.
     *
     * A [[VmFunctionImplementation]] should not free its arguments or its retun
     * value. A VmFunctionImplementation should also not retain any references to
     * its veturn value.
     *
     * To implement an async function, create a promise with [[newPromise]], then
     * return the deferred promise handle from `deferred.handle` from your
     * function implementation:
     *
     * ```
     * const deferred = vm.newPromise()
     * someNativeAsyncFunction().then(deferred.resolve)
     * return deferred.handle
     * ```
     */
    newFunction(name: string, fn: VmFunctionImplementation<QuickJSHandle>): QuickJSHandle;
    /**
     * Create a new [[QuickJSDeferredPromise]]. Use `deferred.resolve(handle)` and
     * `deferred.reject(handle)` to fufill the promise handle available at `deferred.handle`.
     * Note that you are responsible for calling `deferred.dispose()` to free the underlying
     * resources; see the documentation on [[QuickJSDeferredPromise]] for details.
     */
    newPromise(): QuickJSDeferredPromise;
    /**
     * `handle[key]`.
     * Get a property from a JSValue.
     *
     * @param key - The property may be specified as a JSValue handle, or as a
     * Javascript string (which will be converted automatically).
     */
    getProp(handle: QuickJSHandle, key: QuickJSPropertyKey): QuickJSHandle;
    /**
     * `handle[key] = value`.
     * Set a property on a JSValue.
     *
     * @remarks
     * Note that the QuickJS authors recommend using [[defineProp]] to define new
     * properties.
     *
     * @param key - The property may be specified as a JSValue handle, or as a
     * Javascript string or number (which will be converted automatically to a JSValue).
     */
    setProp(handle: QuickJSHandle, key: QuickJSPropertyKey, value: QuickJSHandle): void;
    /**
     * [`Object.defineProperty(handle, key, descriptor)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty).
     *
     * @param key - The property may be specified as a JSValue handle, or as a
     * Javascript string or number (which will be converted automatically to a JSValue).
     */
    defineProp(handle: QuickJSHandle, key: QuickJSPropertyKey, descriptor: VmPropertyDescriptor<QuickJSHandle>): void;
    /**
     * [`func.call(thisVal, ...args)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call).
     * Call a JSValue as a function.
     *
     * See [[unwrapResult]], which will throw if the function returned an error, or
     * return the result handle directly.
     *
     * @returns A result. If the function threw, result `error` be a handle to the exception.
     */
    callFunction(func: QuickJSHandle, thisVal: QuickJSHandle, ...args: QuickJSHandle[]): VmCallResult<QuickJSHandle>;
    /**
     * Like [`eval(code)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#Description).
     * Evauatetes the Javascript source `code` in the global scope of this VM.
     * When working with async code, you many need to call [[executePendingJobs]]
     * to execute callbacks pending after synchronous evaluation returns.
     *
     * See [[unwrapResult]], which will throw if the function returned an error, or
     * return the result handle directly.
     *
     * *Note*: to protect against infinite loops, provide an interrupt handler to
     * [[setInterruptHandler]]. You can use [[shouldInterruptAfterDeadline]] to
     * create a time-based deadline.
     *
     *
     * @returns The last statement's value. If the code threw, result `error` will be
     * a handle to the exception. If execution was interrupted, the error will
     * have name `InternalError` and message `interrupted`.
     */
    evalCode(code: string, filename?: string): VmCallResult<QuickJSHandle>;
    /**
     * Execute pendingJobs on the VM until `maxJobsToExecute` jobs are executed
     * (default all pendingJobs), the queue is exhausted, or the runtime
     * encounters an exception.
     *
     * In QuickJS, promises and async functions create pendingJobs. These do not execute
     * immediately and need to triggered to run.
     *
     * @param maxJobsToExecute - When negative, run all pending jobs. Otherwise execute
     * at most `maxJobsToExecute` before returning.
     *
     * @return On success, the number of executed jobs. On error, the exception
     * that stopped execution.
     */
    executePendingJobs(maxJobsToExecute?: number): ExecutePendingJobsResult;
    /**
     * In QuickJS, promises and async functions create pendingJobs. These do not execute
     * immediately and need to be run by calling [[executePendingJobs]].
     *
     * @return true if there is at least one pendingJob queued up.
     */
    hasPendingJob(): boolean;
    /**
     * Dump a JSValue to Javascript in a best-effort fashion.
     * Returns `handle.toString()` if it cannot be serialized to JSON.
     */
    dump(handle: QuickJSHandle): any;
    /**
     * Unwrap a SuccessOrFail result such as a [[VmCallResult]] or a
     * [[ExecutePendingJobsResult]], where the fail branch contains a handle to a QuickJS error value.
     * If the result is a success, returns the value.
     * If the result is an error, converts the error to a native object and throws the error.
     */
    unwrapResult<T>(result: SuccessOrFail<T, QuickJSHandle>): T;
    private interruptHandler;
    /**
     * Set a callback which is regularly called by the QuickJS engine when it is
     * executing code. This callback can be used to implement an execution
     * timeout.
     *
     * The interrupt handler can be removed with [[removeInterruptHandler]].
     */
    setInterruptHandler(cb: InterruptHandler): void;
    /**
     * Set the max memory this runtime can allocate.
     * To remove the limit, set to `-1`.
     */
    setMemoryLimit(limitBytes: number): void;
    /**
     * Compute memory usage for this runtime. Returns the result as a handle to a
     * JSValue object. Use [[dump]] to convert to a native object.
     * Calling this method will allocate more memory inside the runtime. The information
     * is accurate as of just before the call to `computeMemoryUsage`.
     * For a human-digestable representation, see [[dumpMemoryUsage]].
     */
    computeMemoryUsage(): QuickJSHandle;
    /**
     * @returns a human-readable description of memory usage in this runtime.
     * For programatic access to this information, see [[computeMemoryUsage]].
     */
    dumpMemoryUsage(): string;
    /**
     * Remove the interrupt handler, if any.
     * See [[setInterruptHandler]].
     */
    removeInterruptHandler(): void;
    get alive(): boolean;
    /**
     * Dispose of this VM's underlying resources.
     *
     * @throws Calling this method without disposing of all created handles
     * will result in an error.
     */
    dispose(): void;
    private fnNextId;
    private fnMap;
    /**
     * @hidden
     */
    cToHostCallbackFunction: CToHostCallbackFunctionImplementation;
    /** @hidden */
    cToHostInterrupt: CToHostInterruptImplementation;
    private assertOwned;
    private copyJSValue;
    private freeJSValue;
    private heapValueHandle;
    private borrowPropertyKey;
    private toPointerArray;
    private newMutablePointerArray;
    private newHeapCharPointer;
    private errorToHandle;
}
/**
 * A QuickJSHandle to a constant that will never change, and does not need to
 * be disposed.
 */
export declare type StaticJSValue = Lifetime<JSValueConstPointer, JSValueConstPointer, QuickJSVm>;
/**
 * A QuickJSHandle to a borrowed value that does not need to be disposed.
 *
 * In QuickJS, a JSValueConst is a "borrowed" reference that isn't owned by the
 * current scope. That means that the current scope should not `JS_FreeValue`
 * it, or retain a reference to it after the scope exits, because it may be
 * freed by its owner.
 *
 * quickjs-emscripten takes care of disposing JSValueConst references.
 */
export declare type JSValueConst = Lifetime<JSValueConstPointer, JSValuePointer, QuickJSVm>;
/**
 * A owned QuickJSHandle that should be disposed or returned.
 *
 * The QuickJS interpreter passes Javascript values between functions as
 * `JSValue` structs that references some internal data. Because passing
 * structs cross the Empscripten FFI interfaces is bothersome, we use pointers
 * to these structs instead.
 *
 * A JSValue reference is "owned" in its scope. before exiting the scope, it
 * should be freed,  by calling `JS_FreeValue(ctx, js_value)`) or returned from
 * the scope. We extend that contract - a JSValuePointer (`JSValue*`) must also
 * be `free`d.
 *
 * You can do so from Javascript by calling the .dispose() method.
 */
export declare type JSValue = Lifetime<JSValuePointer, JSValuePointer, QuickJSVm>;
/**
 * Wraps a C pointer to a QuickJS JSValue, which represents a Javascript value inside
 * a QuickJS virtual machine.
 *
 * Values must not be shared between QuickJSVm instances.
 * You must dispose of any handles you create by calling the `.dispose()` method.
 */
export declare type QuickJSHandle = StaticJSValue | JSValue | JSValueConst;
/**
 * Options for [[QuickJS.evalCode]].
 */
export interface QuickJSEvalOptions {
    /**
     * Interrupt evaluation if `shouldInterrupt` returns `true`.
     * See [[shouldInterruptAfterDeadline]].
     */
    shouldInterrupt?: InterruptHandler;
    /**
     * Memory limit, in bytes, of WASM heap memory used by the QuickJS VM.
     */
    memoryLimitBytes?: number;
}
/**
 * QuickJS presents a Javascript interface to QuickJS, a Javascript interpreter that
 * supports ES2019.
 *
 * QuickJS is a singleton. Use the [[getQuickJS]] function to instantiate
 * or retrieve an instance.
 *
 * Use the {@link QuickJS.createVm} method to create a {@link QuickJSVm}.
 *
 * Use the {@link QuickJS.evalCode} method as a shortcut evaluate Javascript safely
 * and return the result as a native Javascript value.
 */
export declare class QuickJS {
    private ffi;
    private vmMap;
    private rtMap;
    private module;
    constructor();
    /**
     * Create a QuickJS VM.
     *
     * Each VM is completely independent - you cannot share handles between
     * VMs.
     */
    createVm(): QuickJSVm;
    /**
     * One-off evaluate code without needing to create a VM.
     *
     * To protect against infinite loops, use the `shouldInterrupt` option. The
     * [[shouldInterruptAfterDeadline]] function will create a time-based deadline.
     *
     * If you need more control over how the code executes, create a
     * [[QuickJSVm]] instance and use its [[QuickJSVm.evalCode]] method.
     *
     * Asynchronous callbacks may not run during the first call to `evalCode`. If you need to
     * work with async code inside QuickJS, you should create a VM and use [[QuickJSVm.executePendingJobs]].
     *
     * @returns The result is coerced to a native Javascript value using JSON
     * serialization, so properties and values unsupported by JSON will be dropped.
     *
     * @throws If `code` throws during evaluation, the exception will be
     * converted into a native Javascript value and thrown.
     *
     * @throws if `options.shouldInterrupt` interrupted execution, will throw a Error
     * with name `"InternalError"` and  message `"interrupted"`.
     */
    evalCode(code: string, options?: QuickJSEvalOptions): unknown;
    private cToHostCallbackFunction;
    private cToHostInterrupt;
}
/**
 * Returns an interrupt handler that interrupts Javascript execution after a deadline time.
 *
 * @param deadline - Interrupt execution if it's still running after this time.
 *   Number values are compared against `Date.now()`
 */
export declare function shouldInterruptAfterDeadline(deadline: Date | number): InterruptHandler;
/**
 * This is the top-level entrypoint for the quickjs-emscripten library.
 * Get the root QuickJS API.
 */
export declare function getQuickJS(): Promise<QuickJS>;
/**
 * Provides synchronous access to the QuickJS API once [[getQuickJS]] has resolved at
 * least once.
 * @throws If called before `getQuickJS` resolves.
 */
export declare function getQuickJSSync(): QuickJS;
