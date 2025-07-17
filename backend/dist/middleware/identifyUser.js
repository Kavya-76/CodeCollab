export const identifyUser = (req, res, next) => {
    const user = req.user; // From auth middleware (JWT or session)
    if (user && user.uid) {
        req.userType = "authenticated";
        req.userId = user.uid;
    }
    else {
        req.userType = "guest";
        req.ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    }
    next();
};
