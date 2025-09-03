
const stack:any[] = []
let idx = -1
export function commit(snapshot){ stack.splice(idx+1); stack.push(JSON.stringify(snapshot)); idx = stack.length-1 }
export function undo(){ if (idx>0) return JSON.parse(stack[--idx]) }
export function redo(){ if (idx<stack.length-1) return JSON.parse(stack[++idx]) }
