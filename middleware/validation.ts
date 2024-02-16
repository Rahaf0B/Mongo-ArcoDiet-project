import { object, string, number, date, mixed, lazy, array } from "yup";
import { Request, Response, NextFunction, query } from "express";
import { parse } from "date-fns";
import "yup-phone-lite";
import { ObjectId } from "mongodb";
import moment from "moment";

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
          return value ? moment(value).isBefore(moment(), "day") : true;
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

async function UserLoginValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let userSchema = object({
    body: object({
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
    })
      .required("The email,password are required")
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

async function changePassValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let userSchema = object({
    body: object({
      old_password: string()
        .strict(true)
        .required("The old_password is required")
        .typeError("The password Should be String")
        .min(6, "password should not be less than 6 digits")
        .matches(
          /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).*$/,
          "The password must contain characters,numbers and special characters"
        )
        .nullable(),
      new_password: string()
        .strict(true)
        .required("The password is required")
        .typeError("The new_password Should be String")
        .min(6, "password should not be less than 6 digits")
        .matches(
          /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).*$/,
          "The password must contain characters,numbers and special characters"
        )
        .nullable(),

      confirm_password: string()
        .strict(true)
        .required("The confirm_password is required")
        .typeError("The confirm Password Should be String")
        .min(6, "password should not be less than 6 digits")
        .matches(
          /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).*$/,
          "The password must contain characters,numbers and special characters"
        )
        .nullable(),
    })
      .required("The email,password,confirm Password are required")
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

async function emailValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let userSchema = object({
    body: object({
      email: string()
        .strict(true)
        .typeError("The Email Should be String")
        .required("The email is required")
        .email("It should be in the Email form")
        .nullable(),
    })
      .required("The email,password,confirm Password are required")
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

async function OPTCodeValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let userSchema = object({
    body: object({
      email: string()
        .strict(true)
        .typeError("The Email Should be String")
        .required("The email is required")
        .email("It should be in the Email form")
        .nullable(),

      optCode: number()
        .strict(true)
        .required("The opt code is required")
        .typeError("The opt code Should be number")
        .nullable(),
    })
      .required("The email,opt code,  are required")
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

async function forgetPassValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let userSchema = object({
    body: object({
      email: string()
        .strict(true)
        .typeError("The Email Should be String")
        .required("The email is required")
        .email("It should be in the Email form")
        .nullable(),

      new_password: string()
        .strict(true)
        .required("The password is required")
        .typeError("The new_password Should be String")
        .min(6, "password should not be less than 6 digits")
        .matches(
          /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).*$/,
          "The password must contain characters,numbers and special characters"
        )
        .nullable(),

      confirm_password: string()
        .strict(true)
        .required("The confirm Password is required")
        .typeError("The confirm_password Should be String")
        .min(6, "password should not be less than 6 digits")
        .matches(
          /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).*$/,
          "The password must contain characters,numbers and special characters"
        )
        .nullable(),
    })
      .required("The email,password,confirm Password are required")
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

async function addAllergiesDiseasesValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let userSchema = object({
    body: object({
      name: string()
        .strict(true)
        .typeError("The name Should be String")
        .required("The name is required")
        .nullable(),
    })
      .required("The name is required")
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

async function addProductValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let userSchema = object({
    body: object({
      soybeans_existing: number()
        .strict(true)
        .typeError("The soybeans_existing Should be number")
        .oneOf([0, 1], "soybeans_existing should be 0 or 1")
        .nullable(),

      wheat_derivatives_existing: number()
        .strict(true)
        .typeError("The wheat_derivatives_existing Should be number")
        .oneOf([0, 1], "wheat_derivatives_existing should be 0 or 1")
        .nullable(),

      pistachio_existing: number()
        .strict(true)
        .typeError("The pistachio_existing Should be number")
        .oneOf([0, 1], "pistachio_existing should be 0 or 1")
        .nullable(),

      peanut_existing: number()
        .strict(true)
        .typeError("The peanut_existing Should be number")
        .oneOf([0, 1], "peanut_existing should be 0 or 1")
        .nullable(),

      nuts_existing: number()
        .strict(true)
        .typeError("The nuts_existing Should be number")
        .oneOf([0, 1], "nuts_existing should be 0 or 1")
        .nullable(),

      sea_components_existing: number()
        .strict(true)
        .typeError("The sea_components_existing Should be number")
        .oneOf([0, 1], "sea_components_existing should be 0 or 1")
        .nullable(),

      fish_existing: number()
        .strict(true)
        .typeError("The fish_existing Should be number")
        .oneOf([0, 1], "fish_existing should be 0 or 1")
        .nullable(),

      egg_existing: number()
        .strict(true)
        .typeError("The egg_existing Should be number")
        .oneOf([0, 1], "egg_existing should be 0 or 1")
        .nullable(),

      milk_existing: number()
        .strict(true)
        .typeError("The milk_existing Should be number")
        .oneOf([0, 1], "milk_existing should be 0 or 1")
        .nullable(),

      carbohydrate_value: number()
        .round("floor")
        .strict(true)
        .typeError("The carbohydrate_value Should be number")
        .nullable(),

      cholesterol_value: number()
        .round("floor")
        .strict(true)
        .typeError("The cholesterol_value Should be number")
        .nullable(),
      protein_value: number()
        .round("floor")
        .strict(true)
        .typeError("The protein_value Should be number")
        .nullable(),

      fats_value: number()
        .round("floor")
        .strict(true)
        .typeError("The fats_value Should be number")
        .nullable(),

      calories_value: number()
        .round("floor")
        .strict(true)
        .typeError("The calories_value Should be number")
        .nullable(),

      sodium_value: number()
        .round("floor")
        .strict(true)
        .typeError("The sodium_value Should be number")
        .nullable(),

      sugar_value: number()
        .round("floor")
        .strict(true)
        .typeError("The sugar_value Should be number")
        .nullable(),

      barcode_number: number()
        .strict(true)
        .required("the barcode_number is required")
        .typeError("The barcode_number Should be number")
        .nullable(),

      weight: number()
        .round("floor")
        .strict(true)
        .typeError("The product_weight Should be number")
        .nullable(),

      name_arabic: string()
        .strict(true)
        .typeError("The name_arabic Should be String")
        .required("The name_arabic is required")
        .nullable(),
      name_english: string()
        .strict(true)
        .typeError("The name_english Should be String")
        .required("The name_english is required")
        .nullable(),
    })
      .required("There should be attribute is required")
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

async function addOrDeleteAppointmentValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let userSchema = object({
    body: object({
      date: string()
        .strict(true)
        .typeError("The date Should be String")
        .required("The date is required")
        .matches(
          /^([0-9]{4})\-([0-9]{2})\-([0-9]{2})$/,
          "date_of_birth must be in format yyyy-MM-dd"
        )
        .test("min", "the date is in the past", function (value) {
          return value
            ? moment(value).isAfter(moment(), "day") ||
                moment(value).isSame(moment(), "day")
            : true;
        })
        .nullable(),

      starting_time: string()
        .strict(true)
        .typeError("The starting_time Should be String")
        .required("The starting_time is required")
        .test(
          "time-format",
          "Invalid time format it should be based on a 12 hour system",
          (value) => {
            if (!value) return true;
            const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9](AM|PM)$/i;
            return timeRegex.test(value);
          }
        )
        .nullable(),
    })
      .required("The date and starting_time  are required")
      .nullable()
      .strict(true)
      .noUnknown(true),
  });
}

async function dateValidation(req: Request, res: Response, next: NextFunction) {
  let userSchema = object({
    query: object({
      date: string()
        .strict(true)
        .typeError("The date Should be String")
        .required("The date is required")
        .matches(
          /^([0-9]{4})\-([0-9]{2})\-([0-9]{2})$/,
          "date_of_birth must be in format yyyy-MM-dd"
        )
        .nullable(),
    })
      .required("The date is required")
      .nullable()
      .noUnknown(true),
  });

  try {
    const response = await userSchema.validate({ query: req.query });
    next();
  } catch (e: any) {
    return res.status(400).send(e.message);
  }
}

async function IdValidation(req: Request, res: Response, next: NextFunction) {
  let userSchema = object({
    params: object({
      id: string()
        .strict(true)
        .typeError("The id Should be String")
        .required("The id is required")
        .test("Invalid id", (value) => ObjectId.isValid(value))
        .nullable(),
    })
      .required("The id is required")
      .nullable()
      .noUnknown(true),
  });

  try {
    const response = await userSchema.validate({ params: req.params });
    next();
  } catch (e: any) {
    return res.status(400).send(e.message);
  }
}

async function reserveAppointmentValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let userSchema = object({
    body: object({
      nutritionist_id: string()
        .strict(true)
        .typeError("The id Should be String")
        .required("The id is required")
        .test("Invalid id", (value) => ObjectId.isValid(value))
        .nullable(),

      date: string()
        .strict(true)
        .typeError("The date Should be String")
        .required("The date is required")
        .matches(
          /^([0-9]{4})\-([0-9]{2})\-([0-9]{2})$/,
          "date_of_birth must be in format yyyy-MM-dd"
        )
        .test("min", "the date is in the past", function (value) {
          return value
            ? moment(value).isAfter(moment(), "day") ||
                moment(value).isSame(moment(), "day")
            : true;
        })
        .nullable(),

      starting_time: string()
        .strict(true)
        .typeError("The starting_time Should be String")
        .required("The starting_time is required")
        .test(
          "time-format",
          "Invalid time format it should be based on a 12 hour system",
          (value) => {
            if (!value) return true;
            const timeRegex = /^(0[1-9]|1[0-2]):([0-5][0-9])(AM|PM)$/i;
            return timeRegex.test(value);
          }
        )
        .test(
          "time-in-past",
          "The starting_time is in the past",
          function (value, { parent }) {
            if (!value || !parent.date) return true;

            const appointmentDateTime = moment(
              `${parent.date} ${value}`,
              "YYYY-MM-DD h:mmA"
            );
            const currentUtcDateTime = moment.utc();
            return appointmentDateTime.isAfter(currentUtcDateTime);
          }
        )
        .nullable(),
    })
      .required("The nutritionist_id,date and starting_time  are required")
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

async function NumberOfItemsValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let userSchema = object({
    query: object({
      number_of_items: number()
        .strict(true)
        .typeError("The number_of_items Should be String")
        .required("The number_of_items is required")
        .min(1, "number_of_items should be not less than 1")
        .nullable(),
    })
      .required("The number_of_items is required")
      .nullable()
      .noUnknown(true),
  });

  try {
    const response = await userSchema.validate({ query: req.query });
    next();
  } catch (e: any) {
    return res.status(400).send(e.message);
  }
}

async function IdQueryValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let userSchema = object({
    query: object({
      id: string()
        .strict(true)
        .typeError("The id Should be String")
        .required("The id is required")
        .test("Invalid id", (value) => ObjectId.isValid(value))
        .nullable(),
    })
      .required("The id is required")
      .nullable()
      .noUnknown(true),
  });

  try {
    const response = await userSchema.validate({ query: req.query });
    next();
  } catch (e: any) {
    return res.status(400).send(e.message);
  }
}

async function ratingValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let userSchema = object({
    body: object({
      rating: number()
        .strict(true)
        .round("floor")
        .typeError("The rating Should be number")
        .required("The rating is required")
        .nullable(),
    })
      .required("The rating is required")
      .nullable()
      .noUnknown(true)
      .strict(true),
  });

  try {
    const response = await userSchema.validate({ params: req.params });
    next();
  } catch (e: any) {
    return res.status(400).send(e.message);
  }
}

async function editNutritionistGeneralInfoValidation(
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
        .nullable(),

      last_name: string()
        .strict(true)
        .typeError("The Last Name Should be String")
        .nullable()
        .min(3, "last name should not be less than 3 digits")
        .max(10, "last name should not be greater than 10 digits"),

      date_of_birth: string()
        .strict(true)
        .typeError("date_of_birth must be a string formate")
        .nullable()
        .test("max", "the date is in the future", function (value) {
          return value ? moment(value).isBefore(moment(), "day") : true;
        })
        .matches(
          /^([0-9]{4})\-([0-9]{2})\-([0-9]{2})$/,
          "date_of_birth must be in format yyyy-MM-dd"
        ),

      phone_number: string()
        .phone("PS", "phone_number is invalid")
        .nullable()
        .typeError("The phone_number should be in string form")
        .matches(
          /^[(][0-9]{3}[)][-\s\.][0-9]{2}[-\s\.][0-9]{7}$/,
          "the phone number should be in format (xxx) xx xxxxxxx"
        )
        .required("The new phone_number is required"),

      description: string()
        .strict(true)
        .typeError("The description Should be String")
        .nullable(),

      specialization: string()
        .strict(true)
        .typeError("The specialization Should be String")
        .nullable(),
      collage: string()
        .strict(true)
        .typeError("The collage Should be String")
        .nullable(),

      experience_years: number()
        .strict(true)
        .typeError("The experience_years Should be number")
        .min(0, "the experience_years should be not less than 0")
        .nullable(),
      price: number()
        .strict(true)
        .typeError("The price Should be number")
        .min(10, "the experience_years should be not less than 10")
        .max(50, "the experience_years should be greater than 50")
        .nullable(),
    })
      .required("The data are required")
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

async function barCodeValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let userSchema = object({
    params: object({
      barcode_number: number()
        .strict(true)
        .typeError("The barcode_number Should be number")
        .required("The barcode_number is required")
        .nullable(),
    })
      .required("The barcode_number is required")
      .nullable()
      .noUnknown(true),
  });

  try {
    const response = await userSchema.validate({ params: req.params });
    next();
  } catch (e: any) {
    return res.status(400).send(e.message);
  }
}

async function HealthInfoValidation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let userSchema = object({
    body: object({
      height: number()
        .strict(true)
        .typeError("The height Should be number")
        .min(10, "the height should be not less than 10")
        .nullable(),

      weight: number()
        .strict(true)
        .typeError("The weight Should be number")
        .min(10, "the weight should be not less than 10")
        .nullable(),

      allergies: array()
        .of(
          object().shape({
            name: string()
              .typeError("The name Should be string")
              .required("the name of the allergies is required")
              .strict(true),
          })
        )
        .typeError("The allergies Should be array of objects"),

      diseases: array()
        .of(
          object().shape({
            name: string()
              .typeError("The name Should be string")
              .required("the name of the diseases is required")
              .strict(true),
          })
        )
        .typeError("The diseases Should be array of objects"),
    })
      .required("The data are required")
      .nullable()
      .noUnknown(true)
      .strict(true),
  });

  try {
    const response = await userSchema.validate({ query: req.query });
    next();
  } catch (e: any) {
    return res.status(400).send(e.message);
  }
}

async function editUserGeneralInfoValidation(
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
        .nullable(),

      last_name: string()
        .strict(true)
        .typeError("The Last Name Should be String")
        .nullable()
        .min(3, "last name should not be less than 3 digits")
        .max(10, "last name should not be greater than 10 digits"),

      date_of_birth: string()
        .strict(true)
        .typeError("date_of_birth must be a string formate")
        .nullable()
        .test("max", "the date is in the future", function (value) {
          return value ? moment(value).isBefore(moment(), "day") : true;
        })
        .matches(
          /^([0-9]{4})\-([0-9]{2})\-([0-9]{2})$/,
          "date_of_birth must be in format yyyy-MM-dd"
        ),
    })
      .required("The data are required")
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

async function NCPValidation(req: Request, res: Response, next: NextFunction) {
  let userSchema = object({
    body: array().of(
      object()
        .shape({
          question: string()
            .typeError("The question Should be string")
            .required("the question is required")
            .strict(true),

          answer: string()
            .typeError("The answer Should be string")
            .required("the answer is required")
            .strict(true),
        })
        .required("The data are required")
        .nullable()
        .noUnknown(true)
        .strict(true)
    ),
  });

  try {
    const response = await userSchema.validate({ query: req.query });
    next();
  } catch (e: any) {
    return res.status(400).send(e.message);
  }
}

export default {
  CreateAccountForUserValidation,
  UserLoginValidation,
  changePassValidation,
  emailValidation,
  OPTCodeValidation,
  forgetPassValidation,
  addAllergiesDiseasesValidation,
  addProductValidation,
  addOrDeleteAppointmentValidation,
  dateValidation,
  IdValidation,
  reserveAppointmentValidation,
  NumberOfItemsValidation,
  IdQueryValidation,
  ratingValidation,
  editNutritionistGeneralInfoValidation,
  barCodeValidation,
  HealthInfoValidation,
  editUserGeneralInfoValidation,
  NCPValidation
};
