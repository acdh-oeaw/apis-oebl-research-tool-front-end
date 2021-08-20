# IRS

## Integriertes Redaktionssystem

The IRS is meant as a system for computer-aided research and data acquisition, project tracking and collaborative scientific writing. The application consists of three main parts:

### 1. The Research Tool

*Lemmas* (specifically persons of historical interest) can be entered manually or batch-imported (from XLSs or CSVs) into the Research Tool. The Research Tool will then try to find the Lemma’s GND (its norm-data Identifier). Once found, it triggers an asynchronous scrape job on the server that tries to find additional information on the subject in various catalogues and databases. This information is then displayed under "Externe Ressourcen". If a GND could not be found automatically, it can be selected manually. All Lemmas can be organized into lists/folders (displayed in the left hand side bar) via drag-and-drop. They can be searched and filtered by all attributes.

![research-tool](screenshots/research-tool.png)

### 2. The Issue Manager

Once a Lemma is selected for publication, it can be added to an *Issue* (”Abgabe”). Inside the Issue/Abgabe, an *Article*’s status can change by moving it from column to column. The natural progression of an Article over time would be left-to-right. Tags can be used to categorize the Articles further and to add important organizational details (such as the payment status, whether the Article is delayed, etc.). In the Issue Manager, the Articles are assigned to Editors and Authors, and the progress is tracked.

![issue-manager](screenshots/issue-manager.png)

### 3. The Article Editor

The Article editor is specifically designed for writing, editing and annotating scientific texts. There are three main types of annotations:

- *Comments* (or rather, Comment Threads). Similar to Microsoft Word or Apple Pages.
- *Citations*. Linked to a Zotero Item.
- *Named Entities*. People, places, artifacts, etc. As a basic type, they can have a Relation Type, a Duration and the actual Entity.

The data for *Citations* and for *Named Entities* is stored directly in the document tree, whereas the comments are only referenced with a UUID with their content stored separately on the server.

An Article (document) can currently contain several types of nodes / blocks:

- a text paragraph.
- a first or second order heading.
- an image, inserted via drag and drop or a menu action.
- an audio file, inserted via drag and drop or a menu action.

![editor](screenshots/editor.png)

## Development

### Basics

The application uses Vue 2.x with Vuetify 2.x as a UI component library, and uses custom UI Elements only if necessary (see [src/views/lib](src/views/lib)). All components are written in Typescript with the Class Component Decorators for more idiomatic structure. Tests are run with Cypress. The color scheme of the application is defined in [src/plugins/vuetify.ts](src/plugins/vuetify.ts)

### Hosting

The SPA is served through an Node.js based Express server, serving the static files (see [server/index.ts](server/index.ts)). The built-in server also performs other (minor) duties (i. e. Zotero response caching and an providing the ”Event Bus” — see below).

### REST API calls / RPC

The Back End provides an OpenAPI (née Swagger) spec. By calling `npm run get-api-types` the spec is downloaded and transformed into a statically typed TS API client. All calls to the Back End are then made through this API client. The auto-generated types are also used extensively throughout the code base.

### State Management

The application state is not stored inside a traditional Vuex State Container, but instead in bare Typescript classes located in [src/store](src/store). Their instance methods are used to mutate their state. They also subscribe to remote changes and emit events, as described below.

Currently, all Lemmas are stored, searched and filtered on the client in an IndexedDB table (called `LemmaDb`). On start-up, we fetch the updates, inserts and deletions from the server, and update the local database accordingly (all of this happens in the lemma class / store).

### Real-Time Synchronization

Clients keep each other up to date by connecting to a remote ”Event Bus” (a WebSocket server), provided by the built-in Node.js server (see [/server](/server/index.ts)). Clients receive Events when the data is changed by another. The Back End can also send specific types of Events by `POST`ing to paths starting with `/message` — for instance when a Lemma’s scrape data is updated by the server. This only works if a secret key is provided in the request header. All `NotifyEvents` are strictly typed and thus conveniently enumerated in [src/service/notify](src/service/notify/notify.ts)`.

### Zotero data caching

Upon initialization the built in server starts caching responses from the Zotero API that rarely change (specifically the `ItemTypeFields` for every type of publication).

### Editor

The Editor component makes heavy use of [ProseMirror](https://prosemirror.net)’s API, data structures and nomenclature both via [TipTap 2](https://tiptap.dev) and directly. Familiarity with the respective APIs is probably necessary for productive development.

## Road Map

- [ ] Use Tokens for authentication instead of HTTP Basic Auth in the header. (Must be coordinated with the Back End)
- [ ] Integrate the Editor with the Back End
  - [ ] Save Article (XML)
  - [ ] Load Article (XML)
  - [ ] Comments Store
  - [ ] Don’t Get Entities from Lobid, but from APIS.
  - [ ] Run automatic Named Entity Recognition via a Spacey Instance.
  - [ ] Browse previous versions of the Article. (Possibly display diff?)
- [ ] Actually upload "Dateien" in the Research Tool Component
- [ ] Ability to add (Zotero) literature to a Lemma in the Research Tool Component.
- [ ] Create a specialized UI just for Authors, where they can only see and edit their own assigned Articles.
- [ ] Display legacy publication data from Gideon.

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run dev
```

### Compiles and minifies for production

```
npm run build
```

### Run e2e tests

```
npm run test
```

### Lints and fixes files

```
npm run lint
```

### Start the server for production

```
npm run start
```

