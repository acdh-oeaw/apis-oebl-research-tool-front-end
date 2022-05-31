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
    // All cases of empty value return undefined gender
    if ((gender === null) || (gender === undefined) || (gender === '')) {
        return undefined;
    }

    // Check every gender:genderStringRepresentations for 1:n equality.
    const matches = Object
        .entries(mapping)
        .filter(
            ([_, genderStringRepresentations]) => genderStringRepresentations.includes(gender)
        )
    ;
    
    if (matches.length === 0) {
        return undefined;
    }

    /**
     * No uniqueness is enforced in the <{gender: [genderRepresentation, ]} -> genderRepresentation> overall the object / enum,
     * instead it is treated as the users choice (however there should be a warning in the ux). 
     */
    const mappedGenders = new Set(matches.map(entry => entry[0]));

    if (mappedGenders.size > 1) {
        return GenderAe0Enum.DIVERS;
    }

    const [genderNormalized, ] = mappedGenders; // I would prefer just mappedGenders[0] or mappedGenders.pop()

    /**
     * This is … not cool. TODO
     */
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
