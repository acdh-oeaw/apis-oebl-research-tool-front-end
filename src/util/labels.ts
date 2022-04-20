
type translation = {
    de: string;
}

type translations = {
    [property: string]: translation
}


export const lemmaRowTranslations: translations = {
    id: {de: 'ID'},
    columns_user: {de: 'Erweiterte Daten'},
    selected: {de: 'Markiert'},
    firstName: {de: 'Vorname'},
    lastName: {de: 'Nachname'},
    alternativeNames: {de: 'Alternative Namen'},
    nobleTitle: {de: 'Adelsprädikat'},
    gender: {de: 'Geschlecht'},
    dateOfBirth: {de: 'Geburtsdatum'},
    dateOfDeath: {de: 'Sterbedatum'},
    kinship: {de: 'Verwandtschaft'},
    bioNote: {de: 'Lebenslauf'},
    religion: {de: 'Religiöses Bekenntnis'},
    professionDetail: {de: 'Berufsbezeichnung'},
    professionGroup: {de: 'Berufsgruppe'},
    gnd: {de: 'GND'},
    loc: {de: 'Library of Congress'},
    viaf_id: {de: 'VIAF ID'},
    wiki_edits: {de: 'Wikipedia Edits'},
    secondaryLiterature: {de: 'Sekundärliteratur'},
    zoteroKeysBy: {de: 'Literatur von'},
    zoteroKeysAbout: {de: 'Literatur über'},
}