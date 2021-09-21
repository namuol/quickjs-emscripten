import { QuickJSEmscriptenModule } from "./emscripten-types";
/**
 * C pointer to export type `CType`. Pointer types are used internally for FFI, but
 * are not intended for external use.
 *
 * @unstable This export type is considered private and may change.
 */
export declare type Pointer<CType extends string> = number & {
    ctype: CType;
};
/**
 * `JSRuntime*`.
 */
export declare type JSRuntimePointer = Pointer<'JSRuntime'>;
/**
 * `JSContext*`.
 */
export declare type JSContextPointer = Pointer<'JSContext'>;
/**
 * `JSValue*`.
 * See [[JSValue]].
 */
export declare type JSValuePointer = Pointer<'JSValue'>;
/**
 * `JSValueConst*
 * See [[JSValueConst]] and [[StaticJSValue]].
 */
export declare type JSValueConstPointer = Pointer<'JSValueConst'>;
/**
 * Used internally for Javascript-to-C function calls.
 */
export declare type JSValuePointerPointer = Pointer<'JSValue[]'>;
/**
 * Used internally for Javascript-to-C function calls.
 */
export declare type JSValueConstPointerPointer = Pointer<'JSValueConst[]'>;
/**
 * Used internally for C-to-Javascript function calls.
 */
export declare type JSCFunctionPointer = Pointer<'JSCFunction'>;
/**
 * Used internally for C-to-Javascript function calls.
 */
export declare type QTS_C_To_HostCallbackFuncPointer = Pointer<'C_To_HostCallbackFunc'>;
/**
 * Used internally for C-to-Javascript interrupt handlers.
 */
export declare type QTS_C_To_HostInterruptFuncPointer = Pointer<'C_To_HostInterruptFunc'>;
/**
 * Used internally for Javascript-to-C calls that may contain strings too large
 * for the Emscripten stack.
 */
export declare type HeapCharPointer = Pointer<'char'>;
/**
 * Low-level FFI bindings to QuickJS's Emscripten module.
 * See instead [[QuickJSVm]], the public Javascript interface exposed by this
 * library.
 *
 * @unstable The FFI interface is considered private and may change.
 */
export declare class QuickJSFFI {
    private module;
    constructor(module: QuickJSEmscriptenModule);
    QTS_SetHostCallback: (fp: QTS_C_To_HostCallbackFuncPointer) => void;
    QTS_ArgvGetJSValueConstPointer: (argv: JSValuePointer | JSValueConstPointer, index: number) => JSValueConstPointer;
    QTS_NewFunction: (ctx: JSContextPointer, func_data: JSValuePointer | JSValueConstPointer, name: string) => JSValuePointer;
    QTS_Throw: (ctx: JSContextPointer, error: JSValuePointer | JSValueConstPointer) => JSValuePointer;
    QTS_NewError: (ctx: JSContextPointer) => JSValuePointer;
    QTS_SetInterruptCallback: (cb: QTS_C_To_HostInterruptFuncPointer) => void;
    QTS_RuntimeEnableInterruptHandler: (rt: JSRuntimePointer) => void;
    QTS_RuntimeDisableInterruptHandler: (rt: JSRuntimePointer) => void;
    QTS_RuntimeSetMemoryLimit: (rt: JSRuntimePointer, limit: number) => void;
    QTS_RuntimeComputeMemoryUsage: (rt: JSRuntimePointer, ctx: JSContextPointer) => JSValuePointer;
    QTS_RuntimeDumpMemoryUsage: (rt: JSRuntimePointer) => string;
    QTS_GetUndefined: () => JSValueConstPointer;
    QTS_GetNull: () => JSValueConstPointer;
    QTS_GetFalse: () => JSValueConstPointer;
    QTS_GetTrue: () => JSValueConstPointer;
    QTS_NewRuntime: () => JSRuntimePointer;
    QTS_FreeRuntime: (rt: JSRuntimePointer) => void;
    QTS_NewContext: (rt: JSRuntimePointer) => JSContextPointer;
    QTS_FreeContext: (ctx: JSContextPointer) => void;
    QTS_FreeValuePointer: (ctx: JSContextPointer, value: JSValuePointer) => void;
    QTS_DupValuePointer: (ctx: JSContextPointer, val: JSValuePointer | JSValueConstPointer) => JSValuePointer;
    QTS_NewObject: (ctx: JSContextPointer) => JSValuePointer;
    QTS_NewObjectProto: (ctx: JSContextPointer, proto: JSValuePointer | JSValueConstPointer) => JSValuePointer;
    QTS_NewArray: (ctx: JSContextPointer) => JSValuePointer;
    QTS_NewFloat64: (ctx: JSContextPointer, num: number) => JSValuePointer;
    QTS_GetFloat64: (ctx: JSContextPointer, value: JSValuePointer | JSValueConstPointer) => number;
    QTS_NewString: (ctx: JSContextPointer, string: HeapCharPointer) => JSValuePointer;
    QTS_GetString: (ctx: JSContextPointer, value: JSValuePointer | JSValueConstPointer) => string;
    QTS_IsJobPending: (rt: JSRuntimePointer) => number;
    QTS_ExecutePendingJob: (rt: JSRuntimePointer, maxJobsToExecute: number) => JSValuePointer;
    QTS_GetProp: (ctx: JSContextPointer, this_val: JSValuePointer | JSValueConstPointer, prop_name: JSValuePointer | JSValueConstPointer) => JSValuePointer;
    QTS_SetProp: (ctx: JSContextPointer, this_val: JSValuePointer | JSValueConstPointer, prop_name: JSValuePointer | JSValueConstPointer, prop_value: JSValuePointer | JSValueConstPointer) => void;
    QTS_DefineProp: (ctx: JSContextPointer, this_val: JSValuePointer | JSValueConstPointer, prop_name: JSValuePointer | JSValueConstPointer, prop_value: JSValuePointer | JSValueConstPointer, get: JSValuePointer | JSValueConstPointer, set: JSValuePointer | JSValueConstPointer, configurable: boolean, enumerable: boolean, has_value: boolean) => void;
    QTS_Call: (ctx: JSContextPointer, func_obj: JSValuePointer | JSValueConstPointer, this_obj: JSValuePointer | JSValueConstPointer, argc: number, argv_ptrs: JSValueConstPointerPointer) => JSValuePointer;
    QTS_ResolveException: (ctx: JSContextPointer, maybe_exception: JSValuePointer) => JSValuePointer;
    QTS_Dump: (ctx: JSContextPointer, obj: JSValuePointer | JSValueConstPointer) => string;
    QTS_Eval: (ctx: JSContextPointer, js_code: HeapCharPointer, filename: string) => JSValuePointer;
    QTS_Typeof: (ctx: JSContextPointer, value: JSValuePointer | JSValueConstPointer) => string;
    QTS_GetGlobalObject: (ctx: JSContextPointer) => JSValuePointer;
    QTS_NewPromiseCapability: (ctx: JSContextPointer, resolve_funcs_out: JSValuePointerPointer) => JSValuePointer;
    QTS_TestStringArg: (string: string) => void;
}
