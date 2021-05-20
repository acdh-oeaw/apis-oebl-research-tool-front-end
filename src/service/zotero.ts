export interface TitleCreator {
  creatorType: string
  firstName: string
  lastName: string
}

export interface Title {
  key: string
  data: {
    abstractNote: string
    accessDate: string
    archiveLocation: string
    callNumber: string
    collections: Array<unknown>
    creators: TitleCreator[]
    date: string
    dateAdded: string
    dateModified: string
    edition: string
    extra: string
    itemType: string
    key: string,
    language: string
    libraryCatalog: string
    numPages: string
    numberOfVolumes: string
    place: string
    publisher: string
    relations: {}
    rights: string
    series: string
    seriesNumber: string
    shortTitle: string
    tags: []
    title: string
    url: string
    ISBN: string
    version: number
    volume: string
  }
}

export default {
  async searchTitle(q: string): Promise<Title[]> {
    const x = await (await fetch(process.env.VUE_APP_WEBAPP_HOST + '/zotero/search/' + q)).json()
    return x
  },
  async getTitle(key: string): Promise<Title> {
    return await (await fetch(process.env.VUE_APP_WEBAPP_HOST + '/zotero/item/' + key)).json()
  },
  async updateTitle(t: Title): Promise<{ version: number }> {
    return await (await fetch(process.env.VUE_APP_WEBAPP_HOST + '/zotero/item/' + t.key, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(t.data)
    })).json()
  }
}
