import { 
    LemmaPrototypeStringType,
    LemmaPrototypeNullableStringType,
    LemmaPrototypeRequiredFieldsType,
} from "./datacontainers";
import { defautLemmaFormatterOptions } from "./options";

export function createEmptyLemmaPrototype(): LemmaPrototypeStringType {
    return {
        lastName: '',
        alternativeNames: '',
        dateOfBirth: '',
        dateOfDeath: '',
        gnd: '',
        loc: '',
        viaf_id: '',
        secondaryLiterature: '',
        zoteroKeysBy: '',
        zoteroKeysAbout: '',
        columns_user: '',
    };
}

export function replaceNullStrings(
        source: LemmaPrototypeStringType,
        nanValues: string[] = defautLemmaFormatterOptions.nullValues,
    ): LemmaPrototypeNullableStringType {
        const sourceEntries = Object.entries(source);
        const targetEntries = sourceEntries.map(
            ([key, value]: [key: string, value: string]) // We get an string key and value
            : [key: string, value: string | null] =>    // return a string key and value string or null
             [key, nanValues.includes(value) ? null : value] // if it is in the nan list
        );

        return Object.fromEntries(targetEntries) as LemmaPrototypeNullableStringType;
}

export function filterMissingRequiredFields(
    prototypes: LemmaPrototypeNullableStringType[],
): LemmaPrototypeRequiredFieldsType[] {
    return prototypes.filter(
            (prototype)
            : prototype is LemmaPrototypeRequiredFieldsType => 
            prototype.lastName !== null
        );
}

export function showMissingRequiredFields(
    prototypes: LemmaPrototypeNullableStringType[],
): LemmaPrototypeNullableStringType[] {
    return prototypes.filter(prototype => prototype.lastName === null);
}
