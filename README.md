<p align="center"><img src="https://github.com/swiftype/swiftype-app-search-javascript/blob/master/logo-app-search.png?raw=true" alt="Elastic App Search Logo"></p>

> **⚠️ This repository is deprecated ⚠️**
>
> **Please visit [https://github.com/elastic/app-search-javascript](https://github.com/elastic/app-search-javascript) for the up to date version. Thank you! - Elastic**

<p align="center"><a href="https://circleci.com/gh/swiftype/swiftype-app-search-javascript"><img src="https://circleci.com/gh/swiftype/swiftype-app-search-javascript.svg?style=svg" alt="CircleCI buidl"></a>
<a href="https://github.com/swiftype/swiftype-app-search-javascript/releases"><img src="https://img.shields.io/github/release/swiftype/swiftype-app-search-javascript/all.svg?style=flat-square" alt="GitHub release" /></a></p>

> A first-party JavaScript client for building excellent, relevant search experiences with [Elastic App Search](https://www.elastic.co/cloud/app-search-service).

## Contents

- [Getting started](#getting-started-)
- [Browser support](#browser-support)
- [Usage](#usage)
- [Running tests](#running-tests)
- [Development](#development)
- [FAQ](#faq-)
- [Contribute](#contribute-)
- [License](#license-)

---

## Getting started 🐣

### Install from a CDN

The easiest way to install this client is to simply include the built distribution from the [jsDelivr](https://www.jsdelivr.com/) CDN.

```html
<script src="https://cdn.jsdelivr.net/npm/swiftype-app-search-javascript@2.4.0/dist/swiftype_app_search.umd.js"></script>
```

This will make the client available globally at:

```javascript
window.SwiftypeAppSearch;
```

### Install from NPM

This package can also be installed with `npm` or `yarn`.

```
npm install --save swiftype-app-search-javascript
```

The client could then be included into your project like follows:

```javascript
// CommonJS
var SwiftypeAppSearch = require("swiftype-app-search-javascript");

// ES
import * as SwiftypeAppSearch from "swiftype-app-search-javascript";
```

## Browser support

The client is compatible with all modern browsers.

Note that this library depends on the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_AP).

This is not supported by Internet Explorer. If you need backwards compatibility
for Internet Explorer, you'll need to polyfill the Fetch API with something
like https://github.com/github/fetch.

## Usage

### Setup: Configuring the client and authentication

Using this client assumes that you have already created an [App Search](https://swiftype.com/app-search) account, and subsequently created an Engine. You'll need to configure the client with the name of your Engine and your authentication credentials, which can be found here: https://app.swiftype.com/as/credentials.

```javascript
var client = SwiftypeAppSearch.createClient({
  hostIdentifier: "host-c5s2mj",
  searchKey: "search-mu75psc5egt9ppzuycnc2mc3",
  engineName: "favorite-videos"
});
```

\* Please note that you should only ever use a **Public Search Key** within Javascript code on the browser. By default, your account should have a Key prefixed with `search-` that is read-only. More information can be found in the [documentation](https://swiftype.com/documentation/app-search/credentials).

List of configuration options:

| Option            | Required | Description                                                                                                                                                                            |
| ----------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hostIdentifier    | No       | Your **Host Identifier**, should start with `host-`. Required unless explicitly setting `endpointBase`                                                                                 |
| searchKey         | Yes      | Your **Public Search Key**. It should start with `search-`.                                                                                                                            |
| engineName        | Yes      |                                                                                                                                                                                        |
| endpointBase      | No       | Overrides the base of the Swiftype API endpoint completely. Useful when proxying the Swiftype API, developing against a local server, or a Managed Deploy. Ex. "http://localhost:3002" |
| cacheResponses    | No       | Whether or not API responses should be cached. Default: `true`.                                                                                                                        |
| additionalHeaders | No       | An Object with keys and values that will be converted to header names and values on all API requests                                                                                   |

### Using with App Search Managed Deploys

The client can be configured to use a managed deploy by using the
`endpointBase` parameter. Since managed deploys do not rely on a `hostIdentifier`
, it can be omitted.

```javascript
var client = SwiftypeAppSearch.createClient({
  searchKey: "search-mu75psc5egt9ppzuycnc2mc3",
  endpointBase: "http://127.0.0.1:3002",
  engineName: "favorite-videos"
});
```

### API Methods

This client is a thin interface to the Swiftype App Search API. Additional details for requests and responses can be
found in the [documentation](https://swiftype.com/documentation/app-search).

#### Searching

For the query term `lion`, a search call is constructed as follows:

```javascript
var options = {
  search_fields: { title: {} },
  result_fields: { id: { raw: {} }, title: { raw: {} } }
};

client
  .search("lion", options)
  .then(resultList => {
    resultList.results.forEach(result => {
      console.log(`id: ${result.getRaw("id")} raw: ${result.getRaw("title")}`);
    });
  })
  .catch(error => {
    console.log(`error: ${error}`);
  });
```

Note that `options` supports all options listed here: https://swiftype.com/documentation/app-search/guides/search.

In addition to the supported options above, we also support the following fields:

| Name                           | Type          | Description                                                                                                                                                                                                                                                                                                   |
| ------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| disjunctiveFacets              | Array[String] | An array of field names. Every field listed here must also be provided as a facet in the `facet` field. It denotes that a facet should be considered disjunctive. When returning counts for disjunctive facets, the counts will be returned as if no filter is applied on this field, even if one is applied. |
| disjunctiveFacetsAnalyticsTags | Array[String] | Used in conjunction with the `disjunctiveFacets` parameter. Queries will be tagged with "Facet-Only" in the Analytics Dashboard unless specified here.                                                                                                                                                        |

_Response_

The search method returns the response wrapped in a `ResultList` type:

```javascript
ResultList {
  rawResults: [], // List of raw `results` from JSON response
  rawInfo: { // Object wrapping the raw `meta` property from JSON response
    meta: {}
  },
  results: [ResultItem], // List of `results` wrapped in `ResultItem` type
  info: { // Currently the same as `rawInfo`
    meta: {}
  }
}

ResultItem {
  getRaw(fieldName), // Returns the HTML-unsafe raw value for a field, if it exists
  getSnippet(fieldName) // Returns the HTML-safe snippet value for a field, if it exists
}
```

#### Query Suggestion

```javascript
var options = {
  size: 3,
  types: {
    documents: {
      fields: ["name"]
    }
  }
};

client
  .querySuggestion("cat", {
    size: 3,
    types: {
      documents: {
        fields: ["name"]
      }
    }
  })
  .then(response => {
    response.results.documents.forEach(document => {
      console.log(document.suggestion);
    });
  })
  .catch(error => {
    console.log(`error: ${error}`);
  });
```

#### Multi Search

It is possible to run multiple queries at once using the `multiSearch` method.

To search for the term `lion` and `tiger`, a search call is constructed as follows:

```javascript
var options = {
  search_fields: { name: {} },
  result_fields: { id: { raw: {} }, title: { raw: {} } }
};

client
  .multiSearch([{ query: "node", options }, { query: "java", options }])
  .then(allResults => {
    allResults.forEach(resultList => {
      resultList.results.forEach(result => {
        console.log(
          `id: ${result.getRaw("id")} raw: ${result.getRaw("title")}`
        );
      });
    });
  })
  .catch(error => {
    console.log(`error: ${error}`);
  });
```

#### Clickthrough Tracking

```javascript
client
  .click({
    query: "lion",
    documentId: "1234567",
    requestId: "8b55561954484f13d872728f849ffd22",
    tags: ["Animal"]
  })
  .catch(error => {
    console.log(`error: ${error}`);
  });
```

Clickthroughs can be tracked by binding `client.click` calls to click events on individual search result links.

The following example shows how this can be implemented declaratively by annotating links with class and data attributes.

```javascript
document.addEventListener("click", function(e) {
  const el = e.target;
  if (!el.classList.contains("track-click")) return;

  client.click({
    query: el.getAttribute("data-query"),
    documentId: el.getAttribute("data-document-id"),
    requestId: el.getAttribute("data-request-id"),
    tags: [el.getAttribute("data-tag")]
  });
});
```

```html
<a href="/items/1234567"
    class="track-click"
    data-request-id="8b55561954484f13d872728f849ffd22"
    data-document-id="1234567"
    data-query="lion"
    data-tag="Animal">
  Item 1
</a>
```

## Running tests

The specs in this project use [node-replay](https://github.com/assaf/node-replay) to capture responses.

The responses are then checked against Jest snapshots.

To capture new responses and update snapshots, run:

```
nvm use
REPLAY=record yarn test -u
```

To run tests:

```
nvm use
yarn test
```

## Development

### Node

You will probably want to install a node version manager, like nvm.

We depend upon the version of node defined in [.nvmrc](.nvmrc).

To install and use the correct node version with nvm:

```
nvm install
```

### Dev Server

Install dependencies:

```
yarn
```

Run dev server:

```
yarn dev
```

### Build

```
nvm use
yarn build
```

### Publish

```
nvm use
yarn publish
```

## FAQ 🔮

### What if I need write operations?

App Search has a first-party [Node.js](https://github.com/swiftype/swiftype-app-search-node) client which supports write operations like indexing.

### Where do I report issues with the client?

If something is not working as expected, please open an [issue](https://github.com/swiftype/swiftype-app-search-javascript/issues/new).

### Where can I learn more about App Search?

Your best bet is to read the [documentation](https://swiftype.com/documentation/app-search).

### Where else can I go to get help?

You can checkout the [Elastic App Search community discuss forums](https://discuss.elastic.co/c/app-search).

## Contribute 🚀

We welcome contributors to the project. Before you begin, a couple notes...

- Prior to opening a pull request, please create an issue to [discuss the scope of your proposal](https://github.com/swiftype/swiftype-app-search-javascript/issues).
- Please write simple code and concise documentation, when appropriate.

## License 📗

[MIT](https://github.com/swiftype/swiftype-app-search-javascript/blob/master/LICENSE) © [Elastic](https://github.com/elastic)

Thank you to all the [contributors](https://github.com/swiftype/swiftype-app-search-javascript/graphs/contributors)!
