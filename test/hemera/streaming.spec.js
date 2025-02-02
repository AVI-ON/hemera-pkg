'use strict'

describe('Streaming', function() {
  const PORT = 6242
  const authUrl = 'nats://localhost:' + PORT
  let server

  before(function(done) {
    server = HemeraTestsuite.start_server(PORT, done)
  })

  after(function() {
    server.kill('SIGKILL')
  })

  it('Should be able to receive many messages from the INBOX channel', function(done) {
    const nats = require('nats').connect(authUrl)

    const hemera = new Hemera(nats)

    const results = []

    hemera.ready(() => {
      hemera.add(
        {
          topic: 'math',
          cmd: 'add'
        },
        function(resp) {
          for (let i = 0; i < 10; i++) {
            this.reply.next(i)
          }
        }
      )

      hemera.act(
        {
          topic: 'math',
          cmd: 'add',
          maxMessages$: 10
        },
        function(err, resp) {
          expect(err).to.be.not.exists()
          results.push(resp)
          if (results.length === 10) {
            hemera.close(done)
          }
        }
      )
    })
  })

  it('Should be able to set maxMessages$ to -1 to receive unlimited amount of messages', function(done) {
    const nats = require('nats').connect(authUrl)

    const hemera = new Hemera(nats)

    const results = []

    hemera.ready(() => {
      hemera.add(
        {
          topic: 'math',
          cmd: 'add'
        },
        function(resp) {
          for (let i = 0; i < 10; i++) {
            this.reply.next(i)
          }
        }
      )

      hemera.act(
        {
          topic: 'math',
          cmd: 'add',
          maxMessages$: -1
        },
        function(err, resp) {
          expect(err).to.be.not.exists()
          results.push(resp)
          if (results.length === 10) {
            // remove the subscription for the global inbox
            hemera.remove(this.sid)
            hemera.close(done)
          }
        }
      )
    })
  })

  it('Should be able to respond multiple errors with reply', function(done) {
    const nats = require('nats').connect(authUrl)

    const hemera = new Hemera(nats)

    const results = []

    hemera.ready(() => {
      hemera.add(
        {
          topic: 'math',
          cmd: 'add'
        },
        function(resp) {
          for (let i = 0; i < 10; i++) {
            this.reply.next(new Error('test'))
          }
        }
      )

      hemera.act(
        {
          topic: 'math',
          cmd: 'add',
          maxMessages$: 10
        },
        function(err, resp) {
          expect(err).to.be.exists()
          results.push(err)
          if (results.length === 10) {
            hemera.close(done)
          }
        }
      )
    })
  })
})
