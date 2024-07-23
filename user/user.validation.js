import Yup from "yup";

export const userValidationSchema = async (req, res, next) => {
  // extract data from req.body

  const data = req.body;

  // validate data

  const userValidationSchema = Yup.object({
    email: Yup.string().email().required().trim().lowercase().max(55),
    password: Yup.string().required().trim(),
    firstName: Yup.string().required().trim().max(30),
    lastName: Yup.string().required().trim().max(30),
    gender: Yup.string().trim().required().oneOf(["male", "female", "other"]),
    role: Yup.string().trim().required().oneOf(["buyer", "seller", "other"]),
  });
  // if validation fails, throw error

  try {
    // validate data
    const validateData = await userValidationSchema.validate(data);
    req.body = validateData;
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }

  // call next function

  next();
};

export const loginUserValidationSchema = Yup.object({
  email: Yup.string().email().required().trim().lowercase().max(55),
  password: Yup.string().required().trim(),
});
