import { ImportOptions } from "./options";


type ImportOptionsCollections = {
    [name: string]: ImportOptions;
};




export class ImportOptionsManager {

    storageKey: string = 'lemmaImportOptions'; 
    importOptionsCollections: ImportOptionsCollections = {}

    constructor() {

        const loadedString = localStorage.getItem(this.storageKey);

        if (loadedString === null) {
            this.importOptionsCollections = {};
        } else {
            this.importOptionsCollections = JSON.parse(loadedString);
        }
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
        this.importOptionsCollections[name] = options;
        this.save();
    }
    
}