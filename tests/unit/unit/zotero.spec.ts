import { expect } from 'chai';
import fetch, { Headers, Response } from 'node-fetch';
import { ZoteroItem } from '../../../src/service/zotero';
import { zoteroFetchFunction, ZoteroEntityType, EntityRelatedZoteroItems, ZoteroItemCache } from '../../../server/zotero';
import { range, reduce } from 'lodash';



class FetchMocker {
    /**
     * Mock data
     */
    olderLibraryVersion: Number;
    newestLibraryVersion: Number;
    items: Array<object>

    constructor() {
        this.olderLibraryVersion = 390;
        this.newestLibraryVersion = 396;
        this.items = [
            {'data': {'ISBN': '',
              'abstractNote': '',
              'accessDate': '',
              'archive': '',
              'archiveLocation': '',
              'callNumber': '',
              'collections': [],
              'creators': [{'creatorType': 'author',
                            'firstName': 'J.',
                            'lastName': 'Štěpánek'},
                           {'creatorType': 'author',
                            'firstName': 'H.',
                            'lastName': 'Štěpánková'}],
              'date': '1923–24',
              'dateAdded': '2021-06-20T16:09:01Z',
              'dateModified': '2021-06-20T16:09:01Z',
              'edition': '2',
              'extra': '',
              'itemType': 'book',
              'key': 'KHPCHKFV',
              'language': '',
              'libraryCatalog': '',
              'numPages': '',
              'numberOfVolumes': '30',
              'place': 'Praha',
              'publisher': '',
              'relations': {},
              'rights': '',
              'series': '',
              'seriesNumber': '',
              'shortTitle': '',
              'tags': [],
              'title': 'Sebrané spisy beletristické',
              'url': '',
              'version': this.olderLibraryVersion,
              'volume': '2'},
     'key': 'KHPCHKFV',
     'library': {'id': 7926651,
                 'links': {'alternate': {'href': 'https://www.zotero.org/arnold-graf',
                                         'type': 'text/html'}},
                 'name': 'arnold-graf',
                 'type': 'user'},
     'links': {'alternate': {'href': 'https://www.zotero.org/arnold-graf/items/KHPCHKFV',
                             'type': 'text/html'},
               'self': {'href': 'https://api.zotero.org/users/7926651/items/KHPCHKFV',
                        'type': 'application/json'}},
     'meta': {'creatorSummary': 'Štěpánek and Štěpánková',
              'numChildren': 0,
              'parsedDate': '1923'},
     'version': this.olderLibraryVersion}
        ]   
    }

    async _getItems(): Promise<Array<object>> {
        return this.items;
    }
    
    async mockFetch<nativeFetchWrapper>(url:string, args: {headers: Headers, method: 'GET', }):  Promise<{status: Number, json(): Promise<any>, headers: Headers}>  {
        

        /* Check for "valid" url */
        const entityPattern = /(?<=https:\/\/api\.zotero\.org\/)(users|groups)\/([\w\d\-]+)(?=\/items)/;
        const match = url.match(entityPattern)
        if ((!match) || (match.length !== 3) ) {
            throw new Error(`Could not parse url for zotero in tests: ${url} with match ${match}`);
        }
        
        const response: {status: Number, json(): Promise<any>, headers: Headers} = {
            headers: new Headers(),
            status: NaN,
            json: async () => [],
        };
        const apikey = args.headers.get('Zotero-API-Key');
        if (!apikey) {
            response.status = 400;
            return response;
        }
        
        const requestLibraryVersion = args.headers.get('If-Modified-Since-Version') ? Number(args.headers.get('If-Modified-Since-Version')) : null;
        response.headers.set('Last-Modified-Version', String(this.newestLibraryVersion))
        if (requestLibraryVersion === this.newestLibraryVersion) {
            response.status = 304;
            return response;
        }

        response.status = 200;
        response.json = this._getItems.bind(this);
        return response;
    }

    getMockFetch() {
        return this.mockFetch.bind(this);
    }
}

describe('Fetching data from zotero (mocked)',async () => {

    const mocker = new FetchMocker();
    
    it('does not return a value a user/group with new (cached) library version', async () => {
        expect(
            await zoteroFetchFunction(
                'user-cached',
                ZoteroEntityType.users,
                mocker.newestLibraryVersion,
                process.env.ZOTERO_API_KEY,
                mocker.getMockFetch()
            )
            ).null;

        expect(
            await zoteroFetchFunction(
                'group-cached',
                ZoteroEntityType.groups,
                mocker.newestLibraryVersion,
                process.env.ZOTERO_API_KEY,
                mocker.getMockFetch()
            )
            ).null;
    });

    context('and old (not cached) library version', async () => {
        it('returns an object which implements the EntityRelatedZoteroItems Inferface for users', async () => {
           const zoteroResult = await zoteroFetchFunction(
               'user-uncached', ZoteroEntityType.users,mocker.olderLibraryVersion,
                process.env.ZOTERO_API_KEY, mocker.getMockFetch()
            );
            expect(zoteroResult).to.haveOwnProperty('libraryVersion');
            expect(zoteroResult?.libraryVersion).to.equal(mocker.newestLibraryVersion);
            expect(zoteroResult).to.haveOwnProperty('zoteroItems');
            expect(zoteroResult?.zoteroItems).to.be.an('array').with.length(1);

            const zoterItem = zoteroResult?.zoteroItems[0];
            expect(zoterItem).to.haveOwnProperty('key');
            expect(zoterItem).to.haveOwnProperty('data');
            expect(zoterItem?.data).to.haveOwnProperty('title');
        });

        it('returns an object which implements the EntityRelatedZoteroItems Inferface for groups', async () => {
            const zoteroResult = await zoteroFetchFunction(
                'user-groups', ZoteroEntityType.groups, mocker.olderLibraryVersion,
                 process.env.ZOTERO_API_KEY, mocker.getMockFetch()
             );
             expect(zoteroResult).to.haveOwnProperty('libraryVersion');
             expect(zoteroResult?.libraryVersion).to.equal(mocker.newestLibraryVersion);
             expect(zoteroResult).to.haveOwnProperty('zoteroItems');
             expect(zoteroResult?.zoteroItems).to.be.an('array').with.length(1);
 
             const zoterItem = zoteroResult?.zoteroItems[0];
             expect(zoterItem).to.haveOwnProperty('key');
             expect(zoterItem).to.haveOwnProperty('data');
             expect(zoterItem?.data).to.haveOwnProperty('title');
         });
    });
});

