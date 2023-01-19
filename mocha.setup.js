require('jsdom-global')(undefined, { pretendToBeVisual: true, url: 'http://localhost' })
global.localStorage = window.localStorage