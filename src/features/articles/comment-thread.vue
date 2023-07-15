<script lang="ts" setup>
import { type Editor } from "@tiptap/vue-2";
import { computed, nextTick, ref, watch } from "vue";

import { type CommentThreadAttributes } from "@/features/articles/extension-comment";
import TextField from "@/features/ui/text-field.vue";
import { getRelativeTime } from "@/lib/get-relative-time";
import { emoji } from "@/service/emoji";
import store from "@/store";

const props = withDefaults(
	defineProps<{
		id: string | null;
		commentThread: CommentThreadAttributes | null;
		scrollable: boolean;
		showHeader: boolean;
		editor: Editor;
	}>(),
	{
		scrollable: true,
		showHeader: true,
	},
);

const newMessage = ref("");
const groups = ref(emoji.groups);
const shouldShowEmojiPicker = ref(false);
const lastCaretPos = ref(0);
const showOverlay = ref(false);
const threadContainer = ref<HTMLElement | null>(null);

const comment = computed(() => {
	console.warn("not implemented TODO");
	return undefined;
});

const userName = computed(() => {
	return store.user.getFullName();
});

function storeLastCaretPos(e: Event) {
	if (e.target instanceof HTMLTextAreaElement) {
		lastCaretPos.value = e.target.selectionStart;
	}
}

function insertEmoji(pos: number, emoji: string) {
	newMessage.value = [newMessage.value.slice(0, pos), emoji, newMessage.value.slice(pos)].join("");
}

function toggleStatus() {
	if (props.commentThread != null) {
		if (props.commentThread.status === "open") {
			props.commentThread.status = "private";
		} else {
			props.commentThread.status = "open";
		}
	}
}

function removeComment() {
	props.editor.commands.unsetMark("comment");
	props.editor.commands.focus();
}

async function appendComment() {
	if (props.commentThread) {
		props.commentThread.comments.push({
			text: newMessage.value,
			date: new Date(),
			user: userName.value,
		});

		newMessage.value = "";
		await repositionTooltip();
		scrollToBottom();
	}
	// this.shouldShowEmojiPicker = false
	// if (this.id != null) {
	//   this.store.article.addComment(this.id, {
	//     commentId: uuid(),
	//     date: new Date(),
	//     user: 4,
	//     text: this.newMessage
	//   })
	//   this.newMessage = ''
	//   await this.repositionTooltip()
	//   this.scrollToBottom()
	// } else {
	//   throw new Error('Can’t append comment. No Thread Id given.')
	// }
}

function toggleEmojiPicker() {
	shouldShowEmojiPicker.value = !shouldShowEmojiPicker.value;
}

function toEmoji(s: number | string): string {
	if (typeof s === "string") {
		const nums = s.split("_").map((val) => parseInt(val, 16));

		return String.fromCodePoint.apply(String, nums);
	} else {
		return "";
	}
}

async function repositionTooltip() {
	await nextTick();

	// trigger resize to reposition the tooltip.
	window.dispatchEvent(new Event("resize"));
}

async function scrollToBottom() {
	await nextTick();

	const el = threadContainer.value;
	if (el instanceof HTMLElement) {
		el.scrollTo({
			top: el.scrollHeight,
			behavior: "smooth",
		});
	}
}

watch(
	() => props.id,
	() => {
		scrollToBottom();
		showOverlay.value = false;
	},
);

const thread = computed(() => {
	console.warn("this is also not implemented. TODO");
	return undefined;
});

function formatTimeDistance(d: string | undefined): string {
	if (d != null) {
		return `${getRelativeTime(d)}`;
	} else {
		return "";
	}
}
</script>

