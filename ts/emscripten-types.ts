// This is a subset of the Emscripten type definitions from @types/emscripten
// Project: http://kripken.github.io/emscripten-site/index.html
// Definitions by: Kensuke Matsuzaki <https://github.com/zakki>
//                 Periklis Tsirakidis <https://github.com/periklis>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
//
// quickjs-emscripten doesn't use the full EmscriptenModule type from @types/emscripten because:
//
// - the upstream types define many properties that don't exist on our module due
//   to our build settings
// - some upstream types reference web-only ambient types like WebGL stuff, which
//   we don't use.

declare namespace Emscripten {
  interface FileSystemType {}
  type EnvironmentType = 'WEB' | 'NODE' | 'SHELL' | 'WORKER'
  type ValueType = 'number' | 'string' | 'array' | 'boolean'
  type TypeCompatibleWithC = number | string | any[] | boolean

  type WebAssemblyImports = Array<{
    name: string
    kind: string
  }>

  type WebAssemblyExports = Array<{
    module: string
    name: string
    kind: string
  }>

  interface CCallOpts {
    async?: boolean
  }
}

declare namespace FS {
  interface Lookup {
      path: string;
      node: FSNode;
  }

  interface FSStream {}
  interface FSNode {}
  interface ErrnoError {}
  
  let ignorePermissions: boolean;
  let trackingDelegate: any;
  let tracking: any;
  let genericErrors: any;
}

export interface FileSystem {
  //
  // paths
  //
  lookupPath(path: string, opts: any): FS.Lookup;
  getPath(node: FS.FSNode): string;

  //
  // nodes
  //
  isFile(mode: number): boolean;
  isDir(mode: number): boolean;
  isLink(mode: number): boolean;
  isChrdev(mode: number): boolean;
  isBlkdev(mode: number): boolean;
  isFIFO(mode: number): boolean;
  isSocket(mode: number): boolean;

  //
  // devices
  //
  major(dev: number): number;
  minor(dev: number): number;
  makedev(ma: number, mi: number): number;
  registerDevice(dev: number, ops: any): void;

  //
  // core
  //
  syncfs(populate: boolean, callback: (e: any) => any): void;
  syncfs(callback: (e: any) => any, populate?: boolean): void;
  mount(type: Emscripten.FileSystemType, opts: any, mountpoint: string): any;
  unmount(mountpoint: string): void;

  mkdir(path: string, mode?: number): any;
  mkdev(path: string, mode?: number, dev?: number): any;
  symlink(oldpath: string, newpath: string): any;
  rename(old_path: string, new_path: string): void;
  rmdir(path: string): void;
  readdir(path: string): any;
  unlink(path: string): void;
  readlink(path: string): string;
  stat(path: string, dontFollow?: boolean): any;
  lstat(path: string): any;
  chmod(path: string, mode: number, dontFollow?: boolean): void;
  lchmod(path: string, mode: number): void;
  fchmod(fd: number, mode: number): void;
  chown(path: string, uid: number, gid: number, dontFollow?: boolean): void;
  lchown(path: string, uid: number, gid: number): void;
  fchown(fd: number, uid: number, gid: number): void;
  truncate(path: string, len: number): void;
  ftruncate(fd: number, len: number): void;
  utime(path: string, atime: number, mtime: number): void;
  open(path: string, flags: string, mode?: number, fd_start?: number, fd_end?: number): FSStream;
  close(stream: FS.FSStream): void;
  llseek(stream: FS.FSStream, offset: number, whence: number): any;
  read(stream: FS.FSStream, buffer: ArrayBufferView, offset: number, length: number, position?: number): number;
  write(
      stream: FS.FSStream,
      buffer: ArrayBufferView,
      offset: number,
      length: number,
      position?: number,
      canOwn?: boolean,
  ): number;
  allocate(stream: FS.FSStream, offset: number, length: number): void;
  mmap(
      stream: FS.FSStream,
      buffer: ArrayBufferView,
      offset: number,
      length: number,
      position: number,
      prot: number,
      flags: number,
  ): any;
  ioctl(stream: FS.FSStream, cmd: any, arg: any): any;
  readFile(path: string, opts: { encoding: 'binary'; flags?: string | undefined }): Uint8Array;
  readFile(path: string, opts: { encoding: 'utf8'; flags?: string | undefined }): string;
  readFile(path: string, opts?: { flags?: string | undefined }): Uint8Array;
  writeFile(path: string, data: string | ArrayBufferView, opts?: { flags?: string | undefined }): void;

  //
  // module-level FS code
  //
  cwd(): string;
  chdir(path: string): void;
  init(
      input: null | (() => number | null),
      output: null | ((c: number) => any),
      error: null | ((c: number) => any),
  ): void;

  createLazyFile(
      parent: string | FS.FSNode,
      name: string,
      url: string,
      canRead: boolean,
      canWrite: boolean,
  ): FS.FSNode;
  createPreloadedFile(
      parent: string | FS.FSNode,
      name: string,
      url: string,
      canRead: boolean,
      canWrite: boolean,
      onload?: () => void,
      onerror?: () => void,
      dontCreateFile?: boolean,
      canOwn?: boolean,
  ): void;
  createDataFile(
      parent: string | FS.FSNode,
      name: string,
      data: ArrayBufferView,
      canRead: boolean,
      canWrite: boolean,
      canOwn: boolean,
  ): FS.FSNode;
}

/**
 * Typings for the featuers we use to interface with our Emscripten build of
 * QuickJS.
 */
export interface QuickJSEmscriptenModule {
  FS: FileSystem
  addFunction(fn: Function, type: string): number
  removeFunction(pointer: number): void
  stringToUTF8(str: string, outPtr: number, maxBytesToRead?: number): void
  lengthBytesUTF8(str: string): number

  _malloc(size: number): number
  _free(ptr: number): void
  cwrap(
    ident: string,
    returnType: Emscripten.ValueType | null,
    argTypes: Emscripten.ValueType[],
    opts?: Emscripten.CCallOpts
  ): (...args: any[]) => any

  // USE_TYPED_ARRAYS == 2
  HEAP8: Int8Array
  HEAP16: Int16Array
  HEAP32: Int32Array
  HEAPU8: Uint8Array
  HEAPU16: Uint16Array
  HEAPU32: Uint32Array
  HEAPF32: Float32Array
  HEAPF64: Float64Array

  TOTAL_STACK: number
  TOTAL_MEMORY: number
  FAST_MEMORY: number
}
