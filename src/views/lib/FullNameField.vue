<template>
    <div class="full-name-input-wrapper">
        <text-field
            :required="false"
            label="Vorname"
            v-model="localFullName.firstName"
            @input="emitInput"
        ></text-field>
        <text-field
            :required="false"
            label="Nachname"
            v-model="localFullName.lastName"
            @input="emitInput"
        ></text-field>
    </div>
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator';
import { FullName as FullNameType } from '@/types/lemma';
import TextField from '@/views/lib/TextField.vue'


@Component({
    components: {
        TextField
    }
})
export default class FullNameField extends Vue {
    
    @Prop( {default: () => { return { firstName: null, lastName: null} } }) fullName!: FullNameType;

    localFullName: FullNameType = this.fullName;


    emitInput() {
        this.$emit('input', this.localFullName);
    }
}


</script>