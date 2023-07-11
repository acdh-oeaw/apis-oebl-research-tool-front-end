<template>
	<v-list-group
		:class="[
			((Array.isArray(value) && value.length === 0) || value === undefined) && 'list-disabled',
			'scrape-result',
		]"
		:value="defaultExpand"
	>
		<template #activator>
			<v-list-item-title style="letter-spacing: 0.1em; text-transform: uppercase">
				{{ title }}
			</v-list-item-title>
			<v-list-item-action-text class="ellipsis">
				<span v-for="(subValue, key) in value" :key="key">{{ formatKey(key) }},</span>
			</v-list-item-action-text>
		</template>
		<v-list-item
			v-for="(scrapeDataValue, key) in nonArrayable(value)"
			:key="key"
			dense
			:href="maybeLinkItem(key, scrapeDataValue)"
			target="_blank"
		>
			<v-list-item-content class="list-item-label">{{ formatKey(key) }}</v-list-item-content>
			<v-list-item-action-text
				:class="[
					'list-item-value',
					typeof scrapeDataValue === 'string' && scrapeDataValue.length > 300 && 'longform-text',
				]"
			>
				{{ formatValue(key, scrapeDataValue) }}
			</v-list-item-action-text>
		</v-list-item>
		<v-list-group
			v-for="(scrapeDataValue, key) in arrayable(value)"
			:key="key"
			sub-group
			:class="[scrapeDataValue.length === 0 && 'list-disabled']"
			:value="defaultExpand"
		>
			<template #activator>
				<v-list-item-title>{{ formatKey(key) }}</v-list-item-title>
				<v-list-item-action-text>{{ scrapeDataValue.length }}</v-list-item-action-text>
			</template>
			<v-list-item
				v-for="(subValue, key) in scrapeDataValue"
				:key="key"
				dense
				:href="maybeLinkItem(key, subValue)"
				target="_blank"
			>
				<v-list-item-content v-if="typeof key !== 'number'" class="list-item-label">
					{{ key }}
				</v-list-item-content>
				<v-list-item-action-text
					:class="[
						'list-item-value',
						typeof subValue === 'string' && subValue.length > 300 && 'longform-text',
					]"
				>
					{{ formatValue(key, subValue) }}
				</v-list-item-action-text>
			</v-list-item>
		</v-list-group>
	</v-list-group>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-duplicates
import { format } from "date-fns";
// eslint-disable-next-line import/no-duplicates
import { de } from "date-fns/locale";
import _ from "lodash";
import { Component, Prop, Vue } from "vue-property-decorator";

import { type ServerResearchLemma } from "@/types/lemma";
import { isValidHttpUrl, maybeParseDate } from "@/util";

type ScrapeValue =
	ServerResearchLemma["columns_scrape"][keyof ServerResearchLemma["columns_scrape"]];

@Component
export default class LemmaScrapeResult extends Vue {
	@Prop({ required: true }) value!: ScrapeValue;
	@Prop({ required: true }) title!: string;
	/* Will expand all sublist as default*/
	@Prop({ default: false }) defaultExpand!: boolean;

	keyNamesReadable: { [key: string]: string } = {
		txt: "",
	};

	formatKey(s: number | string) {
		if (this.keyNamesReadable[String(s)] !== undefined) {
			return "";
		} else {
			return _.startCase(String(s));
		}
	}

	formatValue(key: number | string, value: any) {
		const maybeDate = maybeParseDate(value);
		if (maybeDate !== null) {
			return format(maybeDate, "do MMM. yyyy", { locale: de });
		} else {
			return value;
		}
	}

	arrayable(v: ScrapeValue) {
		return _(v)
			.omitBy((a) => !Array.isArray(a))
			.value();
		// return Object.values(v).filter(Array.isArray)
	}

	nonArrayable(v: ScrapeValue) {
		return _(v).omitBy(Array.isArray).value();
		// return Object.values(v).filter(a => !Array.isArray(a))
	}

	maybeLinkItem(key: number | string, value: any): string | undefined {
		if (isValidHttpUrl(value)) {
			return value;
		}
		// if (key === 'loc') {
		//   return
		// }
	}
}
</script>

<style>
.scrape-result .v-list-item--active {
	position: sticky;
	top: 0;
	z-index: 1;
	background: var(--v-background-base);
}
</style>

<style scoped>
.list-disabled {
	opacity: 50%;
	pointer-events: none;
}

.list-item-label {
	overflow: visible;
	margin-right: 3px;
	white-space: nowrap;
}

.longform-text {
	font-size: 15px !important;
}

.ellipsis {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
