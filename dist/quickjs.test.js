"use strict";
/**
 * These tests demonstate some common patterns for using quickjs-emscripten.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var quickjs_1 = require("./quickjs");
var mocha_1 = require("mocha");
var assert_1 = __importDefault(require("assert"));
var fs_1 = __importDefault(require("fs"));
mocha_1.describe('QuickJSVm', function () { return __awaiter(void 0, void 0, void 0, function () {
    var vm;
    return __generator(this, function (_a) {
        vm = undefined;
        beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            var quickjs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, quickjs_1.getQuickJS()];
                    case 1:
                        quickjs = _a.sent();
                        vm = quickjs.createVm();
                        return [2 /*return*/];
                }
            });
        }); });
        afterEach(function () {
            vm.dispose();
            vm = undefined;
        });
        mocha_1.describe('primitives', function () {
            mocha_1.it('can round-trip a number', function () {
                var jsNumber = 42;
                var numHandle = vm.newNumber(jsNumber);
                assert_1.default.equal(vm.getNumber(numHandle), jsNumber);
            });
            mocha_1.it('can round-trip a string', function () {
                var jsString = 'an example 🤔 string with unicode 🎉';
                var stringHandle = vm.newString(jsString);
                assert_1.default.equal(vm.getString(stringHandle), jsString);
            });
            mocha_1.it('can round-trip undefined', function () {
                assert_1.default.strictEqual(vm.dump(vm.undefined), undefined);
            });
            mocha_1.it('can round-trip true', function () {
                assert_1.default.strictEqual(vm.dump(vm.true), true);
            });
            mocha_1.it('can round-trip false', function () {
                assert_1.default.strictEqual(vm.dump(vm.false), false);
            });
            mocha_1.it('can round-trip null', function () {
                assert_1.default.strictEqual(vm.dump(vm.null), null);
            });
        });
        mocha_1.describe('functions', function () {
            mocha_1.it('can wrap a Javascript function and call it', function () {
                var some = 9;
                var fnHandle = vm.newFunction('addSome', function (num) {
                    return vm.newNumber(some + vm.getNumber(num));
                });
                var result = vm.callFunction(fnHandle, vm.undefined, vm.newNumber(1));
                if (result.error) {
                    assert_1.default.fail('calling fnHandle must succeed');
                }
                assert_1.default.equal(vm.getNumber(result.value), 10);
                fnHandle.dispose();
            });
            mocha_1.it('passes through native exceptions', function () {
                var fnHandle = vm.newFunction('jsOops', function () {
                    throw new Error('oops');
                });
                var result = vm.callFunction(fnHandle, vm.undefined);
                if (!result.error) {
                    assert_1.default.fail('function call must return error');
                }
                assert_1.default.deepEqual(vm.dump(result.error), {
                    name: 'Error',
                    message: 'oops',
                });
                result.error.dispose();
                fnHandle.dispose();
            });
            mocha_1.it('can return undefined twice', function () {
                var fnHandle = vm.newFunction('returnUndef', function () {
                    return vm.undefined;
                });
                vm.unwrapResult(vm.callFunction(fnHandle, vm.undefined)).dispose();
                var result = vm.unwrapResult(vm.callFunction(fnHandle, vm.undefined));
                assert_1.default.equal(vm.typeof(result), 'undefined');
                result.dispose();
                fnHandle.dispose();
            });
            mocha_1.it('can see its arguments being cloned', function () {
                var value;
                var fnHandle = vm.newFunction('doSomething', function (arg) {
                    value = arg.dup();
                });
                var argHandle = vm.newString('something');
                var callHandle = vm.callFunction(fnHandle, vm.undefined, argHandle);
                argHandle.dispose();
                vm.unwrapResult(callHandle).dispose();
                if (!value)
                    throw new Error("Value unset");
                assert_1.default.equal(vm.getString(value), 'something');
                value.dispose();
                fnHandle.dispose();
            });
        });
        mocha_1.describe('properties', function () {
            mocha_1.it('defining a property does not leak', function () {
                vm.defineProp(vm.global, 'Name', {
                    enumerable: false,
                    configurable: false,
                    get: function () { return vm.newString('World'); },
                });
                var result = vm.unwrapResult(vm.evalCode('"Hello " + Name'));
                assert_1.default.equal(vm.dump(result), 'Hello World');
                result.dispose();
            });
        });
        mocha_1.describe('objects', function () {
            mocha_1.it('can set and get properties by native string', function () {
                var object = vm.newObject();
                var value = vm.newNumber(42);
                vm.setProp(object, 'propName', value);
                var value2 = vm.getProp(object, 'propName');
                assert_1.default.equal(vm.getNumber(value2), 42);
                object.dispose();
                value.dispose();
                value2.dispose();
            });
            mocha_1.it('can set and get properties by handle string', function () {
                var object = vm.newObject();
                var key = vm.newString('prop as a QuickJS string');
                var value = vm.newNumber(42);
                vm.setProp(object, key, value);
                var value2 = vm.getProp(object, key);
                assert_1.default.equal(vm.getNumber(value2), 42);
                object.dispose();
                key.dispose();
                value.dispose();
                value2.dispose();
            });
            mocha_1.it('can create objects with a prototype', function () {
                var defaultGreeting = vm.newString('SUP DAWG');
                var greeterPrototype = vm.newObject();
                vm.setProp(greeterPrototype, 'greeting', defaultGreeting);
                defaultGreeting.dispose();
                var greeter = vm.newObject(greeterPrototype);
                // Gets something from the prototype
                var getGreeting = vm.getProp(greeter, 'greeting');
                assert_1.default.equal(vm.getString(getGreeting), 'SUP DAWG');
                getGreeting.dispose();
                // But setting a property from the prototype does not modify the prototype
                var newGreeting = vm.newString('How do you do?');
                vm.setProp(greeter, 'greeting', newGreeting);
                newGreeting.dispose();
                var originalGreeting = vm.getProp(greeterPrototype, 'greeting');
                assert_1.default.equal(vm.getString(originalGreeting), 'SUP DAWG');
                originalGreeting.dispose();
                greeterPrototype.dispose();
                greeter.dispose();
            });
        });
        mocha_1.describe('arrays', function () {
            mocha_1.it('can set and get entries by native number', function () {
                var array = vm.newArray();
                var val1 = vm.newNumber(101);
                vm.setProp(array, 0, val1);
                var val2 = vm.getProp(array, 0);
                assert_1.default.strictEqual(vm.getNumber(val2), 101);
                array.dispose();
                val1.dispose();
                val2.dispose();
            });
            mocha_1.it('adding items sets array.length', function () {
                var vals = [vm.newNumber(0), vm.newNumber(1), vm.newString('cow')];
                var array = vm.newArray();
                for (var i = 0; i < vals.length; i++) {
                    vm.setProp(array, i, vals[i]);
                }
                var length = vm.getProp(array, 'length');
                assert_1.default.strictEqual(vm.getNumber(length), 3);
                array.dispose();
                vals.forEach(function (val) { return val.dispose(); });
            });
        });
        mocha_1.describe('.unwrapResult', function () {
            mocha_1.it('successful result: returns the value', function () {
                var handle = vm.newString('OK!');
                var result = {
                    value: handle,
                };
                assert_1.default.strictEqual(vm.unwrapResult(result), handle);
            });
            mocha_1.it('error result: throws the error as a Javascript value', function () {
                var handle = vm.newString('ERROR!');
                var result = {
                    error: handle,
                };
                try {
                    vm.unwrapResult(result);
                    assert_1.default.fail('vm.unwrapResult(error) must throw');
                }
                catch (error) {
                    assert_1.default.strictEqual(error, 'ERROR!');
                }
            });
        });
        mocha_1.describe('.evalCode', function () {
            mocha_1.it('on success: returns { value: success }', function () {
                var value = vm.unwrapResult(vm.evalCode("[\"this\", \"should\", \"work\"].join(' ')"));
                assert_1.default.equal(vm.getString(value), 'this should work');
                value.dispose();
            });
            mocha_1.it('on failure: returns { error: exception }', function () {
                var result = vm.evalCode("[\"this\", \"should\", \"fail].join(' ')");
                if (!result.error) {
                    assert_1.default.fail('result should be an error');
                }
                assert_1.default.deepEqual(vm.dump(result.error), {
                    name: 'SyntaxError',
                    message: 'unexpected end of string',
                    stack: '    at eval.js:1\n',
                });
                result.error.dispose();
            });
            mocha_1.it('runs in the global context', function () {
                vm.unwrapResult(vm.evalCode("var declaredWithEval = 'Nice!'")).dispose();
                var declaredWithEval = vm.getProp(vm.global, 'declaredWithEval');
                assert_1.default.equal(vm.getString(declaredWithEval), 'Nice!');
                declaredWithEval.dispose();
            });
            mocha_1.it('can access assigned globals', function () {
                var i = 0;
                var fnHandle = vm.newFunction('nextId', function () {
                    return vm.newNumber(++i);
                });
                vm.setProp(vm.global, 'nextId', fnHandle);
                fnHandle.dispose();
                var nextId = vm.unwrapResult(vm.evalCode("nextId(); nextId(); nextId()"));
                assert_1.default.equal(i, 3);
                assert_1.default.equal(vm.getNumber(nextId), 3);
            });
            mocha_1.it('can handle imports', function () {
                vm.unwrapResult(vm.evalCode("import {name} from '" + __dirname + "/../test/foo.js'; globalThis.declaredWithEval = name;")).dispose();
                var declaredWithEval = vm.getProp(vm.global, 'declaredWithEval');
                assert_1.default.equal(vm.getString(declaredWithEval), 'Nice!');
                declaredWithEval.dispose();
            });
            mocha_1.it('can handle imports with custom module loader', function () {
                vm.setSynchronousModuleLoader(function (_) { return "export const name = 'Nice!';"; });
                vm.unwrapResult(vm.evalCode("import {name} from 'fake-file.js'; globalThis.declaredWithEval = name;")).dispose();
                var declaredWithEval = vm.getProp(vm.global, 'declaredWithEval');
                assert_1.default.equal(vm.getString(declaredWithEval), 'Nice!');
                declaredWithEval.dispose();
            });
        });
        mocha_1.describe('.executePendingJobs', function () {
            mocha_1.it('runs pending jobs', function () {
                var i = 0;
                var fnHandle = vm.newFunction('nextId', function () {
                    return vm.newNumber(++i);
                });
                vm.setProp(vm.global, 'nextId', fnHandle);
                fnHandle.dispose();
                var result = vm.unwrapResult(vm.evalCode("(new Promise(resolve => resolve())).then(nextId).then(nextId).then(nextId);1"));
                assert_1.default.equal(i, 0);
                vm.executePendingJobs();
                assert_1.default.equal(i, 3);
                assert_1.default.equal(vm.getNumber(result), 1);
            });
        });
        mocha_1.describe('.hasPendingJob', function () {
            mocha_1.it('returns true when job pending', function () {
                var i = 0;
                var fnHandle = vm.newFunction('nextId', function () {
                    return vm.newNumber(++i);
                });
                vm.setProp(vm.global, 'nextId', fnHandle);
                fnHandle.dispose();
                vm.unwrapResult(vm.evalCode("(new Promise(resolve => resolve(5)).then(nextId));1")).dispose();
                assert_1.default.strictEqual(vm.hasPendingJob(), true, 'has a pending job after creating a promise');
                var executed = vm.unwrapResult(vm.executePendingJobs());
                assert_1.default.strictEqual(executed, 1, 'executed exactly 1 job');
                assert_1.default.strictEqual(vm.hasPendingJob(), false, 'no longer any jobs after execution');
            });
        });
        mocha_1.describe('.dump', function () {
            function dumpTestExample(val) {
                var json = typeof val === 'undefined' ? 'undefined' : JSON.stringify(val);
                var nativeType = typeof val;
                mocha_1.it("supports " + nativeType + " (" + json + ")", function () {
                    var handle = vm.unwrapResult(vm.evalCode("(" + json + ")"));
                    assert_1.default.deepEqual(vm.dump(handle), val);
                    handle.dispose();
                });
            }
            dumpTestExample(1);
            dumpTestExample('hi');
            dumpTestExample(true);
            dumpTestExample(false);
            dumpTestExample(undefined);
            dumpTestExample(null);
            dumpTestExample({ cow: true });
            dumpTestExample([1, 2, 3]);
        });
        mocha_1.describe('.typeof', function () {
            function typeofTestExample(val, toCode) {
                if (toCode === void 0) { toCode = JSON.stringify; }
                var json = toCode(val);
                var nativeType = typeof val;
                mocha_1.it("supports " + nativeType + " (" + json + ")", function () {
                    var handle = vm.unwrapResult(vm.evalCode("(" + json + ")"));
                    assert_1.default.equal(vm.typeof(handle), nativeType);
                    handle.dispose();
                });
            }
            typeofTestExample(1);
            typeofTestExample('hi');
            typeofTestExample(true);
            typeofTestExample(false);
            typeofTestExample(undefined);
            typeofTestExample(null);
            typeofTestExample({ cow: true });
            typeofTestExample([1, 2, 3]);
            typeofTestExample(function () { }, function (val) { return val.toString(); });
        });
        mocha_1.describe('interrupt handler', function () {
            mocha_1.it('is called with the expected VM', function () {
                var calls = 0;
                var interruptHandler = function (interruptVm) {
                    assert_1.default.strictEqual(interruptVm, vm, 'ShouldInterruptHandler callback VM is the vm');
                    calls++;
                    return false;
                };
                vm.setInterruptHandler(interruptHandler);
                vm.unwrapResult(vm.evalCode('1 + 1')).dispose();
                assert_1.default(calls > 0, 'interruptHandler called at least once');
            });
            mocha_1.it('interrupts infinite loop execution', function () {
                var calls = 0;
                var interruptHandler = function (interruptVm) {
                    if (calls > 10) {
                        return true;
                    }
                    calls++;
                    return false;
                };
                vm.setInterruptHandler(interruptHandler);
                var result = vm.evalCode('i = 0; while (1) { i++ }');
                // Make sure we actually got to interrupt the loop.
                var iHandle = vm.getProp(vm.global, 'i');
                var i = vm.getNumber(iHandle);
                iHandle.dispose();
                assert_1.default(i > 10, 'incremented i');
                assert_1.default(i > calls, 'incremented i more than called the interrupt handler');
                // console.log('Javascript loop iterrations:', i, 'interrupt handler calls:', calls)
                if (result.error) {
                    var errorJson = vm.dump(result.error);
                    result.error.dispose();
                    assert_1.default.equal(errorJson.name, 'InternalError');
                    assert_1.default.equal(errorJson.message, 'interrupted');
                }
                else {
                    result.value.dispose();
                    assert_1.default.fail('Should have returned an interrupt error');
                }
            });
        });
        mocha_1.describe('.computeMemoryUsage', function () {
            mocha_1.it('returns an object with JSON memory usage info', function () {
                var result = vm.computeMemoryUsage();
                var resultObj = vm.dump(result);
                result.dispose();
                var example = {
                    array_count: 1,
                    atom_count: 414,
                    atom_size: 13593,
                    binary_object_count: 0,
                    binary_object_size: 0,
                    c_func_count: 46,
                    fast_array_count: 1,
                    fast_array_elements: 0,
                    js_func_code_size: 0,
                    js_func_count: 0,
                    js_func_pc2line_count: 0,
                    js_func_pc2line_size: 0,
                    js_func_size: 0,
                    malloc_count: 665,
                    malloc_limit: 4294967295,
                    memory_used_count: 665,
                    memory_used_size: 36305,
                    obj_count: 97,
                    obj_size: 4656,
                    prop_count: 654,
                    prop_size: 5936,
                    shape_count: 50,
                    shape_size: 10328,
                    str_count: 0,
                    str_size: 0,
                };
                assert_1.default.deepEqual(Object.keys(resultObj).sort(), Object.keys(example).sort());
            });
        });
        mocha_1.describe('.setMemoryLimit', function () {
            mocha_1.it('sets an enforced limit', function () {
                vm.setMemoryLimit(100);
                var result = vm.evalCode("new Uint8Array(101); \"ok\"");
                if (!result.error) {
                    result.value.dispose();
                    throw new Error('should be an error');
                }
                vm.setMemoryLimit(-1); // so we can dump
                var error = vm.dump(result.error);
                result.error.dispose();
                assert_1.default.strictEqual(error, null);
            });
            mocha_1.it('removes limit when set to -1', function () {
                vm.setMemoryLimit(100);
                vm.setMemoryLimit(-1);
                var result = vm.unwrapResult(vm.evalCode("new Uint8Array(101); \"ok\""));
                var value = vm.dump(result);
                result.dispose();
                assert_1.default.strictEqual(value, 'ok');
            });
        });
        mocha_1.describe('.dumpMemoryUsage()', function () {
            mocha_1.it('logs memory usage', function () {
                assert_1.default(vm.dumpMemoryUsage().endsWith('per fast array)\n'), 'should end with "per fast array)\\n"');
            });
        });
        mocha_1.describe('.newPromise()', function () {
            mocha_1.it('dispose does not leak', function () {
                vm.newPromise().dispose();
            });
            mocha_1.it('passes an end-to-end test', function () { return __awaiter(void 0, void 0, void 0, function () {
                function timeout(ms) {
                    return new Promise(function (resolve) {
                        setTimeout(function () { return resolve(); }, ms);
                    });
                }
                var expectedValue, deferred, asyncFuncHandle, vmValue;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            expectedValue = Math.random();
                            deferred = undefined;
                            asyncFuncHandle = vm.newFunction('getThingy', function () {
                                deferred = vm.newPromise();
                                timeout(5).then(function () { return vm.newNumber(expectedValue).consume(function (val) { return deferred.resolve(val); }); });
                                return deferred.handle;
                            });
                            asyncFuncHandle.consume(function (func) { return vm.setProp(vm.global, 'getThingy', func); });
                            vm.unwrapResult(vm.evalCode("\n          var globalThingy = 'not set by promise';\n          getThingy().then(thingy => { globalThingy = thingy })\n        ")).dispose();
                            // Wait for the promise to settle
                            return [4 /*yield*/, deferred.settled
                                // Execute promise callbacks inside the VM
                            ];
                        case 1:
                            // Wait for the promise to settle
                            _a.sent();
                            // Execute promise callbacks inside the VM
                            vm.executePendingJobs();
                            vmValue = vm.unwrapResult(vm.evalCode("globalThingy")).consume(function (x) { return vm.dump(x); });
                            assert_1.default.equal(vmValue, expectedValue);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        mocha_1.describe('memory pressure', function () {
            mocha_1.it('can pass a large string to a C function', function () { return __awaiter(void 0, void 0, void 0, function () {
                var jsonString, stringHandle;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fs_1.default.promises.readFile(__dirname + "/../test/json-generator-dot-com-1024-rows.json", 'utf-8')];
                        case 1:
                            jsonString = _a.sent();
                            stringHandle = vm.newString(jsonString);
                            stringHandle.dispose();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        return [2 /*return*/];
    });
}); });
//# sourceMappingURL=quickjs.test.js.map