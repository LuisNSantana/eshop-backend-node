var { expressjwt: jwt } = require("express-jwt");
const api = process.env.API_URL;

function authJwt() {
  const secret = process.env.secret;
  return jwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      //regular expressions para poder usar rutas que contengan variables
      { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      `${api}/users/login`,
      `${api}/users/register`,

      //habilitar todas las url mientras se desarrolla el front
     //{ url: /(.*)/ },
    ],
  });
}

//cualquier peticion de un usuario que no sea admin va a ser denegada
async function isRevoked(req, object) {
  //console.log('object', object);
  if (object.payload.isAdmin === false) {
    //console.log('This is not admin');
    return true;
  }
  return false;
}

module.exports = authJwt;
