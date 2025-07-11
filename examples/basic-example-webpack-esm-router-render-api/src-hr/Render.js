/*
  THIS FILE IS AUTO-GENERATED by hybrid-render extension of Quasar.
  You should not temper with this file, unless really needed.
*/

import fs from 'fs/promises'
import path from 'path'
import isEqual from 'lodash/isEqual.js'
import {
  getNormPathname,
  getDefaultFilename,
  addExtension,
  ExpressError,
  ConcurrentQueue,
} from './utils.js'
import { config } from './config.js'
import { runtime } from './runtime.js'

class Render {
  constructor({ SSRContext, middleParams }) {
    this._SSRContext = SSRContext
    this._middleParams = middleParams
    this._normPath = null
    this._filePath = null
    this._fileName = null
    this._fullFilePath = null
    this._uniquePageId = null
    this._renderedPage = null
    this._renderRequired = null
    this._reRenderRequired = null
    this._hybridConf = config()
  }

  get hr() {
    return this._SSRContext.req.hybridRender || {}
  }
  get route() {
    return this.hr.route || {}
  }
  get req() {
    return this._SSRContext.req || {}
  }
  get res() {
    return this._SSRContext.res || {}
  }
  get srcDir() {
    return `${process.env.DEV ? '.quasar/' : ''}${this._hybridConf.srcDir || 'hybrid_render'}`
  }

  async run() {
    // entry point of renderer
  }

  async prepare() {
    await this.resolvePathname() // normalize requested url pathname
    await this.resolveFilepath() // set a path of final file
    await this.resolveFilename() // set a name of final file
    await this.resolveFullFilepath() // combine file's path and name and make absolute
    await this.resolveUrl() // set request's url attr to a defined one or default received
    await this.resolveUniquePageId() // resolves a unique id of requested page
  }

  resolvePathname() {
    this._normPath = getNormPathname(this.req.originalUrl)
  }
  resolveFilepath() {
    if (this.hr.filepath) this._filePath = this.hr.filepath
    else this._filePath = this._normPath
  }
  resolveFilename() {
    if (this.hr.filename)
      this._fileName = addExtension({
        filename: this.hr.filename,
        config: this.hr.config,
      })
    else this._fileName = getDefaultFilename(this.hr.config)
  }
  resolveFullFilepath() {
    this._fullFilePath = this._middleParams.resolve.root(
      this.srcDir,
      this.route.type,
      this._filePath,
      this._fileName,
    )
  }
  resolveUrl() {
    if (this.hr.ownUrl) this.req.url = this.hr.ownUrl
    else this.req.url = this._normPath
  }
  resolveUniquePageId() {
    if (this.hr.pageId) this._uniquePageId = this.hr.pageId
    else this._uniquePageId = `${this._normPath}_|_${this._fullFilePath}`
  }
  resolveRenderRequired() {
    this._renderRequired = true
    this._reRenderRequired = false
  }

  async readFile(filePath) {
    const fileStats = await fs.stat(filePath).catch(() => null)
    if (fileStats) return await fs.readFile(filePath, 'utf8')
    return null
  }

  async writeFile(filePath, content) {
    if (content !== null) {
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, content)
    } else {
      throw new ExpressError('HYBRID_EXT_RENDERED_CONTENT_IS_NULL', 500, {
        stack: {
          method: 'writeFile',
          reason: 'Cannot write null to a file.',
        },
      })
    }
  }

  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath)
    } catch (e) {
      if (e.code !== 'ENOENT') throw e
    }
  }

  async readPage() {
    this._renderedPage = await this.readFile(this._fullFilePath)
  }

  writePage() {
    return this.writeFile(this._fullFilePath, this._renderedPage)
  }

  deletePage() {
    return this.deleteFile(this._fullFilePath)
  }

  async servePage() {
    if (this._renderedPage === null) {
      throw new ExpressError('HYBRID_EXT_RENDERED_PAGE_IS_NULL', 404, {
        stack: {
          method: 'serveHTML',
          reason: 'Cannot serve null as html response to user.',
        },
      })
    }

    if (!this.res.headersSent) {
      this.res.setHeader('Content-Type', 'text/html')
      this.res.send(this._renderedPage)
      this.res.end()
    }
  }

  async renderPage() {
    try {
      this._renderedPage = await this._middleParams.render(this._SSRContext)
    } catch (err) {
      if (err.url) {
        if (err.code) return this.res.redirect(err.code, err.url)
        return this.res.redirect(err.url)
      } else if (err.code === 404) {
        throw new ExpressError('HYBRID_EXT_PAGE_NOT_FOUND', 404, {
          stack: {
            method: 'renderPage',
            reason: 'Unable to find the requested page.',
          },
        })
      } else if (process.env.DEV) throw err
      else {
        throw new ExpressError('HYBRID_EXT_UNEXPECTED_RENDER_ERR', 500, {
          stack: {
            method: 'renderPage',
            reason: 'Quasar page render failed with unknown error.',
            errStack: err.stack,
          },
        })
      }
    }
  }
}

