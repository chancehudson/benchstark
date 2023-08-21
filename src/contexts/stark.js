import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'
import { field, starkVariables, defaultStark } from 'starkstark'
import { MultiPolynomial } from 'starkstark/src/MultiPolynomial.mjs'
import { ScalarField } from 'starkstark/src/ScalarField.mjs'
import * as wasm from 'rstark'

// turn it into a u32 array
function serializeBigint(v) {
  let _v = v
  const out = []
  while (_v > 0n) {
    out.push(Number(_v & ((1n << 32n) - 1n)))
    _v >>= 32n
  }
  return out
}

export default class STARK {
  constructor(state, requestUrl) {
    makeAutoObservable(this)
    if (typeof window !== 'undefined') {
      this.load()
    } else {
      // this.loadSSR(requestUrl)
    }
  }

  load() {}

  buildProof(_traceLength = 40, _registerCount = 2) {
    const traceLength = +_traceLength
    const registerCount = +_registerCount
    const results = []
    results.push(`trace length: ${traceLength}, register count: ${registerCount}`)
    results.push(`boundary constraints: ${2*registerCount}`)
    results.push(`transition constraints: ${registerCount}`)
    results.push('-')
    const f = new ScalarField(
      1n + 407n * (1n << 119n),
      85408008396924667383611388730472331217n
    )

    let start = +new Date()
    const sequenceLength = traceLength

    const trace = [
      Array(registerCount).fill().map((_, i) => 2n + BigInt(i))
    ]
    while (trace.length < sequenceLength) {
      trace.push(
        trace[trace.length-1].map(v => f.mul(v, v))
      )
    }
    // trace index, register index, value
    const boundaryConstraints = [
      Array(registerCount).fill().map((_, i) => [0, i, serializeBigint(trace[0][i])]),
      Array(registerCount).fill().map((_, i) => [sequenceLength-1, i, serializeBigint(trace[sequenceLength-1][i])]),
    ].flat()
    console.log(boundaryConstraints)

    const variables = Array(1+2*registerCount).fill().map((_, i) => {
      return new MultiPolynomial(f)
        .term({ coef: 1n, exps: { [i]: 1n }})
    })
    const cycleIndex = variables[0]
    const prevState = variables.slice(1, registerCount+1)
    const nextState = variables.slice(1+registerCount)
    const transitionConstraints = Array(registerCount).fill().map((_, i) => prevState[i].copy().mul(prevState[i]).sub(nextState[i]))

    results.push(`trace built: ${+new Date() - start} ms`)
    start = +new Date()

    const proof = wasm.prove({
      transition_constraints: transitionConstraints.map(v => v.serialize()),
      boundary: boundaryConstraints,
      trace: trace.map(t => t.map(v => serializeBigint(v))),
    })
    results.push(`proof built: ${+new Date() - start} ms`)
    console.log('Proof built!')
    start = +new Date()

    wasm.verify(proof, {
      trace_len: sequenceLength,
      register_count: registerCount,
      transition_constraints: transitionConstraints.map(v => v.serialize()),
      boundary: boundaryConstraints,
    })
    results.push(`proof verified: ${+new Date() - start} ms`)
    console.log('Proof verified!')
    return results

    /*
    console.log(wasm)
    const proof = wasm.prove()
    console.log(proof)
    console.log('done?')

    */

    // const registerCount = 20
    // const trace = [Array(registerCount).fill(5n), Array(registerCount).fill(0n)]
    // const stark = defaultStark(trace.length, registerCount)
    // const vars = starkVariables(registerCount)
    // const boundaryConstraints = [
    //   // ...Array(registerCount).fill().map((_, i) => [0n, BigInt(i), 5n]),
    //   ...Array(registerCount).fill().map((_, i) => [1n, BigInt(i), 0n])
    // ]
    // const cPolys = Array(9).fill().map((_, i) => new MultiPolynomial(field).term({ coef: BigInt(i)+1n, exps: { 0: 0n } }))
    // const transitionConstraints = []
    // // constrain all values to 1-9
    // for (let x = 0; x < registerCount; x++) {
    //   const c = vars.prevState[x]
    //     .copy()
    //     .sub(new MultiPolynomial(field).term({ coef: 1n, exps: { 0: 0n }}))
    //   for (let y = 1; y < 9; y++) {
    //     c.mul(
    //       vars.prevState[x]
    //         .copy()
    //         .sub(new MultiPolynomial(field).term({ coef: BigInt(y)+1n, exps: { 0: 0n }}))
    //       )
    //   }
    //   c.add(vars.nextState[x])
    //   transitionConstraints.push(c)
    // }
    // const notEqual = (var1, var2) => {
    //   // need zeroes at x*y = 1*2 | 1*3 | 1*4 ...
    //   const c = new MultiPolynomial(field).term({ coef: 1n, exps: { 0: 0n }})
    //   for (let x = 0n; x < 9n; x++) {
    //     for (let y = x+1n; y < 9n; y++) {
    //       c.mul(
    //         var1.copy().mul(var2).sub(new MultiPolynomial(field).term({ coef: x*y, exps: { 0: 0n } }))
    //       )
    //     }
    //   }
    //   return c
    // }
    // // constrain all columns to not be equal
    // // for (let x = 0; x < 9; x++) {
    // //   for (let y = x+1; y < 9; y++) {
    // //     transitionConstraints.push(notEqual(vars.prevState[x], vars.prevState[y]))
    // //   }
    // // }
    // console.log(boundaryConstraints, transitionConstraints)
    // console.log('building')
    // const proof = stark.prove(trace, transitionConstraints, boundaryConstraints)
    // console.log('done')
    // console.log(stark.verify(proof, transitionConstraints, boundaryConstraints))
    // return proof
  }
}
