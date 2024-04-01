// "use server"
// import {Server, Socket} from "socket.io";
// import {NextApiRequest} from "next";
// import {ExtendedNextApiResponse} from "@/types";
//
// export default async function handler(
//   req: NextApiRequest,
//   res: ExtendedNextApiResponse
// ) {
//   console.log("Starting socket server")
//   if (res.socket?.server?.io) {
//     console.log("Server already started!");
//     // res.end();
//     // return;
//   }
//
//   // @ts-ignore
//   const io = new Server(res.socket.server, {
//     path: '/api/socket.io',
//     addTrailingSlash: false
//   });
//   res.socket.server.io = io;
//
//   // const supbaseServerClient = createServerClient();
//   // const {data: {user}} = await supbaseServerClient.auth.getUser();
//   // if (!user) {
//   //   console.log("Not logged in");
//   //   res.end();
//   //   return;
//   // } else {
//   //   console.log("User", user);
//   // }
//
//   const onConnection = (socket: Socket) => {
//     console.log("New connection", socket.id);
//     // socket.on("ping", (data, callback) => {
//     //   console.log("Ping", data);
//     //   callback("pong");
//     // });
//
//     socket.on("join", (room) => {
//       console.log("Joining room", room, "for socket", socket.id);
//       socket.join(room);
//     });
//   };
//
//   io.on("connection", onConnection);
//
//   console.log("Socket server started successfully!");
//   res.end();
// }
//
// // function onSocketConnection(io, socket) {
// //   const createdMessage = (msg) => {
// //     console.log("New message", msg);
// //     socket.broadcast.emit("newIncomingMessage", msg);
// //   };
// //
// //   socket.on("createdMessage", createdMessage);
// // };
