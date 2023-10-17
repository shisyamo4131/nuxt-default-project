/**
 * Declare dayjs to use.
 * https://day.js.org/
 *
 * @create 2023-10-02
 * @author shisyamo4131
 */
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import toArray from 'dayjs/plugin/toArray'
// Change timezone to Asis/Tokyo.
dayjs.extend(require('dayjs/plugin/timezone'))
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.tz.setDefault('Asia/Tokyo')

// Change start of week to monday.
// dayjs.extend(require('dayjs/plugin/updateLocale'))
// dayjs.updateLocale('en', { weekStart: 1 })

// Declare extensions to use.
dayjs.extend(isBetween)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.extend(toArray)

export default (context, inject) => {
  inject('dayjs', (string) => dayjs(string))
}
