/* eslint-disable no-underscore-dangle */
import { io } from 'socket.io-client'

export default class WebSocketService {
  static _instance;

  socket = null;

  socketStatus = false;

  constructor() {
    this.socket = io(process.env.VUE_APP_WSURL)
    this.checkStatus()
  }

  static get instance() {
    if (!this._instance) {
      this._instance = new WebSocketService()
    }

    return this._instance
  }

  checkStatus() {
    this.socket.on('connect', () => {
      console.log('connected')
      this.socketStatus = true
    })

    this.socket.on('disconnect', () => {
      console.log('disconnected')
      this.socketStatus = false
    })
  }

  emit(event, payload, callback) {
    console.log('emitting...', event)
    this.socket.emit(event, payload, callback)
  }

  listen(event, callback) {
    console.log('listenning...', event)
    this.socket.on(event, payload => {
      callback(payload)
    })
  }
}
