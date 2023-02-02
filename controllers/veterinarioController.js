import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarID.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";
const registrar = async (req, res) => {
  const { nombre, email, password } = req.body;

  // Revisar si el usuario ya fue registrado
  const existeUsuario = await Veterinario.findOne({ email });
  if (existeUsuario) {
    const error = new Error("El usuario ya ha sido registrado");
    return res.status(400).json({ msj: error.message });
  }
  try {
    // Guardando Registro
    const veterinario = new Veterinario(req.body);
    const veterinarioGuardado = await veterinario.save();

    // Enviar el email
    emailRegistro({
      email,
      nombre,
      token: veterinarioGuardado.token,
    });
    res.json(veterinarioGuardado);
  } catch (error) {
    console.log(error);
  }
};
const perfil = (req, res) => {
  const { veterinario } = req;
  res.json(veterinario);
};
const confirmar = async (req, res) => {
  //Verificacion por medio de un token
  const { token } = req.params;
  const usuarioConfirmar = await Veterinario.findOne({ token });
  if (!usuarioConfirmar) {
    const error = new Error("token invalido");
    return res.status(404).json({ msj: error.message });
  }

  try {
    //Modificamos en caso de que el token sea valido
    usuarioConfirmar.token = null;
    usuarioConfirmar.confirmado = true;
    await usuarioConfirmar.save(); // Guardamos en la base de datos
    res.json({ msj: "Usuario Confirmado Correctamente" });
  } catch (error) {
    console.log(error);
  }
};

const autenticar = async (req, res) => {
  const { email, password } = req.body;
  //Comprobamos si el usuario existe
  const usuario = await Veterinario.findOne({ email });
  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(403).json({ msj: error.message });
  }
  // Comprobamos si el usuario esta
  if (!usuario.confirmado) {
    const error = new Error("Tu cuenta no ha sido confirmada");
    return res.status(403).json({ msj: error.message });
  }

  //Revisar password
  if (await usuario.comprobarPassword(password)) {
    // Autetnticar
    usuario.token = generarJWT(usuario.id);
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: usuario.token,
    });
  } else {
    const error = new Error("Tu password es incorrecto");
    return res.status(403).json({ msj: error.message });
  }
};
const olvidePassword = async (req, res) => {
  const { email } = req.body;
  const existeVeterinario = await Veterinario.findOne({ email });
  if (!existeVeterinario) {
    const error = new Error("El usuario no existe");
    return res.status(400).json({ msj: error.message });
  }
  try {
    existeVeterinario.token = generarId();
    await existeVeterinario.save();

    //Enviar email con instrucciones
    emailOlvidePassword({
      email,
      nombre: existeVeterinario.nombre,
      token: existeVeterinario.token,
    });
    res.json({ msj: "Se ha enviado un email con las instrucciones" });
  } catch (error) {
    console.log(error);
  }
};
const comprobarToken = async (req, res) => {
  const { token } = req.params;
  const tokenValido = await Veterinario.findOne({ token });
  if (tokenValido) {
    // El token es valido, el usuario si existe
    res.json({ msj: "token valido" });
  } else {
    const error = new Error("El token es no válido");
    return res.status(400).json({ msj: error.message });
  }
};
const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const veterinario = await Veterinario.findOne({ token });
  if (!veterinario) {
    const error = new Error("Hubo un error");
    return res.status(400).json({ msj: error.message });
  }

  try {
    veterinario.token = null;
    veterinario.password = password;
    await veterinario.save();
    res.json({ msj: "password modifcado" });
  } catch (error) {
    console.log(error);
  }
};
const actualizarPerfil = async (req, res) => {
  const veterinario = await Veterinario.findById(req.params.id);
  if (!veterinario) {
    const error = new Error("Hubo un error");
    return res.status(400).json({ msj: error.message });
  }
  const { email } = req.body;
  if (veterinario.email !== req.body.email) {
    const existeEmail = await Veterinario.findOne({ email });
    const error = new Error("Este correo ya esta siendo usado");
    return res.status(400).json({ msj: error.message });
  }
  try {
    veterinario.nombre = req.body.nombre;
    veterinario.email = req.body.email;
    veterinario.web = req.body.web;
    veterinario.telefono = req.body.telefono;
    const veterinarioActualizado = await veterinario.save();
    res.json(veterinarioActualizado);
  } catch (error) {
    console.log(error);
  }
};
const actualizarPassword = async (req, res) => {
  //Leer los datos
  const { id } = req.veterinario;
  const { pwd_actual, pwd_nuevo } = req.body;

  //Comprobar que el veterinario existe
  const veterinario = await Veterinario.findById(id);
  if (!veterinario) {
    const error = new Error("Hubo un error");
    return res.status(400).json({ msj: error.message });
  }
  //Comprobar su password
  if (await veterinario.comprobarPassword(pwd_actual)) {
    //Almacenar el nuevo password
    veterinario.password = pwd_nuevo;
    await veterinario.save();
    res.json({msj: 'Password almacenado correctamente'})
  } else {
    const error = new Error("Password actual es no valido");
    return res.status(400).json({ msj: error.message });
  }
};
export {
  registrar,
  perfil,
  confirmar,
  autenticar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  actualizarPerfil,
  actualizarPassword,
};
