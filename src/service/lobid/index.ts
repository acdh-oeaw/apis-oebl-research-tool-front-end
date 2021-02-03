import { Person as LdPerson } from 'schema-dts'
import { ImportablePerson } from '../../types/lemma'
import _ from 'lodash'

export async function getPreviews(gnds: string[]) {
  return Promise.all(gnds.map(gnd => fetch('https://lobid.org/gnd/' + gnd + '.preview').then(r => r.text())))
}

function isQueryableValue(e?: string|null): boolean {
  return e !== undefined && e !== null && e.trim() !== '' && e.trim() !== '*'
}

function makeLobidQueryString(p: ImportablePerson): string {
  const lobidQ = {
    preferredName: p.firstName + ' ' + p.lastName,
    dateOfDeath: (p.dateOfDeath || '') + '*',
    dateOfBirth: (p.dateOfBirth || '') + '*',
    placeOfBirth: p.placeOfBirth,
    placeOfDeath: p.placeOfDeath
  }
  return _.reduce(lobidQ, (m, e, k) => {
    return m.concat(isQueryableValue(e)
      ? k + ':' + e
      : []
    )
  }, [] as string[]).join(' AND ')
}

export async function findPerson(p: ImportablePerson, secondTry = false): Promise<LdPerson[]> {
  // const u = http://lobid.org/gnd/search?q=preferredName%3AFranz*%20AND%20dateOfDeath:1910*&filter=type%3APerson&format=json:preferredName,dateOfDeath,dateOfBirth,%20placeOfDeath,placeOfBirth&size=100
  let res: LdPerson[] = []
  const qp = new URLSearchParams({
    q: makeLobidQueryString(p),
    filter: 'type:Person',
    format: 'json',
    size: '100'
  })
  try {
    const r = await (await fetch('https://lobid.org/gnd/search?' + qp)).json()
    if (r.member.length > 0 || secondTry === true) {
      res = r.member
    } else {
      res = await findPerson({
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: null,
        dateOfDeath: null,
        placeOfBirth: null,
        placeOfDeath: null,
        gnd: []
      }, true)
    }
  } catch (e) {
    console.error(e)
    return []
    // this really shouldn’t happen
  }
  return res
}
