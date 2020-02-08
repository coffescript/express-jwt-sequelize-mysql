'use scrict'

const express = require('express')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')

// passport
const passport = require('passport')
const passportJWT = require('passport-jwt')

// extract the jwt for help the token
let ExtractJwt = passportJWT.ExtractJwt

//JwtStrategy, is a strategy for the auth
let JwtStrategy = passportJWT.Strategy
let jwtOptions = {}

jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
jwtOptions.secretOrKey = 'secretkey120420150902'

// here we go create our strategy for the web token
let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next){
  console.log('payload_received', jwt_payload)
  let user = getUser({ id: jwt_payload.id})
  if (user) {
    next(null, user)
  } else {
    next(null, false)
  }
})

// use strategy
passport.use(strategy)

const PORT = 3000

const app = express()
app.use(passport.initialize())

// parse application/json
app.use(bodyParser.json())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// initialize instance of Sequelize
const sequelize = new Sequelize({
  database: 'users_db',
  username: 'dmr1204',
  password: 'admin1204',
  dialect: 'mysql'
})

// check the database connection
sequelize.authenticate()
  .then(() => console.log('Connection has been established successfully.'))
  .catch(err => console.error('Unable to connect to the database: ', err))

// create user model
const User = sequelize.define('user', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

// create table with user model
User.sync()
    .then(() => console.log('Oh yeah! User table created successfully'))
    .catch(err => console.log('BTW, did you enter wrong database credentials?'))

// add a basic route
app.get('/', function(req, res) {
  res.json({ message: 'Express is up!'})
})

// get all users
app.get('/users', function(req, res) {
  getAllUsers().then(user => res.json(user))
})

// register route
app.post('/', function(req, res, next) {
  const { name, password } = req.body
  createUser({ name, password }).then(user => {
    res.json({user, msg: 'account created successfully'})
  })
})

// login route
app.post('/login', async function(req, res, next) { 
    const { name, password } = req.body;
    if (name && password) {
      // we get the user with the name and save the resolved promise
      returned
      let user = await getUser({ name });
      if (!user) {
        res.status(401).json({ msg: 'No such user found', user })
      }
     if (user.password === password) {
        // from now on we’ll identify the user by the id and the id is
        // the only personalized value that goes into our token
        let payload = { id: user.id };
        let token = jwt.sign(payload, jwtOptions.secretOrKey)
        res.json({ msg: 'ok', token: token })
      } else {
        res.status(401).json({ msg: 'Password is incorrect'})
      }
    }
  })

// protected route
app.get('/protected', passport.authenticate('jwt', { session: false }), function(req, res) {
  res.json({ msg: 'Congrats! You are seeing this because you are authorized'})
  })

// start the app
app.listen(PORT, function(){
  console.log(`Express is running on port ${PORT}`)
})