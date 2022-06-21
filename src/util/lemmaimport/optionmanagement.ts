import { ImportOptions } from "./options";


type ImportOptionsCollections = {
    [name: string]: ImportOptions;
};




export class ImportOptionsManager {

    storageKey: string = 'lemmaImportOptions'; 
    importOptionsCollections: ImportOptionsCollections = {}

    constructor() {
        this.load();
    }

    load() {
        const loadedString = localStorage.getItem(this.storageKey);

        if (loadedString === null) {
            this.importOptionsCollections = {};
            return;
        }

        // Convert plain json objects into ImportOptions class.
        this.importOptionsCollections = Object.fromEntries(
            Object.entries(JSON.parse(loadedString))
            .map(
                ([importOptionsName, importOptions]) => [
                    importOptionsName,
                    Object.assign(
                        new ImportOptions(),
                        importOptions
                    )
                ]
            )
        ); 
        
    }

    save() {
        localStorage.setItem(
            this.storageKey,
            JSON.stringify(
                this.importOptionsCollections
                )
            );
    }

    listImportOptionsNames(): string[] {
        return Object.keys(this.importOptionsCollections);
    }

    getImportOptionByName(name: string): ImportOptions {
        const options = this.importOptionsCollections[name];
        if (options === undefined) {
            throw new Error(`Can't find options with name ${name}`);
        }

        return options;
    }

    addOrUpdateImportOptions(name: string, options: ImportOptions) {
        /*
         *  Often new options will reference to a changed instance of an already saved object. 
        *   To avoid mutating the same object, I use some pseudo deep copy, like here: https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy  
         */
        this.load(); // Reinstate / reset RAM state from localStorage
        this.importOptionsCollections[name] = options; // Add new options in RAM
        this.save(); // Save it to LocalStorage
        this.load(); // Loose references / Clean Up
    }
    
}