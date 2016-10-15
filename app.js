'use strict'

const TelegramBot = require('node-telegram-bot-api')
const redis = require('redis')
const client = redis.createClient()
const secrets = require('./secrets.js')

const bot = new TelegramBot(secrets.telegram.token, {polling: true})

let helpText = `Hey!\n\nUse /check followed by a station code to check if the gates are open.\nUse /open or /closed followed by a station code to let others know.\nUse /undo followed by a station code to undo your report for that station.\n\n/help will get you this message again`

bot.onText(/\/check (.+)/i, (msg, match) => {
  console.log(match[0])

  let code = match[1].toUpperCase()

  client.hget('stationsshorttolong', code, (err, stationName) => {
    let response = ``

    if(stationName) {
      client.hgetall(code, (err, replies) => {
        let value = 0

        if(replies) {
          value = Object.keys(replies).reduce((sum, key) => {
            return sum + parseInt(replies[key])
          }, 0);
        }

        if(value > 0) {
          response = `The ticket barriers are reported to be open at ${stationName}! (confidence: ${value})`
        } else if(value < 0) {
          response = `The ticket barriers are reported to be closed at ${stationName} (confidence: ${-value})`
        } else {
          response = `Sorry, I don't really know about the barriers at ${stationName} 😕`
        }

        bot.sendMessage(msg.from.id, response)
      })
    } else {
      response = `That's not a valid station!`

      bot.sendMessage(msg.from.id, response)
    }
  })
})

bot.onText(/\/undo (.+)/i, (msg, match) => {
  console.log(match[0])

  let code = match[1].toUpperCase()

  client.hget('stationsshorttolong', code, (err, stationName) => {
    let response = ``

    if(stationName) {
      client.hset(code, msg.from.id, 0, (err, replies) => {
        client.expire(code, 3600, (err, replies) => {
          let response = `We removed your info about ${stationName}`

          bot.sendMessage(msg.from.id, response)
        })
      })
    } else {
      response = `That's not a valid station!`

      bot.sendMessage(msg.from.id, response)
    }
  })
})

bot.onText(/\/open (.+)/i, (msg, match) => {
  console.log(match[0])

  let code = match[1].toUpperCase()

  client.hget('stationsshorttolong', code, (err, stationName) => {
    let response = ``

    if(stationName) {
      client.hset(code, msg.from.id, 1, (err, replies) => {
        client.expire(code, 3600, (err, replies) => {
          let response = `Thanks for the heads up about ${stationName}!`

          bot.sendMessage(msg.from.id, response)
        })
      })
    } else {
      response = `That's not a valid station!`

      bot.sendMessage(msg.from.id, response)
    }
  })
})

bot.onText(/\/closed (.+)/i, (msg, match) => {
  console.log(match[0])

  let code = match[1].toUpperCase()

  client.hget('stationsshorttolong', code, (err, stationName) => {
    let response = ``

    if(stationName) {
      client.hset(code, msg.from.id, -1, (err, replies) => {
        client.expire(code, 3600, (err, replies) => {
          let response = `Thanks for the heads up about ${stationName}!`

          bot.sendMessage(msg.from.id, response)
        })
      })
    } else {
      response = `That's not a valid station!`

      bot.sendMessage(msg.from.id, response)
    }
  })
})

bot.onText(/\/help/i, (msg, match) => {
  console.log(match[0])

  bot.sendMessage(msg.from.id, helpText)
})

bot.onText(/\/start/i, (msg, match) => {
  console.log(match[0])

  bot.sendMessage(msg.from.id, helpText)
})
