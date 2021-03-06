import express from 'express'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import createError from 'http-errors'
import { authRouter } from './src/routers/authRouter.js'
import { userRouter } from './src/routers/userRouter.js'
import { adminRouter } from './src/routers/adminRouter.js'
import path from 'path';
const __dirname = path.resolve()

const app = express()
app.use(cookieParser())


//*temp
app.use(helmet())
app.use(
  cors({
    // origin: "https://dayboard.netlify.app",
    origin: "http://localhost:3000",
    credentials: true,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// compress all responses
app.use(compression())
app.use('/auth', authRouter)
app.use('/', userRouter)
app.use('/admin', adminRouter)

// Handle production
if (process.env.NODE_ENV === 'production') {
  // Static folder
  app.use(express.static(__dirname + '/public/'))
  // Handle SPA
  app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'))
}

app.all('*', (req, res, next) => {
  next(new createError(404, `Cant find ${req.originalUrl} on this server!`))
})

app.use((error, req, res, next) => {
  console.log('Error handle by bus : ', error.status, error.message, error.stack)
  error.message = error.message || 'Something wrong!'
  error.status = error.status || 500

  res.status(error.status).json({
    status: error.status,
    message: error.message,
  })
})

export default app
