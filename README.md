Santiy Backend
===

![Travis](https://api.travis-ci.com/anglinb/310-backend.svg?token=65ADET4Jhdo2MDRszyYy&branch=master)

This is an [express](https://expressjs.com/) app that powers the sanity app. The provided endpoints are mostly RESTful w/ a few execptions. The backing store is a standard mongodb process.

### Getting Started

To get started, make sure you have Node `>= 7.6` installed to handle the `async/await` syntax and make sure you have `mongodb` running on the standard port.

*Note* You will have to modify you `.env` file before all of the server functionality will work. 

```
git clone git@github.com:anglinb/310-backend.git
cd 310-backend
# Please see https://github.com/danschultzer/receipt-scanner for install instructions for the receipt-scanner depdendency
npm install
npm run start:dev
```

This will spin up the server locally, running on port 3000 by default. Additionally, `nodemon` will restart the server every time a file changes. 

*Note*: As mentioned above, you will need to run mongodb in the background. The easiest way to get it is to run `brew install mongodb` and then `brew services start mongodb`. 

### Configuration

All the the deployment-specific configuration for the backend stored in a `.env` file in the root directory. The `.env` is written in a standard bash syntax and all the variables in the file get injected into the Node process as enviornment variables. The application can then access these variables through calling `process.env.VARIABLE_NAME`. A sample of this file is provided in `.env-example`. The list below specifies the necessary keys and how to find/set them. 

```
JWT_SECRET="dev" # This is the secret that teh JWTs are signed with. Make sure this has sufficient entropy and share it with no one.

SENDER_EMAIL="banglin@usc.edu" # This is the "from" address for all email notifications and password resets. This will have to be veriftied before use in the AWS Ses console.


# Note: The AWS IAM role _must_ have `AmazonSESFullAccess` policy attached to it
AWS_ACCESS_KEY_ID="ABCDEFHIJKLMNOQRSTAA"  # This is the AWS Key Id.
AWS_SECRET_ACCESS_KEY="fdslewwiojo209fo3ih03hh832ljf3l" # This is the AWS secret
AWS_DEFAULT_REGION="us-east-1" # This is the AWS region where the emails will be sent from

```
### Other Requirements

#### Cron Job
To handle delayed notification sending and budget archival, the project requires a cron job to be called 3 times a day at a regular interval. The cron is invoked as follows:

```
node cron.js
```

Most unix systems provide a mechanism to trigger this script on a regular interval. This can be accomplished by running the `crontab -e` command and following the instructions to create the appropriate entries.
#### AWS SES

We are using Amazon Simple Email Service (SES) for our transactional email. We send password reset emails and budget notifications through their service. To use these features [you will have  to register for an AWS account and verify at least one email](http://docs.aws.amazon.com/ses/latest/DeveloperGuide/quick-start.html). Our team has an account but we were unsure about sharing the AWS tokens. Please contact banglin@usc.edu for details.


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

- `npm run test` - runs all the tests
- `npm run test:int` - run integration tests
- `npm run test:int:watch ` - Run the integration tests every time a file changes.

- `npm run test:unit` - Run the unit tests
- `npm run test:unit:watch ` - Run the unit tests every time a file changes

### Linting

This project uses [standard](https://standardjs.com/) to lint. These commands will run the linter.

- `npm run lint` - Runs standard
- `npm run lint:fix` - Runs standard and lets it fix issues it can handle

