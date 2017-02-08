const nanomorph = require('nanomorph')
const nanoraf = require('nanoraf')

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

  return { start, change, state }
}

module.exports = framework
