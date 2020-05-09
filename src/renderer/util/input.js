export class ClickHandler {
  constructor (threshold, clickCallback, dblclickCallback) {
    this.threshold = threshold
    this.clickCallback = clickCallback
    this.dblclickCallback = dblclickCallback
    this.isFirst = true
    this.latest = Date.now()
    this.timeout = null
  }

  click (e) {
    const now = Date.now()

    if (this.isFirst) {
      this.isFirst = false
      this.timeout = setTimeout(() => {
        this.isFirst = true
        this.clickCallback(e)
      }, this.threshold)
    } else {
      if (now - this.latest < this.threshold) {
        clearTimeout(this.timeout)
        this.isFirst = true
        this.dblclickCallback(e)
      } else {
        this.isFirst = true
        this.clickCallback(e)
      }
    }

    this.latest = now
  }
}
