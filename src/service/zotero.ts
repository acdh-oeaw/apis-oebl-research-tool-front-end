export interface Title {
  data: {
    key: string,
    version: number
    itemType: string
    title: string
    creators: Array<{
      creatorType: string
      firstName: string
      lastName: string
    }>
  }
}

export default {
  async searchTitle(q: string): Promise<Title[]> {
    const x = await (await fetch(process.env.VUE_APP_WEBAPP_HOST + '/zotero/search/' + q)).json()
    return x
  }
}