class RenderApiHints extends Render {
  async startApiProcess() {
    const apiHints = this instanceof RenderISR ? runtime.isrHints : runtime.swrHints

    // get copy of api hints for current page
    const apiHintGroup = apiHints.getHintGroup(this._uniquePageId).useHintGroup()
    const hintObj = apiHintGroup.hintGroup._hintObj

    // pass to SSRContext for use in rendered app
    this.hr.apiHintGroup = apiHintGroup

    // get list of hints and sort them in order they were run
    const hints = Object.values(hintObj).sort((a, b) => a._order - b._order)

    // always re-render in case of empty hintObj
    if (hints.length === 0) return (this._reRenderRequired = true)

    // run api hint processing
    const apiResults = await this.runApiHintProcesss(hints)

    // render needed if api hints changed or required by previous checks
    this._reRenderRequired = apiResults.some((r) => !r)
  }

  async runApiHintProcesss(hints) {
    const queueOpts = this instanceof RenderISR ? this._hybridConf.ISR : this._hybridConf.SWR

    // get configured queue options
    const CONCURRENT_GENS = +queueOpts.queueConcurrence || 3
    const COOLING_TIMEOUT = +queueOpts.queueCooling || 150

    // make list of callbacks for api hint validation
    const calls = hints.map((hint) => {
      return async () => {
        // mark all endpoints as unused, to find out which are still in use
        hint.setUsed(false)

        // handle the outcome of api endpoint
        let newResult, oldResult
        try {
          newResult = await hint._func()
        } catch (e) {
          newResult = e
        }
        try {
          oldResult = await hint._result
        } catch (e) {
          oldResult = e
        }

        // if any results doesnt match, api is not up-to-date
        const areEqual = isEqual(oldResult, newResult)
        if (!areEqual) hint.setResult(newResult)

        return areEqual
      }
    })

    // create and run parallel queue
    const queue = new ConcurrentQueue(
      { concurrentNumber: CONCURRENT_GENS, coolingTimeout: COOLING_TIMEOUT },
      calls,
    )
    return await queue.run()
  }

  async endApiProcess() {
    const apiHints = this instanceof RenderISR ? runtime.isrHints : runtime.swrHints

    // skip if have not been re-rendered
    if (!this._reRenderRequired) return

    const hintGroup = this.hr.apiHintGroup.hintGroup
    const hints = Object.entries(hintGroup._hintObj)

    // delete all unused api hints
    for (let i = 0, len = hints.length; i < len; i++) {
      const [name, hint] = hints[i]

      if (!hint._used) delete hintGroup._hintObj[name]
    }

    // set final hintGroup back to a runtime
    apiHints.setHintGroup(this._uniquePageId, hintGroup)
  }
}

class RenderCSR extends Render {
  /* client is always served with prepared SPA index */

  constructor({ SSRContext, middleParams }) {
    super({ SSRContext, middleParams })
  }

  async run() {
    await this.prepare()

    await this.resolveRenderRequired()

    await this.readPage()

    await this.servePage()
  }

  prepare() {
    // entry file is always SPA entry file
    this._fullFilePath = this._middleParams.resolve.root(this.srcDir, 'csr/index.html')
  }

  async resolveRenderRequired() {
    // make sure that CSR entry is simply re-used
    this._renderRequired = false
    this._reRenderRequired = false
  }
}

class RenderSSG extends Render {
  /* first HTML gets saved, then client is served */

  constructor({ SSRContext, middleParams }) {
    super({ SSRContext, middleParams })
  }

  async run() {
    try {
      await this.prepare()

      await this.resolveRenderRequired()

      if (this._renderRequired) await this.renderPage()
      else await this.readPage()

      // save HTML to filesystem
      await this.writePage()

      await this.servePage()
    } catch (e) {
      // delete cached page if exists (so user gets error for next request)
      this.deletePage()

      throw e
    }
  }

  async resolveRenderRequired() {
    // check if page file exists
    const fileStats = await fs.stat(this._fullFilePath).catch((e) => null)

    // render of SSG is required only if file doesn't exist yet
    this._renderRequired = !fileStats
  }
}

class RenderISR extends RenderApiHints {
  /* first client is served, then HTML gets saved */

  constructor({ SSRContext, middleParams }) {
    super({ SSRContext, middleParams })
  }

