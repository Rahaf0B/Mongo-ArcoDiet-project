import { Double, ObjectId } from "mongodb";

export interface IUser {
  _id?:  ObjectId;
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  gender?: string;
  date_of_birth?: string | Date;
  allergies?: string[];
  diseases?: string[];
  profile_pic_url?: string;
  weight?: number  | Double;
  height?: number | Double;
  is_nutritionist?: boolean;
  is_reqUser?: boolean;
  is_admin?: boolean;
  optCode?:number;
}


export interface INutritionist{
    _id?: ObjectId;
    phone_number?:number;
    description?:string;
    experience_years?:number;
    collage?:string;
    specialization?:string;
    price?:number;
}


export interface IAllergies {
  _id?:  ObjectId;
  name: string;
}

export interface IDiseases {
  _id?:  ObjectId;
  name: string;
}


export interface IRating{
    user_id: ObjectId;
    nutritionist_id: ObjectId;
    value: number;
}


export interface ISession{
  user_id: ObjectId;
  expiration_date?: string | Date;
  token: string;
}


export interface IProduct{
  barcode_number?: number,
  name_english?: string,
  name_arabic?: string,
  weight?: number,
  sugar_value?: number,
  sodium_value?: number,
  calories_value?: number,
  fats_value?: number,
  protein_value?: number,
  cholesterol_value?: number,
  carbohydrate_value?: number,
  milk_existing?: boolean,
  egg_existing?: boolean,
  fish_existing?: boolean,
  sea_components_existing?: boolean,
  nuts_existing?: boolean,
  peanut_existing?: boolean,
  pistachio_existing?: boolean,
  wheat_derivatives_existing?:boolean,
  soybeans_existing?: boolean,
}

export interface IAppointmentInfo{
  date:string | Date;
  starting_time:string | Date;
ending_time:string | Date;
available:boolean;
}
export interface IAppointment{
  nutritionist_id:ObjectId;
 appointmentInfo:IAppointmentInfo[];

}