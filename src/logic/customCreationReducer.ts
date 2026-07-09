import {type CustomCreationState} from "./customCreationInit";
import {dragReducer, type DragReducerPayload} from "./dragReducer";

export type CustomCreationReducerPayload =
  | DragReducerPayload
  | {action: "updateInvalidReason"; invalidReason: string}
  | {action: "updateRepresentativeString"; representativeString: string};

export function customCreationReducer(
  currentState: CustomCreationState,
  payload: CustomCreationReducerPayload,
): CustomCreationState {
  if (payload.action === "updateInvalidReason") {
    return {
      ...currentState,
      invalidReason: payload.invalidReason,
    };
  } else if (payload.action === "updateRepresentativeString") {
    return {
      ...currentState,
      representativeString: payload.representativeString,
    };
  } else {
    return dragReducer(currentState, payload);
  }
}