  async run() {
    let pageLock, isLocksmith
    try {
      await this.prepare()

      // get or create lock for current "page" and perform lock
      pageLock = runtime.pageLocks.getPageLock(this._uniquePageId)
      isLocksmith = pageLock.lock()

      /* HANDLE locksmith customer */
      if (!isLocksmith) {
        // wait for locksmith to read or render and share a page
        const lockResult = await pageLock.subscribe()

        // handle locksmith sending error
        if (lockResult[0] instanceof Error) throw lockResult[0]

        // if okay, first arg will be renderedPage
        this._renderedPage = lockResult[0]

        // then simply serve received page to user
        return await this.servePage()
      }

      /* HANDLE locksmith */
      await this.resolveRenderRequired()

      // run API stuff only if is required render or reRender of page
      const isApiReinvRequired = this._renderRequired || this._reRenderRequired
      if (isApiReinvRequired) {
        // check if api response up-to-date
        await this.startApiProcess()

        // if api expired, rerender, if not, change modified time to now and read from cache
        // also render if no file exists, even though api hints are present (manual delete of file)
        if (this._renderRequired || this._reRenderRequired) await this.renderPage()
        else {
          // change the modify (also access) time of file in case api is up-to-date
          await fs.utimes(this._fullFilePath, new Date(), new Date())
          await this.readPage()
        }

        // update API endpoints of route
        await this.endApiProcess()
      } else await this.readPage()

      await this.servePage()

      // locksmith must notify its customers with rendered page
      pageLock.notifySubscribers(this._renderedPage)

      // save HTML to filesystem
      if (this._renderRequired || this._reRenderRequired) await this.writePage()

      // locksmith must release the lock when process finished
      pageLock.unlock()
    } catch (e) {
      // if locksmith, propagate error to locksmith customers and unlock page
      if (isLocksmith) {
        pageLock.notifySubscribers(e)
        pageLock.unlock()
      }

      // delete cached page if exists (so user gets error for next request)
      this.deletePage()

      throw e
    }
  }

  async resolveRenderRequired() {
    // check if page file exists
    const fileStats = await fs.stat(this._fullFilePath).catch((e) => null)

    // render of ISR is needed if doesn't exist yet, or is expired
    this._renderRequired = !fileStats
    if (fileStats && this.route.ttl !== null && this.route.ttl !== undefined) {
      // set render required if ttl expired, (undefined | null) means never expire
      const ttl = Number(this.route.ttl) || 0
      if ((new Date() - fileStats.mtimeMs) / 1000 > ttl) this._reRenderRequired = true
    }
  }
}

class RenderSWR extends RenderApiHints {
  /* first client is served, then HTML gets saved */

  async run() {
    let pageLock, isLocksmith
    try {
      await this.prepare()

      // get or create lock for current "page" and perform lock
      pageLock = runtime.pageLocks.getPageLock(this._uniquePageId)
      isLocksmith = pageLock.lock()

      /* HANDLE locksmith customer */
      if (!isLocksmith) {
        // wait for locksmith to read or render and share a page
        const lockResult = await pageLock.subscribe()

        // handle locksmith sending error
        if (lockResult[0] instanceof Error) throw lockResult[0]

        // if okay, first arg will be renderedPage
        this._renderedPage = lockResult[0]

        // then simply serve received page to user
        return await this.servePage()
      }

      /* HANDLE locksmith */

      // check if should render / reRender
      await this.resolveRenderRequired()

      let servedFirstPass = true
      if (!this._renderRequired) {
        // already rendered, read & serve
        await this.readPage()
        await this.servePage()

        // locksmith must notify its customers with rendered page
        pageLock.notifySubscribers(this._renderedPage)
      } else servedFirstPass = false

      // run API stuff only if is required render or reRender of page
      const isApiReinvRequired = this._renderRequired || this._reRenderRequired
      if (isApiReinvRequired) {
        // check if api response up-to-date
        await this.startApiProcess()

        // if api expired, rerender, if not, change modified time to now and read from cache
        // also render if no file exists, even though api hints are present (manual delete of file)
        if (this._renderRequired || this._reRenderRequired) await this.renderPage()
        else {
          // change the modify (also access) time of file in case api is up-to-date
          await fs.utimes(this._fullFilePath, new Date(), new Date())
          await this.readPage()
        }

        // update API endpoints of route
        await this.endApiProcess()
      }

      // no error and not served from cache, serve new rendered page
      if (!servedFirstPass) {
        await this.servePage()

        // locksmith must notify its customers with rendered page
        pageLock.notifySubscribers(this._renderedPage)
      }

      // save HTML to filesystem
      if (this._renderRequired || this._reRenderRequired) await this.writePage()

      // locksmith must release the lock when process finished
      pageLock.unlock()
    } catch (e) {
      // if locksmith, propagate error to locksmith customers and unlock page
      if (isLocksmith) {
        pageLock.notifySubscribers(e)
        pageLock.unlock()
      }

      // delete cached page if exists (so user gets error for next request)
      this.deletePage()

      throw e
    }
  }

  async resolveRenderRequired() {
    // check if page file exists
    const fileStats = await fs.stat(this._fullFilePath).catch((e) => null)

    // render of SWR is needed if doesn't exist yet, or is expired
    this._renderRequired = !fileStats

    if (fileStats && this.route.ttl !== null && this.route.ttl !== undefined) {
      // set render required if ttl expired, (undefined | null) means never expire
      const ttl = Number(this.route.ttl) || 0
      if ((new Date() - fileStats.mtimeMs) / 1000 > ttl) this._reRenderRequired = true
    }
  }
}

export { Render, RenderCSR, RenderSSG, RenderISR, RenderSWR }
