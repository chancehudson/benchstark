import { createContext } from 'react'
import { configure } from 'mobx'
import Interface from './interface'
import STARK from './stark'
configure({
  enforceActions: 'never',
})

export const buildState = (requestUrl) => {
  const state = {}

  const ui = new Interface(state, requestUrl)
  const stark = new STARK(state, requestUrl)

  Object.assign(state, {
    ui,
    stark,
  })
  state.loadPromise = Promise.all([ui.loadPromise, stark.loadPromise])
  return state
}

export default createContext(buildState())
