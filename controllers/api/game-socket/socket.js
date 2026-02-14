import console from "console";

const gameSocket = (socket) => {
  console.log("A user connected to the game socket, ", socket.request.session);
};

export default gameSocket;
