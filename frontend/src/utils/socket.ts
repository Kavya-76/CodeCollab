import {io} from "socket.io-client"

const socket_io_url = import.meta.env.VITE_BACKEND_URL;
const socket = io(socket_io_url)
export default socket;