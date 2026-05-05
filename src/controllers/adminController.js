import User from "../database/model/Usuario.js";

export const getUsuarios = async (req, res) => {
    try {
        const usuarios = await User.find();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ msg: "Error del servidor" });
    }
};
