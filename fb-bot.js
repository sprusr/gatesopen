'use strict'

const http = require('http')
const Bot = require('messenger-bot')
const redis = require('redis')
const client = redis.createClient()
const secrets = require('./secrets.js')

let bot = new Bot({
  token: secrets.messenger.token,
  verify: secrets.messenger.verify,
  app_secret: secrets.messenger.app_secret
})

bot.on('error', (err) => {
  console.log(err.message)
})

bot.on('message', (payload, reply) => {
  let text = payload.message.text
  let response = ''

  console.log(payload)

  if(text.match(/^check/)) {
    client.hgetall(text.split(' ')[1], (err, replies) => {
      let value = 0

      console.log(replies)

      if(replies) {
        value = Object.keys(replies).reduce((sum, key) => {
          return sum + parseInt(replies[key])
        }, 0);
      }

      if(value > 0) {
        response = `The gates are reported to be open! (confidence: ${value})`
      } else if(value < 0) {
        response = `The gates are reported to be closed (confidence: ${-value})`
      } else {
        response = `Sorry, I don't have any idea about that station :/`
      }

      reply({ text: response }, (err) => {
        if (err) throw err
      })
    })
  } else if(text.match(/^open/)) {
    client.hset(text.split(' ')[1], payload.sender.id, 1, (err, replies) => {
      response = `Thanks for the heads up!`

      reply({ text: response }, (err) => {
        if (err) throw err
      })
    })
  } else if(text.match(/^closed/)) {
    client.hset(text.split(' ')[1], payload.sender.id, -1, (err, replies) => {
      response = `Thanks for the heads up!`

      reply({ text: response }, (err) => {
        if (err) throw err
      })
    })
  } else if(text.match(/^help/)) {
    response = `Hey!\nType 'check' followed by a station code to check if the gates are open.\nUse 'open' or 'closed' followed by a station code to let othes know.`
    console.log(response)
    reply({ text: response }, (err) => {
      console.log(err)
      if (err) throw err
    })
  } else {
    response = `Hey! I don't understand what you're saying, but if you need some help, type 'help' :)`

    reply({ text: response }, (err) => {
      console.log(err)
      if (err) throw err
    })
  }
})

http.createServer(bot.middleware()).listen(3000)
console.log('Echo bot server running at port 3000.')
