import assert from "node:assert/strict";
import { describe, it } from "node:test";

import request from "supertest";

import { server } from "../server";
import {
	type ZoteroItemPatchInput,
	type ZoteroItemPostInput,
	type ZoteroItemPutInput,
} from "./zotero.schema";

describe("GET /zotero/items", () => {
	it("should respond with zotero items", () => {
		const query = "Testtitel";
		return request(server).get(`/zotero/items?query=${query}`).expect(200);
	});
});

describe("GET /zotero/items/:id", () => {
	it("should respond with zotero item", () => {
		const id = "ZSRWJPWF";
		return request(server)
			.get(`/zotero/items/${id}`)
			.expect(200, { data: { key: id, title: "Testtitel" } });
	});
});

describe("PATCH /zotero/items/:id", () => {
	it("should respond with updated zotero item version number", () => {
		const id = "ZSRWJPWF";
		const data: ZoteroItemPatchInput = {};
		return request(server).patch(`/zotero/items/${id}`).send(data).expect(200);
	});
});

describe("PUT /zotero/items/:id", () => {
	it("should respond with updated zotero item", () => {
		const id = "ZSRWJPWF";
		const data: ZoteroItemPutInput = {};
		return request(server).put(`/zotero/items/${id}`).send(data).expect(200);
	});
});

describe("POST /zotero/items", () => {
	it("should respond with created zotero item", () => {
		const data: ZoteroItemPostInput = {};
		return request(server).post("/zotero/items").send(data).expect(200);
	});
});

describe("GET /zotero/item-types", () => {
	it("should respond with item types", () => {
		return request(server).get("/zotero/item-types").expect(200);
	});
});
