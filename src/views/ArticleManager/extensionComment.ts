import { type Command, mergeAttributes } from "@tiptap/core";
import { v4 as uuid } from "uuid";

import CommentThread from "@/views/ArticleManager/CommentThread.vue";
import popupMark from "@/views/ArticleManager/popupPlugin";

export interface CommentOptions {
	HTMLAttributes: Record<string, any>;
}

export interface CommentWrapperAttributes {
	id: string;
	commentThread: CommentThreadAttributes;
}

export interface CommentThreadAttributes {
	status: "open" | "private";
	comments: Array<{
		date: Date;
		user: string;
		text: string;
	}>;
}

declare module "@tiptap/core" {
	interface Commands {
		comment: {
			/**
			 * Set a mark
			 */
			setComment: (attributes?: { id: string }) => Command;
			/**
			 * Toggle a mark
			 */
			toggleComment: (attributes?: { id: string }) => Command;
			/**
			 * Unset a mark
			 */
			unsetComment: () => Command;
			//showCommentPopUp: (attributes: { id: string, shouldFocus: boolean }) => Command
		};
	}
}

export const Comment = popupMark.extend({
	name: "comment",

	addOptions() {
		return {
			HTMLAttributes: {},
			component: CommentThread,
			tagName: "comment",
		};
	},

	addAttributes() {
		return {
			id: {
				default: null,
				parseHTML: (element) => {
					return {
						id: element.getAttribute("data-id"),
					};
				},
				renderHTML: (attributes) => {
					if (!attributes.id) {
						return {};
					} else {
						return { "data-id": attributes.id };
					}
				},
			},
			commentThread: {
				default: { comments: [], status: "open" },
				parseHTML: (element) => {
					return {
						commentThread: element.getAttribute("data-comment-thread"),
					};
				},
				renderHTML: (attributes) => {
					if (!attributes.commentThread) {
						return {};
					} else {
						return { "data-comment-thread": JSON.stringify(attributes.commentThread) };
					}
				},
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: "comment",
			},
		];
	},

	renderHTML(props) {
		return ["comment", mergeAttributes(this.options.HTMLAttributes, props.HTMLAttributes), 0];
	},

	addCommands() {
		console.warn("This whole module is not working. TODO");
		return {
			setComment:
				(_attributes) =>
				({ commands }) => {
					console.log("new comment");
					return commands.setMark(this.name, { id: uuid() });
				},
			toggleComment:
				(_attributes) =>
				({ commands }) => {
					if (this.editor.isActive(this.name)) {
						return commands.unsetMark(this.name);
					} else {
						const _id = null; // Removed for refactorization. Was `const id = store.article.createCommentThread()` TODO: rm comment
						const command = commands.toggleMark(this.name, { id: uuid() });
						return command;
					}
				},
			unsetComment:
				() =>
				({ commands }) => {
					return commands.unsetMark(this.name);
				},
		};
	},

	// @ts-expect-error Fix later.
	addKeyboardShortcuts() {
		return {
			"Mod-k": () => this.editor.commands.toggleComment(),
		};
	},
});
