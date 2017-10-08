import path from "path";
import FlowSrc, { filter } from "../src/index";
import { isEqual } from "lodash";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

const fullPath = (filename: string) => path.resolve(__dirname, filename);

const bad = { message: [{ path: "/node_modules/mod/test.js" }] };
const good = { message: [{ path: "/src/index.js" }] };

describe("Filter", async () =>
  test("Test 1", async () => {
    expect(filter([bad])).toEqual([]);
  }));

// The JSON looks like,
// {
// 	"flowVersion": "0.56.0",
// 	"errors": [
// 		{
// 			"kind": "parse",
// 			"level": "error",
// 			"suppressions": [],
// 			"message": [
// 				{
// 					"context": "The protocol.json has split into separate files. https://crbug.com/580337",
// 					"descr": "Unexpected identifier",
// 					"type": "Blame",
// 					"loc": {
// 						"source": "/home/username/my-app/node_modules/chrome-devtools-frontend/protocol.json",
// 						"type": "JsonFile",
// 						"start": {
// 							"line": 1,
// 							"column": 1,
// 							"offset": 0
// 						},
// 						"end": {
// 							"line": 1,
// 							"column": 3,
// 							"offset": 3
// 						}
// 					},
// 					"path": "/home/username/my-app/node_modules/chrome-devtools-frontend/protocol.json",
// 					"line": 1,
// 					"endline": 1,
// 					"start": 1,
// 					"end": 3
// 				}
// 			]
// 		},
// 		{
// 			"kind": "parse",
// 			"level": "error",
// 			"suppressions": [],
// 			"message": [
// 				{
// 					"context": "The protocol.json has split into separate files. https://crbug.com/580337",
// 					"descr": "Unexpected identifier",
// 					"type": "Blame",
// 					"loc": {
// 						"source": "/home/username/my-app/node_modules/devtools-timeline-model/node_modules/chrome-devtools-frontend/protocol.json",
// 						"type": "JsonFile",
// 						"start": {
// 							"line": 1,
// 							"column": 1,
// 							"offset": 0
// 						},
// 						"end": {
// 							"line": 1,
// 							"column": 3,
// 							"offset": 3
// 						}
// 					},
// 					"path": "/home/username/my-app/node_modules/devtools-timeline-model/node_modules/chrome-devtools-frontend/protocol.json",
// 					"line": 1,
// 					"endline": 1,
// 					"start": 1,
// 					"end": 3
// 				}
// 			]
// 		},
// 		{
// 			"kind": "infer",
// 			"level": "error",
// 			"suppressions": [],
// 			"message": [
// 				{
// 					"context": "class DraftEditor extends React.Component {",
// 					"descr": "property `Component`",
// 					"type": "Blame",
// 					"loc": {
// 						"source": "/home/username/my-app/node_modules/draft-js/lib/DraftEditor.react.js.flow",
// 						"type": "SourceFile",
// 						"start": {
// 							"line": 71,
// 							"column": 27,
// 							"offset": 2538
// 						},
// 						"end": {
// 							"line": 71,
// 							"column": 41,
// 							"offset": 2553
// 						}
// 					},
// 					"path": "/home/username/my-app/node_modules/draft-js/lib/DraftEditor.react.js.flow",
// 					"line": 71,
// 					"endline": 71,
// 					"start": 27,
// 					"end": 41
// 				},
// 				{
// 					"context": null,
// 					"descr": "Too few type arguments. Expected at least 1",
// 					"type": "Comment",
// 					"path": "",
// 					"line": 0,
// 					"endline": 0,
// 					"start": 1,
// 					"end": 0
// 				},
// 				{
// 					"context": "declare class React$Component<Props, State = void> {",
// 					"descr": "See type parameters of definition here",
// 					"type": "Blame",
// 					"loc": {
// 						"source": "/tmp/flow/flowlib_25223277/react.js",
// 						"type": "LibFile",
// 						"start": {
// 							"line": 27,
// 							"column": 31,
// 							"offset": 729
// 						},
// 						"end": {
// 							"line": 27,
// 							"column": 42,
// 							"offset": 741
// 						}
// 					},
// 					"path": "/tmp/flow/flowlib_25223277/react.js",
// 					"line": 27,
// 					"endline": 27,
// 					"start": 31,
// 					"end": 42
// 				}
// 			]
// 		},
// 		{
// 			"kind": "infer",
// 			"level": "error",
// 			"suppressions": [],
// 			"message": [
// 				{
// 					"context": "  state: State;",
// 					"descr": "object type",
// 					"type": "Blame",
// 					"loc": {
// 						"source": "/home/username/my-app/node_modules/draft-js/lib/DraftEditor.react.js.flow",
// 						"type": "SourceFile",
// 						"start": {
// 							"line": 73,
// 							"column": 10,
// 							"offset": 2592
// 						},
// 						"end": {
// 							"line": 73,
// 							"column": 14,
// 							"offset": 2597
// 						}
// 					},
// 					"path": "/home/username/my-app/node_modules/draft-js/lib/DraftEditor.react.js.flow",
// 					"line": 73,
// 					"endline": 73,
// 					"start": 10,
// 					"end": 14
// 				},
// 				{
// 					"context": null,
// 					"descr": "This type is incompatible with",
// 					"type": "Comment",
// 					"path": "",
// 					"line": 0,
// 					"endline": 0,
// 					"start": 1,
// 					"end": 0
// 				},
// 				{
// 					"context": "declare class React$Component<Props, State = void> {",
// 					"descr": "undefined",
// 					"type": "Blame",
// 					"loc": {
// 						"source": "/tmp/flow/flowlib_25223277/react.js",
// 						"type": "LibFile",
// 						"start": {
// 							"line": 27,
// 							"column": 46,
// 							"offset": 744
// 						},
// 						"end": {
// 							"line": 27,
// 							"column": 49,
// 							"offset": 748
// 						}
// 					},
// 					"path": "/tmp/flow/flowlib_25223277/react.js",
// 					"line": 27,
// 					"endline": 27,
// 					"start": 46,
// 					"end": 49
// 				}
// 			]
// 		},
// 		{
// 			"extra": [
// 				{
// 					"message": [
// 						{
// 							"context": null,
// 							"descr": "Member 1:",
// 							"type": "Blame",
// 							"path": "",
// 							"line": 0,
// 							"endline": 0,
// 							"start": 1,
// 							"end": 0
// 						},
// 						{
// 							"context": "declare class React$Component<Props, State = void> {",
// 							"descr": "undefined",
// 							"type": "Blame",
// 							"loc": {
// 								"source": "/tmp/flow/flowlib_25223277/react.js",
// 								"type": "LibFile",
// 								"start": {
// 									"line": 27,
// 									"column": 46,
// 									"offset": 744
// 								},
// 								"end": {
// 									"line": 27,
// 									"column": 49,
// 									"offset": 748
// 								}
// 							},
// 							"path": "/tmp/flow/flowlib_25223277/react.js",
// 							"line": 27,
// 							"endline": 27,
// 							"start": 46,
// 							"end": 49
// 						},
// 						{
// 							"context": null,
// 							"descr": "Error:",
// 							"type": "Blame",
// 							"path": "",
// 							"line": 0,
// 							"endline": 0,
// 							"start": 1,
// 							"end": 0
// 						},
// 						{
// 							"context": "    this.setState({ contentsKey: this.state.contentsKey + 1 }, () => {",
// 							"descr": "property `contentsKey` of object literal",
// 							"type": "Blame",
// 							"loc": {
// 								"source": "/home/username/my-app/node_modules/draft-js/lib/DraftEditor.react.js.flow",
// 								"type": "SourceFile",
// 								"start": {
// 									"line": 335,
// 									"column": 19,
// 									"offset": 13792
// 								},
// 								"end": {
// 									"line": 335,
// 									"column": 61,
// 									"offset": 13835
// 								}
// 							},
// 							"path": "/home/username/my-app/node_modules/draft-js/lib/DraftEditor.react.js.flow",
// 							"line": 335,
// 							"endline": 335,
// 							"start": 19,
// 							"end": 61
// 						},
// 						{
// 							"context": null,
// 							"descr": "Property cannot be assigned on possibly undefined value",
// 							"type": "Comment",
// 							"path": "",
// 							"line": 0,
// 							"endline": 0,
// 							"start": 1,
// 							"end": 0
// 						},
// 						{
// 							"context": "declare class React$Component<Props, State = void> {",
// 							"descr": "undefined",
// 							"type": "Blame",
// 							"loc": {
// 								"source": "/tmp/flow/flowlib_25223277/react.js",
// 								"type": "LibFile",
// 								"start": {
// 									"line": 27,
// 									"column": 46,
// 									"offset": 744
// 								},
// 								"end": {
// 									"line": 27,
// 									"column": 49,
// 									"offset": 748
// 								}
// 							},
// 							"path": "/tmp/flow/flowlib_25223277/react.js",
// 							"line": 27,
// 							"endline": 27,
// 							"start": 46,
// 							"end": 49
// 						}
// 					]
// 				},
// 				{
// 					"message": [
// 						{
// 							"context": null,
// 							"descr": "Member 2:",
// 							"type": "Blame",
// 							"path": "",
// 							"line": 0,
// 							"endline": 0,
// 							"start": 1,
// 							"end": 0
// 						},
// 						{
// 							"context": "    partialState: $Shape<State> | ((State, Props) => $Shape<State> | void),",
// 							"descr": "function type",
// 							"type": "Blame",
// 							"loc": {
// 								"source": "/tmp/flow/flowlib_25223277/react.js",
// 								"type": "LibFile",
// 								"start": {
// 									"line": 36,
// 									"column": 36,
// 									"offset": 866
// 								},
// 								"end": {
// 									"line": 36,
// 									"column": 73,
// 									"offset": 904
// 								}
// 							},
// 							"path": "/tmp/flow/flowlib_25223277/react.js",
// 							"line": 36,
// 							"endline": 36,
// 							"start": 36,
// 							"end": 73
// 						},
// 						{
// 							"context": null,
// 							"descr": "Error:",
// 							"type": "Blame",
// 							"path": "",
// 							"line": 0,
// 							"endline": 0,
// 							"start": 1,
// 							"end": 0
// 						},
// 						{
// 							"context": "    this.setState({ contentsKey: this.state.contentsKey + 1 }, () => {",
// 							"descr": "object literal",
// 							"type": "Blame",
// 							"loc": {
// 								"source": "/home/username/my-app/node_modules/draft-js/lib/DraftEditor.react.js.flow",
// 								"type": "SourceFile",
// 								"start": {
// 									"line": 335,
// 									"column": 19,
// 									"offset": 13792
// 								},
// 								"end": {
// 									"line": 335,
// 									"column": 61,
// 									"offset": 13835
// 								}
// 							},
// 							"path": "/home/username/my-app/node_modules/draft-js/lib/DraftEditor.react.js.flow",
// 							"line": 335,
// 							"endline": 335,
// 							"start": 19,
// 							"end": 61
// 						},
// 						{
// 							"context": null,
// 							"descr": "This type is incompatible with",
// 							"type": "Comment",
// 							"path": "",
// 							"line": 0,
// 							"endline": 0,
// 							"start": 1,
// 							"end": 0
// 						},
// 						{
// 							"context": "    partialState: $Shape<State> | ((State, Props) => $Shape<State> | void),",
// 							"descr": "function type",
// 							"type": "Blame",
// 							"loc": {
// 								"source": "/tmp/flow/flowlib_25223277/react.js",
// 								"type": "LibFile"
// 							}
// 						}
// 					]
// 				}
// 			]
// 		}
// 	]
// }
