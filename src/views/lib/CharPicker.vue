<template>
    <v-menu v-model="shouldShowSpecialCharPicker" :close-on-content-click="false" :nudge-width="200" :max-width="200"
        offset-x><template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" class="rounded-lg" small text>
                <v-icon small left>mdi-omega</v-icon>
                Sonderzeichen
            </v-btn>
        </template>
        <v-card> <span v-for="(group, i) in specialCharGroups" :key="i">
                <div class="special-char-group caption pl-2">
                    <span class="muted"> {{ group.group }} </span>
                </div>
                <v-btn text small class="special-char" @click="$emit('returnSpecialChar', toSpecialChar(char[0]))"
                    v-for="(char, i) in group.chars" :key="'em' + i">
                    {{ toSpecialChar(char[0]) }}
                </v-btn>
            </span></v-card>
    </v-menu>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { specialChar } from '@/service/specialchars';

@Component
export default class Annotation extends Vue {

    shouldShowSpecialCharPicker = false;

    specialCharGroups = specialChar.groups;

    toSpecialChar(s: string | number): string {

        if (typeof s === 'number') {
            // eslint-disable-next-line prefer-spread
            return String.fromCodePoint(s)
        } else {
            return ''
        }
    }

}


</script>

<style lang="stylus" scoped>
.special-char
  font-size: 1.1em;
  cursor: pointer;
  width: 39px;
  display: inline-block;
  text-align: center;
</style>
