const express = require('express');
const session = require('express-session')
const connectDB = require('./config/init');
const { Server } = require("socket.io");
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const http = require("http");
const app = express();
const server = http.createServer(app)
const io = new Server(server);
const dotenv = require('dotenv')
dotenv.config();
const PORT = process.env.PORT || 3000

connectDB()
app.use(express.static('public/styles'));
app.use(express.static('public/scripts'));
app.use(express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}))

app.route('/')
  .get((req, res) => {
    if (req.session.is_logged_in) {
      res.render('home.ejs', {
        isLoggedIn: req.session.is_logged_in,
        email: req.session.email,
        name: req.session.name,
        picture:req.session.picture
      });
    }
    else {
      // console.log(req.session)
      res.redirect('/api/user/login',);

    }
  })
app.use('/api/user', userRoutes);
app.use('/api/chat', function (request, res, next) {
  if (request.session.is_logged_in) {
    next();
  }
  else {
    res.status(504).render('serverError.ejs', { errorType: "404", error: "page not found!" });
  }
    
}, chatRoutes);

io.on('connection', (socket) => {
  console.log('a user connected');


  socket.on('send message', (msg, roomId, email) => {
    socket.broadcast.to(roomId).emit('receave message', { msg ,email,roomId});
  });

  socket.on('chatRoom', (roomId) => {
    socket.join(roomId);
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
   
});

app.route('/*')
  .get((req, res) => {
    res.render('serverError.ejs', { errorType: "404", error: "page not found!" });
  })
server.listen(PORT, console.log(`App running on port:${PORT}`))