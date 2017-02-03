var html = require('choo/html')
module.exports = (state, prev, send) => {

  return html`
    <div>
      <section class="mb6">
        <p class="lh-copy measure">
          Your push notification URL is:
        </p>
        <div class="code measure pa2 br2 bg-dark-green light-blue overflow-y-scroll nowrap">
          ${window.location.origin + '/' + state.token + '/notify'}
        </div>

        <p class="lh-copy measure">
          You can receive notifications when you send a request to that URL, even when this page isn't open.
        </p>
      </section>

      <section class="mb6">
        <p class="lh-copy measure">
          Try it out! Run this command to see if it works
        </p>
        <div class="code measure pa2 br2 bg-dark-green light-blue overflow-y-scroll nowrap">
          TODO: put a curl command here
        </div>
      </section>

      <section class="mb6">
        <h2 class="f4 fw7 lh-title measure">
          API
        </h2>
        <p class="lh-copy measure">
          TODO: api docs
        </p>
      </section>
    </div>
  `
}
