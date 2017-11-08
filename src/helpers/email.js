const aws = require('aws-sdk')

class EmailSender {
  constructor ({ toEmail, emailText, emailHTML, emailSubject, logger }) {
    this.toEmail = toEmail
    this.emailText = emailText
    this.emailHTML = emailHTML || emailText
    this.emailSubject = emailSubject || 'Sanity Update Email'
    this.logger = logger || require('./logger')()

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
    if (process.env.NODE_ENV === 'test' || process.env.DISABLE_REAL_EMAIL === 'true') {
      this.logger.debug('[EmailSender] Refusing to send real email. Faking successful send', {
        disableRealEmail: process.env.DISABLE_REAL_EMAIL,
        nodeEnv: process.env.NODE_ENV,
        params,
        toEmail: this.toEmail,
        emailText: this.emailText,
        emailHTML: this.emailHTML,
        emailSubject: this.emailSubject
      })
      return new Promise((resolve, reject) => {
        let data = {
          ResponseMetadata: {
            RequestId: 'c9c2b3a9-b490-11e7-b56d-cd7a1708abd5'
          },
          MessageId: '0100015f332ac237-a484368a-0465-4a7c-affd-ea8af600ae27-000000'
        }
        this.logger.debug('[EmailSender] send success', { data })
        resolve(data)
      })
    }
    const ses = new aws.SES()
    this.logger.debug('[EmailSender] sending email over ses', {
      params,
      toEmail: this.toEmail,
      emailText: this.emailText,
      emailHTML: this.emailHTML,
      emailSubject: this.emailSubject
    })
    return new Promise((resolve, reject) => {
      ses.sendEmail(params, (err, data) => {
        if (err) {
          this.logger.debug('[EmailSender] send failure', { err })
          reject(err)
        } else {
          this.logger.debug('[EmailSender] send success', { data })
          resolve(data)
        }
      })
    })
  }
}

module.exports = EmailSender
