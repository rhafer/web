const util = require('util')
const { client } = require('nightwatch-api')
const filesList = client.page.FilesPageElement.filesList()
const filesActionsMenu = client.page.FilesPageElement.fileActionsMenu()

module.exports = {
  commands: {
    openPreview: async function (fileName) {
      await filesList.openFileActionsMenu(fileName)
      await filesActionsMenu.preview()

      return this
    },
    waitForPreviewLoaded: function (fileName) {
      const image = util.format(this.elements.mediaImage.selector, fileName)
      return this.useXpath().waitForElementVisible(image).useCss()
    },
    isPreviewPresent: async function () {
      let isPresent = false
      await this.useXpath().waitForElementVisible(
        {
          selector: this.elements.actionBar.selector,
          abortOnFailure: false
        },
        (result) => {
          isPresent = !!result.value
        }
      )
      return isPresent
    },
    nextMediaResource: function () {
      const nextButtonXpath = this.elements.actionBar.selector + this.elements.nextButton.selector
      return this.useXpath()
        .waitForElementVisible(nextButtonXpath)
        .waitForAnimationToFinish()
        .click(nextButtonXpath)
        .waitForAjaxCallsToStartAndFinish()
        .useCss()
    },
    previousMediaResource: function () {
      const previousButtonXpath =
        this.elements.actionBar.selector + this.elements.previousButton.selector
      return this.useXpath()
        .waitForElementVisible(previousButtonXpath)
        .click(previousButtonXpath)
        .waitForAjaxCallsToStartAndFinish()
        .useCss()
    },
    downloadMediaResource: function () {
      const downloadButtonXpath =
        this.elements.actionBar.selector + this.elements.downLoadButton.selector
      return this.useXpath()
        .waitForElementVisible(downloadButtonXpath)
        .click(downloadButtonXpath)
        .waitForAjaxCallsToStartAndFinish()
        .useCss()
    },
    closeMediaResource: function () {
      const closeButtonXpath = this.elements.actionBar.selector + this.elements.closeButton.selector
      return this.useXpath()
        .waitForElementVisible(closeButtonXpath)
        .click(closeButtonXpath)
        .waitForAjaxCallsToStartAndFinish()
        .useCss()
    }
  },
  elements: {
    actionBar: {
      selector: '//div[contains(@class, "preview-controls-action-bar")]',
      locateStrategy: 'xpath'
    },
    nextButton: {
      selector: `//button[contains(@class, "preview-controls-next")]`,
      locateStrategy: 'xpath'
    },
    previousButton: {
      selector: `//button[contains(@class, "preview-controls-previous")]`,
      locateStrategy: 'xpath'
    },
    downLoadButton: {
      selector: `//button[contains(@class, "preview-controls-download")]`,
      locateStrategy: 'xpath'
    },
    closeButton: {
      selector: `//button[contains(@class, "preview-controls-close")]`,
      locateStrategy: 'xpath'
    },
    mediaImage: {
      selector: '//p[contains(@class, "preview-file-name") and contains(text(),"%s")]',
      locateStrategy: 'xpath'
    }
  }
}
