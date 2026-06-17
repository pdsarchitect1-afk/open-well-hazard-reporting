// Convert a Mongoose document/lean object into a JSON-safe plain object
// (ObjectIds -> strings, Dates -> ISO strings) for sending to the client.
export function serialize<T = any>(doc: any): T {
  return JSON.parse(JSON.stringify(doc));
}
