declare namespace Emscripten {
    interface FileSystemType {
    }
    type EnvironmentType = 'WEB' | 'NODE' | 'SHELL' | 'WORKER';
    type ValueType = 'number' | 'string' | 'array' | 'boolean';
    type TypeCompatibleWithC = number | string | any[] | boolean;
    type WebAssemblyImports = Array<{
        name: string;
        kind: string;
    }>;
    type WebAssemblyExports = Array<{
        module: string;
        name: string;
        kind: string;
    }>;
    interface CCallOpts {
        async?: boolean;
    }
}
/**
 * Typings for the featuers we use to interface with our Emscripten build of
 * QuickJS.
 */
export interface QuickJSEmscriptenModule {
    addFunction(fn: Function, type: string): number;
    removeFunction(pointer: number): void;
    stringToUTF8(str: string, outPtr: number, maxBytesToRead?: number): void;
    lengthBytesUTF8(str: string): number;
    _malloc(size: number): number;
    _free(ptr: number): void;
    cwrap(ident: string, returnType: Emscripten.ValueType | null, argTypes: Emscripten.ValueType[], opts?: Emscripten.CCallOpts): (...args: any[]) => any;
    HEAP8: Int8Array;
    HEAP16: Int16Array;
    HEAP32: Int32Array;
    HEAPU8: Uint8Array;
    HEAPU16: Uint16Array;
    HEAPU32: Uint32Array;
    HEAPF32: Float32Array;
    HEAPF64: Float64Array;
    TOTAL_STACK: number;
    TOTAL_MEMORY: number;
    FAST_MEMORY: number;
}
export {};
