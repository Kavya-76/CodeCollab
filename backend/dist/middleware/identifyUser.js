export const identifyUser = (req, res, next) => {
    const typedReq = req;
    const user = typedReq.user;
    if (user === null || user === void 0 ? void 0 : user.uid) {
        typedReq.userType = "authenticated";
        typedReq.userId = user.uid;
    }
    else {
        typedReq.userType = "guest";
        typedReq.ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    }
    next();
};
