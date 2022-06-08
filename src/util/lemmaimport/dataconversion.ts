import { GenderAe0Enum } from "@/api";
import { NewLemmaRow, UserColumn } from "@/types/lemma";
import { 
    LemmaPrototypeStringType,
    LemmaPrototypeNullableStringType,
    LemmaPrototypeRequiredFieldsType,
    LemmaDates,
    LemmaGender,
    Data2D,
} from "./datacontainers";
import { defautLemmaFormatterOptions, GenderMappingOption, UserColumnMapping } from "./options";

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

function hasMissingRequiredField(prototype: LemmaPrototypeNullableStringType) {
    return prototype.lastName === null;
}

export function filterMissingRequiredFields(
    prototypes: LemmaPrototypeNullableStringType[],
): LemmaPrototypeRequiredFieldsType[] {
    return prototypes.filter(
            (prototype)
            : prototype is LemmaPrototypeRequiredFieldsType => 
            ! hasMissingRequiredField(prototype)
        );
}

export function showMissingRequiredFields(
    prototypes: LemmaPrototypeNullableStringType[],
): LemmaPrototypeNullableStringType[] {
    return prototypes.filter(hasMissingRequiredField);
}

    
export function getMissingRequiredFieldIndexes(prototypes: LemmaPrototypeNullableStringType[]): number[] {
    return prototypes
        .map((prototype, index) => hasMissingRequiredField(prototype) ? index : false)
        .filter((value): value is number => value !== false)
    ;
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

/**
 * Build A NewLemmaRow With Formatted Data And Fill In Empty / Not Yet Build Fields
 * 
 * @param lemmaPrototype
 * @param lemmaDates 
 * @param lemmaGender 
 */
export function buildNewLemmaRowAfterFormatting(
    lemmaPrototype: LemmaPrototypeRequiredFieldsType,
    lemmaDates: LemmaDates,
    lemmaGender: LemmaGender,
): NewLemmaRow {

    return {
        firstName: lemmaPrototype.firstName,
        lastName: lemmaPrototype.lastName,
        ... lemmaDates, // New Formatted Data
        ... lemmaGender, // New Formatted Data

        list: undefined, // This will be done later
        columns_user: {}, // This will be done later

        alternativeNames: [], // Not yet implemented,
        gnd: [], // Not yet implemented,
        loc: null, // Not yet implemented,
        viaf_id: null, // Not yet implemented,
        professionDetail: null, // Not yet implemented,
        professionGroup: null, // Not yet implemented
        secondaryLiterature: [], // Not yet implemented,
        zoteroKeysBy: [], // Not yet implemented,
        zoteroKeysAbout: [], // Not yet implemented,
        bioNote: null, // Not yet implemented,
        kinship: null, // Not yet implemented,
        religion: null, // Not yet implemented,

        legacyGideonCitations: null, // Legacy – no import
    };
}

export function mergeBuildNewLemmaRows(
    lemmaPrototypes: LemmaPrototypeRequiredFieldsType[],
    lemmaDatesRows: LemmaDates[],
    lemmaGenderRows: LemmaGender[],
): NewLemmaRow[] {
    // Check, that all subcomponents return data of the same length (amount of rows)
    const numberOfRows = new Set([
        lemmaPrototypes.length,
        lemmaDatesRows.length,
        lemmaGenderRows.length,
    ]);

    if (numberOfRows.size !== 1) {
        // Inform harshly in console
        console.error({
                message: 'Not all columns have the same amount of rows',
                lemmaGenderRows,
                lemmaDatesRows,
                lemmaPrototypes,
            });
        // But don't crash app …
        return [];
    }

    return lemmaPrototypes.map(
        (lemmaPrototype, index) => {
            const lemmaDates = lemmaDatesRows[index];
            const lemmaGender = lemmaGenderRows[index];
            return buildNewLemmaRowAfterFormatting(
                lemmaPrototype,
                lemmaDates,
                lemmaGender,
            );
        }
    );
}

export function createUserColumns(table: Data2D, options: UserColumnMapping): UserColumn[] {
    
    const mappings: Array<[
        number, // numericalSourceColumn, 
        string, // targetColumn
    ]> = Object.entries(options).map(
        ([targetColumn, sourceColumn]) => [
            table.getNumericalHeaderName(sourceColumn),
            targetColumn,
        ]
    );

    return table.data.map(
        (row: string[]) => {
            return Object.fromEntries(
                mappings.map(
                    ([numericalSourceColumn, targetColumn]) => {
                        return [
                            targetColumn,
                            row[numericalSourceColumn]
                        ];
                    }
                )
            );
        }
    );
}


export function addUserColumns(lemmas: NewLemmaRow[], columns: UserColumn[]): NewLemmaRow[] {
    
    if (columns.length === 0) {
        return lemmas;
    }
    if (lemmas.length !== columns.length) {
        throw new Error(`Can not combine ${lemmas.length} lemmas with ${columns.length} rows of columns`);
    }
    return lemmas.map(
        (lemma, index) => Object.assign(lemma, {columns_user: columns[index]})
    );
}
