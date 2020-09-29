# Flow + Immer Bug

When trying to type annotate an Immer [curried producer](https://immerjs.github.io/immer/docs/curried-produce) using an imported type, Flow seems to use the wrong type signature and report an error:

```
Property someKey is missing in function [1] but exists in SomeTypeImported [2]. [prop-missing]

 [1] 10│ const handler = (draft, action) => draft;
     11│ const initialState = {
     12│   someKey: 1
     13│ };
     14│
     15│ const reducer = produce<SomeType, *>(handler, initialState);
 [2] 16│ const reducerImported = produce<SomeTypeImported, *>(handler, initialState);
     17│
```

`src/index.js` illustrates definitions of `reducer` and `reducerImported` which are functionally identical besides the fact that `reducerImported` relies on the imported type `SomeTypeImported`.

For reference, this is the `IProduce` interface used for `produce`:

```js
type Base = {...} | Array<any>
interface IProduce {
	/**
	 * Immer takes a state, and runs a function against it.
	 * That function can freely mutate the state, as it will create copies-on-write.
	 * This means that the original state will stay unchanged, and once the function finishes, the modified state is returned.
	 *
	 * If the first argument is a function, this is interpreted as the recipe, and will create a curried function that will execute the recipe
	 * any time it is called with the current state.
	 *
	 * @param currentState - the state to start with
	 * @param recipe - function that receives a proxy of the current state as first argument and which can be freely modified
	 * @param initialState - if a curried function is created and this argument was given, it will be used as fallback if the curried function is called with a state of undefined
	 * @returns The next state: a new state, or the current state if nothing was modified
	 */
	<S: Base>(
		currentState: S,
		recipe: (draftState: S) => S | void,
		patchListener?: PatchListener
	): S;
	// curried invocations with inital state
	<S: Base, A = void, B = void, C = void>(
		recipe: (draftState: S, a: A, b: B, c: C, ...extraArgs: any[]) => S | void,
		initialState: S
	): (currentState: S | void, a: A, b: B, c: C, ...extraArgs: any[]) => S;
	// curried invocations without inital state
	<S: Base, A = void, B = void, C = void>(
		recipe: (draftState: S, a: A, b: B, c: C, ...extraArgs: any[]) => S | void
	): (currentState: S, a: A, b: B, c: C, ...extraArgs: any[]) => S;
}
```

It's likely that Flow is attempting to use the first type signature (first argument being `currentState: SomeType`) rather than the second one (first argument being a `recipe` function). Not sure if there's any particular reason why using `SomeTypeImported` over `SomeType` would result in this though. 