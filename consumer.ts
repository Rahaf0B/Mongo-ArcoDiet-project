import { Socket } from "socket.io";
import authorization from "./middleware/authorization";
import { ObjectId } from "mongodb";
import CUser from "./controller/user";
async function handleConnection(socket: Socket) {
  try {
    await authorization.authenticateUserWS(socket);
    const url = new URL(socket.handshake.url, "http://localhost:3000"); // Replace 'https://dummyurl.com' with your actual URL
    const searchParams = url.searchParams;
    const id = searchParams.get("id");
    let channelName = "channel";
    if (new ObjectId(socket.data.uid as string) > new ObjectId(id)) {
      channelName = channelName + "-" + socket.data.uid + "-" + id;
    } else {
      channelName = channelName + "-" + id + "-" + socket.data.uid;
    }
    socket.join(channelName);

    socket.on("message", async (msg) => {
      const instance = CUser.getInstance();
      try {
        const data = await instance.saveMessage(socket.data.uid, id, msg);
        delete data.sender_id;
        socket.to(channelName).emit("chat", data);
      } catch (err) {
        socket.disconnect();
      }
    });
    socket.on("disconnect", (reason) => {
      console.log("User disconnected:", socket.id, "Reason:", reason);
    });
  } catch (e) {}
}


export default { handleConnection,  };