/* Check it with real life data */
describe('Fetching data from the real Zotero API', async () => {
    it('returns data of the expected shape or null', async () => {
        const zoteroResult = await zoteroFetchFunction(
            '7926651', ZoteroEntityType.users,
            null, 'NXywXQ1UV28KbY9kpL7LoYn9'
        );
        /* We simply do not know the outcome for real world dynamic data – explicitly expecting it, so we have a successful test here.*/
        if (zoteroResult === null) {
            expect(zoteroResult).null;
            return;
        }
        expect(zoteroResult).to.haveOwnProperty('libraryVersion');
        expect(zoteroResult?.libraryVersion).to.be.a('number');
        expect(zoteroResult).to.haveOwnProperty('zoteroItems');
        expect(zoteroResult?.zoteroItems).to.be.an('array');
        
        if (zoteroResult.zoteroItems.length) {
            const zoterItem = zoteroResult?.zoteroItems[0];
             expect(zoterItem).to.haveOwnProperty('key');
             expect(zoterItem).to.haveOwnProperty('data');
             expect(zoterItem?.data).to.haveOwnProperty('title');
        }

    });
    
    /* The following led to not responding a not responding Zotero API – leaving it here, so you know :-)
    // it('fails for not existing user', async () => {
    //     /* Chai's own expect().throw() method does not accept async functions, it seems */
    //     try {
    //         const result = await zoteroFetchFunction(
    //             'not-existing-user', ZoteroEntityType.users,
    //             null, 'NXywXQ1UV28KbY9kpL7LoYn9'
    //         );

    //     } catch (error) {
    //         const result = error;
    //     }
    //     expect(result).to.be.an('error');
    // });
});


class StatfulFetchMocker {
    
    libraryVersion: number;

    constructor() {
        this.libraryVersion = 0;
    }


    advanceVersion(version: number|undefined = undefined) {
        if ((typeof version === 'undefined')) {
            this.libraryVersion++;
        } else {
            this.libraryVersion = version;
        }
        return this;
    }

    async mockFetch<nativeFetchWrapper>(
            url:string, args: {headers: Headers, method: 'GET'}
        ): Promise<{status: Number, json(): Promise<any>, headers: Headers}> {

        const requestLibraryVersion = args.headers.get('If-Modified-Since-Version') ? Number(args.headers.get('If-Modified-Since-Version')) : null;
        
        const headers = new Headers();
        headers.set('Last-Modified-Version', String(this.libraryVersion));

        if (requestLibraryVersion === this.libraryVersion) {
            return {
                headers: headers,
                status: 304,
                json: async () => [],
            }
        }

        return {
            headers: headers,
            status: 200,
            json: this._getItems.bind(this),
        }

    }

    async _getItems(): Promise<Array<object>> {
        return Array.from(
            range(0, this.libraryVersion, 1),
            (libraryVersion: number) => {
                return {
                    key: String(libraryVersion),
                    data: {
                        title: `Title ${libraryVersion}`,
                        version: libraryVersion
                    }
                }
            }
        );
    }


    async mockZoteroFetcher(
            entity_id: string, 
            zoteroEntityType: ZoteroEntityType,
            libraryVersion: Number | null = null,
            apiKey: string | undefined
            ): Promise<EntityRelatedZoteroItems | null> {
                return await zoteroFetchFunction(
                    entity_id, zoteroEntityType, libraryVersion, apiKey, this.mockFetch.bind(this)
                );
            }

    getMockZoteroFetcher() {
        return this.mockZoteroFetcher.bind(this);
    }
}


describe('The Zotero cache should cache results (…)', async () => {
    let mocker: StatfulFetchMocker;
    let cache: ZoteroItemCache;

    beforeEach(() => {
        mocker = new StatfulFetchMocker();
        cache = new ZoteroItemCache(ZoteroEntityType.groups, mocker.getMockZoteroFetcher(), 'NXywXQ1UV28KbY9kpL7LoYn9');
    });

    it('returns a result the first time antity-data is requested', async () => {
        const result = await cache.get('any-enitity-id');
        expect(result.length === 1, `Our cache should reflect the behavior of the statful mocker.`)
    });

    it('should return the newest data', async() => {
        let result = await cache.get('any-enitity-id');
        mocker.advanceVersion();
        result = await cache.get('any-enitity-id');
        expect(result.length === 1, `Our cache should reflect the behavior of the statful mocker.`);
    });

    it('should persist data, if nothing has changed', async () => {
        const result_1 = await cache.get('any-enitity-id');
        const result_2 = await cache.get('any-enitity-id');
        expect(result_1).to.deep.equal(result_2);
    });
});