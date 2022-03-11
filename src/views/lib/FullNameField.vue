<template>
    <div class="full-name-input-wrapper">
        <text-field
            :required="false"
            label="Vorname"
            v-model="fullName.firstName"
            @input="emitInput($event, 'firstName')"
            :disabled="disabled"
        ></text-field>
        <text-field
            :required="false"
            label="Nachname"
            v-model="fullName.lastName"
            @input="emitInput($event, 'lastName')"
            :disabled="disabled"
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
    @Prop( { default: true }) disabled!: boolean;

    emitInput(eventData: string, property: 'firstName' | 'lastName') {
        if (! ['firstName', 'lastName'].includes(property)) {
            throw new Error(`Can not emit input for property ${property}`);
        }
        const updateFirstName = property === 'firstName';
        this.$emit('input', {
            firstName: updateFirstName ? eventData : this.fullName.firstName,
            lastName: !updateFirstName ? eventData : this.fullName.lastName,
        });
    }
}


</script>