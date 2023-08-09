import { createContext } from 'react'
import { configure } from 'mobx'
import Interface from './interface'
configure({
  enforceActions: 'never',
})

export const buildState = (requestUrl) => {
  const state = {}

  const ui = new Interface(state, requestUrl)

  Object.assign(state, {
    ui,
  })
  state.loadPromise = Promise.all([ui.loadPromise])
  return state
}

export default createContext(buildState())
