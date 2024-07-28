import User from "../../models/users.js";

export const listUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ users, status: "success" });
  } catch (error) {
    res.status(500).json({ error, message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (user) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(400).json({ message: "User not found", error: true });
    }
  } catch (error) {
    res.status(500).json({ error, message: "Internal server error" });
  }
};
