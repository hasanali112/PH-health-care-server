/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Server } from 'http'
import app from './app'
import config from './app/config'

const port = process.env.PORT || config.port

async function main() {
  const server: Server = app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
}

main()
