const path = require('path')
const uuid = require('uuid')
const multer  = require('multer')
const scanner = require('receipt-scanner')

// Only expecting jpeg or png
const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png' 
]

 
module.exports = (router, app, db) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let directory = path.join(app.get('projectRoot'), 'uploads')
      cb(null, directory)
    },
    filename: (req, file, cb) => {
      if (ALLOWED_MIMES.indexOf(file.mimetype) == -1) {
        cb(new Error('Unsupported mime type :/'))
        return 
      }
      cb(null, file.fieldname + '-' + Date.now() + '.' + file.mimetype.replace('image/', ''))
    }
  })
  
  const upload = multer({ 
    storage
  })

  router.post('/upload', 
    upload.single('receipt'),
    async (req, res, next) => {
      // Ensure there is a file 

      let directory = path.join(app.get('projectRoot'), 'uploads')
      return scanner(req.file.path)
        .parse((error, result) => {
        if (error || result.amount === false) {
          res.json(Object.assign({}, { status: 'failed' }, { error }))
          return 
        }
        res.json( Object.assign({}, { status: 'ok' }, { result }) )
      })
  })
}
