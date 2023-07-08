<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { type NewLemmaRow } from "@/types/lemma";
import { ListManager } from "@/util/lemmaimport/listmanagement";
import { type SelectedList } from "@/util/lemmaimport/options";

const listManager = ListManager.createObservableListManager();

/**
 * This components has 2 "hacks". I am sorry dear god of pethunia!
 */
@Component
export default class ListSelector extends Vue {
	@Prop({ required: true }) preloadedOptions!: SelectedList;
	@Prop({ required: true }) newLemmasRows!: Array<NewLemmaRow>;

	/**
	 * SelectedList is undefined or a "List" object, but not nullable.
	 *
	 * > Note that if the initial value is undefined, the class property will not be reactive which means the changes for the properties will not be detected:
	 * > [...]
	 * > To avoid this, you can use null value or use data hook instead
	 *
	 * https://class-component.vuejs.org/guide/class-component.html#data
	 */
	data(): { selectedList: SelectedList } {
		return {
			selectedList: undefined,
		};
	}

	// Then typescript complains: "Property 'selectedList' does not exist on type 'ListSelector'.". Note I can not just change the type of selectedList
	selectedList: SelectedList;

	selectedListTitle: string | null | undefined = null;
	loadingList = false;
	listCreationFailedMessage: string | null = null;

	@Watch("selectedListTitle")
	updateList() {
		if (this.selectedListTitle === undefined || this.selectedListTitle === null) {
			return;
		}

		this.loadingList = true;
		this.listCreationFailedMessage = null;

		/**
		 * Apperently our own API service does not fail, when there is no internet connection or the server is down,
		 * and I am not going to refactor that, since my goal is to finish this feature.
		 *
		 * Instead doing this … dumb thing: Have fun!
		 *
		 */
		let couldBeAnError = true;

		const onFailure = (reason: any) => {
			if (!couldBeAnError) {
				return;
			}

			this.loadingList = false;
			this.listCreationFailedMessage = "Die Liste konnte leider nicht geladen werden.";
			console.error({ message: `Could not load list ${this.selectedListTitle}`, reason });
		};

		setTimeout(onFailure, 2000);

		listManager
			.getLemmaList(this.selectedListTitle)
			.then((lemmaList) => {
				couldBeAnError = false;
				this.selectedList = lemmaList;
				this.loadingList = false;
			})
			.catch(onFailure);
	}

	@Watch("preloadedOptions", { immediate: true, deep: true })
	setList() {
		this.selectedList = this.preloadedOptions;
	}

	get updatedNewLemmaRows(): Array<NewLemmaRow> {
		return this.newLemmasRows.map((newLemmaRow) =>
			Object.assign(newLemmaRow, { list: this.selectedList }),
		);
	}

	@Watch("selectedList", { immediate: true, deep: true })
	@Watch("newLemmasRows", { immediate: true, deep: false })
	emit() {
		console.debug("asd");
		this.$emit("data", this.lemmasWithLists);
		this.$emit("options", this.selectedList);
	}

	/**
	 * https://vuetifyjs.com/en/api/v-combobox/#props-items
	 */
	get vuetifyItems(): Array<{ text: string; value: string }> {
		return listManager.lemmaLists.map((lemmaList) => {
			return {
				text: lemmaList.title,
				value: lemmaList.title,
			};
		});
	}

	get lemmasWithLists(): Array<NewLemmaRow> {
		return this.newLemmasRows.map((lemma) => Object.assign(lemma, { list: this.selectedList }));
	}
}
</script>

<template>
	<div class="import-list-selector-container">
		<v-container>
			<v-row class="import-list-selection">
				<v-col class="select-import-list">
					<v-combobox
						v-model="selectedListTitle"
						label="Eine Liste auswählen"
						:items="vuetifyItems"
						:return-object="false"
						clearable
					/>
				</v-col>
				<v-col class="selected-import-list">
					<div v-if="selectedList">"{{ selectedList.title }}" geladen</div>
					<div v-if="loadingList">
						<v-progress-circular />
					</div>
					<div v-if="listCreationFailedMessage">
						<v-alert type="error">{{ listCreationFailedMessage }}</v-alert>
					</div>
				</v-col>
			</v-row>

			<v-row class="select-import-submit">
				<v-col>
					<v-btn @click="$emit('submit')">Weiter</v-btn>
				</v-col>
			</v-row>
		</v-container>
	</div>
</template>
