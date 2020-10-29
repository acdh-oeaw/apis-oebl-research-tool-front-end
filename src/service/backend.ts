const host = 'https://oeblresearch.sisyphos.arz.oeaw.ac.at'

interface ApiPerson {
  gnd: string
  firstName: string
  lastName: string
}

interface ApiSuccessMessage {
  success: string
}

export async function postList(ps: ApiPerson[]): Promise<ApiSuccessMessage> {
  const r = await (await fetch(host + '/lemmaresearch/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'arnold.graf@oeaw.ac.at',
      lemmas: ps
    })
  })).json()
  return r
}

export async function getResultsForSearch(id: string): Promise<any> {
  const r = await (await fetch(host + '/lemmaresearch/' + id, {
    method: 'GET'
  })).json()
  return r
}
