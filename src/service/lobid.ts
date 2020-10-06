import { Person as LdPerson } from 'schema-dts'
import { Person } from '../types'
import _ from 'lodash'

export async function findPerson(p: Person, simpleTry = false): Promise<LdPerson[]> {
  // const u = http://lobid.org/gnd/search?q=preferredName%3AFranz*%20AND%20dateOfDeath:1910*&filter=type%3APerson&format=json:preferredName,dateOfDeath,dateOfBirth,%20placeOfDeath,placeOfBirth&size=100
  let res: LdPerson[] = []
  const qp = new URLSearchParams({
    q: makeLobidQueryString(p),
    filter: 'type:Person',
    format: 'json',
    size: '100'
  })
  try {
    const r = await (await fetch('http://lobid.org/gnd/search?' + qp)).json()
    if (r.member.length > 0 || simpleTry === true) {
      res = r.member
    } else {
      res = await findPerson({
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: null,
        dateOfDeath: null,
        placeOfBirth: null,
        placeOfDeath: null
      }, true)
    }
  } catch (e) {
    console.error(e)
    return []
    // this really shouldn’t happen
  }
  return res
}

function isQueryableValue(e?: string|null): boolean {
  return e !== undefined && e !== null && e.trim() !== '' && e.trim() !== '*'
}

function makeLobidQueryString(p: Person): string {
  const lobidQ = {
    preferredName: p.firstName + ' ' + p.lastName,
    dateOfDeath: (p.dateOfDeath || '') + '*',
    dateOfBirth: (p.dateOfBirth || '') + '*',
    placeOfBirth: p.placeOfBirth,
    placeOfDeath: p.placeOfDeath
  }
  return _.reduce(lobidQ, (m, e, k) => {
    console.log(k, e)
    return m.concat(isQueryableValue(e)
      ? k + ':' + e
      : []
    )
  }, [] as string[]).join(' AND ')
}
