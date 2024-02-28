module.exports = {
  eUser: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "Faça login para acessar a página!");
    res.redirect("/");
  },
};
