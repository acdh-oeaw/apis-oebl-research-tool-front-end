<template>
	<v-list-group
		:class="[
			((Array.isArray(value) && value.length === 0) || value === undefined) && 'list-disabled',
			'scrape-result',
		]"
		:value="defaultExpand"
	>
		<template v-slot:activator>
			<v-list-item-title style="text-transform: uppercase; letter-spacing: 0.1em">
				{{ title }}
			</v-list-item-title>
			<v-list-item-action-text class="ellipsis">
				<span v-for="(subValue, key) in value" :key="key">{{ formatKey(key) }},</span>
			</v-list-item-action-text>
		</template>
		<v-list-item
			dense
			v-for="(scrapeDataValue, key) in nonArrayable(value)"
			:key="key"
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
			sub-group
			v-for="(scrapeDataValue, key) in arrayable(value)"
			:key="key"
			:class="[scrapeDataValue.length === 0 && 'list-disabled']"
			:value="defaultExpand"
		>
			<template v-slot:activator>
				<v-list-item-title>{{ formatKey(key) }}</v-list-item-title>
				<v-list-item-action-text>{{ scrapeDataValue.length }}</v-list-item-action-text>
			</template>
			<v-list-item
				dense
				v-for="(subValue, key) in scrapeDataValue"
				:href="maybeLinkItem(key, subValue)"
				target="_blank"
				:key="key"
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
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { ServerResearchLemma } from "@/types/lemma";
import _ from "lodash";
import { maybeParseDate, isValidHttpUrl } from "@/util";
import formatDate from "date-fns/esm/format";
import de from "date-fns/esm/locale/de";

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

	formatKey(s: string | number) {
		if (this.keyNamesReadable[String(s)] !== undefined) {
			return "";
		} else {
			return _.startCase(String(s));
		}
	}

	formatValue(key: string | number, value: any) {
		const maybeDate = maybeParseDate(value);
		if (maybeDate !== null) {
			return formatDate(maybeDate, "do MMM. yyyy", { locale: de });
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

	maybeLinkItem(key: string | number, value: any): string | undefined {
		if (isValidHttpUrl(value)) {
			return value;
		}
		// if (key === 'loc') {
		//   return
		// }
	}
}
</script>
<style lang="stylus" scoped>
.list-disabled
  pointer-events none
  opacity .5

.list-item-label
  overflow: visible
  white-space nowrap
  margin-right 3px

.longform-text
  font-size 15px !important

.ellipsis
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
</style>
<style lang="stylus">
.scrape-result .v-list-item--active
  background var(--v-background-base)
  position sticky
  z-index 1
  top 0
</style>
