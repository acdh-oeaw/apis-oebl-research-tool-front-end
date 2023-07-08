<script lang="ts">
import HRNumbers from "human-readable-numbers";
import { Component, Prop, Vue } from "vue-property-decorator";

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
			return m + e.size;
		}, 0);
	}
}
</script>

<template>
	<div class="outer fill-height flex-column">
		<div v-if="value.length > 0" class="file-list">
			<div
				v-for="(file, i) in value"
				:key="i"
				:title="`${file.name} (${formatNumber(file.size)}b)`"
				class="file-icon flex-grow-1"
			>
				<img
					alt=""
					:src="`/img/file-icons/${file.name.toLowerCase().split('.').pop()}.svg`"
					@error="replaceWithDefaultIcon"
				/>
				<div class="caption text-center muted">{{ file.name }}</div>
			</div>
		</div>
		<div v-else class="text-center py-5 text-body-1 muted">Ziehen Sie Dateien hierher.</div>
		<div class="caption grey--text text-center mt-4">
			{{ value.length }} Datei(en), {{ formatNumber(totalSize) }}b.
		</div>
	</div>
</template>

<style scoped>
.outer {
	width: 100%;
}

.file-icon {
	display: inline-block;
	vertical-align: top;
	width: 120px;
	height: 180px;
	padding: 3px 7px;
	text-align: center;
}

.file-icon .caption {
	display: box;
	overflow: hidden;
	max-height: 40px;
	text-overflow: ellipsis;
	word-break: break-all;
	-webkit-line-clamp: 2;
	-webkit-box-align: center;
	-webkit-box-pack: center;
	-webkit-box-orient: vertical;
}
</style>
