const passportJWT = require("passport-jwt");

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

module.exports = (app, db) => {
  let options = {}
  options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
  options.issuer = 'sanity.server';
  options.audience = 'sanity.app'
  options.secretOrKey =  'development'

  let strategy = new JwtStrategy(options, async (payload, next) => {
    console.log('payload received', payload)

    // Look up user
    let user = await db.User.findOne({ where: { _id: payload._id  } })
    if (user) {
      next(null, user);
    } else {
      next(null, false);
    }
  })
  return strategy
}
