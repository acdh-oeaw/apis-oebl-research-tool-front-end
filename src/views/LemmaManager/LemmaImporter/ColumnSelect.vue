<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { type LemmaRow } from "@/types/lemma";
import { lemmaRowTranslations } from "@/util/labels";
import { type Data2D } from "@/util/lemmaimport/datacontainers";
import { type ExtractColumnOptions } from "@/util/lemmaimport/options";

@Component
export default class ColumnSelect extends Vue {
	@Prop() lemmaKey!: keyof LemmaRow;
	@Prop() sourceData!: Data2D;
	@Prop() preloadedOptions!: ExtractColumnOptions;

	options: ExtractColumnOptions = { sourceKey: null };
	label = "";

	created() {
		this.label = lemmaRowTranslations[this.lemmaKey]!.de;
	}

	get extractedData(): Array<Partial<LemmaRow>> {
		if (this.options.sourceKey === null) {
			return [];
		}

		const column = this.sourceData.selectByHeaderName(this.options.sourceKey);
		return column.map((value) => {
			return {
				[this.lemmaKey]: value,
			};
		});
	}

	@Watch("preloadedOptions", { immediate: true, deep: true })
	setLocalOptions() {
		this.options = this.preloadedOptions;
	}

	@Watch("options", { immediate: true, deep: true })
	emitExtraction() {
		if (this.options.sourceKey == null) {
			this.cancel();
		} else {
			this.submit();
		}
	}

	submit() {
		this.$emit("options", this.options);
		this.$emit("data", this.extractedData);
	}

	cancel() {
		this.$emit("options", this.options);
		this.$emit("cancel");
	}

	// https://vuetifyjs.com/en/api/v-select/#props-items
	get vuetifySelectItems() {
		return this.sourceData.headers.map((header) => {
			return {
				text: header,
				value: header,
			};
		});
	}
}
</script>

<template>
	<div class="column-select">
		<v-container>
			<v-row>
				<v-col>{{ label }}</v-col>
				<v-col>
					<v-select
						label="Quellspalte"
						:value="options.sourceKey"
						:items="vuetifySelectItems"
						clearable
						@change="options.sourceKey = $event"
					/>
				</v-col>
			</v-row>
		</v-container>
	</div>
</template>
