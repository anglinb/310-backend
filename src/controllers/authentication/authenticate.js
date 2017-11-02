const validate = require('express-validation')
const authenticationValidation = require('../../validators/authentication/authentication')
const resetRequestValidation = require('../../validators/authentication/request')
const resetCompleteValidation = require('../../validators/authentication/complete')

const jwt = require('../../helpers/jwt')
const aws = require('aws-sdk')

let sendJWT = (user, res) => {
  let token = jwt.create({ username: user.get('username') })
  res.json({ status: 'ok', authentication: token })
}

module.exports = (router, app, db) => {
  aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_DEFAULT_REGION
  })
  const ses = new aws.SES()
  router.post('/authenticate',
  validate(authenticationValidation),
  async (req, res, next) => {
    let username = req.body.username.toLowerCase()
    const data = {
      username,
      password: req.body.password
    }
    let user = await db.User.findOne({ username: data.username })
    if (user) {
      let success = await user.checkPassword(data.password)
      if (!success) {
        res.status(401).json({ error: { msg: 'Invalid password', error: 'invalid_password' } })
      } else {
        sendJWT(user, res)
      }
    } else {
      let newUser = new db.User({
        username: data.username,
        notifications: {
          frequency: 'DAILY',
          thresholds: [50, 80]
        }
      })
      await newUser.setPassword(data.password)
      await newUser.save()
      await newUser.createDefaultBudget()
      sendJWT(newUser, res)
    }
  })

  router.post('/authenticate/reset/request',
    validate(resetRequestValidation),
    async (req, res, next) => {
      let username = req.body.username.toLowerCase()
      let user = await db.User.findOne({ username })

      if (!user) {
        res.sendStatus(400)
        res.json({ error: { message: 'User not found' } })
      }

      let minNum = 100000
      let maxNum = 999999
      let num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum
      let token = num.toString()

      user.set('passwordResetToken', token)
      await user.save()

      var params = {
        Destination: {
          CcAddresses: [
          ],
          BccAddresses: [
          ],
          ToAddresses: [
            username
          ]
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: `Your reqest code is: ${token}`
            },
            Text: {
              Charset: 'UTF-8',
              Data: `Your reqest code is: ${token}`
            }
          },
          Subject: {
            Charset: 'UTF-8',
            Data: 'Sanity Password Reset'
          }
        },
        Source: process.env.SENDER_EMAIL
      }
      ses.sendEmail(params, function (err, data) {
        if (err) console.log(err, err.stack) // an error occurred
        else console.log(data)           // successful response
         /*
         data = {
          MessageId: "EXAMPLE78603177f-7a5433e7-8edb-42ae-af10-f0181f34d6ee-000000"
         }
         */
        res.json({ status: 'ok' })
      })
    })
  router.post('/authenticate/reset/complete',
    validate(resetCompleteValidation),
    async (req, res, next) => {
      let username = req.body.username.toLowerCase()
      let findBy = { username, passwordResetToken: req.body.passwordResetToken }
      let user = await db.User.findOne(findBy)
      if (user) {
        await user.setPassword(req.body.password)
        await user.save()
        res.json({ status: 'ok' })
      } else {
        res.sendStatus(400)
        res.json({error: {message: 'invalid username or reset token'}})
      }
    })
}
