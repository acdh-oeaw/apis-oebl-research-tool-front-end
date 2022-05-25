import { GenderAe0Enum } from "@/api";
import { 
    LemmaPrototypeStringType,
    LemmaPrototypeNullableStringType,
    LemmaPrototypeRequiredFieldsType,
} from "./datacontainers";
import { defautLemmaFormatterOptions, GenderMappingOption } from "./options";

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
        const notUndefinedEntries = sourceEntries.filter(
            (keyValue: [string, string | undefined]): keyValue is [string,string] => keyValue[1] !== undefined
        );
        const targetEntries = notUndefinedEntries.map(
            ([key, value]: [string, string]) // We get an string key and value
            : [string, string | null] =>    // return a string key and value string or null
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

export function mapGender(gender: string | null | undefined, mapping: GenderMappingOption): GenderAe0Enum | undefined {
    if ((gender === null) || (gender === undefined)) {
        return undefined;
    }

    const options = Object.entries(mapping).filter(([_, genderStringRepresentation]) => gender === genderStringRepresentation);
    
    if (options.length === 0) {
        return undefined;
    }
    const genderNormalized = options[0][0];

    switch (genderNormalized) {
        case GenderAe0Enum.DIVERS:
            return GenderAe0Enum.DIVERS;
        case GenderAe0Enum.WEIBLICH:
            return GenderAe0Enum.WEIBLICH;
        case GenderAe0Enum.M_NNLICH:
            return GenderAe0Enum.M_NNLICH;
        default:
            return undefined;
    }
}
