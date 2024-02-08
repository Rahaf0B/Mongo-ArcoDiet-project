interface IUser {
  _id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  gender?: string;
  date_of_birth?: string | Date;
  allergies?: string[];
  diseases?: string[];
  profile_pic_url?: string;
  weight?: number;
  height?: number;
  is_nutritionist?: boolean;
  is_reqUser?: boolean;
  is_admin?: boolean;
}


interface INutritionist{
    _id?: string;
    phone_number?:number;
    description?:string;
    experience_years?:number;
    collage?:string;
    specialization?:string;
    price?:number;
}


interface IAllergies {
  _id?: string;
  name: string;
}

interface IDiseases {
  _id?: string;
  name: string;
}


interface IRating{
    user_id: string;
    nutritionist_id: string;
    value: number;
}