<template>
	<div style="width: 300px">
		<VOverlay
			v-if="showOverlay"
			opacity=".9"
			style="border-radius: 11px"
			color="background darken-1"
		>
			<VBtn elevation="0" class="mb-1 rounded-lg" block color="red" @click="removeComment">
				Kommentar entfernen
			</VBtn>
			<VBtn
				v-if="commentThread != null"
				block
				outlined
				class="mb-1 rounded-lg"
				color="grey"
				@click="
					toggleStatus();
					showOverlay = false;
				"
			>
				<VIcon v-if="commentThread.status === 'private'" left>mdi-check</VIcon>
				Als “Privat” markieren
			</VBtn>
			<VBtn block outlined class="rounded-lg" color="grey" @click="showOverlay = false">
				Abbrechen
			</VBtn>
		</VOverlay>

		<div v-if="showHeader && commentThread != null" class="d-flex flex-row align-self-stretch">
			<VBtn icon tile class="rounded-lg" disabled small></VBtn>
			<div class="text-center muted caption mb-1 flex-grow-1 align-self-end">Kommentar</div>
			<VBtn icon tile class="rounded-lg" small @click="showOverlay = true">
				<VIcon v-if="commentThread.status === 'open'">mdi-dots-horizontal</VIcon>
				<VIcon v-else-if="commentThread.status === 'private'" small>mdi-lock</VIcon>
			</VBtn>
		</div>

		<div
			v-if="commentThread != null"
			ref="threadContainer"
			:class="['thread-container', scrollable && 'scrollable']"
		>
			<div v-for="(comment, i) in commentThread.comments" :key="i" class="comment-container">
				<div class="comment-header caption d-flex row no-gutters muted px-2 mt-1">
					<span class="comment-user-name">{{ comment.user }}</span>
					<VSpacer />
					{{ formatTimeDistance(comment.date.toString()) }}
				</div>
				<div class="px-2">
					{{ comment.text }}
				</div>
				<VDivider
					v-if="commentThread != null && i !== commentThread.comments.length - 1"
					class="mt-2"
				/>
			</div>
		</div>

		<VDivider v-if="commentThread != null && commentThread.comments.length > 0" class="my-2" />

		<TextField
			v-if="commentThread != null"
			v-model="newMessage"
			class="py-0 pl-1 pr-1 mt-1 mb-0"
			:style="{ background: 'rgba(0,0,0,.05) !important' }"
			placeholder="Kommentar hinzufügen …"
			@keydown.enter.native="appendComment"
			@keyup.native="storeLastCaretPos"
			@mouseup.native="storeLastCaretPos"
		>
			<template #prepend>
				<VBtn small class="rounded-lg mt-1 mr-0" icon tile text @click="toggleEmojiPicker">
					<VIcon :color="shouldShowEmojiPicker ? 'primary' : ''" small>mdi-emoticon-outline</VIcon>
				</VBtn>
			</template>
			<VBtn class="rounded-lg" icon tile text @click="appendComment">
				<VIcon small>mdi-send</VIcon>
			</VBtn>
		</TextField>

		<div v-if="shouldShowEmojiPicker" class="emoji-picker scrollable">
			<span v-for="(group, i) in groups" :key="i">
				<div class="emoji-group caption pl-2">
					<span class="muted">{{ group.group }}</span>
				</div>
				<span v-for="(subgroup, i) in group.subgroups" :key="'sg' + i">
					<!-- FIXME: a11y -->
					<!-- eslint-disable vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
					<span
						v-for="(emoji, i) in subgroup.emojis"
						:key="'em' + i"
						class="emoji"
						@click="
							insertEmoji(
								lastCaretPos,
								toEmoji(
									// @ts-expect-error
									emoji[0],
								),
							)
						"
					>
						<!-- @vue-expect-error -->
						{{ toEmoji(emoji[0]) }}
					</span>
					<!-- eslint-enable vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
				</span>
			</span>
		</div>
	</div>
</template>

<style scoped>
.scrollable {
	overflow: auto;
	max-height: 300px;
}

.emoji-picker {
	max-height: 200px;
}

.emoji-picker .emoji {
	display: inline-block;
	width: 39px;
	font-size: 1.6em;
	text-align: center;
	cursor: pointer;
}

.emoji-group {
	position: sticky;
	top: 0;
	left: 0;
	z-index: 1;
	background: var(--v-background-base);
}

.comment-user-name {
	font-weight: 700;
}
</style>
