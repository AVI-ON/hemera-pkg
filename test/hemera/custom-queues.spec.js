'use strict'

describe('Custom queues', function() {
  const PORT = 6242
  const authUrl = 'nats://localhost:' + PORT
  let server

  before(function(done) {
    server = HemeraTestsuite.start_server(PORT, done)
  })

  after(function() {
    server.kill('SIGKILL')
  })

  it('Should be able distribute content to different queues for the same topic', function(done) {
    const nats = require('nats').connect(authUrl)

    const hemera = new Hemera(nats)
    const hemera2 = new Hemera(nats)

    let queueA = Sinon.spy()
    let queueB = Sinon.spy()

    hemera.ready(() => {
      hemera.add(
        {
          topic: 'email',
          cmd: 'send',
          queue$: 'A'
        },
        (resp, cb) => {
          queueA()
          cb()
        }
      )
    })

    hemera2.ready(() => {
      hemera2.add(
        {
          topic: 'email',
          cmd: 'send',
          queue$: 'B'
        },
        (resp, cb) => {
          queueB()
          cb()
        }
      )
    })

    setTimeout(function() {
      hemera2.act(
        {
          topic: 'email',
          cmd: 'send',
          email: 'foobar@gmail.com',
          msg: 'Hi!'
        },
        function() {
          expect(queueA.callCount).to.be.equals(1)
          expect(queueB.callCount).to.be.equals(1)
          hemera.close(x => hemera2.close(() => done()))
        }
      )
    }, 100)
  })
})
