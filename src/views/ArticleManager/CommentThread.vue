<template>
	<div style="width: 300px">
		<v-overlay
			v-if="showOverlay"
			opacity=".9"
			style="border-radius: 11px"
			color="background darken-1"
		>
			<v-btn elevation="0" class="mb-1 rounded-lg" block color="red" @click="removeComment">
				Kommentar entfernen
			</v-btn>
			<v-btn
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
				<v-icon v-if="commentThread.status === 'private'" left>mdi-check</v-icon>
				Als “Privat” markieren
			</v-btn>
			<v-btn block outlined class="rounded-lg" color="grey" @click="showOverlay = false">
				Abbrechen
			</v-btn>
		</v-overlay>
		<div v-if="showHeader && commentThread != null" class="d-flex flex-row align-self-stretch">
			<v-btn icon tile class="rounded-lg" disabled small></v-btn>
			<div class="text-center muted caption mb-1 flex-grow-1 align-self-end">Kommentar</div>
			<v-btn icon tile class="rounded-lg" small @click="showOverlay = true">
				<v-icon v-if="commentThread.status === 'open'">mdi-dots-horizontal</v-icon>
				<v-icon v-else-if="commentThread.status === 'private'" small>mdi-lock</v-icon>
			</v-btn>
		</div>
		<div
			v-if="commentThread != null"
			ref="threadContainer"
			:class="['thread-container', scrollable && 'scrollable']"
		>
			<div v-for="(comment, i) in commentThread.comments" :key="i" class="comment-container">
				<div class="comment-header caption d-flex row no-gutters muted px-2 mt-1">
					<span class="comment-user-name">{{ comment.user }}</span>
					<v-spacer />
					{{ formatTimeDistance(comment.date.toString()) }}
				</div>
				<div class="px-2">
					{{ comment.text }}
				</div>
				<v-divider
					v-if="commentThread != null && i !== commentThread.comments.length - 1"
					class="mt-2"
				/>
			</div>
		</div>
		<v-divider v-if="commentThread != null && commentThread.comments.length > 0" class="my-2" />
		<text-field
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
				<v-btn small class="rounded-lg mt-1 mr-0" icon tile text @click="toggleEmojiPicker">
					<v-icon :color="shouldShowEmojiPicker ? 'primary' : ''" small>
						mdi-emoticon-outline
					</v-icon>
				</v-btn>
			</template>
			<v-btn class="rounded-lg" icon tile text @click="appendComment">
				<v-icon small>mdi-send</v-icon>
			</v-btn>
		</text-field>
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

<script lang="ts">
import { type Editor } from "@tiptap/vue-2";
// eslint-disable-next-line import/no-duplicates
import { formatDistanceToNow } from "date-fns";
// eslint-disable-next-line import/no-duplicates
import { de } from "date-fns/locale";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

import { emoji } from "@/service/emoji";
import store from "@/store";
import { type CommentThreadAttributes } from "@/views/ArticleManager/extensionComment";
import TextField from "@/views/lib/TextField.vue";

@Component({
	components: {
		TextField,
	},
})
export default class CommentThread extends Vue {
	@Prop({ default: null }) id!: string | null;
	@Prop({ default: null }) commentThread!: CommentThreadAttributes | null;
	@Prop({ default: true }) scrollable!: boolean;
	@Prop({ default: true }) showHeader!: boolean;
	@Prop({ required: true }) editor!: Editor;

	newMessage = "";
	store = store;
	groups = emoji.groups;
	shouldShowEmojiPicker = false;
	lastCaretPos = 0;
	showOverlay = false;

	get comment() {
		console.warn("not implemented TODO");
		return undefined;
		// if (this.id !== null) {
		//   return this.store.article.getThread(this.id)
		// }
	}

	get userName() {
		return this.store.user.getFullName();
	}

	storeLastCaretPos(e: Event) {
		if (e.target instanceof HTMLTextAreaElement) {
			this.lastCaretPos = e.target.selectionStart;
		}
	}

	insertEmoji(pos: number, emoji: string) {
		this.newMessage = [this.newMessage.slice(0, pos), emoji, this.newMessage.slice(pos)].join("");
	}

	toggleStatus() {
		if (this.commentThread != null) {
			if (this.commentThread.status === "open") {
				this.commentThread.status = "private";
			} else {
				this.commentThread.status = "open";
			}
		}
	}

	removeComment() {
		this.editor.commands.unsetMark("comment");
		this.editor.commands.focus();
	}

	async appendComment() {
		if (this.commentThread) {
			this.commentThread.comments.push({
				text: this.newMessage,
				date: new Date(),
				user: this.userName,
			});
			this.newMessage = "";
			await this.repositionTooltip();
			this.scrollToBottom();
		}
		// this.shouldShowEmojiPicker = false
		// if (this.id !== null) {
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

	toggleEmojiPicker() {
		this.shouldShowEmojiPicker = !this.shouldShowEmojiPicker;
	}

	toEmoji(s: number | string): string {
		if (typeof s === "string") {
			const nums = s.split("_").map((val) => parseInt(val, 16));

			return String.fromCodePoint.apply(String, nums);
		} else {
			return "";
		}
	}

	async repositionTooltip() {
		await this.$nextTick();
		// trigger resize to reposition the tooltip.
		window.dispatchEvent(new Event("resize"));
	}

	async scrollToBottom() {
		await this.$nextTick();
		const el = this.$refs.threadContainer;
		if (el instanceof HTMLElement) {
			el.scrollTo({
				top: el.scrollHeight,
				behavior: "smooth",
			});
		}
	}

	@Watch("id")
	onChangeThreadId() {
		this.scrollToBottom();
		this.showOverlay = false;
	}

	mounted() {
		console.log("mounted", this.id);
	}

	get thread() {
		console.warn("this is also ot implemented. TODO");
		return undefined;
		// if (this.id !== null) {
		//   return this.store.article.getThread(this.id)
		// }
	}

	formatTimeDistance(d: string | undefined): string {
		if (d !== undefined) {
			return `${formatDistanceToNow(new Date(d), { locale: de, addSuffix: true })}`;
		} else {
			return "";
		}
	}
}
</script>

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
