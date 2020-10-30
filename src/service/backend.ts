const host = 'https://oeblresearch.sisyphos.arz.oeaw.ac.at'

interface ApiPerson {
  gnd: string
  firstName: string
  lastName: string
}

interface ApiSuccessMessage {
  success: string
}

export interface ApiPersonResult {
  geburtstag: string|null
  gnd: string
  label: string|null
  loc: string|null
  obv_counts: number
  obv_entries: string[]
  query_name: string
  todestag: string|null
  viaf: string|null
  'wien wiki': string|null
  wikipedia_edits: number
  wikipedia_txt: string|null
}

export async function postList(lemmas: ApiPerson[], email: string): Promise<ApiSuccessMessage> {
  const r = await (await fetch(host + '/lemmaresearch/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({email, lemmas})
  })).json()
  return r
}

export async function getResultsForSearch(id: string): Promise<ApiPersonResult[]> {
  const r = await (await fetch(host + '/lemmaresearch/' + id, {
    method: 'GET'
  })).json() as { count: number, results: ApiPersonResult[] }
  return r.results
}
