var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const roomUsers = {};
const roomState = new Map();
export const handleSocketConnection = (io, socket) => {
    console.log("Socket connected:", socket.id);
    socket.on("join-room", ({ roomId, username, uid, isGuest }) => {
        var _a;
        socket.join(roomId);
        Object.assign(socket, { username, roomId, uid, isGuest });
        if (!roomUsers[roomId])
            roomUsers[roomId] = [];
        const userData = { id: socket.id, username, uid, isGuest };
        if (!roomUsers[roomId].some((u) => u.id === socket.id)) {
            roomUsers[roomId].push(userData);
        }
        io.to(roomId).emit("user-list", roomUsers[roomId]);
        socket.emit("load-code", ((_a = roomState.get(roomId)) === null || _a === void 0 ? void 0 : _a.code) || "");
    });
    socket.on("code-change", ({ roomId, code }) => {
        socket.to(roomId).emit("code-change", code);
        const state = roomState.get(roomId) || {};
        roomState.set(roomId, Object.assign(Object.assign({}, state), { code }));
    });
    socket.on("output-result", ({ roomId, output }) => {
        socket.to(roomId).emit("output-result", output);
        const state = roomState.get(roomId) || {};
        roomState.set(roomId, Object.assign(Object.assign({}, state), { output }));
    });
    socket.on("language-change", ({ roomId, language, languageId }) => {
        socket.to(roomId).emit("language-change", { newLanguage: language, newLanguageId: languageId });
        const state = roomState.get(roomId) || {};
        roomState.set(roomId, Object.assign(Object.assign({}, state), { language, languageId }));
    });
    socket.on("user-activity", ({ roomId, userId, isActive }) => {
        var _a;
        const user = (_a = roomUsers[roomId]) === null || _a === void 0 ? void 0 : _a.find((u) => u.id === userId);
        if (user) {
            user.isActive = isActive;
            io.to(roomId).emit("user-list", roomUsers[roomId]);
        }
    });
    socket.on("leave-room", ({ roomId }) => {
        var _a, _b;
        socket.leave(roomId);
        roomUsers[roomId] = (_a = roomUsers[roomId]) === null || _a === void 0 ? void 0 : _a.filter((u) => u.id !== socket.id);
        if (!((_b = roomUsers[roomId]) === null || _b === void 0 ? void 0 : _b.length)) {
            delete roomUsers[roomId];
            roomState.delete(roomId);
        }
        io.to(roomId).emit("user-list", roomUsers[roomId] || []);
    });
    socket.on("start-execution", ({ roomId, username }) => {
        socket.to(roomId).emit("execution-locked", { username });
    });
    socket.on("end-execution", ({ roomId }) => {
        socket.to(roomId).emit("execution-unlocked");
    });
    socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const { roomId, username, uid, isGuest } = socket;
        if (!roomId)
            return;
        roomUsers[roomId] = (_a = roomUsers[roomId]) === null || _a === void 0 ? void 0 : _a.filter((u) => u.id !== socket.id);
        if (!((_b = roomUsers[roomId]) === null || _b === void 0 ? void 0 : _b.length)) {
            delete roomUsers[roomId];
            roomState.delete(roomId);
        }
        if (uid && !isGuest) {
            const code = ((_c = roomState.get(roomId)) === null || _c === void 0 ? void 0 : _c.code) || "";
            console.log("Saving the code for user: ", code);
            //   await saveCodeForUser(uid, code); // ✅ save code
        }
        io.to(roomId).emit("user-list", roomUsers[roomId] || []);
        socket.to(roomId).emit("user-left", { id: socket.id, username });
    }));
};
