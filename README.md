Santiy Backend
===

This is an [express](https://expressjs.com/) app that powers the sanity app. The provided endpoints are mostly RESTful w/ a few execptions. The backing store is a standard mongodb process.

### Getting Started

To get started, make sure you have Node `>= 7.6` installed to handle the `async/await` syntax and make sure you have `mongodb` running on the standard port.

```
git clone git@github.com:anglinb/310-backend.git
cd 310-backend
npm install
npm run start:dev
```

This will spin up the server locally, running on port 3000 by default. Additionally, `nodemon` will restart the server every time a file changes. 


### File Structure

```

src/ - All the JS source
  controllers/ - RESTful application controllers
    budget/ - Budget controllers
    category/ - Category controllers
    authentication/ - Authentication controllers
  db/ - Database related things
    plugins/ - [mongorito plugins](https://github.com/vadimdemedes/mongorito#plugins) (used to wire up relationships)
  helpers/ - Assorted helpers
  middlewares/ - Middlewares to set models for the controllers to play with
  routes/ - Wires up all the controllers to HTTP endpoints
  validators/ - Validator configs for routes that need validation

tests/ - All the tests
  int/ - Integration tests
  uint/ - Unit tests

```


### Testing

The codebase has pretty solid test coverage. Most of the tests are integration tests and are declared in the `tests/int/` directory. There are a few commands to run the test suite. `npm run test` will run everything. 

`npm run test:int` - Run integration tests
`npm run test:int:watch ` - Run the integration tests every time a file changes.

`npm run test:unit` - Run the unit tests
`npm run test:unit:watch ` - Run the unit tests every time a file changes

### Linting

This project uses [standard](https://standardjs.com/) to lint. These commands will run the linter.

`npm run lint` - Runs standard
`npm run lint:fix` - Runs standard and lets it fix issues it can handle

