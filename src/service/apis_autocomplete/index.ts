import { OpenAPI } from "@/api"

export async function getAvailableRelationTypes(relation: string) {
    const res = await (await fetch(`${OpenAPI.BASE}/apis/vocabularies/autocomplete/${relation}/normal/`)).json()
    return res.results
}

export async function searchEntity(entityType: string, q: string) {
    const res = await (await fetch(`${OpenAPI.BASE}/apis/entities/autocomplete/${entityType}/?q=${encodeURIComponent(q)}`)).json()
    return res.results.map((hit: any) => {
        return {
            id: hit.id,
            name: hit.text
        }
    })
} 