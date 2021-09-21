"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lifetime_1 = require("./lifetime");
var assert_1 = __importDefault(require("assert"));
describe('Lifetime', function () {
    describe('.consume', function () {
        it('yeilds the value', function () {
            var lifetime = new lifetime_1.Lifetime(1);
            var result = lifetime.consume(function (l) { return l.value + 1; });
            assert_1.default.strictEqual(result, 2);
        });
        it('disposes the lifetime', function () {
            var disposed = false;
            var lifetime = new lifetime_1.Lifetime(2, undefined, function () {
                disposed = true;
            });
            lifetime.consume(function (l) { return l.value * 2; });
            assert_1.default.strictEqual(lifetime.alive, false);
            assert_1.default.strictEqual(disposed, true);
        });
    });
});
describe('Scope', function () {
    describe('.withScope', function () {
        function counter() {
            var n = 0;
            return {
                increment: function () { return n++; },
                count: function () { return n; },
            };
        }
        it('disposes all the lifetimes', function () {
            var _a = counter(), increment = _a.increment, count = _a.count;
            var secondLifetime = lifetime_1.Scope.withScope(function (scope) {
                scope.manage(new lifetime_1.Lifetime('first', undefined, function (s) { return increment(); }));
                return scope.manage(new lifetime_1.Lifetime('second', undefined, function (s) { return increment(); }));
            });
            assert_1.default.strictEqual(secondLifetime.alive, false);
            assert_1.default.strictEqual(count(), 2);
        });
    });
});
//# sourceMappingURL=lifetime.test.js.map