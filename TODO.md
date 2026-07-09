# TODO

- make small puzzle more interconnected -- maybe by limiting grid size during generation?

- Add a tutorial video that pops up at the start. like palette

- icons uniform
- add tests

- piece rotation
- transpose grid/game solved logic will only work for square grid

For screenshots: https://crossjig.com/?id=custom-833T4HMRRDW1J4D3W2S3YSEW1L2A4Q3LZAFC7W9OGJV40

- add some custom daily puzzles

- add link to sponsors?
- just rename dispatch params to dispatcher everywhere
- piecesOverlapQ should use getGridFromPieces

- move common functions to word-logic package

## Typescript

- With `applyBaseState<T>` can I force T to be GameStateRandom | GameStateDaily | GameStateCustom | GameStateAdventure
- add tests for src/logic/parseUrlQuery.ts -- need to figure out how to mock the query
- add tests for all files missing tests

- Pull reducer things that are specific to daily and custom into dedicated reducers
  - daily:
    - clearStreakIfNeeded
    - newGame daily
  - custom creation
    - updateInvalidReason
    - updateRepresentativeString

?:
- For custom creating, why is letters Letter[] instead of Letter[][]?


 ...(googleAppLink && {googleAppLink}),

 <MyComponent
  {...(googleAppLink && { googleAppLink })}
/>

{...(gameState.dragState?.pieceIDs && { dragPieceIDs: gameState.dragState.pieceIDs })}







crossjig (typescript) $ npm run tslint

> crossjig@3.0.62 tslint
> npx tsc --noEmit

src/components/App.tsx:142:5 - error TS2345: Argument of type '<S extends GameState>(currentState: S, payload: GameReducerPayload) => S' is not assignable to parameter of type '(prevState: CustomCreationState, ...args: AnyActionArg) => CustomCreationState'.
  Types of parameters 'currentState' and 'prevState' are incompatible.
    Type 'CustomCreationState' is not assignable to type 'GameState'.
      Type 'CustomCreationState' is not assignable to type 'GameStateAdventure'.
        Type 'CustomCreationState' is missing the following properties from type 'BaseGameState': seed, maxShiftLeft, maxShiftRight, maxShiftUp, and 7 more.

142     gameReducer,
        ~~~~~~~~~~~

src/components/App.tsx:502:13 - error TS2322: Type '{ dispatchCustomState: ActionDispatch<AnyActionArg>; validityOpacity: number; customState: CustomCreationState; setDisplay: Dispatch<...>; }' is not assignable to type 'IntrinsicAttributes & { dispatchCustomState: Dispatch<CustomCreationReducerPayload>; customState: CustomCreationState; validityOpacity: number; }'.
  Property 'setDisplay' does not exist on type 'IntrinsicAttributes & { dispatchCustomState: Dispatch<CustomCreationReducerPayload>; customState: CustomCreationState; validityOpacity: number; }'.

502             setDisplay={setDisplay}
                ~~~~~~~~~~

src/components/App.tsx:546:11 - error TS2322: Type 'BeforeInstallPromptEvent | null' is not assignable to type 'BeforeInstallPromptEvent'.
  Type 'null' is not assignable to type 'BeforeInstallPromptEvent'.

546           installPromptEvent={installPromptEvent}
              ~~~~~~~~~~~~~~~~~~

  node_modules/@skedwards88/shared-components/src/components/InstallOverview.tsx:23:3
    23   installPromptEvent: BeforeInstallPromptEvent;
         ~~~~~~~~~~~~~~~~~~
    The expected type comes from property 'installPromptEvent' which is declared here on type 'IntrinsicAttributes & { setDisplay: Dispatch<SetStateAction<"game" | "rules" | "heart" | "settings" | "daily" | "dailyStats" | "custom" | "customError" | "customShare" | "customLookup" | ... 5 more ... | "whatsNew">>; ... 6 more ...; sessionId: string; }'
