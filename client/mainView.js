const html = require('choo/html')
const css = require('sheetify')

const horizontalFlip = css`
  :host {
    transform: scale(-1, 1);
  }
`

const Divider = (flip) => {
  var classes = 'nowrap overflow-hidden tc'
  if (flip) classes += ' ' + horizontalFlip
  return html`
    <div class=${classes}>📌📌📌📌📌</div>
  `
}

module.exports = (state, prev, send) => {
  if (!state.token) {
    send('location:set', '/')
    return html`<div></div>`
  }
  return html`
    <div class="measure">
      <section class="mv4">
        <p class="lh-copy">
          Your push notification URL is:
        </p>
        <div class="code pa2 br2 bg-dark-green light-blue overflow-y-scroll nowrap">
          ${window.location.origin + '/' + state.token + '/notify'}
        </div>

        <p class="lh-copy">
          You can receive notifications when you send a request to that URL, even when this page isn't open.
        </p>
      </section>

      ${Divider(false)}

      <section class="mv4">
        <p class="lh-copy">
          Try it out! Run this command to see if it works
        </p>
        <div class="code pa2 br2 bg-dark-green light-blue overflow-y-scroll nowrap">
          TODO: put a curl command here
        </div>
      </section>

      ${Divider(true)}

      <section class="mv4">
        <h2 class="f4 fw7 lh-title">
          API
        </h2>
        <p class="lh-copy">
          TODO: api docs
        </p>
      </section>
    </div>
  `
}
