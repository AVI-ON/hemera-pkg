'use strict'

describe('Delegate', function() {
  const PORT = 6242
  const authUrl = 'nats://localhost:' + PORT
  let server

  before(function(done) {
    server = HemeraTestsuite.start_server(PORT, done)
  })

  after(function() {
    server.kill('SIGKILL')
  })

  it('Should be able to pass data only to the next', function(done) {
    const nats = require('nats').connect(authUrl)

    const hemera = new Hemera(nats)

    hemera.ready(() => {
      hemera.add(
        {
          topic: 'math',
          cmd: 'sub'
        },
        function(resp, cb) {
          cb()
        }
      )

      hemera.add(
        {
          topic: 'math',
          cmd: 'add'
        },
        function(resp, cb) {
          expect(this.delegate$.name).to.exist()

          hemera.act(
            {
              topic: 'math',
              cmd: 'sub',
              a: 1,
              b: 2
            },
            function(err, resp) {
              expect(err).to.be.not.exists()
              expect(this.delegate$.name).to.not.exist()
              cb()
            }
          )
        }
      )

      hemera.act(
        {
          topic: 'math',
          cmd: 'add',
          a: 1,
          b: 2,
          delegate$: {
            name: 'test'
          }
        },
        function(err, resp) {
          expect(this.delegate$.name).to.exist()
          expect(err).to.be.not.exists()

          hemera.close(done)
        }
      )
    })
  })
})
