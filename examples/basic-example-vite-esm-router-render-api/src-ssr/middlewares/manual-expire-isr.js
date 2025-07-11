import { defineSsrMiddleware } from '#q-app/wrappers'

import { promises as fs } from 'fs'
import { config } from '../../src-hr/config.js'

let stateToggleApi1 = true

export default defineSsrMiddleware(({ app, resolve, render, serve }) => {
  app.post('/api/path-reinv', async (req, res, next) => {
    // some kind of AUTH...
    // some kind of reinvalidation logic...
    // probably don't want to await reinvalidation in real app, its just example

    const hybridConf = config()

    let srcDir = hybridConf.srcDir || 'hybrid_render'
    srcDir = process.env.PROD ? srcDir : `.quasar/${srcDir}`

    // delete the page to reinvalidate
    const fullFilepath = resolve.root(srcDir, 'isr/custom-isr/index.html')
    const fileStats = await fs.stat(fullFilepath).catch((e) => null)
    if (fileStats) await fs.unlink(fullFilepath)

    return res.status(200).json({ reqState: null, result: true })
  })

  app.post('/api/path-reinv-2', async (req, res, next) => {
    // some kind of AUTH...
    // some kind of reinvalidation logic...
    // probably don't want to await reinvalidation in real app, its just example

    const hybridConf = config()

    let srcDir = hybridConf.srcDir || 'hybrid_render'
    srcDir = process.env.PROD ? srcDir : `.quasar/${srcDir}`

    // delete the page to reinvalidate
    const fullFilepath = resolve.root(srcDir, 'swr/swr/index.html')
    const fileStats = await fs.stat(fullFilepath).catch((e) => null)
    if (fileStats) await fs.unlink(fullFilepath)

    return res.status(200).json({ reqState: null, result: true })
  })

  app.post('/api/get-api-1-state', async (req, res, next) => {
    // simulate a simple api
    return res.status(200).json({ reqState: null, result: stateToggleApi1 })
  })
  app.post('/api/toggle-api-1-state', async (req, res, next) => {
    // simulate a simple api
    stateToggleApi1 = !stateToggleApi1
    return res.status(200).json({ reqState: null, result: stateToggleApi1 })
  })
})
