<template>
  <div class="lemma-printer-container">
    <v-btn icon @click="runPrintJob">
      <v-icon>mdi-printer</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { LemmaRow } from "@/types/lemma";
import { Vue, Component, Prop } from "vue-property-decorator";
import store from '@/store';

@Component
export default class LemmaPrinter extends Vue {
  @Prop() lemmaRow!: LemmaRow;

  runPrintJob() {
    const navBarSettings = store.settings.showNavDrawer;
    store.settings.showNavDrawer = false;
    console.debug(store.settings.showNavDrawer)
    const printWindow = this.generatePrintWindow();
    printWindow.focus();
    //printWindow.print();
    //printWindow.close();
    //store.settings.showNavDrawer = navBarSettings;
  }

  generatePrintWindow(): Window {

    // An attempt to get a A4-like shape
    const height = window.screen.availHeight;
    const width = height * 1.414;

    const printWindow = window.open(`/lemmas/print/${this.lemmaRow.id}?minimal=1`, '_printLemmaWindow', `popup,innerHeight=${height},innerWidth=${width}`);

    if (printWindow === null) {
      alert('Derzeit ist leider kein Druck möglich. Bitte wenden Sie sich an das Entwicklungsteam.'); // Top message! ;-)
      throw new Error('Printing failed, whyever: I do not find, where I should look up the reason: Good luck, fellow being!');
    }

    return printWindow;
  }
}
</script>
