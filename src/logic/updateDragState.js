// The purpose of this function is just to clearly delineate when I am updating the drag state
// the drag state is:
// - pieceIDs (array of ints): The IDs of the pieces being dragged.
// - boardIsShifting (boolean): Whether the whole board is being dragged.
// - dragHasMoved (boolean): Whether the pointer has moved (ignoring some wiggle) since the drag started.
// - pointerID (integer): The ID of the pointer, as captured by the pointer down event.
// - pointerStartPosition (object with fields `x` and `y`): The x and y position of the pointer, as captured by the pointer down event.
// - pointer
// - pointerOffset (object with fields `x` and `y`): The distance between the pointer and the top left corner of the drag group
// - destination: Info about where the pieces would be dropped, based on the position of the pointer:
//   - if on the board:
//     - where: "board"
//     - top (integer): The starting vertical location of the top of the drag group in the board.
//     - left (integer): The starting horizontal location of the left of the drag group in the board.
//   - if on the pool:
//     - where: "pool"
//    - index (integer): The starting index of the drag group in the pool
export function updateDragState(oldDragState = {}, updates = {}) {
  return {
    ...oldDragState,
    ...updates,
  };
}
