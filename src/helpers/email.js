const aws = require('aws-sdk')

class EmailSender {
  constructor ({ toEmail, emailText, emailHTML, emailSubject }) {
    this.toEmail = toEmail
    this.emailText = emailText
    this.emailHTML = emailHTML || emailText
    this.emailSubject = emailSubject || 'Sanity Update Email'

    // This is probably not the best place to do this but whatever
    aws.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_DEFAULT_REGION
    })
  }

  async send () {
    var params = {
      Destination: {
        CcAddresses: [
        ],
        BccAddresses: [
        ],
        ToAddresses: [
          this.toEmail
        ]
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: this.emailText
          },
          Text: {
            Charset: 'UTF-8',
            Data: this.emailHTML
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: this.emailSubject
        }
      },
      Source: process.env.SENDER_EMAIL
    }
    if (process.env.NODE_ENV === 'test') {
      console.log('Refusing to send email in test... ', this.toEmail, this.emailText, this.emailHTML, this.emailSubject)
      return new Promise((resolve, reject) => {
        resolve({
          ResponseMetadata: {
            RequestId: 'c9c2b3a9-b490-11e7-b56d-cd7a1708abd5'
          },
          MessageId: '0100015f332ac237-a484368a-0465-4a7c-affd-ea8af600ae27-000000'
        }
        )
      })
    }
    const ses = new aws.SES()
    return new Promise((resolve, reject) => {
      ses.sendEmail(params, (err, data) => {
        console.log('ERROR', err)
        console.log('Data', data)
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

    //  , function (err, data) {
    //   if (err) console.log(err, err.stack) // an error occurred
    //   else console.log(data)           // successful response
    //    /*
    //    data = {
    //     MessageId: "EXAMPLE78603177f-7a5433e7-8edb-42ae-af10-f0181f34d6ee-000000"
    //    }
    //    */
    //   res.json({ status: 'ok' })
    // })
}

module.exports = EmailSender
