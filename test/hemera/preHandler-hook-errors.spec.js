'use strict'

describe('preHandler extension error handling', function() {
  const PORT = 6242
  const authUrl = 'nats://localhost:' + PORT
  let server

  before(function(done) {
    server = HemeraTestsuite.start_server(PORT, done)
  })

  after(function() {
    server.kill('SIGKILL')
  })

  it('Should be able to pass a custom super error', function(done) {
    const nats = require('nats').connect(authUrl)

    const hemera = new Hemera(nats)
    const spy = Sinon.spy()

    let plugin = function(hemera, options, done) {
      hemera.setErrorHandler((hemera, error, reply) => {
        expect(error).to.be.exists()
        expect(error.name).to.be.equals('Unauthorized')
        expect(error.message).to.be.equals('test')
        spy()
      })

      hemera.ext('preHandler', function(ctx, req, res, next) {
        next(new UnauthorizedError('test'))
      })

      hemera.add(
        {
          cmd: 'add',
          topic: 'math'
        },
        (resp, cb) => {
          cb(null, resp.a + resp.b)
        }
      )

      done()
    }

    hemera.use(plugin)

    hemera.ready(() => {
      hemera.act(
        {
          topic: 'math',
          cmd: 'add',
          a: 1,
          b: 2
        },
        (err, resp) => {
          expect(err).to.be.exists()
          expect(err.name).to.be.equals('Unauthorized')
          expect(err.message).to.be.equals('test')
          expect(err.hops).to.be.exists()
          expect(err.hops.length).to.be.equals(1)
          expect(err.hops[0].service).to.be.equals('math')
          expect(err.hops[0].method).to.be.equals('a:1,b:2,cmd:add,topic:math')
          expect(spy.calledOnce).to.be.equals(true)
          hemera.close(done)
        }
      )
    })
  })

  it('Should be able to pass an error', function(done) {
    const nats = require('nats').connect(authUrl)

    const hemera = new Hemera(nats)
    const spy = Sinon.spy()

    let plugin = function(hemera, options, done) {
      hemera.setErrorHandler((hemera, error, reply) => {
        expect(error).to.be.exists()
        expect(error.name).to.be.equals('Error')
        expect(error.message).to.be.equals('test')
        spy()
      })
      hemera.ext('preHandler', function(ctx, req, res, next) {
        next(new Error('test'))
      })

      hemera.add(
        {
          cmd: 'add',
          topic: 'math'
        },
        (resp, cb) => {
          cb(null, resp.a + resp.b)
        }
      )

      done()
    }

    hemera.use(plugin)

    hemera.ready(() => {
      hemera.act(
        {
          topic: 'math',
          cmd: 'add',
          a: 1,
          b: 2
        },
        (err, resp) => {
          expect(err).to.be.exists()
          expect(err.name).to.be.equals('Error')
          expect(err.message).to.be.equals('test')
          expect(err.hops).to.be.exists()
          expect(err.hops.length).to.be.equals(1)
          expect(err.hops[0].service).to.be.equals('math')
          expect(err.hops[0].method).to.be.equals('a:1,b:2,cmd:add,topic:math')
          expect(spy.calledOnce).to.be.equals(true)
          hemera.close(done)
        }
      )
    })
  })

  it('Should be able to return a rejected promise', function(done) {
    const nats = require('nats').connect(authUrl)

    const hemera = new Hemera(nats)
    const spy = Sinon.spy()

    let plugin = function(hemera, options, done) {
      hemera.setErrorHandler((hemera, error, reply) => {
        expect(error).to.be.exists()
        expect(error.name).to.be.equals('Error')
        expect(error.message).to.be.equals('test')
        spy()
      })
      hemera.ext('preHandler', function(ctx, req, res) {
        return Promise.reject(new Error('test'))
      })

      hemera.add(
        {
          cmd: 'add',
          topic: 'math'
        },
        (resp, cb) => {
          cb(null, resp.a + resp.b)
        }
      )

      done()
    }

    hemera.use(plugin)

    hemera.ready(() => {
      hemera.act(
        {
          topic: 'math',
          cmd: 'add',
          a: 1,
          b: 2
        },
        (err, resp) => {
          expect(err).to.be.exists()
          expect(err.name).to.be.equals('Error')
          expect(err.message).to.be.equals('test')
          expect(spy.calledOnce).to.be.equals(true)
          hemera.close(done)
        }
      )
    })
  })
})
