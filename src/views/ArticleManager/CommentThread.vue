<template>
	<div style="width: 300px">
		<v-overlay
			v-if="showOverlay"
			opacity=".9"
			style="border-radius: 11px"
			color="background darken-1"
		>
			<v-btn @click="removeComment" elevation="0" class="mb-1 rounded-lg" block color="red">
				Kommentar entfernen
			</v-btn>
			<v-btn
				v-if="commentThread !== undefined"
				block
				@click="
					toggleStatus();
					showOverlay = false;
				"
				outlined
				class="mb-1 rounded-lg"
				color="grey"
			>
				<v-icon left v-if="commentThread.status === 'private'">mdi-check</v-icon>
				Als “Privat” markieren
			</v-btn>
			<v-btn block @click="showOverlay = false" outlined class="rounded-lg" color="grey">
				Abbrechen
			</v-btn>
		</v-overlay>
		<div
			v-if="showHeader && commentThread !== undefined"
			class="d-flex flex-row align-self-stretch"
		>
			<v-btn icon tile class="rounded-lg" disabled small></v-btn>
			<div class="text-center muted caption mb-1 flex-grow-1 align-self-end">Kommentar</div>
			<v-btn @click="showOverlay = true" icon tile class="rounded-lg" small>
				<v-icon v-if="commentThread.status === 'open'">mdi-dots-horizontal</v-icon>
				<v-icon small v-else-if="commentThread.status === 'private'">mdi-lock</v-icon>
			</v-btn>
		</div>
		<div
			v-if="commentThread !== undefined"
			ref="threadContainer"
			:class="['thread-container', scrollable && 'scrollable']"
		>
			<div
				class="comment-container"
				v-for="(comment, i) in commentThread.comments"
				:key="comment.commentId"
			>
				<div class="comment-header caption d-flex row no-gutters muted px-2 mt-1">
					<span class="comment-user-name">{{ comment.user }}</span>
					<v-spacer />
					{{ formatTimeDistance(comment.date.toString()) }}
				</div>
				<div class="px-2">
					{{ comment.text }}
				</div>
				<v-divider
					class="mt-2"
					v-if="commentThread !== undefined && i !== commentThread.comments.length - 1"
				/>
			</div>
		</div>
		<v-divider
			v-if="commentThread !== undefined && commentThread.comments.length > 0"
			class="my-2"
		/>
		<text-field
			v-if="commentThread !== undefined"
			v-model="newMessage"
			@keydown.enter.native="appendComment"
			@keyup.native="storeLastCaretPos"
			@mouseup.native="storeLastCaretPos"
			class="py-0 pl-1 pr-1 mt-1 mb-0"
			:style="{ background: 'rgba(0,0,0,.05) !important' }"
			placeholder="Kommentar hinzufügen …"
		>
			<template v-slot:prepend>
				<v-btn small class="rounded-lg mt-1 mr-0" @click="toggleEmojiPicker" icon tile text>
					<v-icon :color="shouldShowEmojiPicker ? 'primary' : ''" small>
						mdi-emoticon-outline
					</v-icon>
				</v-btn>
			</template>
			<v-btn class="rounded-lg" @click="appendComment" icon tile text>
				<v-icon small>mdi-send</v-icon>
			</v-btn>
		</text-field>
		<div class="emoji-picker scrollable" v-if="shouldShowEmojiPicker">
			<span v-for="(group, i) in groups" :key="i">
				<div class="emoji-group caption pl-2">
					<span class="muted">{{ group.group }}</span>
				</div>
				<span v-for="(subgroup, i) in group.subgroups" :key="'sg' + i">
					<span
						class="emoji"
						@click="insertEmoji(lastCaretPos, toEmoji(emoji[0]))"
						v-for="(emoji, i) in subgroup.emojis"
						:key="'em' + i"
					>
						{{ toEmoji(emoji[0]) }}
					</span>
				</span>
			</span>
		</div>
	</div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import TextField from "../lib/TextField.vue";
import store from "@/store";
import formatDistanceToNow from "date-fns/esm/formatDistanceToNow";
import de from "date-fns/esm/locale/de";
import { v4 as uuid } from "uuid";
import { emoji } from "@/service/emoji";
import { Editor } from "@tiptap/vue-2";
import { CommentThreadAttributes } from "./extensionComment";

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
		if (this.commentThread !== undefined && this.commentThread !== null) {
			if (this.commentThread?.status === "open") {
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

	toEmoji(s: string | number): string {
		if (typeof s === "string") {
			const nums = s.split("_").map((val) => parseInt(val, 16));
			// eslint-disable-next-line prefer-spread
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
<style lang="stylus" scoped>
.scrollable
  max-height 300px
  overflow auto

.emoji-picker
  max-height 200px

.emoji-picker .emoji
  font-size: 1.6em;
  cursor: pointer;
  width: 39px;
  display: inline-block;
  text-align: center;
.emoji-group
  position sticky
  top 0
  left 0
  background var(--v-background-base)
  z-index 1

.comment-user-name
  font-weight:bold
</style>
