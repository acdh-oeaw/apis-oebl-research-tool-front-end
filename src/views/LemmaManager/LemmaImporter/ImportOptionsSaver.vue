<template>
    <div class='import-options-saver-container'>
        TODO: UX
    </div>
</template>

<script lang='ts'>
import { ImportOptionsManager } from '@/util/lemmaimport/optionmanagement';
import { ImportOptions } from '@/util/lemmaimport/options';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class ImportOptionsSaver extends Vue {

    @Prop({required: true}) currentOptions!: ImportOptions;

    importOptionsManager: ImportOptionsManager = new ImportOptionsManager();

    selectedOptionsName?: string = undefined;

    localOptions: ImportOptions = new ImportOptions();

    errorMessage: string|null = null;

    optionsChangedByLoading: boolean = false;

    created() {
        this.localOptions = this.currentOptions;
    }

    changed: boolean = false;

    @Watch('localOptions', {immediate: true, deep: true})
    setChanged() {
        if (this.optionsChangedByLoading) {
            this.$emit('options', this.localOptions);
            this.changed = false;
            return;
        } else {
            this.changed = true;
            // This are not the user selected options anymore.
            this.optionsChangedByLoading = false;
        }
    }

    get optionsNames(): string[] {
        return this.importOptionsManager.listImportOptionsNames();
    }

    loadOption(name: string) {
        try {
            this.localOptions = this.importOptionsManager.getImportOptionByName(name);
        } catch (error) {
            this.errorMessage = `${name} konnte nicht geladen werden`;
        } finally {
            this.optionsChangedByLoading = true;
            this.selectedOptionsName = name;
        }
    }

    saveOption(name: string) {
        this.importOptionsManager.addOrUpdateImportOptions(name, this.localOptions);
        this.selectedOptionsName = name;
    }


}

</script>