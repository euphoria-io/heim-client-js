import moment from 'moment'

import { TICK } from '../const'

export default class Clock {
  constructor(store, hz = 1 / 60) {
    moment.relativeTimeThreshold('s', 0)
    moment.relativeTimeThreshold('m', 60)

    moment.locale('en-short', {
      relativeTime: {
        future: 'in %s',
        past: '%s ago',
        s: '%ds',
        m: '1m',
        mm: '%dm',
        h: '1h',
        hh: '%dh',
        d: '1d',
        dd: '%dd',
        M: '1mo',
        MM: '%dmo',
        y: '1y',
        yy: '%dy',
      },
    })

    moment.locale('en', {
      relativeTime: {
        future: 'in %s',
        past: '%s ago',
        s: '%ds',
        m: '1 min',
        mm: '%d min',
        h: '1 hour',
        hh: '%d hours',
        d: 'a day',
        dd: '%d days',
        M: 'a month',
        MM: '%d months',
        y: 'a year',
        yy: '%d years',
      },
    })

    this.store = store
    this.hz = hz
    this._tick()
  }

  _tick() {
    this.store.dispatch({ type: TICK, now: new Date() })
    if (typeof window !== 'undefined') {
      window.setTimeout(() => this._tick(), 1000.0 / this.hz)
    }
  }
}
