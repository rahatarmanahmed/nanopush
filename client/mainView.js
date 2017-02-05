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
  // TODO: action to reset the URL/token
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
        <div class="code pa2 br2 bg-dark-green light-blue">
          curl 'http://localhost:3000/01365a23-26cd-4846-a75b-24d930d5c802/notify?title=nanopush&body=This%20is%20a%20test'
        </div>
      </section>

      ${Divider(true)}

      <section class="mv4">
        <h2 class="f4 fw7 mb2 lh-title">
          API
        </h2>

        <h3 class="code f5 fw7 mt0 mb1 lh-copy">
          GET /${state.token}/notify
        </h3>
        <p class="ml2 mv1">
          Takes parameters by query string.
        </p>

        <h3 class="code f5 fw7 mt2 mb1 lh-copy">
          POST /${state.token}/notify
        </h3>
        <p class="ml2 mv1">
          Takes parameters by JSON body.
        </p>

        <h4 class="f5 fw7 mt3 mb1">
          Parameters
        </h4>
        <ul class="list mv1">
          <li>
            <span class="code">title</span>: The title text of the notification.
          </li>
          <li>
            <span class="code">body</span>: The body text of the notification.
          </li>
          <li>
            <span class="code">icon</span>: A URL to an icon for the notification.
          </li>
        </ul>
      </section>
    </div>
  `
}
