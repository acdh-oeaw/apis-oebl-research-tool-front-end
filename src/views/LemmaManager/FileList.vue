<template>
	<div class="outer fill-height flex-column">
		<div class="file-list" v-if="value.length > 0">
			<div
				:title="`${file.name} (${formatNumber(file.size)}b)`"
				class="file-icon flex-grow-1"
				v-for="(file, i) in value"
				:key="i"
			>
				<img
					@error="replaceWithDefaultIcon"
					:src="`/img/file-icons/${file.name.toLowerCase().split('.').pop()}.svg`"
				/>
				<div class="caption text-center muted">{{ file.name }}</div>
			</div>
		</div>
		<div class="text-center py-5 text-body-1 muted" v-else>Ziehen Sie Dateien hierher.</div>
		<div class="caption grey--text text-center mt-4">
			{{ value.length }} Datei(en), {{ formatNumber(totalSize) }}b.
		</div>
	</div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import HRNumbers from "human-readable-numbers";
@Component
export default class FileList extends Vue {
	@Prop({ default: () => [] }) value!: Array<{ name: string; url: string; size: number }>;

	replaceWithDefaultIcon(e: Event) {
		if (e.target instanceof HTMLImageElement) {
			e.target.src = "/img/file-icons/unknown.svg";
		}
	}

	formatNumber(n: number) {
		return HRNumbers.toHumanString(n);
	}

	get totalSize(): number {
		return this.value.reduce((m, e) => {
			m = m + e.size;
			return m;
		}, 0);
	}
}
</script>
<style lang="stylus" scoped>
.outer
  width 100%

.file-icon
  width 120px
  padding 3px 7px
  text-align center
  vertical-align top
  display inline-block
  height 180px
  .caption
    max-height 40px
    text-overflow ellipsis
    -webkit-line-clamp 2
    -webkit-box-align center
    -webkit-box-pack center
    -webkit-box-orient vertical
    word-break break-all
    display -webkit-box
    overflow hidden
</style>
