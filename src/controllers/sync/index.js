const Router = require('express').Router
const synchronizers = require('require-dir')()

/*
 * Sync
 *
 * This directory contains a bunch of async functions that help keep the app in sync
 * each on adds it's own key in a big dictionary of updates that get sent down to the
 * app each time this route is called. 
 *
 * To add a new key, create a file export a function that takes app and db and returns
 * an async function that returns the value of that key.
 */

 // Wrapper that creates a dictionary with the filename mapping to the 
 // returned value of the function
let callAndReturn = (key, func) => {
  return async (req) => {
    let result = await func(req)
    let returnValue = {}
    returnValue[key] = result
    return returnValue
  }
}

module.exports = (app, db) => {
  const router = Router()
  let promises = []
  Object.keys(synchronizers).map((key) => {
    // promises.push(callAndReturn(key, synchronizers[key](app, db)))
    promises.push( callAndReturn(key, synchronizers[key](app, db)) )
  })

  router.get('/', async (req, res, next) => {

    // Dispatch all the different synchronizers
    let responses = await Promise.all(promises.map((promise) => {
      return promise(req)
    }))

    // Reduce the values into a single json dictionary
    let reduced = responses.reduce((previous, current) => {
      return Object.assign({}, previous, current)
    }, {})
    res.json(reduced)
  })
  return { router }
}
