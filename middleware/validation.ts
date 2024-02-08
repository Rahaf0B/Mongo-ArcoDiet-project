import { object, string, number, date, mixed, lazy, array } from "yup";
import { Request, Response, NextFunction, query } from "express";
import { parse } from "date-fns";
import "yup-phone-lite";

async function CreateAccountForUserValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let userSchema = object({
    body: object({
      first_name: string()
        .strict(true)
        .typeError("The First Name Should be String")
        .min(3, "first name should not be less than 3 digits")
        .max(10, "first name should not be greater than 10 digits")
        .nullable()
        .required("The First Name is required"),

      last_name: string()
        .strict(true)
        .typeError("The Last Name Should be String")
        .nullable()
        .min(3, "last name should not be less than 3 digits")
        .max(10, "last name should not be greater than 10 digits")
        .required("The Last Name is required"),

      email: string()
        .strict(true)
        .typeError("The Email Should be String")
        .required("The email is required")
        .email("It should be in the Email form")
        .nullable(),

      password: string()
        .strict(true)
        .required("The password is required")
        .typeError("The password Should be String")
        .min(6, "password should not be less than 6 digits")
        .matches(
          /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).*$/,
          "The password must contain characters,numbers and special characters"
        )
        .nullable(),

      gender: string()
        .strict(true)
        .typeError("The gender Should be String")
        .nullable()
        .required("The gender is required")
        .oneOf(
          ["female", "male"],
          "The value of the gender must be female or male"
        ),

      date_of_birth: string()
        .strict(true)
        .typeError("date_of_birth must be a string formate")
        .nullable()
        .test("max", "the date is in the future", function (value) {
          return value
            ? Number(value?.split("-")[0]) < new Date().getFullYear()
            : true;
        })
        .matches(
          /^([0-9]{4})\-([0-9]{2})\-([0-9]{2})$/,
          "date_of_birth must be in format yyyy-MM-dd"
        )
        .required("date_of_birth is required"),
    })
      .required("The first name,last name,email,password are required")
      .nullable()
      .strict(true)
      .noUnknown(true),
  });

  try {
    const response = await userSchema.validate({ body: req.body });
    next();
  } catch (e: any) {
    return res.status(400).send(e.message);
  }
}

export default { CreateAccountForUserValidation };
