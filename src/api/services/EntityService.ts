/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Entity } from '../models/Entity';
import { request as __request } from '../core/request';

export class EntityService {

    /**
     * @param id 
     * @param format 
     * @returns Entity 
     * @throws ApiError
     */
    public static async entityRetrieve(
id: number,
format?: 'json' | 'json+prosop' | 'rdf+n3' | 'rdf+nquads' | 'rdf+turtle' | 'rdf+xml' | 'tei',
): Promise<Entity> {
        const result = await __request({
            method: 'GET',
            path: `/entity/${id}/`,
            query: {
                'format': format,
            },
        });
        return result.body;
    }

}