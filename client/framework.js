const nanomorph = require('nanomorph')
const nanoraf = require('nanoraf')
const html = require('bel')

function framework (viewFn) {
  let tree, currentState

  const render = nanoraf(function (state) {
    const newTree = viewFn(state, change)
    return nanomorph(newTree, tree)
  })

  function change (newState) {
    currentState = Object.assign(currentState, newState)
    render(currentState, {})
  }

  function state () {
    return currentState
  }

  function start (initState) {
    currentState = initState
    tree = viewFn(currentState, change)

    return tree
  }

  return { html, start, change, state }
}

module.exports = framework
