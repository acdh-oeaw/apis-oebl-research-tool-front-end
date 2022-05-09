<template>
  <div class="file-options-container">
    <v-container>
      <v-row class="select-file">
        <v-file-input
          :accept="fileType"
          label="Bitte eine Datei auswählen"
          @change="file = $event === undefined ? null : $event"
          >
        </v-file-input>
        <v-spacer />
        <v-select
          label="Dateityp"
          v-model="fileType"
          :items="[{text: 'csv', value: 'text/csv', }, ]"
        />
      </v-row>
      <v-row class="file-options">
        <csv-importer 
          v-if="file !== null && file.type === 'text/csv'"
          :file="file"
          :preloadedOptions="preloadedFileOptions"
          @options="localOptions = $event"
          @data="localData = $event"
        />

      </v-row>
      <v-row class="data-preview">

      </v-row>
    </v-container>
  </div>
</template>


<script lang="ts">

import { Data2D } from '@/util/lemmaimport/datacontainers';
import { SupportedFilesOptions } from '@/util/lemmaimport/options';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

 
import CsvImporter from './CsvImporter.vue';


/**
 * Select A File, Choose Options, Have A Preview
 */
@Component({
  components: {
    CsvImporter,
  },
})
export default class ImportFileDialog extends Vue {

  /**
   * Preloaded file options from storage
   */
  @Prop({ default: null }) preloadedFileOptions!: null | SupportedFilesOptions;

  file: File | null = null;

  localOptions: SupportedFilesOptions | null = null;

  localData: Data2D|null = null;
  fileType: SupportedFilesOptions['fileType'] = 'text/csv';

  
  emitOptions(): void
  {
    if (this.localOptions === null) {
      return;
    }
    this.$emit('options', this.localOptions);
  }

  emitData(): void
  {
    if (this.localData === null) {
      return;
    }

    this.$emit('data', this.localData);
  }

  created() {
    if (this.preloadedFileOptions !== null) {
      this.localOptions = this.preloadedFileOptions;
      this.fileType = this.preloadedFileOptions.fileType;
    }
  }

  @Watch('localData')
  watchLocalData() {
    this.emitData();
  }

  @Watch('localOptions')
  watchLocalOptions() {
    this.emitOptions();
  }
}

</script>
