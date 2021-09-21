import React, { useEffect } from 'react'
import './App.css'
import { getQuickJS } from 'quickjs-emscripten'
import { versions } from 'process'

function stringify(val: unknown) {
  if (typeof val === 'undefined') {
    return 'undefined'
  }

  return JSON.stringify(val, undefined, 2)
}

const initialCode = `
let cow = 1;
[cow, ++cow];
`.trim()

function App() {
  const [js, setJs] = React.useState(initialCode)
  const [evalResult, setEvalResult] = React.useState<unknown>(undefined)
  const [consoleContents, setConsoleContents] = React.useState<string>('')
  const handleEval = React.useCallback(async () => {
    let consoleContents = '';
    const QuickJS = await getQuickJS()
    const vm = QuickJS.createVm()
    const printFn = vm.newFunction('print', (...args) => {
      consoleContents += args.map(arg => vm.dump(arg)).join(' ') + '\n';
      for (const arg of args) {
        arg.dispose()
      }
      return vm.undefined
    })
    vm.setProp(vm.global, 'print', printFn)
    printFn.dispose()
    try {
      setConsoleContents('')
      const result = vm.unwrapResult(vm.evalCode(js))
      console.log('eval result:', vm.dump(result))
      setConsoleContents(consoleContents);
      setEvalResult(vm.dump(result))
      result.dispose();
    } catch (err) {
      console.log('eval error:', err)
      setEvalResult(err)
    }
    vm.dispose();
  }, [js, setEvalResult])
  useEffect(() => {
    handleEval()
  }, [handleEval, js, setEvalResult])
  return (
    <div className="App">
      <div>
        <h1>quickjs-emscripten</h1>
        <p>
          Javascript/Typescript bindings for <a href="https://bellard.org/quickjs/">QuickJS</a>, a
          modern Javascript interpreter written in C by Fabrice Bellard and Charlie Gordon.
        </p>
        <ul>
          <li>Safely evaluate untrusted Javascript (up to ES2020).</li>
          <li>Create and manipulate values inside the QuickJS runtime.</li>
          <li>Expose host functions to the QuickJS runtime.</li>
        </ul>
        <p>
          <a href="https://github.com/justjake/quickjs-emscripten">Github</a> -{' '}
          <a href="https://github.com/justjake/quickjs-emscripten/blob/master/doc/globals.md">
            Documentation
          </a>{' '}
          - <a href="https://www.npmjs.com/package/quickjs-emscripten">NPM</a>
        </p>
        <h2>Eval JS code safely</h2>
        <label htmlFor="js">This code is evaluated in a QuickJS virtual machine:</label>
        <div>
          <textarea id="js" value={js} onChange={e => setJs(e.target.value)} />
        </div>
        <h3>Eval result:</h3>
        <pre>{stringify(evalResult)}</pre>
        <h3>Console:</h3>
        <pre>{consoleContents}</pre>
      </div>
    </div>
  )
}

export default App
