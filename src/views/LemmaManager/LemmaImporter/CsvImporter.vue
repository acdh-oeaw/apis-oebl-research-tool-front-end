<template>
    <div class="csv-importer-container">
        CCSV
    </div>
</template>

<script lang="ts">
import { CsvOptions } from '@/util/lemmaimport/options';
import { Vue, Prop, Watch } from 'vue-property-decorator';

const defaultOptions: CsvOptions = {
    fileType: 'text/csv',
    newLine: '\n',
    textDelimiter: '"',
    separator: ',',
};


export default class CsvImporter extends Vue {

    @Prop({required: true}) file!: File;
    @Prop({default: null}) preloadedOptions!: CsvOptions|null;

    emitOptions(): void {
        this.$emit('options', this.localOptions);
    }

    emitData(): void {
        const data = [[],];
        this.$emit('data', data);
    }

    plainText: string|null = null;

    localOptions: CsvOptions = defaultOptions;

    @Watch('file', {deep: true, immediate: true})
    watchFile() {
        this.file.text().then(
            (text: string) => this.plainText = text
        );
    }

    @Watch('plainText', {deep: false, immediate: false})
    @Watch('localOptions', {deep: true, immediate: false})
    updateParent(): void {
        this.emitData();
        this.emitOptions();
    }
}
</script>
