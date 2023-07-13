<script lang="ts" setup>
import _ from "lodash";

import { type ServerResearchLemma } from "@/types/lemma";
import { isValidHttpUrl, maybeParseDate } from "@/util";

type ScrapeValue =
	ServerResearchLemma["columns_scrape"][keyof ServerResearchLemma["columns_scrape"]];

const props = defineProps<{
	value: ScrapeValue;
	title: string;
	/* Will expand all sublist as default*/
	defaultExpand: boolean;
}>();

const keyNamesReadable: { [key: string]: string } = {
	txt: "",
};

function formatKey(s: number | string) {
	if (keyNamesReadable[String(s)] !== undefined) {
		return "";
	} else {
		return _.startCase(String(s));
	}
}

function formatValue(key: number | string, value: any) {
	const maybeDate = maybeParseDate(value);
	if (maybeDate != null) {
		const formatter = Intl.DateTimeFormat("de", { dateStyle: "long" });
		return formatter.format(new Date(maybeDate));
	} else {
		return value;
	}
}

function arrayable(v: ScrapeValue) {
	return _(v)
		.omitBy((a) => !Array.isArray(a))
		.value();
	// return Object.values(v).filter(Array.isArray)
}

function nonArrayable(v: ScrapeValue) {
	return _(v).omitBy(Array.isArray).value();
	// return Object.values(v).filter(a => !Array.isArray(a))
}

function maybeLinkItem(key: number | string, value: any): string | undefined {
	if (isValidHttpUrl(value)) {
		return value;
	}
	// if (key === 'loc') {
	//   return
	// }
}
</script>

<template>
	<VListGroup
		:class="[
			((Array.isArray(value) && value.length === 0) || value === undefined) && 'list-disabled',
			'scrape-result',
		]"
		:value="defaultExpand"
	>
		<template #activator>
			<VListItemTitle style="letter-spacing: 0.1em; text-transform: uppercase">
				{{ title }}
			</VListItemTitle>
			<VListItemActionText class="ellipsis">
				<span v-for="(subValue, key) in value" :key="key">{{ formatKey(key) }},</span>
			</VListItemActionText>
		</template>
		<VListItem
			v-for="(scrapeDataValue, key) in nonArrayable(value)"
			:key="key"
			dense
			:href="maybeLinkItem(key, scrapeDataValue)"
			target="_blank"
		>
			<VListItemContent class="list-item-label">{{ formatKey(key) }}</VListItemContent>
			<VListItemActionText
				:class="[
					'list-item-value',
					typeof scrapeDataValue === 'string' && scrapeDataValue.length > 300 && 'longform-text',
				]"
			>
				{{ formatValue(key, scrapeDataValue) }}
			</VListItemActionText>
		</VListItem>
		<VListGroup
			v-for="(scrapeDataValue, key) in arrayable(value)"
			:key="key"
			sub-group
			:class="[
				// @ts-expect-error
				scrapeDataValue.length === 0 && 'list-disabled',
			]"
			:value="defaultExpand"
		>
			<template #activator>
				<VListItemTitle>{{ formatKey(key) }}</VListItemTitle>
				<VListItemActionText>
					{{ Array.isArray(scrapeDataValue) ? scrapeDataValue.length : 0 }}
				</VListItemActionText>
			</template>
			<VListItem
				v-for="(subValue, key) in scrapeDataValue"
				:key="key"
				dense
				:href="maybeLinkItem(key, subValue)"
				target="_blank"
			>
				<VListItemAontent v-if="typeof key !== 'number'" class="list-item-label">
					{{ key }}
				</VListItemAontent>
				<VListItemActionText
					:class="[
						'list-item-value',
						// @ts-expect-error
						typeof subValue === 'string' && subValue.length > 300 && 'longform-text',
					]"
				>
					{{ formatValue(key, subValue) }}
				</VListItemActionText>
			</VListItem>
		</VListGroup>
	</VListGroup>
</template>

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
