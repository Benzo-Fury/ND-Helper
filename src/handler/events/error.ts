import  { eventModule, EventType } from "@sern/handler";

export default eventModule({
  type: EventType.Sern,
  name: "error",
  execute: async (err) => {
    // todo:
    console.log(err)
  }
})