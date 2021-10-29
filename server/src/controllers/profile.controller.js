import Profile from "../models/profile.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

// sign-up end point controller.
export const signUp = async (req, res) => {
  let { name, username, email, password } = req.body;

  const user = await Profile.findOne({
    $or: [{ email: email }, { username: username }],
  });

  if (user)
    return res
      .status(401)
      .send({ type: "Error", msg: "This user is already exist" });

  const profile = await new Profile({
    name: name,
    username: username,
    password: password,
    email: email,
  });

  await profile.save();
  const token = generateToken(profile._id);
  res.send({ ...profile._doc, token });
};

// sign-in end point controller.
export const signIn = async (req, res) => {
  const { username, email, password } = req.body;

  const user = await Profile.findOne({
    $or: [{ username: username }, { email: email }],
  });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = generateToken(user._id);
    const userWithoutPassword = await Profile.findOne(
      { email: email },
      { password: 0 }
    );
    res.status(200).send({ ...userWithoutPassword._doc, token });
  } else {
    res.sendStatus(401).send({ msg: "Invalid credentials!" });
  }
};

// follow endpoint controller

export const follow = async (req, res) => {
  const { id, username } = req.query;
  const user = req.user;

  const profile = await Profile.findOne({
    $or: [{ username: username }, { _id: id }],
  });

  user.follow(profile);
  res.send(200);
};

//  unfollow endpoint
export const unfollow = async (req, res) => {
  const { id, username } = req.query;
  const user = req.user;
  const profile = await Profile.findOne({
    $or: [{ username: username }, { _id: id }],
  });

  user.unfollow(profile);
  res.send(200);
};

export const removeFollow = async (req, res) => {
  const { id, username } = req.query;
  const user = req.user;

  const profile = await Profile.findOne({
    $or: [{ username: username }, { _id: id }],
  });
  user.unfollow(profile);
  res.send(200);
};

// get profiles
export const getProfile = (req, res) => {
  const { username, id } = req.query;
  if (username || id) {
    Profile.findOne(
      {
        $or: [{ username: username }, { _id: id }],
      },
      { password: 0 }
    )
      .then((result) => res.send(result))
      .catch((err) => res.send(err));
  } else {
    Profile.find({}, { password: 0 })
      .then((result) => res.send(result))
      .catch((err) => res.send(err));
  }
};